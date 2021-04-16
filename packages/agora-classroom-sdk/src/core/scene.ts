import { observable } from 'mobx';
import { BoardStore } from './board';
import { LocalVideoStreamState, MediaStore } from './media';
import { UIStore } from './ui';
import { autorun, computed, toJS } from 'mobx';
import { CourseWareList, LanguageEnum } from '@/edu-sdk';
import { AgoraRegion, regionMap } from '@/edu-sdk/declare';
import { EduBoardService } from '@/modules/board/edu-board-service';
import { EduRecordService } from '@/modules/record/edu-record-service';
import { UploadService } from '@/services/upload-service';
import { BizLogger, GlobalStorage, platform } from '@/utils/utils';
import { AgoraElectronRTCWrapper, AgoraWebRtcWrapper, EduAudioSourceType, EduClassroomManager, EduLogger, EduManager, EduRoleType, EduRoleTypeEnum, EduRoomType, EduSceneType, EduStream, EduTextMessage, EduUser, EduVideoSourceType, GenericErrorWrapper, LocalUserRenderer, PrepareScreenShareParams, RemoteUserRenderer, UserRenderer } from 'agora-rte-sdk';
import { eduSDKApi } from '@/services/edu-sdk-api';
import { CameraOption } from 'agora-rte-sdk';
import { transI18n } from '@/ui-kit/components/i18n';
import { get, isEmpty } from 'lodash';
import { SceneDefinition } from "white-web-sdk"
import { v4 as uuidv4 } from 'uuid';
import { reportService } from '@/services/report-service';
import dayjs from 'dayjs';
import { RoomApi } from '@/services/room-api';
import { Mutex } from '@/utils/mutex';
import { controller } from '@/edu-sdk/controller';

enum TimeFormatType {
  Timeboard,
  Message
}

type LocalPacketLoss = {
  audioStats: { audioLossRate: number },
  videoStats: { videoLossRate: number }
}

type ProcessType = {
  reward: number,
}

type RoomProperties = {
  board: {
    info: {
      boardAppId: string,
      boardId: string,
      boardToken: string,
    }
  },
  record: {
    state: number,
    roomType: number,
  },
  reward: RoomRewardType,
  state: number,
  students: Record<string, ProcessType>,
}

type MinimizeType = {
  id: string,
  type: 'teacher' | 'student' | 'chat',
  content: string,
  isHidden: boolean,
  animation: string,
  zIndex: number,
  height: number,
  width?: number,
}

type RoomRewardType = {
  room: number,
  config: {
    roomLimit: number,
  }
}

type TrophyType = {
  minimizeTrigger: boolean,
  startPosition: {
    x: number,
    y: number,
  },
  endPosition: {
    x: number,
    y: number,
  }
}

type ClassroomScheduleType = {
  startTime: number,
  duration: number,
  closeDelay: number
}

export enum RoomPropertiesChangeCause {
  studentRewardStateChanged = 1101, // 单个人的奖励发生
}


export type ProgressUserInfo = {
  userUuid: string,
  ts: number
}

export enum CoVideoActionType {
  studentHandsUp = 1,
  teacherAccept = 2,
  teacherRefuse = 3,
  studentCancel = 4,
  teacherReplayTimeout = 7,
}

export type CauseOperator = {
  cmd: number,
  data: {
    processUuid: string,
    addProgress: ProgressUserInfo[],
    addAccepted: ProgressUserInfo[],
    removeProgress: ProgressUserInfo[],
    removeAccepted: ProgressUserInfo[],
    actionType: CoVideoActionType,
    cmd: number
  }
}

export type CauseData = {
  data: {
    processUuid: string,
    addProgress: ProgressUserInfo[],
    removeProgress: ProgressUserInfo[],
    actionType: CoVideoActionType,
  }
}

export type CauseResponder<T extends Partial<CauseData['data']>> = {
  readonly cmd: 501,
  readonly data: Readonly<T>
}

export type HandsUpDataTypes = 
  | HandsUpMessageData
  | CancelHandsUpMessageData
  | CloseCoVideoMessageData
  | AcceptMessageData
  | RefuseMessageData


export type HandsUpMessageData = Pick<CauseData['data'],
  | 'actionType'
  | 'processUuid'
  | 'addProgress'
>

export type CancelHandsUpMessageData = Pick<CauseData['data'],
  | 'processUuid'
  | 'removeProgress'
  | 'actionType'
>

export type CloseCoVideoMessageData = Pick<CauseData['data'],
  | 'processUuid'
  | 'removeProgress'
  | 'actionType'
>

export type AcceptMessageData = Pick<CauseData['data'],
  | 'actionType'
  | 'processUuid'
  | 'addProgress'
>

export type RefuseMessageData = Pick<CauseData['data'],
| 'actionType'
| 'processUuid'
| 'removeProgress'
>

export type RosterUserInfo = {
  name: string,
  uid: string,
  onlineState: boolean,
  onPodium: boolean,
  micDevice: boolean,
  cameraDevice: boolean,
  cameraEnabled: boolean,
  micEnabled: boolean,
  whiteboardGranted: boolean,
  canCoVideo: boolean,
  canGrantBoard: boolean,
  stars: number,
  disabled: boolean
}

export declare type ListenerCallbackType<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T];




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
  SmallClassPath = '/classroom/small',
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

export type SceneVideoConfiguration = {
  width: number,
  height: number,
  frameRate: number
}

export enum EduClassroomStateEnum {
  beforeStart = 0,
  start = 1,
  end = 2,
  // close state is front-end only state
  close = 3
}

export enum ClassStateEnum {
  started = 1
}

export enum UnmuteMediaEnum {
  audio = 0,
  video = 1
}

export enum CustomPeerApply {
  unmuteAction = 10
}

export const networkQualities: {[key: string]: string} = {
  'excellent': 'network-good',
  'good': 'network-good',
  'poor': 'network-normal',
  'bad': 'network-normal',
  'very bad': 'network-bad',
  'down': 'network-bad',
  'unknown': 'network-normal',
}

export type EduMediaStream = {
  streamUuid: string,
  userUuid: string,
  renderer?: UserRenderer,
  account: string,
  local: boolean,
  audio: boolean,
  video: boolean,
  hideControl: boolean,
  whiteboardGranted: boolean,
  micVolume: number,
  placement: string,
  stars: number,
  holderState: 'loading' | 'muted' | 'broken'
}


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
  region?: AgoraRegion,
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

export class SceneStore {
  _microphoneTrack?: any = undefined;

  _cameraRenderer?: LocalUserRenderer = undefined;

  _screenVideoRenderer?: LocalUserRenderer = undefined;

  currentNativeWindowId: string = ''

  showNativeShareWindow: boolean = false;

  nativeScreenShareItems: any[] = []

  waitingShare: boolean = false;

  isSharingScreen: boolean = false;

  joined: boolean = false
  
  roomJoined: boolean = false

  public _hasCamera?: boolean = undefined
  public _hasMicrophone?: boolean = undefined
  params: AppStoreInitParams;
  _screenEduStream: EduStream | undefined;
  customScreenShareWindowVisible: any;
  customScreenShareItems: any[] = [];
  cameraLock: any;
  appStore: any;
  cameraRenderer: any;
  microphoneLock: any;
  sharing: boolean = false;
  _roomManager?: EduClassroomManager;
  _cameraEduStream: any;
  recordState: any;
  joiningRTC: boolean = false;
  classState: any;
  userList: EduUser[] = [];
  streamList: EduStream[] = [];
  remoteUsersRenderer: any;
  canChatting?: boolean;
  recording: any;
  public readonly mutex = new Mutex()
  roomApi!: RoomApi;
  isFullScreen: boolean = false;
  roomProperties: RoomProperties = {
    board: {
      info: {
        boardAppId: '',
        boardId: '',
        boardToken: '',
      }
    },
    record: {
      state: 0,
      roomType: 0,
    },
    state: 0,
    reward: {
      room: 0,
      config: {
        roomLimit: 0
      }
    },
    students: {},
  }

  isStudentChatAllowed?: boolean;
  classTimeText: any;
  classroomSchedule?: ClassroomScheduleType
  eduManager!: EduManager;
  boardStore: BoardStore;
  mediaStore: MediaStore;
  uiStore: UIStore;

  get videoEncoderConfiguration(): SceneVideoConfiguration {
    return {
      width: 320,
      height: 240,
      frameRate: 15
    }
  }

