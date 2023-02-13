/**
 * IPC消息通道
 */
export enum ChannelType {
  OpenBrowserWindow = 'open-browser-window',
  CloseBrowserWindow = 'close-browser-window',
  ShowBrowserWindow = 'show-browser-window',
  HideBrowserWindow = 'hide-browser-window',
  Message = 'browser-window-message',
  UpdateBrowserWindow = 'update-browser-window',
  MoveWindowToTargetScreen = 'move-window-to-target-screen',
  MoveWindowAlignToWindow = 'move-window-align-to-window',
  ShortCutCapture = 'short-cut-capture', // 环信截图事件
  RTCRawDataTransmit = 'rtc-raw-data-transmit',
}
/**
 * IPC消息类型
 */
export enum IPCMessageType {
  /** App事件 */
  // 关闭窗口（用户点击关闭）
  BrowserWindowClose = 'BrowserWindowClose',
  // 窗口已关闭（窗口进程被关闭）
  BrowserWindowClosed = 'BrowserWindowClosed',
  /** 远程控制 */
  // 控制栏授权状态变更
  ControlStateChanged = 'ControlStateChanged',
  // 隐藏控制栏
  HideControlBar = 'HideControlBar',
  // 关闭控制栏
  CloseControlBar = 'CloseControlBar',
  //学生列表变更事件
  StudentListUpdated = 'StudentListUpdated',
  //同步学生列表
  FetchStudentList = 'FetchStudentList',
  //取消屏幕分享&远程控制
  StopScreenShareAndRemoteControl = 'StopScreenShareAndRemoteControl',
  //切换分享内容
  SwitchScreenShareDevice = 'SwitchScreenShareDevice',
  /** 白板 */
  // 截图完成
  ShortCutCaptureDone = 'ShortCutCaptureDone',
  // 未授权
  ShortCutCaptureDenied = 'ShortCutCaptureDenied',
  /** 扩展屏 */
  // 获取扩展屏状态
  FetchVideoGalleryState = 'FetchVideoGalleryState',
  // 获取扩展状态变更
  VideoGalleryStateUpdated = 'VideoGalleryStateUpdated',
  // 更新扩展屏状态
  UpdateVideoGalleryState = 'UpdateVideoGalleryState',
  // 邀请上台
  InviteStage = 'InviteStage',
}
