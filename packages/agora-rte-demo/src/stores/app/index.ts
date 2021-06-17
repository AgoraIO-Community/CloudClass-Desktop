import { dialogManager } from 'agora-aclass-ui-kit';
import uuidv4 from 'uuid/v4';
import { CourseWareItem, CourseWareList } from './../../edu-sdk/index';

import {
  GenericErrorWrapper,
  EduManager,
  EduClassroomManager,
  LocalUserRenderer,
  EduStream,
  PrepareScreenShareParams,
  AgoraWebRtcWrapper,
  AgoraElectronRTCWrapper,
  EduRoleTypeEnum,
  EduUserService,
  EduLogger,
} from 'agora-rte-sdk'
import * as AgoraCEF from 'agora-cef-sdk';
import { EduRecordService } from '@/modules/record/edu-record-service';
import { EduBoardService } from '@/modules/board/edu-board-service';
import { UIStore } from './ui';
import { LanguageEnum, TranslateEnum } from '@/edu-sdk';
import { BoardStore } from './board';
import { PretestStore } from './pretest'
import { DiskStore } from './disk'
// import { get, isEmpty } from 'lodash';
import { GlobalStorage } from '@/utils/custom-storage';
import { autorun, toJS, observable, action, computed, runInAction } from 'mobx';
import { MediaStore } from './media';
import { t } from '@/i18n';
import { BizLogger } from '@/utils/biz-logger';
import { platform } from '@/utils/platform';
import { SceneStore } from './scene';
import { ListenerCallback, AgoraEduEvent } from '@/edu-sdk/declare';
import { get, isEmpty } from 'lodash';
import { eduSDKApi } from '@/services/edu-sdk-api';
import { MemoryStorage } from '@/utils/custom-storage';
import { AcadsocRoomStore } from './acadsoc-room';
import { UploadService } from '@/services/upload-service';
import { reportService } from '@/services/report-service';
import { ClassRoomAbstractStore, controller } from '@/edu-sdk/controller';
import { HomeStore } from './home';
import { StatisticsStore } from './statistics';
import { APIStore } from './api';

type RoomInfoParams = {
  roomName: string
  roomType: number
  roomUuid: string
  userName: string
  userRole: number
  userUuid: string
}

export type AppStoreConfigParams = {
  agoraAppId: string
  agoraNetlessAppId: string
  // agoraRestFullToken: string
  enableLog: boolean
  sdkDomain: string
  reportDomain: string
  rtmUid: string
  rtmToken: string
  courseWareList: CourseWareList
  personalCourseWareList?: CourseWareList
  cachePath?: string
  oss?: {
    region: string
    bucketName: string
    folder: string
    accessKey: string
    secretKey: string
    endpoint: string
  }
}

export type AppStoreInitParams = {
  roomInfoParams?: RoomInfoParams
  config: AppStoreConfigParams
  language: LanguageEnum
  translateLanguage: TranslateEnum
  startTime?: number
  duration?: number
  pretest?: boolean
  mainPath?: string
  roomPath?: string
  resetRoomInfo: boolean
}

export type RoomInfo = {
  roomName: string
  roomType: number
  userName: string
  userRole: EduRoleTypeEnum
  userUuid: string
  roomUuid: string
  rtmUid: string
  rtmToken: string
  groupName?: string
  groupUuid?: string
}

export type DeviceInfo = {
  cameraName: string
  microphoneName: string
}

//TODO: cef release
window.onbeforeunload = () => {
  if (window.agoraBridge) {
    AgoraCEF.AgoraRtcEngine.release()
    console.log("[agora-apaas] cef release ", Date.now())
  }
}

export class AppStore implements ClassRoomAbstractStore {
  // stores
  uiStore!: UIStore;
  boardStore!: BoardStore;
  apiStore!: APIStore;
  statisticsStore!: StatisticsStore;
  mediaStore!: MediaStore;
  sceneStore!: SceneStore;
  acadsocStore!: AcadsocRoomStore;
  pretestStore!: PretestStore;
  diskStore!: DiskStore;
  homeStore!: HomeStore;