  private load() {
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

  constructor(params: AppStoreInitParams) {
    this.params = params
    // makeAutoObservable(this, {
    //   roomUuid: computed,
    //   screenShareStreamUuid: computed,
    //   userRole: computed,
    //   roomType: computed,
    //   delay: computed,
    //   screenEduStream: computed,
    //   cameraEduStream: computed,
    //   teacherUuid: computed,
    //   muteControl: computed,
    //   mediaService: observable.ref,
    //   eduManager: observable.ref,
    // })
    const {config, roomInfoParams, language} = this.params

    const sdkDomain = config.sdkDomain

    // const sdkDomain = config.sdkDomain.replace('%region%', this.params.config.region ?? 'cn')

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
        sdkDomain: sdkDomain,
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
        sdkDomain: sdkDomain,
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

    if (language) {
      // this.uiStore.setLanguage(language)
    }

    this.mediaStore = new MediaStore(this)
    this.boardStore = new BoardStore(this)
    this.uiStore = new UIStore(this)
  }

  updateDeviceInfo(info: {
    cameraName: string
    microphoneName: string
  }) {
    this.deviceInfo.cameraName = info.cameraName
    this.deviceInfo.microphoneName = info.microphoneName
  }

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

  _boardService?: EduBoardService;
  _recordService?: EduRecordService;
  _uploadService?: UploadService;
  roomManager?: EduClassroomManager = undefined
  deviceInfo!: DeviceInfo
  roomInfo!: RoomInfo

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

  get roomUuid() {
    return this.roomInfo.roomUuid
  }

  get screenShareStreamUuid() {
    return this.roomManager?.userService?.screenStream?.stream?.streamUuid ?? -1
  }

  get userRole (): EduRoleTypeEnum {
    return this.roomInfo.userRole
  }

  get roomType (): number {
    return this.roomInfo.roomType
  }

  showScreenShareWindowWithItems () {
    if (this.isElectron) {
      this.mediaService.prepareScreenShare().then((items: any) => {
        this.showNativeShareWindow = true
        this.nativeScreenShareItems = items
      }).catch((err: any) => {
        BizLogger.warn('show screen share window with items', err)
      })
    }
  }

  async prepareScreenShare(params: PrepareScreenShareParams = {}) {
    const res = await this.mediaService.prepareScreenShare(params)
    if (this.mediaService.screenRenderer) {
      this._screenVideoRenderer = this.mediaService.screenRenderer
    }
  }

  async stopNativeSharing() {
    if (this.screenEduStream) {
      await this.roomManager?.userService.stopShareScreen()
      // await eduSDKApi.stopShareScreen(this.roomUuid, this.userUuid)
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
    this.isSharingScreen = false
  }

  async resetWebPrepareScreen() {
    if (this.mediaService.screenRenderer) {
      this._screenVideoRenderer = undefined
    }
  }

  cpuUsage: number = 0

  updateCpuRate(rate: number) {
    this.cpuUsage =rate
  }

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
  
  lockCamera() {
    this.cameraLock = true
    BizLogger.info('[demo] lockCamera ')
  }

  unLockCamera() {
    this.cameraLock = false
    BizLogger.info('[demo] unlockCamera ')
  }

  async openCamera(option?: SceneVideoConfiguration) {
    if (this._cameraRenderer) {
      return BizLogger.warn('[demo] Camera already exists')
    }
    if (this.cameraLock) {
      return BizLogger.warn('[demo] openCamera locking')
    }
    this.lockCamera()
    try {
      const deviceId = this.mediaStore.cameraId
      const config = {
        deviceId,
        encoderConfig: {
          ...option
        }
      } as CameraOption
      await this.mediaService.openCamera(config)
      this._cameraRenderer = this.mediaService.cameraRenderer
      if (this.isElectron) {
        this.mediaStore.rendererOutputFrameRate[`${0}`] = 1
      }

      BizLogger.info('[demo] action in openCamera >>> openCamera, ', JSON.stringify(config))
      this.unLockCamera()

    } catch (err) {
      this.unLockCamera()
      const error = GenericErrorWrapper(err)
      BizLogger.warn('[demo] action in openCamera >>> openCamera', error)
      throw error
    }
  }


  async muteLocalCamera() {
    if (this.cameraLock) {
      return BizLogger.warn('[demo] openCamera locking')
    }
    try {
      BizLogger.info('[demo] [local] muteLocalCamera')
      if (this._cameraRenderer) {
        await this.closeCamera()
        this.unLockCamera()
      }
      await Promise.all([
        await this.roomManager?.userService.updateMainStreamState({'videoState': false}),
      ])
    } catch (err) {
      this.unLockCamera()
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] muteLocalCamera, ${error}`)
      throw error
    }
  }

  async unmuteLocalCamera() {
    BizLogger.info('[demo] [local] unmuteLocalCamera')
    if (this.cameraLock) {
      return BizLogger.warn('[demo] [mic lock] unmuteLocalCamera')
    }
    try {
      await Promise.all([
        this.openCamera(),
        this.roomManager?.userService.updateMainStreamState({'videoState': true})
      ])
    } catch (err) {
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] muteLocalCamera, ${error}`)
      throw error
    }
  }

