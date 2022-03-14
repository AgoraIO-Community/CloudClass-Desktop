export enum AGNetworkQuality {
  unknown = 99,
  bad = 1,
  poor = 2,
  good = 3,
  great = 4,
  down = 5,
}

export enum AGRteTrackErrorReason {
  Unknown,
  PermissionDenied,
}

export interface NetworkStats {
  packetLoss?: number;
  downlinkNetworkQuality?: AGNetworkQuality;
  uplinkNetworkQuality?: AGNetworkQuality;
  cpu?: number;
  cpuTotal?: number;
  delay?: number;
}

export enum AgoraRteMediaSourceState {
  /**
   * 设备停止采集
   */
  stopped = 0,
  /**
   * 设备开启中
   */
  starting = 2,
  /**
   * 设备已开启
   */
  started = 1,
  /**
   * 设备错误
   */
  error = -1,
}

export enum RtcState {
  Idle = 0,
  Connecting = 1,
  Connected = 2,
  Reconnecting = 3,
}

export interface AGRtcDeviceInfo {
  deviceid: string;
  devicename: string;
}

export interface AGRtcCefDeviceInfo {
  deviceId: string;
  deviceName: string;
}

export interface AGVideoEncoderConfigurations {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}

export enum AGMediaEncryptionMode {
  /** 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES_128_XTS = 1,
  /** 2: 128-bit AES encryption, ECB mode.
   */
  AES_128_ECB = 2,
  /** 3: 256-bit AES encryption, XTS mode.
   */
  AES_256_XTS = 3,
  /** 4: Reserved property.
   */
  SM4_128_ECB = 4,
  /** 5: 128-bit AES encryption, GCM mode.
   *
   * @since v3.3.1
   */
  AES_128_GCM = 5,
  /** 6: 256-bit AES encryption, GCM mode.
   *
   * @since v3.3.1
   */
  AES_256_GCM = 6,
}

export interface AGMediaEncryptionConfig {
  mode: AGMediaEncryptionMode;
  key: string;
}

export enum AGScreenShareType {
  Window = 0,
  Screen = 1,
}

export interface AGScreenShareDevice {
  id: string;
  title: string;
  type: AGScreenShareType;
  image: Uint8Array;
  //only available for window type
  isCurrent?: boolean;
}

export enum AGRenderMode {
  fit,
  fill,
}
export enum lighteningLevel {
  low = 0,
  normal = 1,
  height = 2,
}
export interface BeautyEffect {
  lighteningContrastLevel: lighteningLevel; // 对比度
  lighteningLevel: number; // 亮度
  rednessLevel: number; // 红润度
  smoothnessLevel: number; // 平滑度
}