  eduManager!: EduManager;

  _boardService?: EduBoardService;
  _recordService?: EduRecordService;
  _uploadService?: UploadService;

  get boardService() {
    return this._boardService as EduBoardService;
  }

  get uploadService() {
    return this._uploadService as UploadService;
  }

  get recordService() {
    return this._recordService as EduRecordService;
  }

  get mediaService() {
    return this.eduManager.mediaService
  }

  get isWeb(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraWebRtcWrapper
  }

  get isElectron(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraElectronRTCWrapper
  }

  @observable
  deviceInfo!: DeviceInfo

  private load() {
    const storage = GlobalStorage.read('agora_edu_room')
    if (storage || !isEmpty(storage)) {
      this.roomInfo = storage.roomInfo
      this.updateRtmInfo({
        rtmUid: this.roomInfo.rtmUid,
        rtmToken: this.roomInfo.rtmToken,
      })
    } else {
      this.roomInfo = {
        roomName: "",
        roomUuid: "",
        roomType: 0,
        userName: "",
        userRole: EduRoleTypeEnum.none,
        userUuid: "",
        rtmUid: "",
        rtmToken: "",
      }
    }
  }

  @observable
  roomInfo!: RoomInfo
  
  get isNotInvisible() {
    return this.roomInfo.userRole !== EduRoleTypeEnum.invisible
  }

  @observable
  params!: AppStoreInitParams

  roomManager?: EduClassroomManager = undefined

  groupClassroomManager?: EduClassroomManager = undefined

  @observable
  delay: number = 0

  @observable
  time: number = 0

  @observable
  cpuRate: number = 0

  @observable
  waitingShare: boolean = false

  @observable
  _screenVideoRenderer?: LocalUserRenderer = undefined;

  @observable
  _screenEduStream?: EduStream = undefined

  @observable
  sharing: boolean = false

  @observable
  customScreenShareWindowVisible: boolean = false
  
  @observable
  customScreenShareItems: any[] = []

  @action
  resetStates() {
    this.mediaStore.resetRoomState()
    this.resetRoomInfo()    
    this.resetParams()
    this.roomManager = undefined
    this.groupClassroomManager = undefined
    this.delay = 0
    this.time = 0
    this.cpuRate = 0
    this.waitingShare = false
    this._screenVideoRenderer = undefined;
    this._screenEduStream = undefined
    this.sharing = false
    this.customScreenShareWindowVisible = false
    this.customScreenShareItems = []
  }

  async uploadLog() {
    const  {roomUuid,roomName,roomType,} = this.roomInfo
    const {userName,userUuid,roleType:role} = this.homeStore.launchOption
    await EduManager.uploadLog({
      roomUuid,
      roomName,
      roomType,
      userName,
      userUuid,
      role
    })
  }

  id: string = uuidv4()

