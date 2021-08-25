const { ipcRenderer: ipc } = require('electron');

const AgoraRtcEngine = require('agora-electron-sdk').default;

const child_process = require('child_process')

const rimraf = require('rimraf')

const { promisify } = require('util')

const {remote} = require('./remote')

const os = require('os')
const path = require('path');
const fs = require('fs');

const platform = process.platform

const rtcEngine = new AgoraRtcEngine();

window.isElectron = true

window.rtcEngine = rtcEngine;
window.ipc = ipc;
window.path = path;

window.child_process = child_process

window.os_platform = platform

window.isMacOS = () => process.platform === 'darwin'

window.openPrivacyForCaptureScreen = () => window.child_process.execSync(`open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"`)

const AdmZip = require('adm-zip');

let logFolderCleaned = false

const doGzip = async () => {
  try {
    let logFolder = await getLogPath()
    let tmpFolder = await getTempPath()
    await cleanLogFolder(logFolder)
    
    let tmpZipPath = path.join(tmpFolder, 'agora_sdk.log.zip')

    const zip = new AdmZip();
    const logFolderExists = fs.existsSync(logFolder)
    if (logFolderExists) {
      await zip.addLocalFolderPromise(logFolder)
      console.log(`[preload] add folder ${logFolder}`)
    }
    await zip.writeZipPromise(tmpZipPath)
    let res = await promisify(fs.readFile)(tmpZipPath)
    console.log(`[preload] zip log files success ${tmpZipPath}`)
    return res
  } catch (err) {
    console.error('[preload] zip log files failed')
    throw err
  }
}

window.doGzip = doGzip;

const getLogPath = async () => {
  return await remote.getAppPath('logs')
}

const getTempPath = async () => {
  return await remote.getAppPath('temp')
}

window.getLogPath = getLogPath

const cleanFolder = (uploadsDir, age) => {
  return new Promise((resolve, reject) => {
    fs.readdir(uploadsDir, function (err, files) {
      if (err) {
        return reject(err)
      }
      files.forEach(function (file, index) {
        fs.stat(path.join(uploadsDir, file), function (err, stat) {
          var endTime, now;
          if (err) {
            return console.error(err);
          }
          now = new Date().getTime();
          endTime = new Date(stat.ctime).getTime() + age;
          if (now > endTime) {
            return rimraf(path.join(uploadsDir, file), function (err) {
              if (err) {
                return console.error(err);
              }
              console.log(`[preload] successfully deleted ${file}`);
            });
          } else {
            console.log(`[preload] skip file ${file}`)
          }
        });
      });
      resolve()
    });
  })
}


const cleanLogFolder = async (logFolder) => {
  if (!logFolderCleaned) {
    // clean up once only
    logFolderCleaned = true
    // clean up files which are older than 3 days
    try {
      await cleanFolder(logFolder, 1000 * 3600 * 24 * 3)
      console.info(`[preload] clean folder success`)
    } catch(e) {
      console.error(`[preload] clean folder failed: ${e.message}`)
    }
  }
}


getLogPath().then((path) => {
  console.log(`[preload] default log folder ${path}`)
  window.defaultLogFolder = path
})