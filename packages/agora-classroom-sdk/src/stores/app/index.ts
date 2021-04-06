import { transI18n } from 'agora-scenario-ui-kit';
import { LanguageEnum, TranslateEnum } from '@/edu-sdk';
import { ClassRoomAbstractStore, controller } from '@/edu-sdk/controller';
import { EduBoardService } from '@/modules/board/edu-board-service';
import { EduRecordService } from '@/modules/record/edu-record-service';
import { eduSDKApi } from '@/services/edu-sdk-api';
import { reportService } from '@/services/report-service';
import { UploadService } from '@/services/upload-service';
import { BizLogger, GlobalStorage, platform } from '@/utils/utils';
import {
  AgoraElectronRTCWrapper, AgoraWebRtcWrapper,
  EduClassroomManager, EduManager,
  EduRoleTypeEnum, EduStream, GenericErrorWrapper,
  LocalUserRenderer,
  PrepareScreenShareParams
} from 'agora-rte-sdk';
import { get, isEmpty } from 'lodash';
import { action, autorun, computed, observable, runInAction, toJS } from 'mobx';
import {v4 as uuidv4} from 'uuid';
import { CourseWareItem, CourseWareList } from './../../edu-sdk/index';
import { BoardStore } from './board';
import { HomeStore } from './home';
import { MediaStore } from './media';
import { PretestStore } from './pretest';
import { RoomStore } from './room';
import { SceneStore } from './scene';
import { UIStore } from './ui';


type RoomInfoParams = {
  roomName: string,
  roomType: number,
  roomUuid: string,
  userName: string,
  userRole: number,
  userUuid: string,
}

export type AppStoreConfigParams = {
  agoraAppId: string,
  agoraNetlessAppId: string,
  // agoraRestFullToken: string
  enableLog: boolean,
  sdkDomain: string,
  rtmUid: string,
  rtmToken: string,
  courseWareList: CourseWareList,
  personalCourseWareList?: CourseWareList,
  oss?: {
    region: string,
    bucketName: string,
    folder: string,
    accessKey: string,
    secretKey: string,
    endpoint: string,
  },
  recordUrl: string
}

export type AppStoreInitParams = {
  roomInfoParams?: RoomInfoParams,
  config: AppStoreConfigParams,
  language: LanguageEnum,
  startTime?: number,
  duration?: number,
  pretest?: boolean,
  mainPath?: string,
  roomPath?: string,
  resetRoomInfo: boolean,
}

export type RoomInfo = {
  roomName: string,
  roomType: number,
  userName: string,
  userRole: EduRoleTypeEnum,
  userUuid: string,
  roomUuid: string,
  rtmUid: string,
  rtmToken: string,
  groupName?: string,
  groupUuid?: string,
}

export type DeviceInfo = {
  cameraName: string,
  microphoneName: string,
}

export class AppStore implements ClassRoomAbstractStore {
  // stores
  uiStore!: UIStore;
  boardStore!: BoardStore;
  mediaStore!: MediaStore;
  sceneStore!: SceneStore;
  roomStore!: RoomStore;
  pretestStore!: PretestStore;
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

  id: string = uuidv4()

  constructor(params: AppStoreInitParams) {
    this.params = params
    console.log("[ID] appStore ### ", this.id)
    // console.log(" roomInfoParams ", params.roomInfoParams)
    // console.log(" config >>> params: ", {...this.params})
    const {config, roomInfoParams, language} = this.params

    if (platform === 'electron') {
      this.eduManager = new EduManager({
        appId: config.agoraAppId,
        rtmUid: config.rtmUid,
        rtmToken: config.rtmToken,
        platform: 'electron',
        logLevel: '' as any,
        logDirectoryPath: '',
        // @ts-ignore
        agoraRtc: window.rtcEngine,
        // agoraRtc: window,
        sdkDomain: config.sdkDomain,
      })
    } else {
      this.eduManager = new EduManager({
        appId: config.agoraAppId,
        rtmUid: config.rtmUid,
        rtmToken: config.rtmToken,
        platform: 'web',
        logLevel: '' as any,
        logDirectoryPath: '',
        codec: 'vp8',
        sdkDomain: config.sdkDomain,
      })
    }

    if (isEmpty(roomInfoParams)) {
      this.load()
      autorun(() => {
        const data = toJS(this)
        GlobalStorage.save('agora_edu_room', {
          roomInfo: data.roomInfo,
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
      const data = toJS(this)
      GlobalStorage.save('agora_edu_device', {
        deviceInfo: data.deviceInfo
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

    this.uiStore = new UIStore(this)

    if (language) {
      this.uiStore.setLanguage(language)
    }

    this.pretestStore = new PretestStore(this)
    this.roomStore = new RoomStore(this)
    this.boardStore = new BoardStore(this)
    this.sceneStore = new SceneStore(this)
    this.homeStore = new HomeStore(this)
    this.mediaStore = new MediaStore(this)

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
      startTime: this.params.startTime,
      duration: this.params.duration,
      config: {
        courseWareList: this.params.config.courseWareList,
        agoraAppId: this.params.config.agoraAppId,
        agoraNetlessAppId: this.params.config.agoraNetlessAppId,
        // agoraRestFullToken: this.params.config.agoraRestFullToken,
        enableLog: true,
        sdkDomain: this.params.config.sdkDomain,
        rtmUid: this.params.config.rtmUid,
        rtmToken: this.params.config.rtmToken,
        recordUrl: this.params.config.recordUrl
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
      rtmUid: this.params.config.rtmUid,
    })
    reportService.setAppId(this.params.config.agoraAppId)
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
      this.uiStore.addToast(transI18n('toast.failed_to_end_screen_sharing') + `${err.message}`)
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
        this.uiStore.addToast(transI18n('toast.failed_to_initiate_screen_sharing_to_remote') + `${err.message}`)
      } else {
        this.uiStore.addToast(transI18n('toast.failed_to_enable_screen_sharing') + `${err.message}`)
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
        this.uiStore.addToast(transI18n('create_screen_share_failed'))
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
      this.uiStore.addToast(transI18n('toast.failed_to_initiate_screen_sharing') + `${err.message}`)
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
      await this.roomStore.leave()
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
    // Modal.removeAll()
    await controller.appController.destroy()
  }
}
export { BoardStore } from './board';
export { HomeStore } from './home';
export { PretestStore } from './pretest';
export { RoomStore } from './room';
export { UIStore } from './ui';
