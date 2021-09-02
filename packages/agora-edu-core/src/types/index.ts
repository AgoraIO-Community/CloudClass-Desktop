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
declare module 'white-web-sdk' {
  export interface Room {
    /**
     * @param scenePath: 需要导出的白板场景路径，要求必须是合法的路径页面，否则会 throw error。如果想获取当前页面的文件，传入 room.state.sceneState.scenePath 即可
     * @return Promise<Blob> 该方法需要进行一次网络请求，所以是异步回调。如果网络请求传错误，也会 throw error，并提供具体信息。
     * Blob 转文件下载可以参考网络。
     */
    exportScene(scenePath: string): Promise<Blob> 

    /**
     * @param dir 场景文件想要插入的场景目录位置。该路径必须是场景目录，否则会报错，无法插入。
     * @param payload 场景文件
     * @return Promise<SceneDefinition> 该方法插入成功后，会返回场景页面的具体信息，当前插入的方式，无法自定义场景文件的名称，所以会将场景文件的内容给予返回。如果实在需要更改名称，可以将 dir + name 的路径拼接后，使用 moveScene API 进行替换。
     */
    importScene(dir: string, payload: Blob): Promise<SceneDefinition> 
  }
}