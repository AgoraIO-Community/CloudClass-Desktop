// 判断是否为 electron 平台
export default function isElctronPlatform() {
  let isElectron = window.navigator.userAgent.indexOf('Electron') !== -1;
  if (isElectron) {
    return true;
  }
}

export function ipcElecteonRenderer() {
  let ipcRenderer = window.require('electron').ipcRenderer;
  return ipcRenderer;
}
