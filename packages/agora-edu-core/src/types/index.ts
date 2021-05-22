import { SceneDefinition } from "white-web-sdk"
import { CourseWareItem, LanguageEnum } from "../api/declare"

export enum DeviceStateEnum {
  Frozen = 0,
  Available = 1,
  Disabled = 2,
}

export type StorageCourseWareItem = {
  size: string,
  updateTime: string,
  progress: number,
  resourceName: string,
  resourceUuid: string,
  taskUuid: string,
  status: DownloadFileStatus,
  type: StorageFileType,
  download?: boolean
}

export type StorageFileType = string

export enum DownloadFileStatus {
  Cached = "cached",
  Downloading = "downloading",
  NotCached = "NotCached"
}

export type DownloadListWareItem = {
  fileName: string,
  uuid: string,
  size: string,
  type: StorageFileType
}


export type StorageStoreInitializeParams = {
  courseWareList: CourseWareItem[],
  language: LanguageEnum
}

export type CourseStorageType = CourseWareItem & {
  status: DownloadFileStatus,
  progress: number,
}

export enum BizPageRouter {
  Setting = 'setting',
  OneToOne = '1v1',
  SmallClass = 'small',
  OneToOneIncognito = '1v1_incognito',
  SmallClassIncognito = 'small_incognito',
  LaunchPage = 'launch',
  PretestPage = 'pretest',
  TestHomePage = 'test_home',
  Incognito = "Incognito"
}

export enum BizPagePath {
  OneToOnePath = '/classroom/1v1',
  SmallClassPath = '/classroom/mid',
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
  Disabled = "disabled",
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
  messageId: string
  fromRoomUuid?: string
  fromRoomName?: string
  status?: 'fail' | 'success' | 'loading'
}

export interface ChatConversation {
  userUuid: string,
  userName: string,
  unreadMessageCount: number,
  messages: any[],
  timestamp?: number
}