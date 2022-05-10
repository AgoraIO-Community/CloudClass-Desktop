export enum BizPageRouter {
  Setting = 'setting',
  OneToOne = '1v1',
  MidClass = 'small',
  BigClass = 'big',
  OneToOneIncognito = '1v1_incognito',
  SmallClassIncognito = 'small_incognito',
  LaunchPage = 'launch',
  PretestPage = 'pretest',
  TestHomePage = 'test_home',
  Incognito = 'Incognito',
  TestRecordPage = 'test_record',
  TestH5HomePage = 'test_h5_home',
  TestAdapteHomePage = 'test_adapte_home',
  RecordationSearchPage = 'recordation-search',
  Window = 'window',
}

export enum OrientationEnum {
  portrait = 'portrait',
  landscape = 'landscape',
}

export type ConfirmDialogAction = 'ok' | 'cancel';

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
}
export enum ControlState {
  NotAllowedControlled = '0',
}