  async muteLocalMicrophone() {
    BizLogger.info('[demo] [local] muteLocalMicrophone')
    if (this.microphoneLock) {
      return BizLogger.warn('[demo] [mic lock] muteLocalMicrophone')
    }

    try {
      await this.closeMicrophone()
      this.unLockMicrophone()

      await Promise.all([
        this.roomManager?.userService.updateMainStreamState({'audioState': false}),
      ])
    }catch(err) {
      this.unLockMicrophone()
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] muteLocalmicrophone, ${error}`)
      throw error
    }
  }

  async unmuteLocalMicrophone() {
    BizLogger.info('[demo] [local] unmuteLocalMicrophone')
    if (this.microphoneLock) {
      return BizLogger.warn('[demo] [mic lock] unmuteLocalMicrophone')
    }

    try {
      await this.openMicrophone()
      await Promise.all([
        this.roomManager?.userService.updateMainStreamState({'audioState': true}),
      ])
    }catch(err){
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] unmuteLocalMicrophone, ${error}`)
      throw error
    }
  }

  async closeCamera() {
    await this.mediaService.closeCamera()
    this.resetCameraTrack()
    BizLogger.info("close camera in scene store")
  }

  resetCameraTrack() {
    throw new Error('Method not implemented.');
  }

  lockMicrophone() {
    this.microphoneLock = true
    BizLogger.info('[demo] lockMicrophone ')
  }

  unLockMicrophone() {
    this.microphoneLock = false
    BizLogger.info('[demo] unLockMicrophone ')
  }

  
  async openMicrophone() {
    if (this._microphoneTrack) {
      return BizLogger.warn('[demo] Microphone already exists')
    }

    if (this.microphoneLock) {
      return BizLogger.warn('[demo] openMicrophone locking 1')
    }
    this.lockMicrophone()
    try {
      const deviceId = this.mediaStore.microphoneId
      await this.mediaService.openMicrophone({deviceId})
      this._microphoneTrack = this.mediaService.microphoneTrack
      // this.microphoneLabel = this.mediaService.getMicrophoneLabel()
      BizLogger.info('[demo] action in openMicrophone >>> openMicrophone')
      // this._microphoneId = this.microphoneId
      this.unLockMicrophone()
    } catch (err) {
      this.unLockMicrophone()
      BizLogger.info('[demo] action in openMicrophone >>> openMicrophone')
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      throw err
    }
  }

  
  async closeMicrophone() {
    if (this.microphoneLock) return BizLogger.warn('[demo] closeMicrophone microphone is locking')
    await this.mediaService.closeMicrophone()
    this.resetMicrophoneTrack()
  }

  resetMicrophoneTrack() {
    throw new Error('Method not implemented.');
  }

  
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
        // await eduSDKApi.stopShareScreen(this.roomUuid, this.userUuid)
        this._screenEduStream = undefined
      }
      this.sharing = false
    } catch(err) {
      // this.uiStore.addToast(transI18n('toast.failed_to_end_screen_sharing') + `${err.message}`)
    } finally {
      this.waitingShare = false
    }
  }
  
  async startWebSharing() {
    try {
      this.waitingShare = true
      await this.mediaService.prepareScreenShare({
        shareAudio: 'auto',
        encoderConfig: '720p'
      })
      await this.roomManager?.userService.startShareScreen()
      // await eduSDKApi.startShareScreen(this.roomUuid, this.userUuid)
      const params: any = {
        channel: this.roomUuid,
        uid: +this.screenShareStreamUuid,
        token: this.roomManager?.userService.screenStream.token,
      }

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
        // this.uiStore.addToast(transI18n('toast.failed_to_initiate_screen_sharing_to_remote') + `${err.message}`)
      } else {
        if (err.code === 'PERMISSION_DENIED') {
          // this.uiStore.addToast(transI18n('toast.failed_to_enable_screen_sharing_permission_denied'))
        } else {
          // this.uiStore.addToast(transI18n('toast.failed_to_enable_screen_sharing') + ` code: ${err.code}, msg: ${err.message}`)
        }
      }
      BizLogger.info('SCREEN-SHARE ERROR ', err)
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
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

  
  get delay(): string {
    return `${this.mediaStore.delay}`
  }

  get screenEduStream(): EduStream {
    return this._screenEduStream as EduStream
  }

  
  get cameraEduStream(): EduStream {
    return this._cameraEduStream as EduStream
  }

  isBigClassStudent(): boolean {
    const userRole = this.roomInfo.userRole
    return +this.roomInfo.roomType === EduRoomType.SceneTypeBigClass && userRole === EduRoleTypeEnum.student
  }

  getStudentConfig() {
    const roomType = +this.roomInfo.roomType
    if (roomType === EduRoomType.SceneTypeBigClass || roomType === EduRoomType.SceneTypeMiddleClass) {
      return {
        sceneType: roomType,
        userRole: 'audience'
      }
    }
    return {
      sceneType: roomType,
      userRole: 'broadcaster'
    }
  }
  
  async joinRTC(args: any) {
    try {
      await this.mediaService.join(args)
      this.joiningRTC = true
    } catch (err) {
      // this.uiStore.addToast(transI18n('toast.failed_to_join_rtc_please_refresh_and_try_again'))
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      throw err
    }
  }

  async leaveRtc() {
    try {
      this.joiningRTC = false
      try {
        await this.closeCamera()
      } catch (err) {
        BizLogger.warn(`${err}`)
      }
      try {
        await this.closeMicrophone()
      } catch (err) {
        BizLogger.warn(`${err}`)
      }
      try {
        await this.mediaService.leave()
      } catch (err) {
        BizLogger.warn(`${err}`)
      }
      console.log('toast.leave_rtc_channel')
      // this.uiStore.addToast(transI18n('toast.leave_rtc_channel'))
      this.reset()
    } catch (err) {
      console.log('toast.failed_to_leave_rtc')
      // this.uiStore.addToast(transI18n('toast.failed_to_leave_rtc'))
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  
  async prepareCamera() {
    if (this._hasCamera === undefined) {
      const cameras = await this.mediaService.getCameras()
      this._hasCamera = !!cameras.length
      if (this._hasCamera && this.mediaService.isWeb) {
        this.mediaService.web.publishedVideo = true
      }
    }
  }

  
  async prepareMicrophone() {
    if (this._hasMicrophone === undefined) {
      const microphones = await this.mediaService.getMicrophones()
      this._hasMicrophone = !!microphones.length
      if (this._hasMicrophone && this.mediaService.isWeb) {
        this.mediaService.web.publishedAudio = true
      }
    }
  }

  getLocalPlaceHolderProps() {
    if (!this.cameraEduStream) {
      return {
        placeHolderType: 'loading',
        text: transI18n(`placeholder.loading`)
      }
    }

    if ((this.cameraEduStream && !!this.cameraEduStream.hasVideo === false)) {
      return {
        placeHolderType: 'muted',
        text: transI18n('placeholder.closedCamera')
      }
    }

    const streamUuid = +this.cameraEduStream.streamUuid
    const isFreeze = this.queryVideoFrameIsNotFrozen(+streamUuid) === false
    if (this.cameraEduStream 
      && !!this.cameraEduStream.hasVideo === true) {
      if (isFreeze) {
        return {
          placeHolderType: 'broken',
          text: transI18n('placeholder.noAvailableCamera')
        }
      }
      if (this.cameraRenderer) {
        return {
          placeHolderType: 'none',
          text: ''
        }
      }
    }
    return {
      placeHolderType: 'loading',
      text: transI18n(`placeholder.loading`)
    }
  }

  getRemotePlaceHolderProps(userUuid: string, userRole: string) {
    const stream = this.getStreamBy(userUuid)

    if (!stream) {
      const currentIsTeacher = userRole === 'teacher' ? 'teacher' : 'student'
      if (currentIsTeacher) {
        return this.defaultTeacherPlaceholder
      } else {
        return this.defaultStudentPlaceholder
      }
    }

    if (!!stream.hasVideo === false) {
      return {
        placeHolderType: 'muted',
        text: transI18n('placeholder.closedCamera')
      }
    }

    const isFreeze = this.queryVideoFrameIsNotFrozen(+stream.streamUuid) === false
    if (isFreeze) {
      return {
        placeHolderType: 'broken',
        text: transI18n('placeholder.noAvailableCamera')
      }
    }

    return {
      placeHolderType: 'none',
      text: ''
    }
  }

  getFixAudioVolume(streamUuid: number): number {
    const isLocal = this.localStreamUuid === streamUuid
    if (isLocal) {
      return this.localVolume
    }
    const level = this.mediaStore.speakers[`${streamUuid}`] || 0
    if (this.isElectron) {
      return this.fixNativeVolume(level)
    }
    return this.fixWebVolume(level)
  }

  queryCamIssue(userUuid: string): boolean {
    const user = this.userList.find((item: EduUser) => item.userUuid === userUuid)
    if (user && user.userProperties) {
      return !!get(user.userProperties, 'devices.camera', 1) === false
    }
    return false
  }

  queryVideoFrameIsNotFrozen (uid: number): boolean {
    const isLocal = this.localStreamUuid === +uid
    if (isLocal) {
      if (this.mediaStore.localVideoState === LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_FAILED) {
        return false
      }
      // const frameRate = this.mediaStore.rendererOutputFrameRate[`${0}`]
      // return frameRate > 0
      const freezeCount = this.cameraRenderer?.freezeCount || 0
      return freezeCount < 3
    } else {
      const frameRate = this.mediaStore.rendererOutputFrameRate[`${uid}`]
      return frameRate > 0
    }
  }

  private getUserBy(userUuid: string): EduUser {
    return this.userList.find((it: EduUser) => it.userUuid === userUuid) as EduUser
  }

  private getStreamBy(userUuid: string): EduStream {
    return this.streamList.find((it: EduStream) => it.userInfo.userUuid as string === userUuid) as EduStream
  }

  async startClass() {
    try {
      await eduSDKApi.updateClassState({
        roomUuid: `${this.roomUuid}`,
        state: 1
      })
      // await this.roomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStart)
      // this.classState = true
      // this.uiStore.addToast(transI18n('toast.course_started_successfully'))
    } catch (err) {
      BizLogger.info(err)
      // this.uiStore.addToast(transI18n('toast.setting_start_failed'))
    }
  }

  
  async stopClass() {
    try {
      await eduSDKApi.updateClassState({
        roomUuid: `${this.roomUuid}`,
        state: 2
      })
      // await this.roomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStop)
      // this.uiStore.addToast(transI18n('toast.the_course_ends_successfully'))
    } catch (err) {
      BizLogger.info(err)
      // this.uiStore.addToast(transI18n('toast.setting_ended_failed'))
    }
  }

  loading: boolean = false;

  get teacherUuid(): string {
    const teacher = this.userList.find((it: EduUser) => it.role === EduRoleType.teacher)
    if (teacher) {
      return teacher.userUuid
    }
    return ''
  }
  
  get muteControl(): boolean {
    if (this.roomInfo) {
      return this.roomInfo.userRole === EduRoleTypeEnum.teacher
    }
    return false
  }

  get userUuid() {
    return `${this.roomInfo?.userUuid}`
  }

  
  get isRecording() {
    return this.recordState
  }
  
  get defaultTeacherPlaceholder() {
    if (this.loading) {
      return {
        placeHolderType: 'loading',
        text: transI18n(`placeholder.loading`)
      }
    }
    if (this.classState === EduClassroomStateEnum.beforeStart) {
      return {
        placeHolderType: 'loading',
        text: transI18n(`placeholder.teacher_noEnter`)
      }
    }
    return {
      placeHolderType: 'loading',
      text: transI18n(`placeholder.teacher_Left`)
    }
  }

  
  get defaultStudentPlaceholder() {
    if (this.loading) {
      return {
        placeHolderType: 'loading',
        text: transI18n(`placeholder.loading`)
      }
    }
    // if (this.classState)
    if (this.classState === EduClassroomStateEnum.beforeStart) {
      return {
        placeHolderType: 'noEnter',
        text: transI18n(`placeholder.student_noEnter`)
      }
    }
    return {
      placeHolderType: 'loading',
      text: transI18n(`placeholder.student_Left`)
    }
  }

    
  get localVolume(): number {
    let volume = 0
    // TODO: native adapter
    if (this.isElectron) {
      // native sdk默认0是本地音量
      volume = this.mediaStore.speakers[0] || 0
      return this.fixNativeVolume(volume)
    }
    if (this.isWeb && get(this, 'cameraEduStream.streamUuid', 0)) {
      volume = this.mediaStore.speakers[+this.cameraEduStream.streamUuid] || 0
      return this.fixWebVolume(volume)
    }
    return volume
  }

  
  get studentStreams(): EduMediaStream[] {
    let streamList = this.streamList.reduce(
      (acc: EduMediaStream[], stream: EduStream) => {
        const user = this.userList.find((user: EduUser) => (user.userUuid === stream.userInfo.userUuid && ['broadcaster', 'audience'].includes(user.role)))
        if (!user || this.isLocalStream(stream)) return acc;
        const props = this.getRemotePlaceHolderProps(user.userUuid, 'student')
        const volumeLevel = this.getFixAudioVolume(+stream.streamUuid)
        acc.push({
          local: false,
          account: user.userName,
          userUuid: stream.userInfo.userUuid as string,
          streamUuid: stream.streamUuid,
          video: stream.hasVideo,
          audio: stream.hasAudio,
          renderer: this.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +stream.streamUuid) as RemoteUserRenderer,
          hideControl: this.hideControl(user.userUuid),
          placeHolderType: props.placeHolderType,
          placeHolderText: props.text,
          micVolume: volumeLevel,
          whiteboardGranted: this.boardStore.checkUserPermission(`${user.userUuid}`),
        } as any)
        return acc;
      }
    , [])

    const localUser = this.roomInfo

    const isStudent = [EduRoleTypeEnum.student].includes(localUser.userRole)

    if (this.cameraEduStream && isStudent) {
      const props = this.getLocalPlaceHolderProps()
      streamList = [{
        local: true,
        account: localUser.userName,
        userUuid: this.cameraEduStream.userInfo.userUuid as string,
        streamUuid: this.cameraEduStream.streamUuid,
        video: this.cameraEduStream.hasVideo,
        audio: this.cameraEduStream.hasAudio,
        renderer: this.cameraRenderer as LocalUserRenderer,
        hideControl: this.hideControl(this.userUuid),
        placeHolderType: props.placeHolderType,
        placeHolderText: props.text,
        micVolume: this.localVolume,
        whiteboardGranted: this.boardStore.checkUserPermission(`${this.userUuid}`),
      } as any].concat(streamList.filter((it: any) => it.userUuid !== this.userUuid))
    }
    if (streamList.length) {
      return streamList  
    }
    return [{
      local: false,
      account: 'student',
      userUuid: '',
      streamUuid: '',
      video: false,
      audio: false,
      renderer: undefined,
      hideControl: true,
      placeHolderText: this.defaultStudentPlaceholder.text,
      placeHolderType: this.defaultStudentPlaceholder.placeHolderType,
      micVolume: 0,
      whiteboardGranted: false,
      defaultStream: true
    } as any]
  }

  
  get mutedChat(): boolean {
    if (this.canChatting !== undefined) {
      return this.canChatting
    }
    const classroom = this.roomManager?.getClassroomInfo()
    if (classroom && classroom.roomStatus) {
      return !classroom.roomStatus.isStudentChatAllowed
    }
    return true
  }


  get localStreamUuid() {
    return +this.cameraEduStream?.streamUuid ?? -1
  }
  
  get teacherStream(): EduMediaStream {

    // 当本地是老师时
    const localUser = this.roomInfo
    if (localUser && localUser.userRole === EduRoleTypeEnum.teacher) {
      const {placeHolderType, text} = this.getLocalPlaceHolderProps()
      return {
        local: true,
        userUuid: this.userUuid,
        account: localUser.userName,
        streamUuid: this.cameraEduStream?.streamUuid,
        video: this.cameraEduStream?.hasVideo,
        audio: this.cameraEduStream?.hasAudio,
        renderer: this.cameraRenderer as LocalUserRenderer,
        hideControl: this.hideControl(this.userUuid),
        holderState: placeHolderType,
        placeHolderText: text,
        whiteboardGranted: true,
        micVolume: this.localVolume,
      } as any
    }

    // 当远端是老师时
    const teacherStream = this.streamList.find((it: EduStream) => it.userInfo.role as string === 'host' && it.userInfo.userUuid === this.teacherUuid && it.videoSourceType !== EduVideoSourceType.screen) as EduStream
    if (teacherStream) {
      const user = this.getUserBy(teacherStream.userInfo.userUuid as string) as EduUser
      const props = this.getRemotePlaceHolderProps(user.userUuid, 'teacher')
      const volumeLevel = this.getFixAudioVolume(+teacherStream.streamUuid)
      return {
        local: false,
        account: user.userName,
        userUuid: user.userUuid,
        streamUuid: teacherStream.streamUuid,
        video: teacherStream.hasVideo,
        audio: teacherStream.hasAudio,
        renderer: this.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +teacherStream.streamUuid) as RemoteUserRenderer,
        hideControl: this.hideControl(user.userUuid),
        holderState: props.placeHolderType,
        placeHolderText: props.text,
        whiteboardGranted: true,
        micVolume: volumeLevel,
      } as any
    }
    return {
      account: 'teacher',
      streamUuid: '',
      userUuid: '',
      local: false,
      video: false,
      audio: false,
      renderer: undefined,
      hideControl: true,
      placeHolderText: this.defaultTeacherPlaceholder.text,
      holderState: this.defaultTeacherPlaceholder.placeHolderType,
      micVolume: 0,
    } as any
  }

  
  get sceneVideoConfig() {
    const roomType = this.roomInfo?.roomType ?? 1
    const userRole = this.roomInfo?.userRole ?? EduRoleTypeEnum.invisible
    const isHost = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(userRole)

    const config = {
      hideOffPodium: roomType === EduRoomType.SceneType1v1 ? true : false,
      hideOffAllPodium: roomType === EduRoomType.SceneType1v1 ? true : false,
      isHost: isHost,
    }

    return config
  }

  get isAssistant() {
    if (this.roomInfo.userRole === EduRoleTypeEnum.assistant) {
      return true
    }
    return false
  }

  get isTeacher() {
    if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
      return true
    }
    return false;
  }

  get studentsReward() {
    return get(this.roomProperties, 'students', {})
  }

  get signalLevel(): number {
    const best = ['good', 'excellent']
    if (best.includes(this.mediaStore.networkQuality)) {
      return 3
    }

    const qualities = ['poor', 'bad']
    if (qualities.includes(this.mediaStore.networkQuality)) {
      return 2
    }

    const level1Qualities = ['very bad','down']
    if (level1Qualities.includes(this.mediaStore.networkQuality)) {
      return 1
    }

    return 0
  }


  
  get sceneType() {
    const roomType = get(this.roomInfo, 'roomType', 1)
    return roomType
  }

  
  get screenShareStream(): EduMediaStream {
    // 当本地存在业务流时
    if (this.screenEduStream) {
      return {
        local: true,
        account: '',
        stars: 0,
        userUuid: this.screenEduStream.userInfo.userUuid as string,
        streamUuid: this.screenEduStream.streamUuid,
        video: this.screenEduStream.hasVideo,
        audio: this.screenEduStream.hasAudio,
        renderer: this._screenVideoRenderer as LocalUserRenderer,
        hideControl: false
      } as any
    } else {
      return this.streamList.reduce((acc: EduMediaStream[], stream: EduStream) => {
        const teacher = this.userList.find((user: EduUser) => user.role === 'host')
        if (stream.videoSourceType !== EduVideoSourceType.screen 
          || !teacher 
          || stream.userInfo.userUuid !== teacher.userUuid) {
          return acc;
        } else {
          if (this.userUuid === stream.userInfo.userUuid) {
            if (this.screenEduStream) {
              acc.push({
                local: true,
                account: '',
                stars: 0,
                userUuid: this.screenEduStream.userInfo.userUuid as string,
                streamUuid: this.screenEduStream.streamUuid,
                video: this.screenEduStream.hasVideo,
                audio: this.screenEduStream.hasAudio,
                renderer: this._screenVideoRenderer as LocalUserRenderer,
                hideControl: false
              } as any)
              return acc;
            } else {
              return acc
            }
          } else {
            acc.push({
              local: false,
              account: '',
              userUuid: stream.userInfo.userUuid,
              streamUuid: stream.streamUuid,
              video: stream.hasVideo,
              audio: stream.hasAudio,
              renderer: this.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +stream.streamUuid) as RemoteUserRenderer,
              hideControl: false
            } as any)
          }
        }
        return acc;
      }, [])[0]
    }
  }

  isLocalStream(stream: EduStream): boolean {
    return this.userUuid === stream.userInfo.userUuid
  }

  fixNativeVolume(volume: number) {
    return Math.max(0, +(volume / 255).toFixed(2))
  }

  fixWebVolume(volume: number) {
    if (volume > 0.01 && volume < 1) {
      const v = Math.min(+volume * 10, 0.8)
      return v
    }
    const v = Math.min(+(volume / 100).toFixed(2), 0.8)
    return v
  }
  
  async muteChat() {
    await eduSDKApi.muteChat({
      roomUuid: this.roomInfo.roomUuid,
      muteChat: 1
    })
    this.canChatting = true
  }

  
  async unmuteChat() {
    await eduSDKApi.muteChat({
      roomUuid: this.roomInfo.roomUuid,
      muteChat: 0
    })
    this.canChatting = false
  }

  /**
   * @note only teacher or myself return true
   * @param userUuid string
   */
  hideControl(userUuid: string): boolean {
    if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole)) {
      return false
    }

    if (this.userUuid === userUuid) {
      return false
    }

    return true
  }

  async closeStream(userUuid: string, isLocal: boolean) {
    BizLogger.info("closeStream", userUuid, isLocal)
    if (isLocal) {
      if (this.cameraEduStream) {
        await this.roomManager?.userService.unpublishStream({
          streamUuid: this.cameraEduStream.streamUuid,
        })
        BizLogger.info("closeStream ", this.userUuid)
        if (this.userUuid === userUuid) {
          BizLogger.info("准备结束摄像头")
          this._cameraEduStream = undefined
          await this.mediaService.unpublish()
          await this.mediaService.closeCamera()
          await this.mediaService.closeMicrophone()
        }
      }
    } else {
      if (this.roomManager?.userService) {
        const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
        const targetUser = this.userList.find((it: EduUser) => it.userUuid === targetStream?.userInfo.userUuid)
        if (targetUser) {
          await this.roomManager?.userService.teacherCloseStream(targetUser)
          await this.roomManager?.userService.remoteCloseStudentStream(targetStream as EduStream)
        }
      }
    }
  }

  async muteAudio(userUuid: string, isLocal: boolean) {
    if (isLocal) {
      BizLogger.info('before muteLocalAudio', this.microphoneLock)
      await this.muteLocalMicrophone()
      BizLogger.info('after muteLocalAudio', this.microphoneLock)
    } else {
      const stream = this.getStreamBy(userUuid)
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      
      try {
        await Promise.all([
          this.roomManager?.userService.remoteStopStudentMicrophone(targetStream as EduStream),
        ])
      }catch(err) {
        throw err
      }
    }
  }

  async unmuteAudio(userUuid: string, isLocal: boolean) {
    BizLogger.info("unmuteAudio", userUuid, isLocal)
    if (isLocal) {
      await this.unmuteLocalMicrophone()
    } else {
      const stream = this.getStreamBy(userUuid)
      if (stream && this.mediaService.isElectron) {
        await this.mediaService.muteRemoteAudio(+stream.streamUuid, false)
      }
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      try {
        await Promise.all([
          this.roomManager?.userService.remoteStartStudentMicrophone(targetStream as EduStream),
        ])
      }catch(err) {
        throw err
      }
    }
  }

  async grantBoard(userUuid: string, isLocal: boolean) {

  }

  async revokeBoard(userUuid: string, isLocal: boolean) {
    
  }

  getSessionConfig(): {sceneType: number, userRole: string} {
    const userRole = this.roomInfo.userRole
    const roomType = +this.roomInfo.roomType

    if (userRole === EduRoleTypeEnum.student) {
      const studentRoleConfig = {
        [EduSceneType.Scene1v1]: 'broadcaster',
        [EduSceneType.SceneMedium]: 'audience'
      }
      return {
        sceneType: roomType,
        userRole: studentRoleConfig[roomType]
      }
    }

    if (userRole === EduRoleTypeEnum.teacher) {
      return {
        sceneType: roomType,
        userRole: 'host'
      }
    }

    if (userRole === EduRoleTypeEnum.assistant) {
      return {
        sceneType: roomType,
        userRole: 'assistant'
      }
    }
    
    return {
      sceneType: roomType,
      userRole: 'invisible'
    }
  }

  getRoleEnumValue(userRole: string): EduRoleTypeEnum {
    if(userRole === 'invisible') {
      return EduRoleTypeEnum.invisible
    } else if(userRole === 'assistant') {
      return EduRoleTypeEnum.assistant
    } else if(userRole === 'teacher') {
      return EduRoleTypeEnum.teacher
    }
    return EduRoleTypeEnum.student
  }

  async muteVideo(userUuid: string, isLocal: boolean) {
    BizLogger.info("muteVideo", userUuid, isLocal)
    if (isLocal) {
      BizLogger.info('before muteLocalCamera', this.cameraLock)
      await this.muteLocalCamera()
      BizLogger.info('after muteLocalCamera', this.cameraLock)
    } else {
      const stream = this.getStreamBy(userUuid)
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      try {
        await Promise.all([
          this.roomManager?.userService.remoteStopStudentCamera(targetStream as EduStream),
        ])

      } catch(err) {
        throw err
      }
    }
  }

  async unmuteVideo(userUuid: string, isLocal: boolean) {
    BizLogger.info("unmuteVideo", userUuid, isLocal)
    if (isLocal) {
      BizLogger.info('before unmuteLocalCamera', this.cameraLock)
      await this.unmuteLocalCamera()
      BizLogger.info('after unmuteLocalCamera', this.cameraLock)
    } else {
      const stream = this.getStreamBy(userUuid)
      if (stream && this.mediaService.isElectron) {
        await this.mediaService.muteRemoteVideo(+stream.streamUuid, false)
      }
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)

      try {
        await Promise.all([
          this.roomManager?.userService.remoteStartStudentCamera(targetStream as EduStream),
        ])
      } catch(err) {
        throw err
      }
    }
  }

  async startOrStopRecording(){
    try {
      if (this.recording) {
        return
      }
      this.recording = true
      if (this.isRecording) {
        await this.stopRecording()
      } else {
        await this.startRecording()
      }
      this.recording = false
    } catch (err) {
      this.recording = false
    }
  }

  resetStates() {
    this.mediaStore.resetRoomState()
    this.resetRoomInfo()    
    this.resetParams()
    this.roomManager = undefined
    this.waitingShare = false
    this._screenVideoRenderer = undefined;
    this._screenEduStream = undefined
    this.sharing = false
    this.customScreenShareWindowVisible = false
    this.customScreenShareItems = []
  }

  async releaseRoom() {
    try {
      await this.leave()
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
    await controller.appController.destroy()
  }

  async startRecording() {
    try {
      await eduSDKApi.updateRecordingState({
        roomUuid: this.roomUuid,
        state: 1
      })
      // let {recordId} = await this.recordService.startRecording(this.roomUuid)
      // this.recordId = recordId
      // this.uiStore.addToast(transI18n('toast.start_recording_successfully'))
    } catch (err) {
      // this.uiStore.addToast(transI18n('toast.start_recording_failed') + `, ${err.message}`)
    }
  }

  async stopRecording() {
    try {
      await eduSDKApi.updateRecordingState({
        roomUuid: this.roomUuid,
        state: 0
      })
      // await this.recordService.stopRecording(this.roomUuid, this.recordId)
      // this.uiStore.addToast(transI18n('toast.successfully_ended_recording'))
      // this.recordId = ''
    } catch (err) {
      // this.uiStore.addToast(transI18n('toast.failed_to_end_recording') + `, ${err.message}`)
    }
  }

  async revokeCoVideo(userUuid: string) {
    try {
      await eduSDKApi.revokeCoVideo({
        roomUuid: this.roomInfo.roomUuid,
        toUserUuid: userUuid
      })
    } catch (err) {
      const error = GenericErrorWrapper(err)
      // this.uiStore.addToast(BusinessExceptions.getErrorText(error))
    }
  }

  async revokeAllCoVideo() {
    try {
      await eduSDKApi.revokeAllCoVideo({
        roomUuid: this.roomInfo.roomUuid
      })
    } catch(err) {
      const error = GenericErrorWrapper(err)
      // this.uiStore.addToast(BusinessExceptions.getErrorText(error))
    }
  }

  async join() {
    try {
      // this.disposers.push(reaction(() => this.classState, this.onClassStateChanged.bind(this)))

      // TODO: loading
      // this.uiStore.startLoading()
      this.roomApi = new RoomApi({
        appId: this.eduManager.config.appId,
        sdkDomain: this.eduManager.config.sdkDomain as string,
        rtmToken: this.params.config.rtmToken,
        rtmUid: this.params.config.rtmUid,
      })
      const roomUuid = this.roomInfo.roomUuid

      const startTime = this.params.startTime
      const duration = this.params.duration
      
      // REPORT
      // CRITICAL REPORT ONLY STARTS AFTER BELOW LINE
      reportService.initReportParams({
        appId: this.eduManager.config.appId,
        uid: this.params.config.rtmUid,
        rid: roomUuid,
        sid: this.eduManager.sessionId
      })
      reportService.reportEC('joinRoom', 'start')

      const region = regionMap[this.params.config.region!] ?? 'cn-hz'
      
      let checkInResult = await eduSDKApi.checkIn({
        roomUuid,
        roomName: `${this.roomInfo.roomName}`,
        roomType: +this.roomInfo.roomType as number,
        userName: this.roomInfo.userName,
        userUuid: this.roomInfo.userUuid,
        role: this.roomInfo.userRole,
        startTime: startTime,  // 单位：毫秒
        duration: duration,    // 秒
        region: region
      })
      EduLogger.info("## classroom ##: checkIn:  ", JSON.stringify(checkInResult))
      // this.timeShift = checkInResult.ts - dayjs().valueOf()
      // this.classroomSchedule = {
      //   startTime: checkInResult.startTime,
      //   duration: checkInResult.duration,
      //   closeDelay: checkInResult.closeDelay
      // }
      // TODO tick classroom clock
      // this.tickClassroom()

      this.canChatting = checkInResult.muteChat ? false : true
      this.recordState = !!checkInResult.isRecording
      this.classState = checkInResult.state
      this.boardStore.init({
        boardId: checkInResult.board.boardId,
        boardToken: checkInResult.board.boardToken,
        boardRegion: checkInResult.board.boardRegion,
      }).catch((err: any) => {
        const error = GenericErrorWrapper(err)
        BizLogger.warn(`${error}`)
        // this.isNotInvisible && this.uiStore.addToast(
        //   transI18n('toast.failed_to_join_board'),
        //   'error'
        // )
      })
      // this.uiStore.stopLoading()

      // logout will clean up eduManager events, so we need to put the listener here
      this.eduManager.on('ConnectionStateChanged', async ({newState, reason}: any) => {
        if (newState === "ABORTED" && reason === "REMOTE_LOGIN") {
          await this.releaseRoom()
          // this.uiStore.addToast(transI18n('toast.classroom_remote_join'))
          this.noticeQuitRoomWith(QuickTypeEnum.Kick)
        }
        reportService.updateConnectionState(newState)
      })

      await this.eduManager.login(this.userUuid)
  
      const roomManager = this.eduManager.createClassroom({
        roomUuid: roomUuid,
        roomName: this.roomInfo.roomName
      })
      // TODO: seqIdChanged
      roomManager.on('seqIdChanged', (evt: any) => {
        BizLogger.info("seqIdChanged", evt)
        // this.uiStore.updateCurSeqId(evt.curSeqId)
        // this.uiStore.updateLastSeqId(evt.latestSeqId)
      })
      // 本地用户更新
      roomManager.on('local-user-updated', (evt: any) => {
        this.userList = roomManager.getFullUserList()
        BizLogger.info("ode", evt)
      })
      roomManager.on('local-user-removed', async (evt: any) => {
        await this.mutex.dispatch<Promise<void>>(async () => {
          BizLogger.info("local-user-removed ", evt)
          const {user, type} = evt
          if (user.user.userUuid === this.roomInfo.userUuid && type === 2) {
            await this.releaseRoom()
            // this.uiStore.addToast(transI18n('toast.kick_by_teacher'), 'error')
            this.noticeQuitRoomWith(QuickTypeEnum.Kicked)
          }
        })
      })
      // 本地流移除
      roomManager.on('local-stream-removed', async (evt: any) => {
        const {operator, data, cause} = evt
        await this.mutex.dispatch<Promise<void>>(async () => {
          if (!this.joiningRTC) {
            return 
          }
          try {
            const tag = uuidv4()
            BizLogger.info(`[demo] tag: ${tag}, [${Date.now()}], handle event: local-stream-removed, `, JSON.stringify(evt))
            if (evt.type === 'main') {
              this._cameraEduStream = undefined
              await this.closeCamera()
              await this.closeMicrophone()
              if (cause && cause.cmd === 501) {
                const roleMap = {
                  'host': transI18n('role.teacher'),
                  'assistant': transI18n('role.assistant')
                }
                const role = roleMap[operator.userRole] ?? 'unknown'
                // this.uiStore.addToast(transI18n(`roster.close_student_co_video`, {teacher: role}))
              }
              BizLogger.info(`[demo] tag: ${tag}, [${Date.now()}], main stream closed local-stream-removed, `, JSON.stringify(evt))
            }
            BizLogger.info("[demo] local-stream-removed emit done", evt)
          } catch (err) {
            BizLogger.error(`[demo] local-stream-removed async handler failed`)
            const error = GenericErrorWrapper(err)
            BizLogger.error(`${error}`)
          }
        })
      })
      // 本地流更新
      roomManager.on('local-stream-updated', async (evt: any) => {
        const {operator, data, cause} = evt
        await this.mutex.dispatch<Promise<void>>(async () => {
          this.streamList = roomManager.getFullStreamList()
          if (!this.joiningRTC) {
            return 
          }
          const tag = uuidv4()
          BizLogger.info(`[demo] tag: ${tag}, seq[${evt.seqId}] time: ${Date.now()} local-stream-updated, `, JSON.stringify(evt))
          if (evt.type === 'main') {
            if (this.isAssistant) {
              return
            }
            const localStream = roomManager.getLocalStreamData()
            BizLogger.info(`[demo] local-stream-updated tag: ${tag}, time: ${Date.now()} local-stream-updated, main stream `, JSON.stringify(localStream), this.joiningRTC)
            const causeCmd = cause?.cmd ?? 0
            if (localStream && localStream.state !== 0) {
              if (causeCmd === 501) {
                const roleMap = {
                  'host': transI18n('role.teacher'),
                  'assistant': transI18n('role.assistant')
                }
                const role = roleMap[operator.userRole] ?? 'unknown'
                // this.uiStore.addToast(transI18n(`roster.open_student_co_video`, {teacher: role}))
              }
              BizLogger.info(`[demo] local-stream-updated tag: ${tag}, time: ${Date.now()} local-stream-updated, main stream is online`, ' _hasCamera', this._hasCamera, ' _hasMicrophone ', this._hasMicrophone, this.joiningRTC)
              if (this._cameraEduStream) {
                if (!!localStream.stream.hasVideo !== !!this._cameraEduStream.hasVideo) {
                  console.log("### [demo] localStream.stream.hasVideo ", localStream.stream.hasVideo, "this._cameraEduStream.hasVideo ", this._cameraEduStream.hasVideo)
                  this._cameraEduStream.hasVideo = !!localStream.stream.hasVideo
                  if (causeCmd !== 501) {
                    const i18nRole = operator.role === 'host' ? 'teacher' : 'assistant'
                    const operation = this._cameraEduStream.hasVideo ? 'co_video.remote_open_camera' : 'co_video.remote_close_camera'
                    // this.uiStore.addToast(transI18n(operation, {reason: transI18n(`role.${i18nRole}`)}))
                  }
                  // this.operator = {
                  //   ...operator,
                  //   cmd: cause?.cmd ?? 0,
                  //   action: 'video'
                  // }
                }
                if (!!localStream.stream.hasAudio !== !!this._cameraEduStream.hasAudio) {
                  console.log("### [demo] localStream.stream.hasAudio ", localStream.stream.hasAudio, "this._cameraEduStream.hasAudio ", this._cameraEduStream.hasAudio)
                  this._cameraEduStream.hasAudio = !!localStream.stream.hasAudio
                  if (causeCmd !== 501) {
                    const i18nRole = operator.role === 'host' ? 'teacher' : 'assistant'
                    const operation = this._cameraEduStream.hasAudio ? 'co_video.remote_open_microphone' : 'co_video.remote_close_microphone'
                    // this.uiStore.addToast(transI18n(operation, {reason: transI18n(`role.${i18nRole}`)}))
                  }
                  // this.operator = {
                  //   ...operator,
                  //   cmd: cause?.cmd ?? 0,
                  //   action: 'audio'
                  // }
                }
              } else {
                this._cameraEduStream = localStream.stream
                // this.operator = {
                //   ...operator,
                //   cmd: cause?.cmd ?? 0,
                //   action: 'all'
                // }
              }
              BizLogger.info(`[demo] tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated, main stream is online`, ' _hasCamera', this._hasCamera, ' _hasMicrophone ', this._hasMicrophone, this.joiningRTC, ' _eduStream', JSON.stringify(this._cameraEduStream))
              if (this.joiningRTC) {
                if (this.cameraEduStream.hasVideo) {

                  await this.openCamera(this.videoEncoderConfiguration)
                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after openCamera  local-stream-updated, main stream is online`, ' _hasCamera', this._hasCamera, ' _hasMicrophone ', this._hasMicrophone, this.joiningRTC, ' _eduStream', JSON.stringify(this._cameraEduStream))
                } else {

                  await this.closeCamera()
                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after closeCamera  local-stream-updated, main stream is online`, ' _hasCamera', this._hasCamera, ' _hasMicrophone ', this._hasMicrophone, this.joiningRTC, ' _eduStream', JSON.stringify(this._cameraEduStream))
                }
                // if (this._hasMicrophone) {
                  if (this.cameraEduStream.hasAudio) {
                    BizLogger.info('open microphone')
                    await this.openMicrophone()

                    BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} after openMicrophone  local-stream-updated, main stream is online`, ' _hasCamera', this._hasCamera, ' _hasMicrophone ', this._hasMicrophone, this.joiningRTC, ' _eduStream', JSON.stringify(this._cameraEduStream))
                  } else {
                    BizLogger.info('close local-stream-updated microphone')
                    await this.closeMicrophone()
                    BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after closeMicrophone  local-stream-updated, main stream is online`, ' _hasCamera', this._hasCamera, ' _hasMicrophone ', this._hasMicrophone, this.joiningRTC, ' _eduStream', JSON.stringify(this._cameraEduStream))
                  }
              }
            } else {
              BizLogger.info("reset camera edu stream", JSON.stringify(localStream), localStream && localStream.state)
              this._cameraEduStream = undefined
            }
          }
    
          if (evt.type === 'screen') {
            if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
              const screenStream = roomManager.getLocalScreenData()
              BizLogger.info("local-stream-updated getLocalScreenData#screenStream ", JSON.stringify(screenStream))
              if (screenStream && screenStream.state !== 0) {
                this._screenEduStream = screenStream.stream
                this.sharing = true
              } else {
                BizLogger.info("local-stream-updated reset screen edu stream", screenStream, screenStream && screenStream.state)
                this._screenEduStream = undefined
                this.sharing = false
              }
            }
          }
    
          BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated emit done`, evt)
          BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated emit done`, ' _hasCamera', this._hasCamera, ' _hasMicrophone ', this._hasMicrophone, this.joiningRTC, ' _eduStream', JSON.stringify(this._cameraEduStream))
        })
      })
      // 远端人加入
      roomManager.on('remote-user-added', (evt: any) => {
        this.userList = roomManager.getFullUserList()
        BizLogger.info("remote-user-added", evt)
      })
      // 远端人更新
      roomManager.on('remote-user-updated', (evt: any) => {
        this.userList = roomManager.getFullUserList()
        BizLogger.info("remote-user-updated", evt)
      })
      // 远端人移除
      roomManager.on('remote-user-removed', (evt: any) => {
        this.userList = roomManager.getFullUserList()
        BizLogger.info("remote-user-removed", evt)
      })
      // 远端流加入
      roomManager.on('remote-stream-added', (evt: any) => {
          this.streamList = roomManager.getFullStreamList()
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
            if (this.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
              this.sharing = true
            } else { 
              this.sharing = false
            }
          }
        BizLogger.info("remote-stream-added", evt)
      })
      // 远端流移除
      roomManager.on('remote-stream-removed', (evt: any) => {
        // runInAction(() => {
          this.streamList = roomManager.getFullStreamList()
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
            if (this.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
              this.sharing = true
            } else { 
              this.sharing = false
            }
          }
        // })
        BizLogger.info("remote-stream-removed", evt)
      })
      // 远端流更新
      roomManager.on('remote-stream-updated', (evt: any) => {
        // runInAction(() => {
          this.streamList = roomManager.getFullStreamList()
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
            if (this.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
              this.sharing = true
            } else { 
              this.sharing = false
            }
          }
        // })
        BizLogger.info("remote-stream-updated", evt)
      })
      const decodeMsg = (str: string) => {
        try {
          return JSON.parse(str)
        } catch(err) {
          const error = GenericErrorWrapper(err)
          BizLogger.warn(`${error}`)
          return null
        }
      }
      // 教室更新
      roomManager.on('classroom-property-updated', async (evt: any) => {
        console.log('## classroom-property-updated', evt)
        const {classroom, cause, operator} = evt
        await this.mutex.dispatch<Promise<void>>(async () => {

          cause && this.handleCause(operator)

          this.roomProperties = get(classroom, 'roomProperties')
          const newClassState = get(classroom, 'roomStatus.courseState')
        
          const record = get(classroom, 'roomProperties.record')
          if (record) {
            const state = record.state
            if (state === 1) {
              this.recordState = true
            } else {
              if (state === 0 && this.recordState) {
                // this.addChatMessage({
                //   id: 'system',
                //   ts: Date.now(),
                //   text: '',
                //   account: 'system',
                //   link: this.roomUuid,
                //   sender: false
                // })
                this.recordState = false
              }
            }
          }
          
          // update scene store
          if (newClassState !== undefined && this.classState !== newClassState) {
            this.classState = newClassState
            // if (this.classState === 1) {
            //   this.startTime = get(classroom, 'roomStatus.startTime', 0)
            //   this.addInterval('timer', () => {
            //     this.updateTime(+get(classroom, 'roomStatus.startTime', 0))
            //   }, ms)
            // } else {
            //   this.startTime = get(classroom, 'roomStatus.startTime', 0)
            //   BizLogger.info("end time", this.startTime)
            //   this.delInterval('timer')
            // }
          }
          const isStudentChatAllowed = classroom?.roomStatus?.isStudentChatAllowed ?? true
          console.log('## isStudentChatAllowed , ',  isStudentChatAllowed, classroom)
          this.canChatting = isStudentChatAllowed
          this.chatIsBanned(isStudentChatAllowed)
        })
      })
      roomManager.on('room-chat-message', (evt: any) => {
        const {textMessage} = evt;
        console.log('### room-chat-message ', evt)
        const message = textMessage as EduTextMessage

        const fromUser = message.fromUser

        const chatMessage = message.message
        
        // TODO: add chat list
        // this.addChatMessage({
        //   id: fromUser.userUuid,
        //   ts: message.timestamp,
        //   text: chatMessage,
        //   account: fromUser.userName,
        //   role: `${this.getRoleEnumValue(fromUser.role)}`,
        //   isOwn: false
        // })
        // if (this.uiStore.chatCollapse) {
        //   this.incrementUnreadMessageCount()
        // }
        BizLogger.info('room-chat-message', evt)
      })
      const { sceneType, userRole } = this.getSessionConfig()
      await roomManager.join({
        userRole: userRole,
        roomUuid,
        userName: `${this.roomInfo.userName}`,
        userUuid: `${this.userUuid}`,
        sceneType,
      })
      this._roomManager = roomManager;

      this._uploadService = new UploadService({
        // prefix: '',
        sdkDomain: this.params.config.sdkDomain,
        appId: this.params.config.agoraAppId,
        rtmToken: this.params.config.rtmToken,
        rtmUid: this.params.config.rtmUid,
        // region: this.params.config.region
        // roomUuid: roomManager.roomUuid,
        // userToken: roomManager.userToken,
      })

      this._uploadService.setRegion(region)

      this._boardService = new EduBoardService({
        prefix: '',
        sdkDomain: this.params.config.sdkDomain,
        appId: this.params.config.agoraAppId,
        rtmToken: this.params.config.rtmToken,
        rtmUid: this.params.config.rtmUid,
        roomUuid: roomManager.roomUuid,
        userToken: roomManager.userToken,
      })
      this._recordService = new EduRecordService({
        prefix: '',
        sdkDomain: this.params.config.sdkDomain,
        appId: this.params.config.agoraAppId,
        rtmToken: this.params.config.rtmToken,
        rtmUid: this.params.config.rtmUid,
        roomUuid: roomManager.roomUuid,
      })
  
      const roomInfo = roomManager.getClassroomInfo()
      // this.startTime = +get(roomInfo, 'roomStatus.startTime', 0)

      const mainStream = roomManager.data.streamMap['main']
  
      // this.classState = roomInfo.roomStatus.courseState

      if (this.classState === 1) {
        // this.addInterval('timer', () => {
        //   this.updateTime(+get(roomInfo, 'roomStatus.startTime', 0))
        // }, ms)
      }
      // this.canChatting = !roomInfo.roomStatus.isStudentChatAllowed
  
      await this.joinRTC({
        uid: +mainStream.streamUuid,
        channel: roomInfo.roomInfo.roomUuid,
        token: mainStream.rtcToken
      })
  
      const localStreamData = roomManager.data.localStreamData

      const canPublishRTC = (localStreamData: any, sceneType: any): boolean => {
        const canPublishRTCRoles = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.student]
        if (sceneType === 0) {
          if (canPublishRTCRoles.includes(this.roomInfo.userRole)) {
            return true
          }
        }
        if (sceneType === 4) {
          const canPublishRTCRoles = [EduRoleTypeEnum.teacher]
          if (canPublishRTCRoles.includes(this.roomInfo.userRole)) {
            return true
          }
        }
        return false
      }
  
      if (canPublishRTC(localStreamData, sceneType)) {
  
        const localStreamData = roomManager.data.localStreamData
  
        BizLogger.info("localStreamData", localStreamData)
        await roomManager.userService.publishStream({
          videoSourceType: EduVideoSourceType.camera,
          audioSourceType: EduAudioSourceType.mic,
          streamUuid: mainStream.streamUuid,
          streamName: '',
          hasVideo: localStreamData && localStreamData.stream ? localStreamData.stream.hasVideo : true,
          hasAudio: localStreamData && localStreamData.stream ? localStreamData.stream.hasAudio : true,
          userInfo: {} as EduUser
        })
        EduLogger.info("toast.publish_business_flow_successfully")
        this._cameraEduStream = this.roomManager?.userService?.localStream?.stream ?? undefined
        try {
          // await this.prepareCamera()
          // await this.prepareMicrophone()
          if (this._cameraEduStream) {
            if (this._cameraEduStream.hasVideo) {
              try {
                await this.openCamera(this.videoEncoderConfiguration)
              } catch (err) {
                throw err
              }
            } else {
              await this.closeCamera()
            }
            if (this._cameraEduStream.hasAudio) {
              BizLogger.info('open microphone')
              await this.openMicrophone()
            } else {
              BizLogger.info('close microphone')
              await this.closeMicrophone()
            }
          }
        } catch (err) {
          // if (this.isNotInvisible) {
          //   this.uiStore.addToast(
          //     (transI18n('toast.media_method_call_failed') + `: ${err.message}`),
          //     'error'
          //   )
          // }
          const error = GenericErrorWrapper(err)
          BizLogger.warn(`${error}`)
        }
      }
  
      const roomProperties = roomManager.getClassroomInfo().roomProperties as any

      //@ts-ignore
      this.roomProperties = roomProperties
    
      this.userList = roomManager.getFullUserList()
      this.streamList = roomManager.getFullStreamList()
      if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
        if (this.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
          this.sharing = true
        } else { 
          this.sharing = false
        }
      }
      this.joined = true
      this.roomJoined = true
    } catch (err) {
      this.eduManager.removeAllListeners()
      this.uiStore.stopLoading()
      try {
        await this.destroy()
      } catch (err) {
        EduLogger.info(" appStore.destroyRoom ", err.message)
      }
      const error = GenericErrorWrapper(err)
      reportService.reportElapse('joinRoom', 'end', {result: false, errCode: `${error.message}`})
      // this.uiStore.addDialog(GenericErrorDialog, {error})
      throw error
    }
  }

  async sendMessage(message: any) {
    const ts = +Date.now();
    try {
      const result = await eduSDKApi.sendChat({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: this.roomInfo.userUuid,
        data: {
          message,
          type: 1,
        }
      })

      if (this.isTeacher || this.isAssistant) {
        const sensitiveWords = get(result, 'sensitiveWords', [])
      }

      return {
        id: this.userUuid,
        ts,
        text: message,
        account: this.roomInfo.userName,
        sender: true,
        fromRoomName: this.roomInfo.userName,
      }
    } catch (err) {
      this.appStore.uiStore.addToast(
        transI18n('toast.failed_to_send_chat'),
        'error'
      )
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      return{
        id: this.userUuid,
        ts,
        text: message,
        account: this.roomInfo.userName,
        sender: true,
        fromRoomName: this.roomInfo.userName,
        status:'fail'
      }
    }
  }
  
  // setMessageList(messageList: ChatMessage[]) {
  //   this.roomChatMessages = messageList
  // }

  async getHistoryChatMessage(data: {
    nextId: string,
    sort: number
  }) {
    try {
      const historyMessage = await eduSDKApi.getHistoryChatMessage({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: this.roomInfo.userUuid,
        data
      })
      historyMessage.list.map((item:any)=>{
        return {
          text: item.message,
          ts:item.sendTime,
          id:item.sequences,
          fromRoomUuid:item.fromUser.userUuid,
          userName:item.fromUser.userName,
          role:item.fromUser.role,
          sender: item.fromUser.userUuid === this.roomInfo.userUuid,
          account:item.fromUser.userName
        }
      })
      return historyMessage
    } catch (err) {
      this.uiStore.addToast('toast.failed_to_send_chat')
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }
  // 奖杯
  async sendReward(userUuid: string, reward: number) {
    try {
      return await eduSDKApi.sendRewards({
        roomUuid: this.roomInfo.roomUuid,
        rewards: [{
          userUuid: userUuid,
          changeReward: reward,
        }]
      })
    } catch (err) {
      this.uiStore.addToast(
        'toast.failed_to_send_reward',
        'error'
      )
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  async kickOutOnce(userUuid: string, roomUuid: string) {
    await eduSDKApi.kickOutOnce({
      roomUuid,
      toUserUuid: userUuid
    })
  }

  async kickOutBan(userUuid: string, roomUuid: string) {
    await eduSDKApi.kickOutBan({
      roomUuid,
      toUserUuid: userUuid
    })
  }


  chatIsBanned(isStudentChatAllowed: boolean) {
    const isFirstLoad = () => {
      return this.isStudentChatAllowed === undefined
    }
    if(!this.joined) {
      return
    }
    // 判断是否等于上一次的值 相同则不更新
    if (!isFirstLoad() && this.isStudentChatAllowed !== isStudentChatAllowed) {
      if (this.isStudentChatAllowed) {
        // this.uiStore.addToast(
        //   transI18n('toast.chat_disable'),
        //   'error'
        // )
      } else {
        // this.uiStore.addToast(
        //   transI18n('toast.chat_enable'),
        //   'error'
        // )
      }
    } 
    this.isStudentChatAllowed = isStudentChatAllowed
  }
  async onClassStateChanged(state: EduClassroomStateEnum) {
    if(state === EduClassroomStateEnum.close) {
      try {
        await this.releaseRoom()
      } catch (err) {
        EduLogger.info("appStore.destroyRoom failed: ", err.message)
      }
      // this.uiStore.addDialog(RoomEndNotice)
    } else if(state === EduClassroomStateEnum.end) {
      // this.uiStore.addToast(
      //   transI18n('toast.class_is_end', {reason: this.formatTimeCountdown((this.classroomSchedule?.closeDelay || 0) * 1000, TimeFormatType.Message)}),
      //   'error'
      // )
    }
  }

  getRewardByUid(uid: string): number {
    return get(this.studentsReward, `${uid}.reward`, 0)
  }
  
  async leave() {
    try {
      this.joiningRTC = false
      try {
        await this.leaveRtc()
      } catch (err) {
        BizLogger.error(`${err}`)
      }
      try {
        await this.boardStore.leave()
      } catch (err) {
        BizLogger.error(`${err}`)
      }
      try {
        await this.eduManager.logout()
      } catch (err) {
        BizLogger.error(`${err}`)
      }
      try {
        await this.roomManager?.leave()
      } catch (err) {
        BizLogger.error(`${err}`)
      }
      // this.uiStore.addToast(t('toast.successfully_left_the_business_channel'))
      // this.delInterval('timer')
      this.reset()
      // this.uiStore.updateCurSeqId(0)
      // this.uiStore.updateLastSeqId(0)
    } catch (err) {
      this.reset()
      const error = GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
    }
  }

  noticeQuitRoomWith(quickType: QuickTypeEnum) {
    switch(quickType) {
      case QuickTypeEnum.Kick: {
        // this.uiStore.addDialog(KickEnd)
        break;
      }
      case QuickTypeEnum.End: {
        // this.uiStore.addDialog(RoomEndNotice)
        break;
      }
      case QuickTypeEnum.Kicked: {
        // this.uiStore.addDialog(KickedEnd)
        break;
      }
    }
  }

  async endRoom() {
    await eduSDKApi.updateClassState({
      roomUuid: this.roomInfo.roomUuid,
      state: 2
    })
    await this.releaseRoom()
    this.noticeQuitRoomWith(QuickTypeEnum.End)
  }

  formatTimeCountdown(milliseconds: number, mode: TimeFormatType):string {
    let seconds = Math.floor(milliseconds / 1000)
    let duration = dayjs.duration(milliseconds);
    let formatItems:string[] = []

    let hours_text = duration.hours() === 0 ? '' : `HH [${transI18n('nav.hours')}]`;
    let mins_text = duration.minutes() === 0 ? '' : `mm [${transI18n('nav.minutes')}]`;
    let seconds_text = duration.seconds() === 0 ? '' : `ss [${transI18n('nav.seconds')}]`;
    let short_hours_text = `HH [${transI18n('nav.short.hours')}]`;
    let short_mins_text = `mm [${transI18n('nav.short.minutes')}]`;
    let short_seconds_text = `ss [${transI18n('nav.short.seconds')}]`;
    if(mode === TimeFormatType.Timeboard) {
      // always display all time segment
      if(seconds < 60 * 60) {
        // less than a min
        formatItems = [short_mins_text, short_seconds_text]
      } else {
        formatItems = [short_hours_text, short_mins_text, short_seconds_text]
      }
    } else {
      // do not display time segment if it's 0
      if(seconds < 60) {
        // less than a min
        formatItems = [seconds_text]
      } else if (seconds < 60 * 60) {
        [mins_text, seconds_text].forEach(item => item && formatItems.push(item))
      } else {
        [hours_text, mins_text, seconds_text].forEach(item => item && formatItems.push(item))
      }
    }
    return duration.format(formatItems.join(' '))
  }

  @computed
  get navigationState() {
    return {
      cpuUsage: this.mediaStore.cpuUsage,
      isStarted: !!this.classState,
      title: this.roomInfo.roomName,
      signalQuality: this.mediaStore.networkQuality as any,
      networkLatency: +this.mediaStore.delay,
      networkQuality: this.mediaStore.networkQuality,
      packetLostRate: this.mediaStore.localPacketLostRate,
      classTimeText: this.classTimeText,
      isNative: this.isElectron,
    }
  }

  handleCause(operator: unknown) {
    const actionOperator = operator as CauseOperator
    const {cmd, data} = actionOperator
    console.log('[hands-up] ###### ', JSON.stringify({cmd, data}))
    if (cmd === 501) {
      const process = data.processUuid
      if (process === 'handsUp') {
        switch(data.actionType) {
          case CoVideoActionType.studentHandsUp: {
            if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole)) {
              // this.uiStore.addToast(transI18n("co_video.received_student_hands_up"), 'success')
            }
            console.log('学生举手')
            break;
          }
          // case CoVideoActionType.teacherAccept: {
          //   if (data.addAccepted) {
          //     const exists = data.addAccepted.find((it: any) => it.userUuid === this.roomInfo.userUuid)
          //     if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
          //       exists && this.uiStore.addToast(transI18n('co_video.teacher_accept_co_video'))
          //     }
          //   }
          //   break;
          // }
          case CoVideoActionType.teacherRefuse: {
            if ([EduRoleTypeEnum.student].includes(this.roomInfo.userRole)) {
              const includedRemoveProgress: ProgressUserInfo[] = data?.removeProgress ?? []
              if (includedRemoveProgress.find((it) => it.userUuid === this.roomInfo.userUuid)) {
                // this.uiStore.addToast(transI18n("co_video.received_teacher_refused"), 'warning')
              }
            }
            console.log('老师拒绝')
            break;
          }
          case CoVideoActionType.studentCancel: {
            if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole)) {
              // this.uiStore.addToast(transI18n("co_video.received_student_cancel"), 'error')
            }
            console.log('学生取消')
            break;
          }
          // case CoVideoActionType.teacherReplayTimeout: {
          //   this.uiStore.addToast(transI18n("co_video.received_message_timeout"), 'error')
          //   console.log('超时')
          //   break;
          // }
        }
      }
    }
  }

  reset() {
    this._hasCamera = undefined
    this._hasMicrophone = undefined
    this.waitingShare = false
    this.nativeScreenShareItems = []
    this.currentNativeWindowId = ''
    this.showNativeShareWindow = false
    this.isSharingScreen = false
  }
}