  constructor(params: AppStoreInitParams) {
    this.params = params
    console.log("[ID] appStore ### ", this.id)
    console.log(" roomInfoParams ", params.roomInfoParams)
    console.log(" config >>> params: ", {...this.params})
    const {config, roomInfoParams, language} = this.params

    //@ts-ignore
    // window.rtcEngine.on('error', (evt) => {
    //   console.log('electron ', evt)
    // }
    if (platform === 'electron') {

      //@ts-ignore
      if (window.agoraBridge) {
        const cefClient = new AgoraCEF.AgoraRtcEngine.RtcEngineContext(config.agoraAppId)
        console.log("#### cef initialize", cefClient)
        //@ts-ignore
        this.eduManager = new EduManager({
          appId: config.agoraAppId,
          rtmUid: config.rtmUid,
          rtmToken: config.rtmToken,
          platform: 'electron',
          logLevel: '' as any,
          logDirectoryPath: config.cachePath || '',
          // @ts-ignore
          cefClient,
          // cefClient: new AgoraCEF.AgoraRtcEngine.RtcEngineContext(config.agoraAppId),
          //@ts-ignore
          agoraRtc: AgoraCEF.AgoraRtcEngine,
          // agoraRtc: window,
          sdkDomain: config.sdkDomain,
          reportDomain: config.reportDomain
        })
      } else {
        this.eduManager = new EduManager({
          appId: config.agoraAppId,
          rtmUid: config.rtmUid,
          rtmToken: config.rtmToken,
          platform: 'electron',
          logLevel: '' as any,
          logDirectoryPath: config.cachePath || '',
          // @ts-ignore
          agoraRtc: window.rtcEngine,
          // agoraRtc: window,
          sdkDomain: config.sdkDomain,
          reportDomain: config.reportDomain
        })
      }
    } else {
      this.eduManager = new EduManager({
        appId: config.agoraAppId,
        rtmUid: config.rtmUid,
        rtmToken: config.rtmToken,
        platform: 'web',
        logLevel: '' as any,
        logDirectoryPath: config.cachePath || '',
        codec: 'vp8',
        sdkDomain: config.sdkDomain,
        reportDomain: config.reportDomain
      })
    }

    if (isEmpty(roomInfoParams)) {
      this.load()
      autorun(() => {
        const roomInfo = toJS(this.roomInfo)
        GlobalStorage.save('agora_edu_room', {
          roomInfo,
        })
        this
      })
    } else {
      this.setRoomInfo({
        rtmUid: this.params.config.rtmUid,
        rtmToken: this.params.config.rtmToken,
        ...roomInfoParams!
      })
    }

    autorun(() => {
      const deviceInfo = toJS(this.deviceInfo)
      GlobalStorage.save('agora_edu_device', {
        deviceInfo
      })
    })

    const deviceStorage = GlobalStorage.read('agora_edu_device')
    if (deviceStorage || !isEmpty(deviceStorage)) {
      this.deviceInfo = {
        cameraName: "",
        microphoneName: ""
      }
      this.updateDeviceInfo({
        cameraName: get(deviceStorage, 'deviceInfo.cameraName', ''),
        microphoneName: get(deviceStorage, 'deviceInfo.microphoneName', '')
      })
    } else {
      this.deviceInfo = {
        cameraName: "",
        microphoneName: ""
      }
    }

    if (config.enableLog) {
      EduManager.enableDebugLog(true);
    }

    this.mediaStore = new MediaStore(this)
    this.uiStore = new UIStore(this)

    if (language) {
      this.uiStore.setLanguage(language)
    }

    this.pretestStore = new PretestStore(this)
    this.acadsocStore = new AcadsocRoomStore(this)
    this.statisticsStore = new StatisticsStore(this)
    this.apiStore = new APIStore(this)
    this.boardStore = new BoardStore(this)
    this.sceneStore = new SceneStore(this)
    this.homeStore = new HomeStore(this)
    this._screenVideoRenderer = undefined
  }

  @computed
  get userRole (): EduRoleTypeEnum {
    return this.roomInfo.userRole
  }

  @computed
  get roomType (): number {
    return this.roomInfo.roomType
  }

  @action
  resetParams() {
    this.params = {
      roomInfoParams: {
        roomName: '',
        roomType: 0,
        userName: '',
        userRole:EduRoleTypeEnum.none,
        userUuid: '',
        roomUuid: '',
        ...this.params.roomInfoParams
      },
      language: this.params.language,
      translateLanguage: this.params.translateLanguage,
      startTime: this.params.startTime,
      duration: this.params.duration,
      config: {
        courseWareList: this.params.config.courseWareList,
        agoraAppId: this.params.config.agoraAppId,
        agoraNetlessAppId: this.params.config.agoraNetlessAppId,
        // agoraRestFullToken: this.params.config.agoraRestFullToken,
        enableLog: true,
        sdkDomain: this.params.config.sdkDomain,
        reportDomain: this.params.config.reportDomain,
        rtmUid: this.params.config.rtmUid,
        rtmToken: this.params.config.rtmToken,
      },
      mainPath: this.params.mainPath,
      roomPath: this.params.roomPath,
      resetRoomInfo: this.params.resetRoomInfo
    }
  }

