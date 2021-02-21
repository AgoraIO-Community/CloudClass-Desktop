import 'promise-polyfill/src/polyfill'
import '@/index.scss'
import { RenderLiveRoom } from "@/monolithic/live-room"
import { RenderReplayRoom } from "@/monolithic/replay-room"
import { GenericErrorWrapper } from "@/sdk/education/core/utils/generic-error"
import { AppStore } from "@/stores/app"
import { ReplayAppStore } from "@/stores/replay-app"
import { unmountComponentAtNode } from "react-dom"
import { AgoraEduSDKConfigParams, ListenerCallback } from "./declare"
import { eduSDKApi } from '@/services/edu-sdk-api'
import { EduRoleTypeEnum, EduRoomTypeEnum } from "@/sdk/education/interfaces/index.d"
import { AgoraSDKError, checkConfigParams, checkLaunchOption, checkReplayOption } from './validator'

export enum AgoraEduEvent {
  ready = 1,
  destroyed = 2
}

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

export type LaunchOption = {
  userUuid: string
  userName: string
  roomUuid: string
  roleType: EduRoleTypeEnum
  roomType: EduRoomTypeEnum
  roomName: string
  listener: ListenerCallback
  pretest: boolean
  // rtmUid: string
  rtmToken: string
  language: LanguageEnum
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

export type DelegateType = {
  delegate?: AppStore
}

class ReplayRoom {

  private readonly store!: ReplayAppStore
  private dom!: Element
  public _isReleased: boolean = false

  constructor(store: ReplayAppStore, dom: Element) {
    this.store = store
    this.dom = dom
  }

  async destroy () {
    if (this._isReleased) {
      throw new GenericErrorWrapper("replay room already destroyed")
    }
    try {
      await this.store.destroy()
    } catch (err) {
      console.error(err)
    }
    unmountComponentAtNode(this.dom)
    instances["replay"] = undefined
    this._isReleased = true
  }
}

class ClassRoom {

  private readonly store!: AppStore
  private dom!: Element

  public _isReleased: boolean = false

  constructor(store: AppStore, dom: Element) {
    this.store = store
    this.dom = dom
  }

  async destroy () {
    if (this._isReleased) {
      throw new GenericErrorWrapper("classroom already destroyed")
    }
    try {
      await this.store.destroy()
    } catch (err) {
      console.error(err)
    }
    unmountComponentAtNode(this.dom)
    this._isReleased = true
    instances["launch"] = undefined
  }
}

const stores: Map<string, AppStore> = new Map()

const locks: Map<string, boolean> = new Map()

const instances: Record<string, any> = {

}

const roomTypes = {
  [EduRoomTypeEnum.Room1v1Class]: {
    path: '/classroom/one-to-one'
  },
  [EduRoomTypeEnum.RoomSmallClass]: {
    path: '/classroom/small-class'
  },
  [EduRoomTypeEnum.RoomBigClass]: {
    path: '/classroom/big-class'
  }
}

const devicePath = '/setting'
export class AgoraEduSDK {

  static get version(): string {
    return '1.0.1-rc.1'
  }

  static _debug: boolean = false 

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

  static async launch(dom: Element, option: LaunchOption) {
    console.log("launch ", dom, " option ", option)

    checkLaunchOption(dom, option)

    if (locks.has("launch") || instances["launch"]) {
      throw new GenericErrorWrapper("already launched")
    }

    try {
      locks.set("launch", true)
      eduSDKApi.updateRtmInfo({
        rtmUid: option.userUuid,
        rtmToken: option.rtmToken,
      })
      const data = await eduSDKApi.getConfig()

      let mainPath = roomTypes[option.roomType]?.path || '/classroom/one-to-one'
      let roomPath = mainPath

      console.log("main Path", mainPath, " room Path", roomPath)

      if (option.pretest) {
        mainPath = '/setting'
      }

      const store = new AppStore({
        config: {
          agoraAppId: sdkConfig.configParams.appId,
          agoraNetlessAppId: data.netless.appId,
          enableLog: true,
          sdkDomain: sdkConfig.sdkDomain,
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
        listener: option.listener,
        unmountDom: () => {
          unmountComponentAtNode(dom)
          if (instances["launch"]) {
            instances["launch"]._isReleased = true
            instances["launch"] = undefined
            console.log("release launch instance")
          }
          console.log("unmount dom")
        }
      })
      //@ts-ignore
      window.globalStore = store
      stores.set("app", store)
      RenderLiveRoom({dom, store}, this._map["classroom"])
      if (store.params.listener) {
        store.params.listener(AgoraEduEvent.ready)
      }
      locks.delete("launch")
      instances["launch"] = new ClassRoom(store, dom)
      return instances["launch"]
    } catch (err) {
      locks.delete("launch")
      throw new GenericErrorWrapper(err)
    }
  }

  static async replay(dom: Element, option: ReplayOption) {

    console.log(" replay ", dom, " option ", JSON.stringify(option))
    if (locks.has("replay") || instances["replay"]) {
      throw new GenericErrorWrapper("already replayed")
    }

    checkReplayOption(dom, option)

    const store = new ReplayAppStore({
      config: {
        agoraAppId: sdkConfig.configParams.appId,
        agoraNetlessAppId: option.whiteboardAppId,
        enableLog: true,
        sdkDomain: sdkConfig.sdkDomain,
        rtmUid: '',
        rtmToken: '',
      },
      language: option.language,
      replayConfig: {
        whiteboardUrl: option.videoUrl,
        logoUrl: '',
        whiteboardId: option.whiteboardId,
        whiteboardToken: option.whiteboardToken,
        startTime: option.beginTime,
        endTime: option.endTime,
      },
      listener: option.listener,
    })
    RenderReplayRoom({dom, store}, this._map["replay"])
    if (store.params.listener) {
      store.params.listener(AgoraEduEvent.ready)
    }
    instances["replay"] = new ReplayRoom(store, dom)
    return instances["replay"]
  }
}
