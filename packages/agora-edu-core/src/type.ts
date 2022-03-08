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
  startTime?: number;
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
  url?: string;
  size: number;
  updateTime: number;
  taskUuid?: string;
  taskProgress?: CloudDriveResourceConvertProgress;
  conversion?: any;
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
  Ready = 1, // 进入教室
  Destroyed = 2, // 教室销毁
  KickOut = 101, // 被踢出教室
  TeacherTurnOnMyMic = 102, // 老师允许学生打开麦克风
  TeacherTurnOffMyMic = 103, // 老师不允许学生打开麦克风
  TeacherGrantPermission = 104, // 老师授权白板权限
  TeacherRevokePermission = 105, // 老师收回白板权限
  UserAcceptToStage = 106, // 学生上台
  UserLeaveStage = 107, // 学生下台
  RewardReceived = 108, // 收到奖励
  TeacherTurnOnMyCam = 109, // 老师允许学生打开摄像头
  TeacherTurnOffMyCam = 110, // 老师不允许学生打开摄像头
  CurrentCamUnplugged = 111, // 摄像头被拔出
  CurrentMicUnplugged = 112, // 麦克风被拔出
  CurrentSpeakerUnplugged = 113, // 扬声器被拔出
  CaptureScreenPermissionDenied = 114, // 用户未授权屏幕共享
  ScreenShareStarted = 115, // 屏幕共享开始
  ScreenShareEnded = 116, // 屏幕共享结束
  InvitedToGroup = 117, //被邀请至小组
  MoveToOtherGroup = 118, // 被移动至小组
}
