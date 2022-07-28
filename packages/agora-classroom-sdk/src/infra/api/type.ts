import {
  AgoraEduClassroomEvent,
  EduRoleTypeEnum,
  EduRoomServiceTypeEnum,
  EduRoomSubtypeEnum,
  EduRoomTypeEnum,
  EduRtcConfig,
  Platform,
} from 'agora-edu-core';
import { EduVideoEncoderConfiguration, MediaOptions } from 'agora-rte-sdk';
import { CloudDriveResourceConvertProgress } from '../stores/common/cloud-drive/type';
import { AgoraWidgetBase } from '../stores/common/widget/widget-base';
import { FcrMultiThemeMode } from '../types/config';

export type AgoraRegion = Uppercase<AgoraRegionString>;

export const regionMap = {
  AP: 'sg',
  CN: 'cn-hz',
  EU: 'gb-lon',
  NA: 'us-sv',
} as const;

export type AgoraRegionString = 'cn' | 'ap' | 'na' | 'eu';

export type ListenerCallback = (evt: AgoraEduClassroomEvent, ...args: any[]) => void;

export enum WindowID {
  Main = 'main',
  RemoteControlBar = 'remote-control-bar',
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

export type LaunchMediaOptions = MediaOptions & {
  lowStreamCameraEncoderConfiguration?: EduVideoEncoderConfiguration;
};

export type ConvertMediaOptionsConfig = EduRtcConfig & {
  defaultLowStreamCameraEncoderConfigurations?: EduVideoEncoderConfiguration;
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
  roomSubtype?: EduRoomSubtypeEnum; // 房间子类型
  roomServiceType?: EduRoomServiceTypeEnum; // 房间服务类型
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
  userFlexProperties?: { [key: string]: any }; //用户自订属性
  mediaOptions?: LaunchMediaOptions;
  latencyLevel?: 1 | 2;
  platform?: Platform;
  recordOptions?: BoardWindowAnimationOptions; // 白板录制参数
  recordRetryTimeout?: number; // 录制重试间隔
  uiMode?: FcrMultiThemeMode;
  shareUrl?: string; // 分享URL
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

export { AgoraWidgetBase } from '../stores/common/widget/widget-base';
export type {
  AgoraMultiInstanceWidget,
  AgoraTrackSyncedWidget,
  AgoraWidgetLifecycle,
  AgoraWidgetRenderable,
} from '../stores/common/widget/widget-base';
export { AgoraWidgetTrackMode } from '../stores/common/widget/type';

export { AgoraExtensionRoomEvent, AgoraExtensionWidgetEvent } from '../protocol/events';

export type CourseWareItem = {
  resourceName: string;
  resourceUuid: string;
  ext: string;
  url?: string;
  size: number;
  updateTime: number;
  taskUuid?: string;
  taskProgress?: CloudDriveResourceConvertProgress;
  conversion?: {
    outputFormat: string;
    preview: boolean;
    scale: number;
    type: 'dynamic' | 'static';
    canvasVersion: boolean;
  };
  initOpen?: boolean;
};

export type CourseWareList = CourseWareItem[];

export type BoardWindowAnimationOptions = {
  minFPS?: number;
  maxFPS?: number;
  resolution?: number;
  autoResolution?: boolean;
  autoFPS?: boolean;
};
