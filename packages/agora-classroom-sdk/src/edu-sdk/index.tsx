import '@/index.css';
// import { ReplayRoom } from "@/monolithic/replay-room"
import { LiveRoom } from "@/monolithic/live-room";
import { getLiveRoomPath } from '@/router';
import { eduSDKApi } from '@/services/edu-sdk-api';
import { AppStore } from "@/stores/app";
import { BizPagePath } from '@/types';
import { EduRoleTypeEnum, EduRoomTypeEnum, GenericErrorWrapper } from "agora-rte-sdk";
// import 'agora-scenario-ui-kit/lib/style.css';
import 'promise-polyfill/src/polyfill';
import React from 'react';
import { SceneDefinition } from 'white-web-sdk';
import { controller } from './controller';
import { AgoraEduSDKConfigParams, ListenerCallback } from "./declare";
import { checkConfigParams, checkLaunchOption } from './validator';
export interface AliOSSBucket {
  key: string
  secret: string
  name: string
  folder: string
  cdn: string
}

export interface WhiteboardOSSConfig {
  bucket: AliOSSBucket
}

export interface ApplicationConfigParameters {
  gtmId: string
  agora: {
    appId: string
    whiteboardAppId: string
  }
  appToken: string
  enableLog: boolean
  ossConfig?: WhiteboardOSSConfig
}

type SDKConfig = {
  configParams: AgoraEduSDKConfigParams
  sdkDomain: string
}

const sdkConfig: SDKConfig = {
  configParams: {
    appId: '',
    // rtmToken: '',
    // userName: '',
    // userUuid: '',
    // roomName: '',
    // roomUuid: '',
    // roomType: '',
    // roleType: '',
    // appId: '',
    // whiteboardAppId: '',
    // rtmUid: '',
  },
  sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`
}

export type LanguageEnum = "en" | "zh"
export type TranslateEnum = "" | "auto" | "zh-CHS" | "en" | "ja" | "ko" | "fr" | "es" | "pt" | "it" | "ru" | "vi" | "de" | "ar" 

export type ConvertedFile = {
  width: number,
  height: number,
  ppt: {
    width: number,
    src: string,
    height: number
  },
  conversionFileUrl: string,
}

export type ConvertedFileList = ConvertedFile[]

export type CourseWareItem = {
  resourceName: string,
  resourceUuid: string,
  ext: string,
  url: string,
  conversion: {
    type: string,
  },
  size: number,
  updateTime: number,
  scenes: SceneDefinition[],
  convert?: boolean,
  taskUuid?: string,
  taskToken?: string,
  taskProgress?: {
    totalPageSize?: number,
    convertedPageSize?: number,
    convertedPercentage?: number,
    convertedFileList: ConvertedFileList
  }
}

export type CourseWareList = CourseWareItem[]

/**
 * LaunchOption 接口
 */
export type LaunchOption = {
  userUuid: string, // 用户uuid
  userName: string, // 用户昵称
  roomUuid: string, // 房间uuid
  roleType: EduRoleTypeEnum, // 角色
  roomType: EduRoomTypeEnum, // 房间类型
  roomName: string, // 房间名称
  listener: ListenerCallback, // launch状态
  pretest: boolean, // 开启设备检测
  rtmUid: string
  rtmToken: string, // rtmToken
  language: LanguageEnum, // 国际化
  startTime: number, // 房间开始时间
  duration: number, // 课程时长
  courseWareList: CourseWareList, // 课件列表
  personalCourseWareList?: CourseWareList // 个人课件列表
  recordUrl?: string // 回放页地址
}

export type ReplayOption = {
  // logoUrl: string
  whiteboardAppId: string
  videoUrl: string
  whiteboardId: string
  whiteboardToken: string
  beginTime: number
  endTime: number
  listener: ListenerCallback
  language: LanguageEnum
}

export type OpenDiskOption = {
  listener: ListenerCallback, // launch状态
  language: LanguageEnum, // 国际化
  courseWareList: CourseWareList // 课件列表
}

export type AgoraEduBoardScene = SceneDefinition

export type AgoraEduCourseWare = {
  resourceUuid: string,
  resourceName: string,
  scenePath: string,
  scenes: AgoraEduBoardScene[],
  url: string,
  type: string,
}

export type DiskOption = {
  courseWareList: AgoraEduCourseWare[]
}

export type DelegateType = {
  delegate?: AppStore
}

const devicePath = '/pretest'
export class AgoraEduSDK {

  static get version(): string {
    return '1.1.0'
  }

  static _debug: boolean = false 

  static _list: AgoraEduCourseWare[]

  static configCourseWares(list: AgoraEduCourseWare[]) {
    this._list = list
  }

  static config (params: AgoraEduSDKConfigParams) {

    checkConfigParams(params);

    Object.assign(sdkConfig.configParams, params)
    eduSDKApi.updateConfig({
      sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
      appId: sdkConfig.configParams.appId,
    })
  }

  static _launchTime = 0

  static _replayTime = 0

  static _map: Record<string, DelegateType> = {
    "classroom": {
      delegate: undefined
    },
    "replay": {
      delegate: undefined
    }
  }

  /**
   * 开启在线教育场景
   * @param dom DOM元素
   * @param option LaunchOption
   */
  static async launch(dom: Element, option: LaunchOption) {
    console.log("launch ", dom, " option ", option)

    if (controller.appController.hasCalled) {
      throw GenericErrorWrapper("already launched")
    }

    const unlock = controller.appController.acquireLock()
    try {
      checkLaunchOption(dom, option)
      eduSDKApi.updateRtmInfo({
        rtmUid: option.userUuid,
        rtmToken: option.rtmToken,
      })
      const data = await eduSDKApi.getConfig()

      let mainPath = getLiveRoomPath(option.roomType)
      console.log('mainPath ', mainPath)
      let roomPath = mainPath

      console.log("main Path", mainPath, " room Path", roomPath)

      if (option.pretest) {
        mainPath = BizPagePath.PretestPagePath
      }

      const store = new AppStore({
        config: {
          agoraAppId: sdkConfig.configParams.appId,
          agoraNetlessAppId: data.netless.appId,
          enableLog: true,
          sdkDomain: sdkConfig.sdkDomain,
          courseWareList: option.courseWareList,
          personalCourseWareList: option.personalCourseWareList,
          oss: {
            region: data.netless.oss.region,
            bucketName: data.netless.oss.bucket,
            folder: data.netless.oss.folder,
            accessKey: data.netless.oss.accessKey,
            secretKey: data.netless.oss.secretKey,
            endpoint: data.netless.oss.endpoint
          },
          rtmUid: option.userUuid,
          rtmToken: option.rtmToken,
          recordUrl: data.recordUrl
        },
        language: option.language,
        startTime: option.startTime,
        duration: option.duration,
        roomInfoParams: {
          roomUuid: option.roomUuid,
          userUuid: option.userUuid,
          roomName: option.roomName,
          userName: option.userName,
          userRole: option.roleType,
          roomType: +option.roomType,
        },
        resetRoomInfo: false,
        mainPath: mainPath,
        roomPath: roomPath,
        pretest: option.pretest,
      })
      controller.appController.create(store, <LiveRoom store={store} />, dom, option.listener)
      //@ts-ignore
      window.globalStore = controller.appController.store
      unlock()
    } catch (err) {
      unlock()
      throw GenericErrorWrapper(err)
    }
    
    return controller.appController.getClassRoom()
  }
}