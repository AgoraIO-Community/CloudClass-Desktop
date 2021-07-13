import { EduRoleTypeEnum, EduManager, AgoraWebRtcWrapper, AgoraElectronRTCWrapper, EduClassroomManager, LocalUserRenderer, EduStream, GenericErrorWrapper, PrepareScreenShareParams } from 'agora-rte-sdk'
import { isEmpty, get } from 'lodash'
import { observable, action, autorun, toJS, computed, runInAction } from 'mobx'
import { EduBoardService } from '../services/edu-board-service'
import { EduRecordService } from '../services/edu-record-service'
import { eduSDKApi } from '../services/edu-sdk-api'
import { reportService } from '../services/report'
import { UploadService } from '../services/upload-service'
import { platform, GlobalStorage, BizLogger } from '../utilities/kit'
import { BoardStore } from './board'
import { MediaStore } from './media'
import { PretestStore } from './pretest'
import { RoomStore } from './room'
import { SceneStore } from './scene'
// import { UIStore } from './ui'
import { v4 as uuidv4} from 'uuid'
import { AppStoreInitParams, CourseWareItem, DeviceInfo, IAgoraExtApp, RoomInfo } from '../api/declare'
import { WidgetStore } from './widget'
import { reportServiceV2 } from '../services/report-v2'
import { Subject } from 'rxjs'

export class EduScenarioAppStore {
  // stores
  /**
   * appStore类
   * 包含uiStore
   */
  // uiStore!: UIStore;
  boardStore!: BoardStore;
  mediaStore!: MediaStore;
  sceneStore!: SceneStore;
  roomStore!: RoomStore;
  pretestStore!: PretestStore;
  widgetStore!: WidgetStore;

  eduManager!: EduManager;

  _boardService?: EduBoardService;
  _recordService?: EduRecordService;
  _uploadService?: UploadService;

  toast$: Subject<any> = new Subject<any>()
  dialog$: Subject<any> = new Subject<any>()
  seq$: Subject<any> = new Subject<any>()
  
  @observable
  speakers: Map<number, number> = new Map();

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
    // const storage = GlobalStorage.read('agora_edu_room')
    // if (storage || !isEmpty(storage)) {
    //   this.roomInfo = storage.roomInfo
    //   this.updateRtmInfo({
    //     rtmUid: this.roomInfo.rtmUid,
    //     rtmToken: this.roomInfo.rtmToken,
    //   })
    // } else {
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
    // }
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
  customScreenShareItems: any[] = []

  @observable
  allExtApps:IAgoraExtApp[]

  @observable
  activeExtAppIds:string[] = []

  pretestNotice$: Subject<any> = new Subject<any>()

  @computed
  get activeExtApps():IAgoraExtApp[] {
    return this.allExtApps.filter(app => this.activeExtAppIds.includes(app.appIdentifier))
  }

  @observable
  language: string = 'zh'

  @action.bound
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
    this.customScreenShareItems = []
  }

  id: string = uuidv4()

  appController: any;

  private dom: HTMLElement

  constructor(params: AppStoreInitParams, dom: HTMLElement, appController: any) {
    this.params = params
    this.dom = dom
    if (appController) {
      appController.bindStoreDestroy(this.destroy) 
      console.log('bind store destroy success')
      this.appController = appController
    }
    // console.log(" roomInfoParams ", params.roomInfoParams)
    // console.log(" config >>> params: ", {...this.params})
    const {config, roomInfoParams, language} = this.params

    const sdkDomain = config.sdkDomain

    console.log("[ID] appStore ### ", this.id, " config", config)

    // const sdkDomain = config.sdkDomain.replace('%region%', this.params.config.region ?? 'cn')

    if (platform === 'electron') {
      this.eduManager = new EduManager({
        vid: config.vid,
        appId: config.agoraAppId,
        rtmUid: config.rtmUid,
        rtmToken: config.rtmToken,
        platform: 'electron',
        logLevel: '' as any,
        logDirectoryPath: '',
        // @ts-ignore
        agoraRtc: window.rtcEngine,
        // agoraRtc: window,
        rtcArea: config.rtcArea,
        rtmArea: config.rtmArea,
        sdkDomain: sdkDomain,
        scenarioType: roomInfoParams?.roomType,
        cameraEncoderConfigurations: this.params.config.mediaOptions?.cameraEncoderConfiguration
      })
    } else {
      this.eduManager = new EduManager({
        vid: config.vid,
        appId: config.agoraAppId,
        rtmUid: config.rtmUid,
        rtmToken: config.rtmToken,
        platform: 'web',
        logLevel: '' as any,
        logDirectoryPath: '',
        codec: 'vp8',
        rtcArea: config.rtcArea,
        rtmArea: config.rtmArea,
        sdkDomain: sdkDomain,
        scenarioType: roomInfoParams?.roomType,
        cameraEncoderConfigurations: this.params.config.mediaOptions?.cameraEncoderConfiguration
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

    // this.uiStore = new UIStore(this)

    if (language) {
      this.language = language
    }

    this.pretestStore = new PretestStore(this)
    this.roomStore = new RoomStore(this)
    this.boardStore = new BoardStore(this)
    this.sceneStore = new SceneStore(this)
    this.mediaStore = new MediaStore(this)
    this.widgetStore = new WidgetStore()
    this.widgetStore.widgets = this.params.config.widgets || {}
    this.allExtApps = this.params.config.extApps || []

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

  @action.bound
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

  @action.bound
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

  @action.bound
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

  @action.bound
  updateDeviceInfo(info: {
    cameraName: string
    microphoneName: string
  }) {
    this.deviceInfo.cameraName = info.cameraName
    this.deviceInfo.microphoneName = info.microphoneName
  }

  @action.bound
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

  @action.bound
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

  @action.bound
  updateCourseWareList(courseWareList: CourseWareItem[]) {
    this.params.config.courseWareList = courseWareList
  }

  @action.bound
  reset() {
    this._boardService = undefined
    this._recordService = undefined
    this._uploadService = undefined
    // this.roomInfo = {}
  }

  @action.bound
  async releaseRoom() {
    try {
      await this.roomStore.leave()
      reportService.stopHB()
      reportServiceV2.reportApaasUserQuit(new Date().getTime(), 0);
      this.resetStates()
    } catch (err) {
      this.resetStates()
      const exception = GenericErrorWrapper(err)
      reportServiceV2.reportApaasUserQuit(new Date().getTime(), err.code || err.message);
      throw exception
    }
  }

  @action.bound
  async destroy() {
    await this.releaseRoom()
  }

  @action.bound
  async destroyRoom() {
    await this.appController.destroy()
  }
  
  @action.bound
  fireToast(eventName: string, props?: any) {
    this.toast$.next({
      eventName,
      props,
    })
  }

  @action.bound
  fireDialog(eventName: string, props?: any) {
    console.log('fire dialog ', eventName, props)
    this.dialog$.next({
      eventName,
      props
    })
  }

  @action.bound
  updateSeqId(props?: any) {
    this.seq$.next({
      props
    })
  }
}
export { BoardStore } from './board';
export { PretestStore } from './pretest';
export { RoomStore } from './room';
// export { UIStore } from './ui';
