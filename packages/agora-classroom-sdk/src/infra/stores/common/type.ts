/**
 * 视频流占位符类型
 */
export enum CameraPlaceholderType {
  /**
   * 摄像头打开
   */
  none = 'none',
  /**
   * 设备正在打开
   */
  loading = 'loading',
  /**
   * 摄像头关闭
   */
  muted = 'muted',
  /**
   * 摄像头损坏
   */
  broken = 'broken',
  /**
   * 摄像头禁用
   */
  disabled = 'disabled',
  /**
   * 老师不在教室
   */
  notpresent = 'notpresent',
  /**
   * 老师摄像头占位符（大小窗场景）
   */
  nosetup = 'nosetup',
}

export enum DeviceStateChangedReason {
  cameraFailed = 'pretest.device_not_working',
  micFailed = 'pretest.device_not_working',
  newDeviceDetected = 'new_device_detected',
  cameraUnplugged = 'pretest.camera_move_out',
  micUnplugged = 'pretest.mic_move_out',
  playbackUnplugged = 'pretest.playback_move_out',
}

export interface WidgetTrackStruct {
  state: number;
  position: { xaxis: number; yaxis: number };
  size: { width: number; height: number };
  extra: {
    contain: boolean;
    zIndex: number;
    userUuid: string;
    [key: string]: any;
  };
}
export enum RemoteControlBarUIParams {
  width = 262,
  height = 92,
}
