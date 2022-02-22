const https = require('https'); // or 'https' for https:// URLs
const fs = require('fs');
const version = require('../data/version.json')
const Logger = require('./logger.js');
const path = require('path');

module.exports.downloadFile = async (url, dest, name) => {
  Logger.log(`Downloading ${url} to ${dest}`)
  return new Promise(function(resolve, reject) {
      if (dest != '' && !fs.existsSync(dest)) fs.mkdirSync(dest);
      var file = fs.createWriteStream(`${dest}${name}`);
      https.get(url, function(response) {
          response.pipe(file);
          file.on('finish', function() {
              Logger.log(`Successfully downloaded ${name}`)
              file.close(resolve());
          });
      }).on('error', function(err) {
          fs.unlink(`${dest}${name}`); // Delete the file async. (But we don't check the result)
          Logger.warn('Failed to download file')
          Logger.error(err)
          reject()
      });
  });
}

module.exports.getCurrentVersion = (key) => { return version[key] }

module.exports.updateVersion = (key, ver) => {
  version[key] = ver
  fs.writeFile('./data/version.json', JSON.stringify(version), (error) => {
    if (error) return Logger.log(`[updateMonitorVersion] ${error}`);
    Logger.log(`Updated ${key} to ${ver}`);
  });
}

module.exports.deleteFolderRecursive = (path) => {
  if(fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        module.exports.deleteFolderRecursive(curPath);
      } else {
        Logger.debug(`Deleted ${curPath}`)
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
    Logger.debug(`Deleted ${path}`)
  }
};