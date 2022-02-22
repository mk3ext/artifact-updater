const request = require('request-promise');
const fs = require('fs');
const { load } = require('cheerio');
const { exec } = require('child_process');
const Config = require('./data/config.json')
const { downloadFile, deleteFolderRecursive, getCurrentVersion, updateVersion } = require('./utils/helper');

async function getArtifact() {
  return new Promise(function(resolve, reject) {
    request(Config.artifactsURL, async (error, response, html) => {
      if (!error & response.statusCode == 200) {
        const $= load(html);

        const href = $('a.button').map((i, x) => x.attribs.class == 'button is-link is-primary' ? $(x).attr('href') : null).toArray()[0].replace('./','')
        const id = href.split('-')[0]
        const currentVersion = getCurrentVersion('artifact')

        if (id == currentVersion) {
          console.log(`No need to update`);
          return console.log(`Current version is ${currentVersion} and latest recommended is ${id}`);
        }

        await downloadFile(Config.artifacts.url + href, '', Config.artifacts.archive)
        await extractArchive()

        await updateVersion('artifact', id)
        resolve()
      }
    });
  })
}

async function extractArchive() {
  const archive = Config.artifacts.archive
  const dir = Config.artifacts.directory;
  console.log(`Attempting to extract ${archive} to ${dir}`)

  return new Promise(function(resolve, reject) {

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    if (fs.existsSync(`${dir}alpine`)) {
      deleteFolderRecursive(`${dir}alpine`)
      fs.unlink(`${dir}run.sh`, (err) => {
        if (err) console.error(err);
        console.log(`Deleted ${dir}run.sh`)
      });
    }

    exec(`tar xf ${archive} --directory ${dir}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`${error.message}`);
        reject()
      }
      if (stderr) {
        console.log(`${stderr}`);
        resolve()
      }
      console.log(`Successfully extracted to ${archive}`);
      fs.unlink(`${archive}`, (err) => {
        if (err) console.error(err);
        console.log(`Deleted ${archive}`)
      });
      resolve()
    });

  });
}

getArtifact()