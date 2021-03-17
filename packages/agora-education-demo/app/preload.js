const {ipcRenderer: ipc, app} = require('electron');

const AgoraRtcEngine = require('agora-electron-sdk').default;

const child_process = require('child_process')

const {promisify} = require('util')

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

window.openPrivacyForCaptureScreen = () => window.child_process.execSync(`open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"`)

const AdmZip = require('adm-zip');

window.ipc.on('appPath', (event, args) => {
  const appPath = args[0];
  const logPath = path.join(appPath, `log`, `agora_sdk.log`)
  const dstPath = path.join(appPath, `log`, `agora_sdk.log.zip`)
  window.dstPath = dstPath;
  window.logPath = logPath;
  window.videoSourceLogPath = args[1];

  console.log('window. dstPath', window.dstPath)
  console.log('window. logPath', window.logPath)
  console.log('window. videoSourceLogPath', window.videoSourceLogPath)
})

const doGzip = async () => {
  try {
    const zip = new AdmZip();
    const logFileExists = fs.existsSync(window.setNodeAddonLogPath)
    if (logFileExists) {
      zip.addLocalFile(window.logPath)
    }
    const videoSourceLogFileExists = fs.existsSync(window.setNodeAddonVideoSourceLogPath)
    if (videoSourceLogFileExists) {
      zip.addLocalFile(window.videoSourceLogPath)
    }
    zip.writeZip(window.dstPath)
    let res = await promisify(fs.readFile)(window.dstPath)
    console.log("doGzip ", res)
    return res    
  } catch (err) {
    console.error('[doGzip] upload failured')
    throw err
  }
}

window.doGzip = doGzip;

if (app) {
  console.log("app [logs]", app.getPath('logs'))
}

const getLogPath = () => {
  return app.getPath('logs')
}

window.app = app

window.getLogPath = getLogPath
