import {
  EduRoleTypeEnum,
  EduVideoEncoderConfiguration,
  EduRoomTypeEnum,
  MediaEncryptionConfig,
} from 'agora-rte-sdk';
import { SceneDefinition } from 'white-web-sdk';

export type AgoraExtAppUserInfo = {
  userUuid: string;
  userName: string;
  roleType: number;
};

export type AgoraExtAppRoomInfo = {
  roomUuid: string;
  roomName: string;
  roomType: number;
};

export type AgoraExtAppContext = {
  properties: any;
  dependencies: Map<string, any>;
  localUserInfo: AgoraExtAppUserInfo;
  roomInfo: AgoraExtAppRoomInfo;
  language: string;
};

export type AgoraExtAppHandle = {
  updateRoomProperty: (
    properties: any,
    common: any,
    cause: any,
  ) => Promise<void>;
  deleteRoomProperties: (properties: string[], cause: any) => Promise<void>;
};

export interface IAgoraExtApp {
  language: string;
  appIdentifier: string;
  appName: string;
  width: number;
  height: number;
  extAppDidLoad(
    dom: Element,
    ctx: AgoraExtAppContext,
    handle: AgoraExtAppHandle,
  ): void;
  extAppRoomPropertiesDidUpdate(properties: any, cause: any): void;
  extAppWillUnload(): void;
}

export type AgoraWidgetUserInfo = {
  userUuid: string;
  userName: string;
  roleType: number;
};

export type AgoraWidgetRoomInfo = {
  roomUuid: string;
  roomName: string;
  roomType: number;
};

export type AgoraWidgetContext = {
  // properties: any
  events: any;
  actions: any;
  dependencies: Map<string, any>;
  localUserInfo: AgoraWidgetUserInfo;
  roomInfo: AgoraWidgetRoomInfo;
  language: string;
};

export type AgoraWidgetHandle = {
  updateRoomProperty: (properties: any, cause: any) => Promise<void>;
  deleteRoomProperties: (properties: string[], cause: any) => Promise<void>;
};

export interface IAgoraWidget {
  widgetId: string;
  widgetDidLoad(dom: Element, ctx: AgoraWidgetContext, widgetProps: any): void;
  widgetRoomPropertiesDidUpdate(properties: any, cause: any): void;
  widgetWillUnload(): void;
}

export type AgoraConvertedFile = {
  width: number;
  height: number;
  ppt: {
    width: number;
    src: string;
    height: number;
  };
  conversionFileUrl: string;
};

export type ConvertedFileList = AgoraConvertedFile[];

export type CourseWareItem = {
  resourceName: string;
  resourceUuid: string;
  ext: string;
  url: string;
  conversion: {
    type: string;
  };
  size: number;
  updateTime: number;
  scenes: SceneDefinition[];
  convert?: boolean;
  taskUuid?: string;
  taskToken?: string;
  taskProgress?: {
    totalPageSize?: number;
    convertedPageSize?: number;
    convertedPercentage?: number;
    convertedFileList: ConvertedFileList;
  };
  isActive?: boolean;
};

export type CourseWareList = CourseWareItem[];

type RoomInfoParams = {
  roomName: string;
  roomType: number;
  roomUuid: string;
  userName: string;
  userRole: number;
  userUuid: string;
};

export type AgoraRegion = Uppercase<AgoraRegionString>;

export const regionMap = {
  AP: 'sg',
  CN: 'cn-hz',
  EU: 'gb-lon',
  NS: 'us-sv',
} as const;

export type AgoraRegionString = 'cn' | 'ap' | 'ns';

export type BoardOptionUserPayload = {
  avatar?: string;
  cursorName?: string;
  disappearCursor?: boolean;
};

export type BoardOptions = {
  userPayload?: BoardOptionUserPayload;
};

export type MediaOptions = {
  cameraEncoderConfiguration?: EduVideoEncoderConfiguration;
  screenShareEncoderConfiguration?: EduVideoEncoderConfiguration;
  encryptionConfig?: MediaEncryptionConfig;
};

export type AppStoreConfigParams = {
  agoraAppId: string;
  agoraNetlessAppId: string;
  // agoraRestFullToken: string
  enableLog: boolean;
  sdkDomain: string;
  rtmUid: string;
  rtmToken: string;
  courseWareList: CourseWareList;
  region?: AgoraRegion;
  rtcArea?: string;
  rtmArea?: string;
  personalCourseWareList?: CourseWareList;
  vid?: number;
  oss?: {
    region: string;
    bucketName: string;
    folder: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
  };
  recordUrl: string;
  extApps?: IAgoraExtApp[];
  widgets?: { [key: string]: IAgoraWidget };
  userFlexProperties?: { [key: string]: any };
  mediaOptions?: MediaOptions;
  boardOptions?: BoardOptions;
};

export type LanguageEnum = 'en' | 'zh';

export type AppStoreInitParams = {
  roomInfoParams?: RoomInfoParams;
  config: AppStoreConfigParams;
  language: LanguageEnum;
  startTime?: number;
  duration?: number;
  pretest?: boolean;
  mainPath?: string;
  roomPath?: string;
  resetRoomInfo: boolean;
};

export type RoomInfo = {
  roomName: string;
  roomType: number;
  userName: string;
  userRole: EduRoleTypeEnum;
  userUuid: string;
  roomUuid: string;
  rtmUid: string;
  rtmToken: string;
  groupName?: string;
  groupUuid?: string;
};

export type DeviceInfo = {
  cameraName: string;
  microphoneName: string;
};

export type RoomConfigProps<T> = {
  store: T;
};

export interface RoomComponentConfigProps<T> {
  store: T;
  dom: Element;
}

export enum AgoraEduEvent {
  ready = 1,
  destroyed = 2,
  clicked = 3,
}

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
  // rtmUid: string
  rtmToken: string; // rtmToken
  language: LanguageEnum; // 国际化
  startTime: number; // 房间开始时间
  duration: number; // 课程时长
  courseWareList: CourseWareList; // 课件列表
  personalCourseWareList?: CourseWareList; // 个人课件列表
  recordUrl?: string; // 回放页地址
  extApps?: IAgoraExtApp[]; // app插件
  region?: AgoraRegion;
  widgets?: { [key: string]: IAgoraWidget };
  userFlexProperties?: { [key: string]: any }; //用户自订属性
  mediaOptions?: MediaOptions;
};

export type AgoraEduSDKConfigParams = {
  appId: string;
  region?: string;
};

export interface RoomParameters {
  roomUuid: string;
  userUuid: string;
  roomName: string;
  userName: string;
  userRole: EduRoleTypeEnum;
  roomType: number;
}

export type ListenerCallback = (evt: AgoraEduEvent) => void;

export type PPTDataType = {
  active: boolean;
  pptType: PPTType;
  id: string;
  data: any;
  cover: any;
  showName: string;
};

export enum PPTType {
  dynamic = 'dynamic',
  static = 'static',
  mp4 = 'mp4',
  mp3 = 'mp3',
  init = 'init',
}

export type NetlessImageFile = {
  width: number;
  height: number;
  file: File;
  coordinateX: number;
  coordinateY: number;
};

export type TaskType = {
  uuid: string;
  folder: string;
  imageFile: NetlessImageFile;
};

//查找网盘文件信息
export type OssExistsFileInfo = {
  isExist: boolean; //是否存在
  fileOssUrl: string; //文件网盘路径
  findInfo: string; //查询信息
};

export type PPTProgressListener = (
  phase: PPTProgressPhase,
  percent: number,
) => void;

export enum PPTProgressPhase {
  Checking, //检测
  Uploading,
  Converting,
}
