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
  ShortCutCapture = 'short-cut-capture', // 环信截图事件
}
/**
 * IPC消息类型
 */
export enum IPCMessageType {
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
  // 截图完成
  ShortCutCaptureDone = 'ShortCutCaptureDone',
  // 未授权
  ShortCutCaptureDenied = 'ShortCutCaptureDenied',
}
