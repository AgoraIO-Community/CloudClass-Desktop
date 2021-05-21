import { SceneDefinition } from "agora-edu-core"

export declare type ListenerCallbackType<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];




export enum BizPageRouter {
  Setting = 'setting',
  OneToOne = '1v1',
  MidClass = 'small',
  BigClass = 'big',
  OneToOneIncognito = '1v1_incognito',
  SmallClassIncognito = 'small_incognito',
  LaunchPage = 'launch',
  PretestPage = 'pretest',
  TestHomePage = 'test_home',
  Incognito = "Incognito",
  TestRecordPage = "test_record"
}

export enum BizPagePath {
  OneToOnePath = '/classroom/1v1',
  MidClassPath = '/classroom/mid',
  BigClassPath = '/classroom/big',
  PretestPagePath = '/pretest',
}

export type NetlessTaskProgress = {
  totalPageSize: number,
  convertedPageSize: number,
  convertedPercentage: number,
  convertedFileList: readonly SceneDefinition[]
}

export type CreateMaterialParams = {
  roomUuid: string,
  // userUuid: string,
  resourceUuid: string,
  url: string,
  resourceName: string,
  ext: string, 
  taskUuid: string,
  taskToken: string,
  taskProgress: NetlessTaskProgress,
  size: number
}

export type CreateMaterialResult = {
  ext: string,
  resourceName: string,
  resourceUuid: string,
  size: number,
  taskProgress: NetlessTaskProgress,
  updateTime: number,
  taskUuid: string,
  url: string,
}

export type CourseWareUploadResult = {
  resourceUuid: string,
  resourceName: string,
  ext: string,
  size: number,
  url: string,
  updateTime: number,
  scenes?: readonly SceneDefinition[],
  taskUuid?: string,
}

export enum QuickTypeEnum { 
  Kick = "kick",
  Kicked = "kicked",
  End = "end"
}

export enum AgoraMediaDeviceEnum {
  Default = "",
  Muted = "muted",
  Unknown = "unknown"
}

export interface ChatMessage {
  account: string
  text: string
  link?: string
  ts: number
  id: string
  sender?: boolean
  role: number
  fromRoomUuid?: string
  fromRoomName?: string
  status?: 'fail' | 'success' | 'loading'
}