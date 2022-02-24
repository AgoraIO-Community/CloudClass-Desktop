// 判断是否为 electron 平台
export default function isElctronPlatform() {
  let isElectron =
    window && window.process && window.process.versions && window.process.versions['electron'];
  if (isElectron) {
    return true;
  }
}

export function ipcElecteonRenderer() {
  let ipcRenderer = window.require('electron').ipcRenderer;
  return ipcRenderer;
}
