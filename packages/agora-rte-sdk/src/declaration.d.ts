interface Window {
  platform: string
  isElectron: Boolean
  defaultLogFolder: string
  ipc: {
    once(event: string, callback: (...args: any) => void): void
  }
  getCachePath: (callback: (path: string) => void) => void
}

declare type IAgoraRtcEngine = any