  @action
  resetRoomInfo() {
    if (this.params.resetRoomInfo) {
      this.roomInfo = {
        roomName: "",
        roomUuid: "",
        roomType: 0,
        userName: "",
        userRole: 0,
        userUuid: "",
        rtmUid: "",
        rtmToken: "",
      }
    }
  }

  get userUuid(): string {
    return this.roomInfo.userUuid
  }

  @action
  updateCpuRate(rate: number) {
    this.cpuRate = rate
  }

  updateTime(startTime: number) {
    if (startTime) {
      const preState = Math.abs(Date.now() - startTime)
      this.time = preState
    }
  }
  

  resetTime() {
    this.time = 0
  }

  @action
  updateDeviceInfo(info: {
    cameraName: string
    microphoneName: string
  }) {
    this.deviceInfo.cameraName = info.cameraName
    this.deviceInfo.microphoneName = info.microphoneName
  }

  @action
  updateRtmInfo(info: {
    rtmUid: string
    rtmToken: string
  }) {
    this.params.config.rtmToken = info.rtmToken
    this.params.config.rtmUid = info.rtmUid
    this.eduManager.updateRtmConfig({
      rtmUid: this.params.config.rtmUid,
      rtmToken: this.params.config.rtmToken,
    })
    eduSDKApi.updateRtmInfo({
      rtmToken: this.params.config.rtmToken,
      rtmUid: this.params.config.rtmUid,
    })
    reportService.updateRtmConfig({
      rtmToken: this.params.config.rtmToken,
      rtmUid: this.params.config.rtmUid
    })
  }

  @action
  setRoomInfo(payload: RoomInfo) {
    this.roomInfo = {
      roomName: payload.roomName,
      roomType: payload.roomType,
      roomUuid: payload.roomUuid,
      userName: payload.userName,
      userRole: payload.userRole,
      userUuid: payload.userUuid,
      rtmUid: payload.rtmUid,
      rtmToken: payload.rtmToken
    }
    this.updateRtmInfo({
      rtmUid: payload.rtmUid,
      rtmToken: payload.rtmToken
    })
  }

  @action
  async stopWebSharing() {
    try {
      this.waitingShare = true
      if (this._screenVideoRenderer) {
        await this.mediaService.stopScreenShare()
        this.mediaService.screenRenderer && this.mediaService.screenRenderer.stop()
        this._screenVideoRenderer = undefined
      }
      if (this._screenEduStream) {
        await this.roomManager?.userService.stopShareScreen()
        this._screenEduStream = undefined
      }
      this.sharing = false
    } catch(err) {
      this.uiStore.addToast(t('toast.failed_to_end_screen_sharing') + `${err.message}`)
    } finally {
      this.waitingShare = false
    }
  }

  @action
  async startWebSharing() {
    try {
      this.waitingShare = true
      await this.mediaService.prepareScreenShare({
        shareAudio: 'auto',
        encoderConfig: '720p'
      })
      await this.roomManager?.userService.startShareScreen()
      const streamUuid = this.roomManager!.userService.screenStream.stream.streamUuid
      const params: any = {
        channel: this.roomManager?.roomUuid,
        uid: +streamUuid,
        token: this.roomManager?.userService.screenStream.token,
      }
      BizLogger.info("screenStreamData params ", JSON.stringify(params))
      BizLogger.info("screenStreamData ", JSON.stringify(this.roomManager?.userService.screenStream))

      await this.mediaService.startScreenShare({
        params
      })
      this._screenEduStream = this.roomManager?.userService.screenStream.stream
      this._screenVideoRenderer = this.mediaService.screenRenderer
      this.sharing = true
    } catch (err) {
      if (this.mediaService.screenRenderer) {
        this.mediaService.screenRenderer.stop()
        this.mediaService.screenRenderer = undefined
        this._screenVideoRenderer = undefined
        this.uiStore.addToast(t('toast.failed_to_initiate_screen_sharing_to_remote') + `${err.message}`)
      } else {
        this.uiStore.addToast(t('toast.failed_to_enable_screen_sharing') + `${err.message}`)
      }
      BizLogger.info('SCREEN-SHARE ERROR ', err)
      const error = GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
    } finally {
      this.waitingShare = false
    }
  }

