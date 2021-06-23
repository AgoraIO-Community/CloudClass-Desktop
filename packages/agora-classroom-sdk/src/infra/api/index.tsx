import { getLiveRoomPath } from '@/infra/router/index';
import { CoreContextProvider, CourseWareList, eduSDKApi, SceneDefinition, IAgoraExtApp, IAgoraWidget, globalConfigs } from 'agora-edu-core';
import { EduRoleTypeEnum, EduRoomTypeEnum, GenericErrorWrapper } from "agora-rte-sdk";
import 'promise-polyfill/src/polyfill';
import { ReactElement, useState, ReactChild } from 'react';
import { AgoraIFrameWidget } from 'agora-widget-gallery';
import { LiveRoom } from '../monolithic/live-room';
import { BizPagePath } from '../types';
import { controller } from './controller';
import { AgoraEduSDKConfigParams, AgoraRegion, ListenerCallback } from "./declare";
import { checkConfigParams, checkLaunchOption } from './validator';
import { UIContext } from '@/infra/hooks'
import { UIStore } from '@/infra/stores/app/ui'

export const UIContextProvider = ({ children }: { children: ReactChild}) => {

  const [store] = useState<UIStore>(() => new UIStore())

  return (
    <UIContext.Provider value={store}>
      {children}
    </UIContext.Provider>
  )
}

export interface AliOSSBucket {
  key: string
  secret: string
  name: string
  folder: string
  cdn: string
}


export const scenarioRoomPath = {
  [EduRoomTypeEnum.Room1v1Class]: {
    path: BizPagePath.OneToOnePath,
  },
  [EduRoomTypeEnum.RoomSmallClass]: {
    path: BizPagePath.MidClassPath,
  },
  [EduRoomTypeEnum.RoomBigClass]: {
    path: BizPagePath.BigClassPath,
  }
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
  }
} 

export type LanguageEnum = "en" | "zh"
export type TranslateEnum = "" | "auto" | "zh-CHS" | "en" | "ja" | "ko" | "fr" | "es" | "pt" | "it" | "ru" | "vi" | "de" | "ar"

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
  // rtmUid: string
  rtmToken: string, // rtmToken
  language: LanguageEnum, // 国际化
  startTime: number, // 房间开始时间
  duration: number, // 课程时长
  courseWareList: CourseWareList, // 课件列表
  personalCourseWareList?: CourseWareList, // 个人课件列表
  recordUrl?: string, // 回放页地址
  extApps?: IAgoraExtApp[] // app插件
  region?: AgoraRegion
  widgets?: {[key: string]: IAgoraWidget}
  userFlexProperties?: {[key: string]: any} //用户自订属性
}

