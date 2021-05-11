import { EduRoleTypeEnum } from 'agora-rte-sdk';

export type AgoraRegion = Uppercase<AgoraRegionString>

export const regionMap = {
  'AP': 'sg',
  'CN': 'cn-hz',
  'EU': 'gb-lon',
  'NS': 'us-sv',
} as const

export type AgoraRegionString = 
  | 'cn'
  | 'ap'
  | 'ns'

export type RoomConfigProps<T> = {
  store: T
}

export interface RoomComponentConfigProps<T> {
  store: T
  dom: Element
}


export enum AgoraEduEvent {
  ready = 1,
  destroyed = 2,
  clicked = 3
}


export type AgoraEduSDKConfigParams = {
  appId: string;
  region?: string;
}

export interface RoomParameters {
  roomUuid: string
  userUuid: string
  roomName: string
  userName: string
  userRole: EduRoleTypeEnum
  roomType: number
}

export type ListenerCallback = (evt: AgoraEduEvent) => void

export type PPTDataType = {
  active: boolean,
  pptType: PPTType,
  id: string,
  data: any,
  cover: any,
  showName: string
}

export enum PPTType {
  dynamic = "dynamic",
  static = "static",
  mp4 = "mp4",
  mp3 = "mp3",
  init = "init",
}

export type NetlessImageFile = {
  width: number,
  height: number,
  file: File,
  coordinateX: number,
  coordinateY: number,
}

export type TaskType = {
  uuid: string,
  folder: string,
  imageFile: NetlessImageFile
}

//查找网盘文件信息
export type OssExistsFileInfo = {
  isExist: boolean, //是否存在
  fileOssUrl: string , //文件网盘路径
  findInfo: string , //查询信息
}

export type PPTProgressListener = (phase: PPTProgressPhase, percent: number) => void;

export enum PPTProgressPhase {
  Checking, //检测
  Uploading,
  Converting,
}