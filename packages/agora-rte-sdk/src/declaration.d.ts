interface Window {
  logPath: string
  videoSourceLogPath: string
  platform: string
  isElectron: boolean
  setNodeAddonLogPath: string
  setNodeAddonVideoSourceLogPath: string
  main_pid: number
  ipc: {
    once(event: string, callback: (...args: any) => void): void
  }
  getCachePath: (callback: (path: string) => void) => void
}

declare type IAgoraRtcEngine = any