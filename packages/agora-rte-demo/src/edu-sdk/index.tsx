import { SceneDefinition } from 'white-web-sdk';
import '@/index.scss'
import 'promise-polyfill/src/polyfill'
import React from 'react'
// import { ReplayRoom } from "@/monolithic/replay-room"
import { LiveRoom } from "@/monolithic/live-room"
import { GenericErrorWrapper, EduRoleTypeEnum, EduRoomTypeEnum  } from "agora-rte-sdk"
import { AppStore } from "@/stores/app"
import { unmountComponentAtNode } from "react-dom"
import { AgoraEduSDKConfigParams, ListenerCallback } from "./declare"
import { eduSDKApi } from '@/services/edu-sdk-api'
import { AgoraSDKError, checkConfigParams, checkDiskParams, checkLaunchOption, checkReplayOption } from './validator'
import { diskAppStore, DiskAppStore, DiskLifeStateEnum } from '@/monolithic/disk/disk-store';
import { controller, EduSDKInternalStateEnum } from './controller';
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

export type LanguageEnum = "" | "en" | "zh"
export type TranslateEnum = "" | "auto" | "zh-CHS" | "en" | "ja" | "ko" | "fr" | "es" | "pt" | "it" | "ru" | "vi" | "de" | "ar" 

export type ConvertedFile = {
  width: number,
  height: number,
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
  translateLanguage: TranslateEnum, // 翻译语言
  startTime: number, // 房间开始时间
  duration: number, // 课程时长
  courseWareList: CourseWareList // 课件列表
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

// class ReplayRoom {

//   private readonly store!: ReplayAppStore
//   private dom!: Element

//   constructor(store: ReplayAppStore, dom: Element) {
//     this.store = store
//     this.dom = dom
//   }

//   async destroy () {
//     await this.store.destroy()
//     unmountComponentAtNode(this.dom)
//     instances["replay"] = undefined
//   }
// }

// const stores: Map<string, AppStore> = new Map()

const locks: Map<string, boolean> = new Map()

// const instances: Record<string, any> = {

// }

const roomTypes = {
  [EduRoomTypeEnum.Room1v1Class]: {
    path: '/classroom/one-to-one'
  },
  [EduRoomTypeEnum.RoomSmallClass]: {
    path: '/classroom/small-class'
  },
  [EduRoomTypeEnum.RoomBigClass]: {
    path: '/classroom/big-class'
  },
  [EduRoomTypeEnum.RoomAcadosc]: {
    path: '/acadsoc/one-to-one'
  }
}

const devicePath = '/pretest'
export class AgoraEduSDK {

  static get version(): string {
    return '1.0.0'
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

      // let mainPath = roomTypes[option.roomType]?.path || '/classroom/one-to-one'
      let mainPath = '/acadsoc/one-to-one' // TODO: 阿卡索主页
      let roomPath = mainPath

      console.log("main Path", mainPath, " room Path", roomPath)

      if (option.pretest) {
        mainPath = '/pretest'
      }

      const store = new AppStore({
        config: {
          agoraAppId: sdkConfig.configParams.appId,
          agoraNetlessAppId: data.netless.appId,
          enableLog: true,
          sdkDomain: sdkConfig.sdkDomain,
          courseWareList: option.courseWareList,
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
        },
        language: option.language,
        translateLanguage: option.translateLanguage,
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
      //@ts-ignore
      // window.globalStore = store
      // stores.set("app", store)
      controller.appController.create(store, <LiveRoom store={store} />, dom, option.listener)
      unlock()
    } catch (err) {
      unlock()
      throw GenericErrorWrapper(err)
    }
    
    return controller.appController.getClassRoom()
  }

  // TODO: @deprecated method
  static async replay(dom: Element, option: ReplayOption) {

    console.log(" replay ", dom, " option ", JSON.stringify(option))
    if (controller.replayController.hasCalled) {
      throw GenericErrorWrapper("already replayed")
    }

    const unlock = controller.replayController.acquireLock()
    try {
      checkReplayOption(dom, option)

      // const store = new ReplayAppStore({
      //   config: {
      //     agoraAppId: sdkConfig.configParams.appId,
      //     agoraNetlessAppId: option.whiteboardAppId,
      //     enableLog: true,
      //     sdkDomain: sdkConfig.sdkDomain,
      //     rtmUid: '',
      //     rtmToken: '',
      //     courseWareList: [],
      //   },
      //   language: option.language,
      //   replayConfig: {
      //     whiteboardUrl: option.videoUrl,
      //     logoUrl: '',
      //     whiteboardId: option.whiteboardId,
      //     whiteboardToken: option.whiteboardToken,
      //     startTime: option.beginTime,
      //     endTime: option.endTime,
      //   },
      // })

      // controller.replayController.create(store, <ReplayRoom store={store}/>, dom, option.listener)
      unlock()
    } catch (err) {
      unlock()
      throw GenericErrorWrapper(err)
    }

    return controller.replayController.getClassRoom()
  }

  static openDisk(dom: Element) {
    if (diskAppStore.status === DiskLifeStateEnum.init) {
      throw GenericErrorWrapper("already disk")
    }
  }
}