/**
 * PretestOption 接口
 */
 export type PretestOption = {
  listener: ListenerCallback, // launch状态
  language: LanguageEnum, // 国际化
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

const devicePath = '/pretest'
export class AgoraEduSDK {

  static get version(): string {
    return '1.1.0'
  }

  static _debug: boolean = false 

  static _list: AgoraEduCourseWare[]

  // @internal
  static configCourseWares(list: AgoraEduCourseWare[]) {
    this._list = list
  }

  static config (params: AgoraEduSDKConfigParams) {

    checkConfigParams(params);

    Object.assign(sdkConfig.configParams, params)

    globalConfigs.setRegion(params.region ?? 'GLOBAL')

    console.log('# set config ', sdkConfig.configParams, ' params ', params)
    // globalConfigs should only be copied here
    eduSDKApi.updateConfig({ 
      sdkDomain: globalConfigs.sdkDomain,
      appId: sdkConfig.configParams.appId,
    })
  }

  // @internal
  static setParameters(params: string) {
    try {
      let json = JSON.parse(params)
      if(json["edu.apiUrl"]) {
        globalConfigs.setSDKDomain(json["edu.apiUrl"])
      }
      if(json["reportUrl"] && json["reportQos"]) {
        globalConfigs.setReportConfig({
          sdkDomain: json['reportUrl'],
          qos: +(json['reportQos'])
        })
      }else{
        globalConfigs.setReportConfig();
      }
      console.info(`setParameters ${params}`)
    }catch(e) {
      console.error(`parse private params failed ${params}`)
    }
  }

  static _launchTime = 0

  static _replayTime = 0

  private static appNode: ReactElement | null = null

  static setAppNode (appNode: ReactElement) {
    this.appNode = appNode
  }

  /**
   * 开启在线教育场景
   * @param dom DOM元素
   * @param option LaunchOption
   */
  static async launch(dom: HTMLElement, option: LaunchOption) {
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

      //@ts-ignore
      let mainPath = getLiveRoomPath(option.roomType)
      console.log('mainPath ', mainPath)
      //@ts-ignore
      let roomPath = mainPath

      console.log("main Path", mainPath, " room Path", roomPath)

      if (option.pretest) {
        mainPath = BizPagePath.PretestPagePath
      }

      const params = {
        config: {
          rtcArea: globalConfigs.sdkArea.rtcArea,
          rtmArea: globalConfigs.sdkArea.rtmArea,
          agoraAppId: sdkConfig.configParams.appId,
          agoraNetlessAppId: data.netless.appId,
          enableLog: true,
          sdkDomain: `${globalConfigs.sdkDomain}`,
          region: option.region,
          courseWareList: option.courseWareList,
          personalCourseWareList: option.personalCourseWareList,
          vid: data.vid,
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
          recordUrl: option.recordUrl!,
          extApps: option.extApps,
          widgets: {...{'chat':new AgoraIFrameWidget()}, ...option.widgets},
          userFlexProperties: option.userFlexProperties
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
      }
      controller.appController.create(
        <CoreContextProvider params={params} dom={dom} controller={controller.appController}>
            <UIContextProvider>
              <LiveRoom />
            </UIContextProvider>
        </CoreContextProvider>,
        dom,
        option.listener
      )
      unlock()
    } catch (err) {
      unlock()
      throw GenericErrorWrapper(err)
    }
    
    return controller.appController.getClassRoom()
  }

  /**
   * 只开启设备检测页
   * @param dom DOM元素
   * @param option LaunchOption
   */
   static async pretest(dom: HTMLElement, option: PretestOption) {
    console.log("pretest ", dom, " option ", option)

    if (controller.appController.hasCalled) {
      throw GenericErrorWrapper("already launched")
    }

    const unlock = controller.appController.acquireLock()
    try {
      const mainPath = BizPagePath.PretestPagePath

      const DUMMY = "dummy"

      const params = {
        config: {
          rtcArea: globalConfigs.sdkArea.rtcArea,
          rtmArea: globalConfigs.sdkArea.rtmArea,
          recordUrl: DUMMY,
          agoraAppId: sdkConfig.configParams.appId,
          agoraNetlessAppId: DUMMY,
          enableLog: true,
          sdkDomain: `${globalConfigs.sdkDomain}`,
          courseWareList: [],
          personalCourseWareList: [],
          vid: -1,
          oss: {
            region: DUMMY,
            bucketName: DUMMY,
            folder: DUMMY,
            accessKey: DUMMY,
            secretKey: DUMMY,
            endpoint: DUMMY
          },
          rtmUid: DUMMY,
          rtmToken: DUMMY,
          pretestOnly: true
        },
        language: option.language,
        startTime: undefined,
        duration: undefined,
        roomInfoParams: {
          roomUuid: DUMMY,
          userUuid: DUMMY,
          roomName: DUMMY,
          userName: DUMMY,
          userRole: 0,
          roomType: 0,
        },
        resetRoomInfo: false,
        mainPath: mainPath,
      }
      controller.appController.create(
        <CoreContextProvider params={params} dom={dom} controller={controller.appController}>
            <UIContextProvider>
              <LiveRoom />
            </UIContextProvider>
        </CoreContextProvider>,
        dom,
        option.listener
      )
      unlock()
    } catch (err) {
      unlock()
      throw GenericErrorWrapper(err)
    }
    
    return controller.appController.getClassRoom()
  }
}

export * from './declare';
