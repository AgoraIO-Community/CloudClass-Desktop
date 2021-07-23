import { IAgoraRTC, IAgoraRTCClient, ICameraVideoTrack, ILocalAudioTrack, ILocalTrack, ILocalVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { AgoraElectronRTCWrapper } from '../electron';
// @ts-ignore
import IAgoraRtcEngine from 'agora-electron-sdk';
import { LocalUserRenderer, RemoteUserRenderer } from '../renderer';
import { AgoraWebRtcWrapper } from '../web';
import { EduVideoEncoderConfiguration } from '../../../interfaces';

export declare function event_device_changed (evt: any): void;

export type Option = any;

export declare interface WebRtcWrapperInitOption {
  appId: string
  uploadLog: boolean
  agoraWebSdk: IAgoraRTC
  webConfig: {
    mode: string,
    codec: string,
    role: string
  }
}

export type RTCWrapperProvider = AgoraWebRtcWrapper | AgoraElectronRTCWrapper


/**
 * IElectronRTCWrapper
 * 主要集成agora-electron-sdk，为media-service提供web端内部实现
 */
export declare interface IElectronRTCWrapper extends IAgoraRTCModule {
  client: IAgoraRtcEngine
}

/**
 * ElectronWrapperInitOption
 * 主要用于初始化构造electron rtc wrapper
 */
export declare interface ElectronWrapperInitOption {
  logPath: string;
  videoSourceLogPath: string;
  AgoraRtcEngine: any;
  appId: string;
  cefClient: any;
  area: AREA_CODE;
  cameraEncoderConfiguration?: EduVideoEncoderConfiguration
}

export const convertNativeAreaCode = (codeName: string) => {
  const areaTable: Record<string, number> = {
    "CHINA": 1,
    "ASIA": 8,
    "NORTH_AMERICA": 2,
    "JAPAN": 16,
    "EUROPE": 4,
    "INDIA": 32,
    "GLOBAL": 0xFFFFFFFF,
  }

  const areaCode = areaTable[codeName] ?? areaTable["GLOBAL"]

  console.log("use native area code: ", areaCode)
  return areaCode;
}

/**
 * IWebRTCWrapper
 * 主要集成web ng sdk，为media-service提供web端内部实现
 */
export declare interface IWebRTCWrapper extends IAgoraRTCModule {

  cameraTrack?: ICameraVideoTrack
  audioTrack?: IMicrophoneAudioTrack

  screenVideoTrack?: ILocalVideoTrack
  screenAudioTrack?: ILocalAudioTrack
  screenClient?: IAgoraRTCClient

  client: IAgoraRTCClient
}

export type AREA_CODE = 
  | "CHINA"
  | "ASIA"
  | "NORTH_AMERICA"
  | "EUROPE"
  | "JAPAN"
  | "INDIA"
  | "OVERSEA"
  | "GLOBAL"
  | "SOUTH_AMERICA"
  | "AFRICA"
  | string

/**
 * WebRtcWrapperInitOption
 * 主要用于初始化构造agora-web-sdk-ng rtc wrapper
 */
export declare interface WebRtcWrapperInitOption {
  appId: string;
  uploadLog: boolean;
  agoraWebSdk: IAgoraRTC;
  area: AREA_CODE;
  cameraEncoderConfiguration: EduVideoEncoderConfiguration;
  webConfig: {
    mode: string;
    codec: string;
    role: string;
  }
}

export enum ScreenShareType {
  Window = 0,
  Screen = 1
}

export declare interface PrepareScreenShareParams {
  // 仅适用于Electron平台 目前只支持ElectronSDK
  dom?: HTMLElement
  type?:ScreenShareType
  // 仅适用于web平台 详细参考agora-web-sdk-ng的文档
  shareAudio?: 'enable' | 'auto' | 'disable'
  encoderConfig?: any
}
export declare interface CameraOption {
  deviceId: string
  encoderConfig?: {
    width: number,
    height: number,
    frameRate: number,
  }
}

export declare interface MicrophoneOption {
  deviceId: string
}

/**
 * 
 */
export declare interface IAgoraRTCModule {

  init(): void
  release(): void

  join(option: Option): Promise<any>
  leave(): Promise<any>

  enableLocalVideo(v: boolean): Promise<any>
  enableLocalAudio(v: boolean): Promise<any>
  disableLocalAudio(): void;
  disableLocalVideo(): void;
  setCameraDevice(deviceId: string): Promise<any>
  setMicrophoneDevice(deviceId: string): Promise<any>
  muteLocalVideo(val: boolean, deviceId?: string): Promise<any>
  muteLocalAudio(val: boolean, deviceId?: string): Promise<any>
  muteRemoteVideo(uid: any, val: boolean): Promise<any>
  muteRemoteAudio(uid: any, val: boolean): Promise<any>

  getCameras(): Promise<any[]>

  getMicrophones(): Promise<any[]>

  prepareScreenShare(params?: PrepareScreenShareParams): Promise<any>
  startScreenShare(params: StartScreenShareParams): Promise<any>
  stopScreenShare(): Promise<any>

  changePlaybackVolume(volume: number): void;

  // muteRemoteVideoByClient(client: any, uid: string, val: boolean): Promise<any>

  // muteRemoteAudioByClient(client: any, uid: string, val: boolean): Promise<any>


  on(event: 'error', listener: (err: any) => void): void
  on(event: 'audio-device-changed', listener: typeof event_device_changed): void
  on(event: 'video-device-changed', listener: typeof event_device_changed): void
  on(event: 'user-joined', listener: (evt: any) => void): void
  on(event: 'user-left', listener: (evt: any) => void): void
  on(event: 'user-info-updated', listener: (evt: any) => void): void
  on(event: 'token-privilege-will-expire', listener: (evt: any) => void): void
  on(event: 'token-privilege-did-expire', listener: (evt: any) => void): void
  on(event: 'connection-state-change', listener: (state: any, reason: any) => void): void
  on(event: 'stream-fallback', listener: (state: any, reason: any) => void): void
  on(event: 'network-quality', listener: (stats: any) => void): void
  on(event: 'volume-indicator', listener: (result: any[]) => void): void
}

export declare interface RTCProviderInitParams {
  eduManager?: any;
  cefClient: any;
  agoraSdk: any;
  platform: string;
  codec: string;
  appId: string;
  rtcArea: AREA_CODE;
  rtmArea: AREA_CODE;
  cameraEncoderConfiguration: EduVideoEncoderConfiguration,
  electronLogPath?: {
    logPath: string;
    videoSourceLogPath: string;
  }
}

export declare interface StartScreenShareParams {
  // Electron屏幕共享参数
  shareId?: any
  config?: {
    profile: number
    rect: any
    param: any
  }
  type?: ScreenShareType
  // Web屏幕共享参数
  params: {
    uid: any
    channel: string
    token: string
    joinInfo?: string
  }
  encoderConfig?: any
}

export type JoinOption = {
  channel: string
  token?: string | null
  uid: number
  info?: string
  data: any
}


/**
 * IMediaService
 * 媒体提供层入口
 */
export declare interface IMediaService extends IAgoraRTCModule {
  /**
   * sdk包装器用于提供agora-rtc-sdk-ng/agora-electron-sdk实例能力
   */
  sdkWrapper: RTCWrapperProvider

  web: AgoraWebRtcWrapper
  electron: AgoraElectronRTCWrapper

  /**
   * 本地预览摄像头渲染器，用于绘制本地摄像头捕捉到的画面
   */
  cameraTestRenderer?: LocalUserRenderer

  /**
   * 本地摄像头渲染器，当加入频道时会自动推入频道里。
   */
  cameraRenderer?: LocalUserRenderer

  /**
   * 本地麦克风音频轨道
   */
  microphoneTrack?: ILocalTrack

  /**
   * 屏幕共享渲染器，当加入频道时会自动推入频道内。
   */
  screenRenderer?: LocalUserRenderer

  /**
   * 远端用户渲染器，在加入频道以后通过 user-published/user-unpublished 获取
   */
  remoteUsersRenderer: RemoteUserRenderer[]

  /**
   * 获取测试摄像头标签
   */
  getTestCameraLabel(): string

  /**
   * 获取测试麦克风标签
   */
  getTestMicrophoneLabel(): string

  /**
   * 获取摄像头标签
   */
  getCameraLabel(): string

  /**
   * 获取扬声器标签
   */
  getSpeakerLabel(): string

  /**
   * 获取麦克风标签
   */
  getMicrophoneLabel(): string

  /**
   * 修改扬声器设备音量
   */
  changePlaybackVolume(volume: number): void

  /**
   * 初始化
   */
  init(): void

  /**
   * 释放媒体
   */
  release(): void

  /**
   * 加入频道
   * option: JoinOption
   */
  join(option: JoinOption): Promise<any>

  /**
   * 离开频道
   */
  leave(): Promise<any>

  /**
   * 加入子频道
   * option: JoinOption
   */
  joinSubChannel(option: JoinOption): Promise<any>

  /**
   * 离开子频道
   * option: SubChannel
   */
  leaveSubChannel(channelName: string): Promise<any>

  // /**
  //  * 发布流
  //  */
  // publish(): Promise<any>

  // /**
  //  * 取消发布流
  //  */
  // unpublish(): Promise<any>

  /**
   * 获取摄像头
   */
  getCameras(): Promise<any>

  /**
   * 获取麦克风
   */
  getMicrophones(): Promise<any>

  /**
   * 准备屏幕共享
   */
  prepareScreenShare(params: PrepareScreenShareParams): Promise<any>

  /**
   * 开启屏幕共享
   */
  startScreenShare(option: StartScreenShareParams): Promise<any>

  /**
   * 停止屏幕共享
   */
  stopScreenShare(): Promise<any>

  /**
   * 获取扬声器音量，仅适用于electron
   */
  getPlaybackVolume(): number

  /**
   * 重置
   */
  reset(): void
}

declare class MediaService {
  /**
   * media-service 网络延迟
   * @param event 'watch-rtt' 
   * @param listener 网络延迟回调
   */
  on(event: 'watch-rtt', listener: (evt: any) => void): this
  /**
   * media-service 网络质量
   * @param event 'network-quality' 
   * @param listener 网络质量回调
   */
  on(event: 'network-quality', listener: (evt: any) => void): this
  /**
   * media-service 网络重连状态
   * @param event 'connection-state-change' 
   * @param listener 网络重连状态回调
   */
  on(event: 'connection-state-change', listener: (evt: any) => void): this
  /**
   * media-service 网络音量回调
   * @param event 'volume-indication' 
   * @param listener 网络音量回调
   */
  on(event: 'volume-indication', listener: (evt: any) => void): this
  /**
   * media-service 网络异常回调
   * @param event 'exception' 
   * @param listener 网络异常回调
   */
  on(event: 'exception', listener: (evt: any) => void): this
  /**
   * media-service 收到远端发布的用户流
   * @param event 'user-published' 
   * @param listener 收到远端发布的用户流回调
   */
  on(event: 'user-published', listener: (evt: any) => void): this
  /**
   * media-service 收到远端取消发布的用户流
   * @param event 'user-unpublished' 
   * @param listener 收到远端取消发布的用户流回调
   */
  on(event: 'user-unpublished', listener: (evt: any) => void): this
  /**
   * media-service rtc 状态统计
   * @param event 'rtcStats' 
   * @param listener rtc状态统计回调
   */
  on(event: 'rtcStats', listener: (evt: any) => void): this
  /**
   * media-service 视频设备改变
   * @param event 'video-device-changed' 
   * @param listener 视频设备改变回调
   */
  on(event: 'video-device-changed', listener: (evt: any) => void): this
  /**
   * media-service 媒体设备改变
   * @param event 'audio-device-changed' 
   * @param listener 视频设备改变回调
   */
  on(event: 'audio-device-changed', listener: (evt: any) => void): this
  /**
   * media-service 自动播放失败
   * @param event 'audio-autoplay-failed' 
   * @param listener 自动播放失败的回调
   */
  on(event: 'audio-autoplay-failed', listener: (evt: any) => void): this
}

export type MediaVolume = {
  uid: number,
  volume: number,
}