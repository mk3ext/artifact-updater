const { getCurrentVersion, updateVersion, deleteFolderRecursive } = require('./utils/helper');
const Config = require('./data/config.json')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const extract = require('extract-zip');
const fs = require('fs');
const path = require('path');


const extractZip = (file, destination, deleteSource) => {
  extract(file, { dir: destination }, (err) => {
    if (!err) {
      if (deleteSource) fs.unlinkSync(file);
      nestedExtract(destination, extractZip);
    } else {
      console.error(err);
    }
  });
};

const nestedExtract = (dir, zipExtractor) => {
  fs.readdirSync(dir).forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isFile()) {
      if (path.extname(file) === '.zip') {
        // deleteSource = true to avoid infinite loops caused by extracting same file
        zipExtractor(path.join(dir, file), dir, true);
      }
    } else {
      nestedExtract(path.join(dir, file), zipExtractor);
    }
  });
};

async function downloadLatestMonitor() {
  var { stdout, stderr } = await exec(`curl -s ${Config.monitor.repo}`)
  const json = JSON.parse(stdout);
  const currentVersion = getCurrentVersion('monitor');

  if (currentVersion == json.tag_name) {
    console.log(`No need to update`);
    return console.log(`Current version is ${currentVersion} and latest is ${json.tag_name}`);
  }

  const downloadDirectory = path.join(Config.artifacts.directory, '/alpine/opt/cfx-server/citizen/system_resources')

  var { stdout, stderr } = await exec(`curl -s ${Config.monitor.repo} | grep -E 'browser_download_url' | grep monitor | cut -d '"' -f 4 | wget -P ${downloadDirectory} -qi -  `);
  console.log(`Successfully downloaded monitor.zip to ${downloadDirectory}`)
  deleteFolderRecursive(`${downloadDirectory}/monitor`)

  fs.mkdirSync(`${downloadDirectory}/monitor`);
  extractZip(`${downloadDirectory}/monitor.zip`, `${downloadDirectory}/monitor`, true)

  await updateVersion('monitor', json.tag_name)
}

downloadLatestMonitor()