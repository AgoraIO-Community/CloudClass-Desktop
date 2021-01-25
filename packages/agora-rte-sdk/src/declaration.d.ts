interface Window {
  logPath: string
  videoSourceLogPath: string
  platform: string
  isElectron: boolean
  setNodeAddonLogPath: string
  setNodeAddonVideoSourceLogPath: string
  ipc: {
    once(event: string, callback: (...args: any) => void): void
  }
}

declare type IAgoraRtcEngine = any