  async startOrStopSharing() {
    if (this.isWeb) {
      if (this.sharing) {
        await this.stopWebSharing()
      } else {
        await this.startWebSharing()
      }
    }

    if (this.isElectron) {
      if (this.sharing) {
        await this.stopNativeSharing()
      } else {
        await this.showScreenShareWindowWithItems()
      }
    }
  }

  @action
  updateCourseWareList(courseWareList: CourseWareItem[]) {
    this.params.config.courseWareList = courseWareList
  }

  @action
  showScreenShareWindowWithItems () {
    if (this.isElectron) {
      this.mediaService.prepareScreenShare().then((items: any) => {
        runInAction(() => {
          this.customScreenShareWindowVisible = true
          this.customScreenShareItems = items
        })
      }).catch(err => {
        BizLogger.warn('show screen share window with items', err)
      })
    }
  }

  @action
  async resetWebPrepareScreen() {
    if (this.mediaService.screenRenderer) {
      this._screenVideoRenderer = undefined
    }
  }


  @action
  async prepareScreenShare(params: PrepareScreenShareParams = {}) {
    const res = await this.mediaService.prepareScreenShare(params)
    if (this.mediaService.screenRenderer) {
      this._screenVideoRenderer = this.mediaService.screenRenderer
    }
  }

  @computed
  get screenEduStream(): EduStream {
    return this._screenEduStream as EduStream
  }

  @action
  async stopNativeSharing() {
    if (this.screenEduStream) {
      await this.roomManager?.userService.stopShareScreen()
      this._screenEduStream = undefined
    }
    if (this._screenVideoRenderer) {
      await this.mediaService.stopScreenShare()
      this._screenVideoRenderer && this._screenVideoRenderer.stop()
      this._screenVideoRenderer = undefined
    }
    if (this.customScreenShareWindowVisible) {
      this.customScreenShareWindowVisible = false
    }
    this.customScreenShareItems = []
    this.sharing = false
  }

  @action
  async startNativeScreenShareBy(windowId: number) {
    try {
      this.waitingShare = true
      await this.roomManager?.userService.startShareScreen()
      const streamUuid = this.roomManager!.userService.screenStream.stream.streamUuid
      const params: any = {
        channel: this.roomManager?.roomUuid,
        uid: +streamUuid,
        token: this.roomManager?.userService.screenStream.token,
      }
      await this.mediaService.startScreenShare({
        windowId: windowId as number,
        params
      })
      if (!this.mediaService.screenRenderer) {
        this.uiStore.addToast(t('create_screen_share_failed'))
        return
      } else {
        this._screenVideoRenderer = this.mediaService.screenRenderer
      }
      this.removeScreenShareWindow()
      this.sharing = true
    } catch (err) {
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      // if (!this.mediaService.screenRenderer) {
      //   await this.mediaService.stopScreenShare()
      // }
      this.waitingShare = false
      this.uiStore.addToast(t('toast.failed_to_initiate_screen_sharing') + `${err.message}`)
      // throw err
    }
  }

  @action
  removeScreenShareWindow () {
    if (this.isElectron) {
      this.customScreenShareWindowVisible = false
      this.customScreenShareItems = []
    }
  }

  @action
  reset() {
    this._boardService = undefined
    this._recordService = undefined
    this._uploadService = undefined
    // this.roomInfo = {}
    this.resetWebPrepareScreen()
    this.removeScreenShareWindow()
  }

  @action
  async releaseRoom() {
    try {
      await this.acadsocStore.leave()
      reportService.stopHB()
      this.resetStates()
    } catch (err) {
      this.resetStates()
      const exception = GenericErrorWrapper(err)
      throw exception
    }
  }
  async destroy() {
    await this.releaseRoom()
  }

  async destroyRoom() {
    dialogManager.removeAll()
    await controller.appController.destroy()
  }
}
export * from './acadsoc-room';
export { UIStore } from './ui';
export { BoardStore } from './board';
export { PretestStore } from './pretest';
export { DiskStore } from './disk';
export { HomeStore } from './home';
export { StatisticsStore} from './statistics'