import { SceneDefinition } from 'white-web-sdk';
import { CloudDriveResourceConvertProgress } from './stores/domain/common/cloud-drive/type';

export enum ClassroomState {
  Idle = 0,
  Connecting = 1,
  Connected = 2,
  Reconnecting = 3,
  Error = 4,
}

export enum WhiteboardState {
  Idle = 0,
  Connecting = 1,
  Connected = 2,
  Reconnecting = 3,
}

/**
 * 教育SDK房间枚举
 * Room1v1Class = 1，1v1
 * RoomSmallClass = 4，小班课
 */
export enum EduRoomTypeEnum {
  Room1v1Class = 0,
  RoomSmallClass = 4,
  RoomBigClass = 2,
  // RoomAcadosc = 3
}

/**
 * 教育SDK角色枚举
 * invisible = 0,为观众
 * teacher = 1，为老师
 * student = 2，为学生
 * assistant = 3，为助教
 */
export enum EduRoleTypeEnum {
  none = -1,
  invisible = 0,
  teacher = 1,
  student = 2,
  assistant = 3,
}

export interface EduSessionInfo {
  roomUuid: string;
  roomName: string;
  roomType: EduRoomTypeEnum;
  userUuid: string;
  userName: string;
  role: EduRoleTypeEnum;
  token: string;
  flexProperties: any;
  duration: number;
}

export type StorageCourseWareItem = {
  size: string;
  updateTime: string;
  progress: number;
  resourceName: string;
  resourceUuid: string;
  taskUuid: string;
  status: DownloadFileStatus;
  type: StorageFileType;
  download?: boolean;
};

export interface BoardToolItem {
  value: string;
  label: any;
  icon: string;
  isActive?: boolean;
  hover?: boolean;
  component?: any;
}

export enum DownloadFileStatus {
  Cached = 'cached',
  Downloading = 'downloading',
  NotCached = 'NotCached',
}

export type StorageFileType = string;

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
  taskProgress?: CloudDriveResourceConvertProgress;
  isActive?: boolean;
};

export type CourseWareList = CourseWareItem[];

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

export type FetchImageResult = {
  width: number;
  height: number;
  file: File;
  uuid: string;
  url: string;
};

export type BaseImageSize = {
  width: number;
  height: number;
};

export type Color = {
  r: number;
  g: number;
  b: number;
};

export enum Identity {
  host = 'host',
  guest = 'guest',
}

export enum AgoraEduEventType {
  classroomEvents = 'classroom-events',
  interactionEvents = 'interaction-events',
}

export enum AgoraEduClassroomEvent {
  ready = 1,
  destroyed = 2,
  clicked = 3,
}

export enum AgoraEduInteractionEvent {
  KickOut = 1,
  TeacherTurnOnMyMic = 2,
  TeacherTurnOffMyMic = 3,
  TeacherGrantPermission = 4,
  TeacherRevokePermission = 5,
  UserAcceptToStage = 6,
  UserLeaveStage = 7,
  RewardReceived = 8,
  TeacherTurnOnMyCam = 9,
  TeacherTurnOffMyCam = 10,
  CurrentCamUnplugged = 11,
  CurrentMicUnplugged = 12,
  CurrentSpeakerUnplugged = 13,
}

export type ConfirmDialogAction = 'ok' | 'cancel';
