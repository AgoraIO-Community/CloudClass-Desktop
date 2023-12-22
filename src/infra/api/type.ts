import {
  AgoraEduClassroomEvent,
  ConversionOption,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduRtcConfig,
  Platform,
  AgoraCloudProxyType,
} from 'agora-edu-core';
import { AGMediaOptions, AgoraLatencyLevel, AGVideoEncoderConfiguration } from 'agora-rte-sdk';
import { IBaseProcessor, IExtension } from 'agora-rte-extension';
import { CloudDriveResourceConvertProgress } from '../stores/common/cloud-drive/type';
import { FcrMultiThemeMode, AgoraWidgetBase } from 'agora-common-libs';

export type AgoraRegion = Uppercase<AgoraRegionString>;

export const regionMap = {
  AP: 'sg',
  CN: 'cn-hz',
  EU: 'gb-lon',
  NA: 'us-sv',
} as const;

export type AgoraRegionString = 'cn' | 'ap' | 'na' | 'eu';

export type ListenerCallback = (evt: AgoraEduClassroomEvent, ...args: unknown[]) => void;

export enum WindowID {
  Main = 'main',
  VideoGallery = 'video-gallery',
}

export type LanguageEnum = 'en' | 'zh';
export type TranslateEnum =
  | ''
  | 'auto'
  | 'zh-CHS'
  | 'en'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'es'
  | 'pt'
  | 'it'
  | 'ru'
  | 'vi'
  | 'de'
  | 'ar';

export type ConfigParams = {
  appId: string;
  region?: string;
};

export type LaunchMediaOptions = AGMediaOptions & {
  lowStreamCameraEncoderConfiguration?: AGVideoEncoderConfiguration;
};

export type ConvertMediaOptionsConfig = EduRtcConfig & {
  defaultLowStreamCameraEncoderConfigurations?: AGVideoEncoderConfiguration;
};

/**
 * LaunchOption 接口
 */
export type LaunchOption = {
  userUuid: string; // 用户uuid
  userName: string; // 用户昵称
  roomUuid: string; // 房间uuid
  roleType: EduRoleTypeEnum; // 角色
  roomType: EduRoomTypeEnum; // 房间类型
  roomName: string; // 房间名称
  listener: ListenerCallback; // launch状态
  pretest: boolean; // 开启设备检测
  rtmToken: string; // rtmToken
  language: LanguageEnum; // 国际化
  startTime?: number; // 房间开始时间
  duration: number; // 课程时长
  courseWareList: CourseWareList; // 课件列表
  recordUrl?: string; // 回放页地址
  widgets?: { [key: string]: typeof AgoraWidgetBase };
  userFlexProperties?: { [key: string]: unknown }; //用户自订属性
  mediaOptions?: LaunchMediaOptions;
  latencyLevel?: AgoraLatencyLevel;
  platform?: Platform;
  recordOptions?: BoardWindowAnimationOptions; // 白板录制参数
  recordRetryTimeout?: number; // 录制重试间隔
  uiMode?: FcrMultiThemeMode;
  shareUrl?: string; // 分享URL
  virtualBackgroundImages?: string[]; // 虚拟背景图片
  virtualBackgroundVideos?: string[]; // 虚拟背景视频
  webrtcExtensionBaseUrl?: string; // WebRTC 扩展插件包路径前缀
  rtcCloudProxyType?: AgoraCloudProxyType; // RTC 云代理类型
  rtmCloudProxyEnabled?: boolean; // 是否开启 RTM 云代理
};

/**
 *  运行窗口选项
 */
export type LaunchWindowOption = {
  windowID: WindowID; //窗口ID
  language: LanguageEnum; // 语言
  args: any; // 传入属性
  roomType: EduRoomTypeEnum;
  uiMode: FcrMultiThemeMode;
};

export type CourseWareItem = {
  resourceName: string;
  resourceUuid: string;
  ext: string;
  url?: string;
  size: number;
  updateTime: number;
  taskUuid?: string;
  taskProgress?: CloudDriveResourceConvertProgress;
  conversion?: ConversionOption;
  initOpen?: boolean;
};

export type CourseWareList = CourseWareItem[];

export type BoardWindowAnimationOptions = {
  minFPS?: number;
  maxFPS?: number;
  resolution?: number;
  autoResolution?: boolean;
  autoFPS?: boolean;
  maxResolutionLevel?: number;
  forceCanvas?: boolean;
};

export type ExtensionInitializer = {
  createInstance: () => IExtension<IBaseProcessor>;
  createProcessor: (extension: IExtension<IBaseProcessor>) => Promise<IBaseProcessor>;
};

export type ProcessorInitializer<T extends IBaseProcessor> = {
  name: string;
  createProcessor: () => Promise<T>;
};
