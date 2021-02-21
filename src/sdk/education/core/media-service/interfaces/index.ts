import { IAgoraRTC, IAgoraRTCClient, ICameraVideoTrack, ILocalAudioTrack, ILocalTrack, ILocalVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { AgoraElectronRTCWrapper } from '../electron';
import { IAgoraRtcEngine } from '../electron/types/agora_sdk';
import { LocalUserRenderer, RemoteUserRenderer } from '../renderer';
import { AgoraWebRtcWrapper } from '../web';

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
  logPath: string
  videoSourceLogPath: string
  AgoraRtcEngine: any
  appId: string
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

/**
 * WebRtcWrapperInitOption
 * 主要用于初始化构造agora-web-sdk-ng rtc wrapper
 */
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

export declare interface PrepareScreenShareParams {
  // 仅适用于Electron平台 目前只支持ElectronSDK
  dom?: HTMLElement
  // 仅适用于web平台 详细参考agora-web-sdk-ng的文档
  shareAudio?: 'enable' | 'auto' | 'disable'
  encoderConfig?: any
}

export declare interface CameraOption {
  deviceId: string
  encoderConfig?: any
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
  
  publish(): Promise<any>
  unpublish(): Promise<any>

  muteLocalVideo(val: boolean): Promise<any>
  muteLocalAudio(val: boolean): Promise<any>
  muteRemoteVideo(uid: any, val: boolean): Promise<any>
  muteRemoteAudio(uid: any, val: boolean): Promise<any>

  openCamera(option?: CameraOption): Promise<any>
  changeCamera(deviceId: string): Promise<any>
  closeCamera(): void

  getCameras(): Promise<any[]>

  openMicrophone(option?: MicrophoneOption): Promise<any>
  changeMicrophone(deviceId: string): Promise<any>
  closeMicrophone(): void

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
  agoraSdk: any
  platform: string
  codec: string
  appId: string
  electronLogPath?: {
    logPath: string
    videoSourceLogPath: string
  }
}

export declare interface StartScreenShareParams {
  // Electron屏幕共享参数
  windowId?: number
  config?: {
    profile: number
    rect: any
    param: any
  }
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

  /**
   * 发布流
   */
  publish(): Promise<any>

  /**
   * 取消发布流
   */
  unpublish(): Promise<any>

  /**
   * 打开摄像头
   */
  openCamera(option?: CameraOption): Promise<any>

  /**
   * 更换摄像头
   */
  changeCamera(deviceId: string): Promise<any>

  /**
   * 关闭摄像头
   */
  closeCamera(): Promise<any>

  /**
   * 打开麦克风
   */
  openMicrophone(option?: MicrophoneOption): Promise<any>

  /**
   * 更换麦克风
   */
  changeMicrophone(deviceId: string): Promise<any>

  /**
   * 关闭麦克风
   */
  closeMicrophone(): Promise<any>

  /**
   * 打开测试摄像头
   */
  openTestCamera(option: CameraOption): Promise<any>

  /**
   * 关闭测试摄像头
   */
  closeTestCamera(): void

  /**
   * 更改测试摄像头
   */
  changeTestCamera(deviceId: string): Promise<any>

  /**
   * 更改测试分辨率
   */
  changeTestResolution(config: any): Promise<any>

  /**
   * 打开测试麦克风
   * @param option 
   */
  openTestMicrophone(option?: MicrophoneOption): Promise<any>

  /**
   * 关闭测试麦克风
   */
  closeTestMicrophone(): void

  /**
   * 更改测试麦克风
   */
  changeTestMicrophone(id: string): Promise<any>

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
   * 改变分辨率
   */
  changeResolution(config: any): Promise<any>

  /**
   * 获取扬声器音量，仅适用于electron
   */
  getPlaybackVolume(): number

  /**
   * 关闭或打开远端视频
   */
  // muteRemoteVideoByClient(client: any, uid: string, val: boolean): Promise<any>

  /**
   * 关闭或打开远端音频
   */
  // muteRemoteAudioByClient(client: any, uid: string, val: boolean): Promise<any>

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
