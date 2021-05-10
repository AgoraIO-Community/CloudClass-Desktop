import { ReactElement } from 'react';
import { UserRenderer, LocalUserRenderer, EduUser, EduStream, EduClassroomManager, EduRoleTypeEnum, GenericErrorWrapper, MediaService, AgoraWebRtcWrapper, AgoraElectronRTCWrapper, CameraOption, PrepareScreenShareParams, EduRoomType, EduRoleType, EduVideoSourceType, RemoteUserRenderer } from "agora-rte-sdk"
import { get } from "lodash"
import { observable, computed, action, runInAction } from "mobx"
import { EduScenarioAppStore } from "."
import { EduBoardService } from "../services/edu-board-service"
import { EduRecordService } from "../services/edu-record-service"
import { eduSDKApi } from "../services/edu-sdk-api"
import { RoomApi } from "../services/room-api"
import { BusinessExceptions } from "../utilities/biz-error"
import { BizLogger } from "../utilities/kit"
import { Mutex } from "../utilities/mutex"
import { LocalVideoStreamState } from "./media"

const delay = 2000

const ms = 500

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

export class SimpleInterval {
  _intervalMap: Record<string, any> = {}

  addInterval(key: string, callback: CallableFunction, delay: number) {
    if (this._intervalMap.hasOwnProperty(key)) {
      this.delInterval(key)
    }
    this._intervalMap[key] = setInterval(callback, delay)
  }

  delInterval(key: string) {
    clearInterval(this._intervalMap[key])
    delete this._intervalMap[key]
  }
}

export class SceneStore extends SimpleInterval {
  // @observable
  // cameraLabel: string = '';

  // @observable
  // microphoneLabel: string = '';

  // @observable
  // _cameraId: string = '';

  // @observable
  // _microphoneId: string = '';

  @observable
  resolution: string = '480p_1'

  @observable
  _microphoneTrack?: any = undefined;

  @observable
  _cameraRenderer?: LocalUserRenderer = undefined;

  @observable
  _screenVideoRenderer?: LocalUserRenderer = undefined;


  @computed
  get videoEncoderConfiguration(): SceneVideoConfiguration {
    return {
      width: 320,
      height: 240,
      frameRate: 15
    }
  }

  @computed
  get totalVolume(): number {
    return this.appStore.mediaStore.totalVolume
  }

  @observable
  currentWindowId: string = ''

  @observable
  customScreenShareWindowVisible: boolean = false;

  @observable
  customScreenShareItems: any[] = []

  @observable
  settingVisible: boolean = false

  autoplay: boolean = false

  @observable
  recordState: boolean = false

  startTime: number = 0

  @observable
  sharing: boolean = false;

  @computed
  get localStreamUuid(): any{
    return ''
    // return this.app
  }

  public _hasCamera?: boolean = undefined
  public _hasMicrophone?: boolean = undefined

  public readonly mutex = new Mutex()

  public cameraLock: boolean = false
  public microphoneLock: boolean = false


  @observable
  waitingShare: boolean = false


  @observable
  userList: EduUser[] = []

  @observable
  private _streamList: EduStream[] = []

  @computed
  get screenShareStreamList() {
    return this._streamList.filter((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)
  }
  
  @computed
  get streamList() {
    return this._streamList.filter((it: EduStream) => it.videoSourceType !== EduVideoSourceType.screen)
  }

  @action.bound
  updateStreamList(streamList: EduStream[])  {
    this._streamList = streamList
  }

  @observable
  unreadMessageCount: number = 0

  @observable
  joined: boolean = false


  @observable
  classState: number = 0

  @observable
  _delay: number = 0

  @observable
  time: number = 0

  @observable
  _cameraEduStream?: EduStream = undefined

  @observable
  _screenEduStream?: EduStream = undefined

  roomApi!: RoomApi

  @observable
  joiningRTC: boolean = false

  @observable
  recordId: string = ''

  @observable
  recording: boolean = false

  @observable
  _canChatting: boolean = true

  @computed
  get canChatting() {
    // TODO: global muted
    if (this._canChatting) {
      if (this.appStore.roomInfo.userRole === EduRoleTypeEnum.student) {
        const userUuid = this.roomInfo.userUuid
        const user = this.userList.find((user: EduUser) => user.userUuid === userUuid)
        if (user) {
          return !(!!user.userProperties.muteChat)
        }
      }
    }

    return this._canChatting
  }

  _roomManager?: EduClassroomManager = undefined;

  appStore!: EduScenarioAppStore;

  @action.bound
  reset() {
    this.mediaService.reset()
    this.openingTeacherCamera = false
    this.closingTeacherCamera = false
    this.loadingTeacherMicrophone = false
    this.openingStudentCamera = false
    this.closingStudentCamera = false
    this.loadingStudentMicrophone = false
    // this.cameraLabel = '';
    // this.microphoneLabel = '';
    // this._cameraId = '';
    // this._microphoneId = '';
    this.resolution = '480_p1';
    this._microphoneTrack = undefined;
    this._cameraRenderer = undefined;
    this._screenVideoRenderer = undefined;
    this.currentWindowId = ''
    this.customScreenShareWindowVisible = false
    this.customScreenShareItems = []
    this.settingVisible = false
    this.autoplay = false
    this.recordState = false
    this.startTime = 0
    this.sharing = false;
    this._hasCamera = undefined
    this._hasMicrophone = undefined
    this.cameraLock = false
    this.microphoneLock = false
    this.waitingShare = false
    this.userList = []
    this._streamList = []    
    this.unreadMessageCount = 0
    this.joined = false
    this.classState = 0
    this._delay = 0
    this.time = 0
    this._cameraEduStream = undefined
    this._screenEduStream = undefined
    this.joiningRTC = false
    this.recordId = ''
    this.recording = false  
    this._canChatting = true
    this._roomManager = undefined
  }

  constructor(appStore: EduScenarioAppStore) {
    super()
    this.appStore = appStore
  }

  @computed
  get isHost(): boolean {
    if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole)) {
      return true
    }
    return false
  }

  @computed
  get remoteUsersRenderer() {
    return this.appStore.mediaStore.remoteUsersRenderer
  }

  @computed
  get screenVideoRenderer(): LocalUserRenderer | undefined {
    return this._screenVideoRenderer;
  }

  @computed
  get cameraRenderer(): LocalUserRenderer | undefined {
    return this._cameraRenderer;
  }

  @computed
  get cameraId(): string {
    const defaultValue = ''
    return defaultValue
  }

  @computed
  get microphoneId(): string {
    const defaultValue = ''
    return defaultValue
  }

  get boardService(): EduBoardService {
    return this.appStore.boardService
  }

  get recordService(): EduRecordService {
    return this.appStore.recordService
  }

  @computed
  get canChat(): boolean {
    const userRole = get(this.roomInfo, 'userRole', '')
    if (userRole === EduRoleTypeEnum.teacher) {
      return true
    }

    return false
  }

  @action.bound
  showSetting() {
    this.settingVisible = true
  }

  @action.bound
  hideSetting() {
    this.settingVisible = false
  }

  @action.bound
  resetCameraTrack () {
    this._cameraRenderer = undefined
  }

  @action.bound
  resetMicrophoneTrack() {
    this._microphoneTrack = undefined
  }

  @action.bound
  resetScreenTrack () {
    this._screenVideoRenderer = undefined
  }

  @action.bound
  resetScreenStream() {
    if (this.screenVideoRenderer) {
      this.screenVideoRenderer.stop()
      this._screenVideoRenderer = undefined
    }
    if (this.screenEduStream) {
      this._screenEduStream = undefined
    }
  }

  async sendUnmuteApply(source: 'video' | 'audio', userUuid: string) {
    const message = JSON.stringify({
      cmd: CustomPeerApply.unmuteAction,
      payload: {
        action: source === 'video' ? UnmuteMediaEnum.video : UnmuteMediaEnum.audio,
        fromUser: {
          uuid: this.userUuid,
          role: this.roomInfo.userRole,
          name: this.roomInfo.userName
        },
        fromRoom: {
          uuid: this.roomUuid,
          name: this.roomInfo.roomName
        }
      },
    })
    await this.roomManager.userService.sendUserChatMessage(
      message,
      {
        userUuid,
      } as EduUser,
    )
  }

  @action.bound
  showScreenShareWindowWithItems (screenComponent: ReactElement) {
    if (this.isElectron) {
      this.mediaService.prepareScreenShare().then((items: any) => {
        runInAction(() => {
          // TODO: addDialog
          this.customScreenShareWindowVisible = true
          this.customScreenShareItems = items.map((item: any) => ({
            ...item,
            title: item.name,
            id: item.windowId,
            image: item.image,
            // image: CustomBtoa(item.image),
          }))
          if (items.length) {
            this.appStore.uiStore.fireDialog('screen-share', {
              customScreenShareWindowVisible: this.customScreenShareWindowVisible,
              customScreenShareItems: this.customScreenShareItems,
            })
            // this.appStore.uiStore.addDialog(OpenShareScreen)
            // this.appStore.uiStore.addDialog(screenComponent)
          } else {
            this.appStore.uiStore.fireToast(`toast.failed_to_enable_screen_sharing_permission_denied`)
            //@ts-ignore
            if (window.isMacOS && window.openPrivacyForCaptureScreen) {
              //@ts-ignore
              if (window.isMacOS()) {
                //@ts-ignore
                window.openPrivacyForCaptureScreen()
              }
            }
          }
        })
      }).catch(err => {
        BizLogger.warn('show screen share window with items', err)
        if (err.code === 'ELECTRON_PERMISSION_DENIED') {
          this.appStore.uiStore.fireToast('toast.failed_to_enable_screen_sharing_permission_denied')
        } else {
          this.appStore.uiStore.fireToast('toast.failed_to_enable_screen_sharing', {reason: ` code: ${err.code}, msg: ${err.message}`})
        }
      })
    }
  }

  @computed
  get roomUuid(): string {
    return this.appStore.roomInfo.roomUuid
  }

  @action.bound
  async startNativeScreenShareBy(windowId: number) {
    try {
      this.waitingShare = true
      await this.roomManager?.userService.startShareScreen()
      // await eduSDKApi.startShareScreen(this.roomUuid, this.userUuid)
      const params: any = {
        channel: this.roomUuid,
        uid: +this.roomManager?.userService.screenStream.stream.streamUuid,
        token: this.roomManager?.userService.screenStream.token,
      }
      await this.mediaService.startScreenShare({
        windowId: windowId as number,
        params
      })
      if (!this.mediaService.screenRenderer) {
        this.appStore.uiStore.fireToast('toast.create_screen_share_failed')
        return
      } else {
        this._screenVideoRenderer = this.mediaService.screenRenderer
      }
      this.removeScreenShareWindow()
      this.sharing = true
    } catch (err) {
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      this.waitingShare = false
      this.appStore.uiStore.fireToast('toast.failed_to_initiate_screen_sharing', {reason: `${err.message}`})
    }
  }

  @action.bound
  removeScreenShareWindow () {
    if (this.isElectron) {
      this.customScreenShareWindowVisible = false
      this.customScreenShareItems = []
    }
  }

  get mediaService(): MediaService {
    return this.appStore.eduManager.mediaService as MediaService;
  }

  get web(): AgoraWebRtcWrapper {
    return (this.mediaService.sdkWrapper as AgoraWebRtcWrapper)
  }

  get isWeb(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraWebRtcWrapper
  }

  get isElectron(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraElectronRTCWrapper
  }

  lockCamera() {
    this.cameraLock = true
    BizLogger.info('[demo] lockCamera ')
  }

  unLockCamera() {
    this.cameraLock = false
    BizLogger.info('[demo] unlockCamera ')
  }

  @observable
  openingTeacherCamera: boolean = false

  @observable
  closingTeacherCamera: boolean = false

  @observable
  openingStudentCamera: boolean = false

  @observable
  closingStudentCamera: boolean = false

  @observable
  loadingTeacherMicrophone: boolean = false

  @observable
  loadingStudentMicrophone: boolean = false

  @action.bound
  setOpeningCamera(value: boolean, userUuid: string) {
    if (this.roomInfo.userUuid === userUuid) {
      if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
        this.openingTeacherCamera = value
      } else {
        this.openingStudentCamera = value
      }
    } else {
      const user = this.userList.find((it: EduUser) => it.userUuid === userUuid)
      if (user) {
        if (['broadcaster', 'audience'].includes(user.role)) {
          this.openingStudentCamera = value
        } else {
          this.openingTeacherCamera = value
        }
      }
    }
  }

  @action.bound
  setClosingCamera(value: boolean, userUuid: string) {
    if (this.roomInfo.userUuid === userUuid) {
      if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
        this.closingTeacherCamera = value
      } else {
        this.closingStudentCamera = value
      }
    } else {
      const user = this.userList.find((it: EduUser) => it.userUuid === userUuid)
      if (user) {
        if (['broadcaster', 'audience'].includes(user.role)) {
          this.closingStudentCamera = value
        } else {
          this.closingTeacherCamera = value
        }
      }
    }
  }

  @action.bound
  setLoadingMicrophone(value: boolean, userUuid: string) {
    if (this.roomInfo.userUuid === userUuid) {
      if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
        this.loadingTeacherMicrophone = value
      } else {
        this.loadingStudentMicrophone = value
      }
    } else {
      const user = this.userList.find((it: EduUser) => it.userUuid === userUuid)
      if (user) {
        if (['broadcaster', 'audience'].includes(user.role)) {
          this.loadingStudentMicrophone = value
        } else {
          this.loadingTeacherMicrophone = value
        }
      }
    }
  }

  get openingCamera(){
    return this.roomInfo.userRole === EduRoleTypeEnum.teacher ? this.openingTeacherCamera : this.openingStudentCamera
  }


  get closingCamera(){
    return this.roomInfo.userRole === EduRoleTypeEnum.teacher ? this.closingTeacherCamera : this.closingStudentCamera
  }


  get loadingMicrophone(){
    return this.roomInfo.userRole === EduRoleTypeEnum.teacher ? this.loadingTeacherMicrophone : this.loadingStudentMicrophone
  }

  @action.bound
  async openCamera(option?: SceneVideoConfiguration) {
    if (this._cameraRenderer) {
      return BizLogger.warn('[demo] Camera already exists')
    }
    if (this.cameraLock) {
      return BizLogger.warn('[demo] openCamera locking')
    }
    this.lockCamera()
    try {
      const deviceId = this.appStore.pretestStore.cameraId
      const config = {
        deviceId,
        encoderConfig: {
          ...option
        }
      } as CameraOption
      await this.mediaService.openCamera(config)
      this._cameraRenderer = this.mediaService.cameraRenderer

      BizLogger.info('[demo] action in openCamera >>> openCamera, ', JSON.stringify(config))
      this.unLockCamera()

      // wait until frame available
      await this.waitFor(() => {
        return (this.cameraRenderer?.renderFrameRate || 0) !== 0
      }, 10000, 100)
    } catch (err) {
      this.unLockCamera()
      const error = GenericErrorWrapper(err)
      BizLogger.warn('[demo] action in openCamera >>> openCamera', error)
      throw error
    }
  }

  // TODO: need refactor
  waitFor(fn: () => boolean, timeout: number, checkinterval: number) {
    return Promise.resolve()
    // return new Promise<void>(async (resolve, reject) => {
    //   for(let i = 0; i < timeout; i += checkinterval) {
    //     await (() => new Promise((resolve) => {setTimeout(resolve, checkinterval)}))()
    //     if(fn()){
    //       return resolve()
    //     }
    //   }
    //   return reject(GenericErrorWrapper(new Error('operation timeout')))
    // })
  }

  @action.bound
  async muteLocalCamera() {
    if (this.cameraLock || this.closingCamera === true) {
      return BizLogger.warn('[demo] openCamera locking')
    }
    this.setClosingCamera(true, this.roomInfo.userUuid)
    try {
      BizLogger.info('[demo] [local] muteLocalCamera')
      if (this._cameraRenderer) {
        await this.closeCamera()
        this.unLockCamera()
      }
      await Promise.all([
        await this.roomManager?.userService.updateMainStreamState({'videoState': false}),
        this.waitFor(() => {
          return this.cameraEduStream.hasVideo === false
        }, 10000, 200)
      ])
      this.setClosingCamera(false, this.roomInfo.userUuid)
    } catch (err) {
      this.unLockCamera()
      this.setClosingCamera(false, this.roomInfo.userUuid)
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] muteLocalCamera, ${error}`)
      throw error
    }
  }

  @action.bound 
  async unmuteLocalCamera() {
    BizLogger.info('[demo] [local] unmuteLocalCamera')
    if (this.cameraLock) {
      return BizLogger.warn('[demo] [mic lock] unmuteLocalCamera')
    }
    this.setOpeningCamera(true, this.roomInfo.userUuid)
    try {
      await Promise.all([
        this.openCamera(),
        this.roomManager?.userService.updateMainStreamState({'videoState': true})
      ])
      this.setOpeningCamera(false, this.roomInfo.userUuid)
    } catch (err) {
      this.setOpeningCamera(false, this.roomInfo.userUuid)
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] muteLocalCamera, ${error}`)
      throw error
    }
  }

  @action.bound
  async muteLocalMicrophone() {
    BizLogger.info('[demo] [local] muteLocalMicrophone')
    if (this.microphoneLock) {
      return BizLogger.warn('[demo] [mic lock] muteLocalMicrophone')
    }

    this.setLoadingMicrophone(true, this.roomInfo.userUuid)
    try {
      await this.closeMicrophone()
      this.unLockMicrophone()

      await Promise.all([
        this.roomManager?.userService.updateMainStreamState({'audioState': false}),
        this.waitFor(() => {
          return this.cameraEduStream.hasAudio === false
        }, 10000, 200)
      ])
      this.setLoadingMicrophone(false, this.roomInfo.userUuid)
    }catch(err) {
      this.unLockMicrophone()
      this.setLoadingMicrophone(false, this.roomInfo.userUuid)
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] muteLocalmicrophone, ${error}`)
      throw error
    }
  }

  @action.bound
  async unmuteLocalMicrophone() {
    BizLogger.info('[demo] [local] unmuteLocalMicrophone')
    if (this.microphoneLock) {
      return BizLogger.warn('[demo] [mic lock] unmuteLocalMicrophone')
    }

    this.setLoadingMicrophone(true, this.roomInfo.userUuid)

    try {
      await this.openMicrophone()
      await Promise.all([
        this.roomManager?.userService.updateMainStreamState({'audioState': true}),
        this.waitFor(() => {
          return this.cameraEduStream.hasAudio === true
        }, 10000, 200)
      ])
      this.setLoadingMicrophone(false, this.roomInfo.userUuid)
    }catch(err){
      this.setLoadingMicrophone(false, this.roomInfo.userUuid)
      const error = GenericErrorWrapper(err)
      BizLogger.info(`[demo] [local] unmuteLocalMicrophone, ${error}`)
      throw error
    }
  }

  @action.bound
  async closeCamera() {
    await this.mediaService.closeCamera()
    this.resetCameraTrack()
    BizLogger.info("close camera in scene store")
  }

  lockMicrophone() {
    this.microphoneLock = true
    BizLogger.info('[demo] lockMicrophone ')
  }

  unLockMicrophone() {
    this.microphoneLock = false
    BizLogger.info('[demo] unLockMicrophone ')
  }

  @action.bound
  async openMicrophone() {
    if (this._microphoneTrack) {
      return BizLogger.warn('[demo] Microphone already exists')
    }

    if (this.microphoneLock) {
      return BizLogger.warn('[demo] openMicrophone locking 1')
    }
    this.lockMicrophone()
    try {
      const deviceId = this.appStore.pretestStore.microphoneId
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

  @action.bound
  async closeMicrophone() {
    if (this.microphoneLock) return BizLogger.warn('[demo] closeMicrophone microphone is locking')
    await this.mediaService.closeMicrophone()
    this.resetMicrophoneTrack()
  }

  @action.bound
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
      this.appStore.uiStore.fireToast('toast.failed_to_end_screen_sharing', {reason: `${err.message}`})
    } finally {
      this.waitingShare = false
    }
  }

  @action.bound
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
        uid: +this.roomManager?.userService.screenStream.stream.streamUuid,
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
        this.appStore.uiStore.fireToast('toast.failed_to_initiate_screen_sharing_to_remote', {reason: `${err.message}`})
      } else {
        if (err.code === 'PERMISSION_DENIED') {
          this.appStore.uiStore.fireToast('toast.failed_to_enable_screen_sharing_permission_denied')
        } else {
          this.appStore.uiStore.fireToast('toast.failed_to_enable_screen_sharing', {reason: ` code: ${err.code}, msg: ${err.message}`})
        }
      }
      BizLogger.info('SCREEN-SHARE ERROR ', err)
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    } finally {
      this.waitingShare = false
    }
  }

  screenComponent: ReactElement | null = null;

  attachScreenComponent(component: ReactElement) {
    this.screenComponent = component
  }

  @action.bound
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
        await this.showScreenShareWindowWithItems(this.screenComponent!)
      }
    }
  }

  @action.bound
  async prepareScreenShare(params: PrepareScreenShareParams = {}) {
    const res = await this.mediaService.prepareScreenShare(params)
    if (this.mediaService.screenRenderer) {
      this._screenVideoRenderer = this.mediaService.screenRenderer
    }
  }

  @action.bound
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
    this.sharing = false
  }

  @action.bound
  async resetWebPrepareScreen() {
    if (this.mediaService.screenRenderer) {
      this._screenVideoRenderer = undefined
    }
  }

  @computed
  get roomInfo() {
    return this.appStore.roomInfo
  }

  @computed
  get delay(): string {
    return `${this.appStore.mediaStore.delay}`
  }

  get roomManager(): EduClassroomManager {
    return this._roomManager as EduClassroomManager
  }

  @computed
  get screenEduStream(): EduStream {
    return this._screenEduStream as EduStream
  }

  @computed
  get cameraEduStream(): EduStream {
    return this._cameraEduStream as EduStream
  }

  isBigClassStudent(): boolean {
    const userRole = this.roomInfo.userRole
    return +this.roomInfo.roomType === EduRoomType.SceneTypeBigClass && userRole === EduRoleTypeEnum.student
  }

  get eduManager() {
    return this.appStore.eduManager
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

  get teacherUuid(): string {
    const teacher = this.userList.find((it: EduUser) => it.role === EduRoleType.teacher)
    if (teacher) {
      return teacher.userUuid
    }
    return ''
  }

  get localUser(): any {
    return this.roomInfo
  }

  @computed
  get muteControl(): boolean {
    if (this.roomInfo) {
      return this.roomInfo.userRole === EduRoleTypeEnum.teacher
    }
    return false
  }

  get userUuid() {
    return `${this.appStore.userUuid}`
  }

  @computed
  get isRecording() {
    return this.recordState
  }
  
  async joinRTC(args: any) {
    try {
      await this.mediaService.join(args)
      this.joiningRTC = true
    } catch (err) {
      // this.appStore.uiStore.fireToast('toast.failed_to_join_rtc_please_refresh_and_try_again')
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
      // this.appStore.uiStore.fireToast('toast.leave_rtc_channel'))
      this.appStore.reset()
    } catch (err) {
      console.log('toast.failed_to_leave_rtc')
      // this.appStore.uiStore.fireToast('toast.failed_to_leave_rtc'))
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  @action.bound
  async prepareCamera() {
    if (this._hasCamera === undefined) {
      const cameras = await this.mediaService.getCameras()
      this._hasCamera = !!cameras.length
      if (this._hasCamera && this.mediaService.isWeb) {
        this.mediaService.web.publishedVideo = true
      }
    }
  }

  @action.bound
  async prepareMicrophone() {
    if (this._hasMicrophone === undefined) {
      const microphones = await this.mediaService.getMicrophones()
      this._hasMicrophone = !!microphones.length
      if (this._hasMicrophone && this.mediaService.isWeb) {
        this.mediaService.web.publishedAudio = true
      }
    }
  }

  @computed
  get defaultTeacherPlaceholder() {
    if (this.appStore.uiStore.loading) {
      return {
        holderState: 'loading',
        text: `placeholder.loading`
      }
    }
    if (this.classState === EduClassroomStateEnum.beforeStart) {
      return {
        holderState: 'loading',
        text: `placeholder.teacher_noEnter`
      }
    }
    return {
      holderState: 'loading',
      text: `placeholder.teacher_Left`
    }
  }

  @computed
  get defaultStudentPlaceholder() {
    if (this.appStore.uiStore.loading) {
      return {
        holderState: 'loading',
        text: `placeholder.loading`
      }
    }
    // if (this.classState)
    if (this.classState === EduClassroomStateEnum.beforeStart) {
      return {
        holderState: 'noEnter',
        text: `placeholder.student_noEnter`
      }
    }
    return {
      holderState: 'loading',
      text: `placeholder.student_Left`
    }
  }

  getLocalPlaceHolderProps() {
    // if (this.openingCamera === true) {
    //   return {
    //     holderState: 'loading',
    //     text: 'placeholder.openingCamera'
    //   }
    // }

    // if (this.closingCamera === true) {
    //   return {
    //     holderState: 'closedCamera',
    //     text: 'placeholder.closingCamera'
    //   }
    // }

    if (!this.cameraEduStream || this.openingCamera || this.closingCamera) {
      return {
        holderState: 'loading',
        text: `placeholder.loading`
      }
    }

    if ((this.cameraEduStream && !!this.cameraEduStream.hasVideo === false)) {
      return {
        holderState: 'muted',
        text: 'placeholder.closedCamera'
      }
    }

    const streamUuid = +this.cameraEduStream.streamUuid
    const isFreeze = this.queryVideoFrameIsNotFrozen(+streamUuid) === false
    if (this.cameraEduStream 
      && !!this.cameraEduStream.hasVideo === true) {
      if (isFreeze) {
        return {
          holderState: 'broken',
          text: 'placeholder.noAvailableCamera'
        }
      }
      if (this.cameraRenderer) {
        return {
          holderState: 'none',
          text: ''
        }
      }
    }
    return {
      holderState: 'loading',
      text: `placeholder.loading`
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
    const stats = this.getRemoteVideoStatsBy(stream.streamUuid)

    if(!stats){
      // display loading when stats is not yet ready
      return {
        holderState: 'loading',
        text: `placeholder.loading`
      }
    }

    if (!!stream.hasVideo === false) {
      return {
        holderState: 'muted',
        text: 'placeholder.closedCamera'
      }
    }

    const isFreeze = this.queryVideoFrameIsNotFrozen(+stream.streamUuid) === false
    if (isFreeze) {
      return {
        holderState: 'broken',
        text: 'placeholder.noAvailableCamera'
      }
    }

    return {
      holderState: 'none',
      text: ''
    }
  }


  getFixAudioVolume(streamUuid: number): number {
    const isLocal = get(this, 'cameraEduStream.streamUuid', -1) === streamUuid
    if (isLocal) {
      return this.localVolume
    }
    const level = this.appStore.mediaStore.speakers.get(+streamUuid) || 0
    if (this.appStore.isElectron) {
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
    const isLocal = +get(this, 'cameraEduStream.streamUuid', 0) === +uid
    if (isLocal) {
      if (this.appStore.mediaStore.localVideoState === LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_FAILED) {
        return false
      }
      // const frameRate = this.appStore.mediaStore.rendererOutputFrameRate[`${0}`]
      // return frameRate > 0
      const freezeCount = this.cameraRenderer?.freezeCount || 0
      return freezeCount < 3
    } else {
      // const render = this.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +uid) as RemoteUserRenderer
      // if(render) {
      //   return render.renderFrameRate > 0
      // }
      const stats = this.getRemoteVideoStatsBy(`${uid}`)
      let freezeCount = stats ? stats.freezeCount : 0
      return freezeCount < 3
    }
  }

  @computed
  get teacherStream(): EduMediaStream {

    // 当本地是老师时
    const localUser = this.localUser
    if (localUser && localUser.userRole === EduRoleTypeEnum.teacher) {
      const {holderState, text} = this.getLocalPlaceHolderProps()
      return {
        local: true,
        userUuid: this.appStore.userUuid,
        account: localUser.userName,
        streamUuid: this.cameraEduStream?.streamUuid,
        video: this.cameraEduStream?.hasVideo,
        audio: this.cameraEduStream?.hasAudio,
        renderer: this.cameraRenderer as LocalUserRenderer,
        hideControl: this.hideControl(this.appStore.userUuid),
        holderState: holderState,
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
        holderState: props.holderState,
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
      holderState: this.defaultTeacherPlaceholder.holderState,
      micVolume: 0,
    } as any
  }

  @computed
  get sceneVideoConfig() {
    const roomType = this.roomInfo?.roomType ?? 1
    const userRole = this.roomInfo?.userRole ?? EduRoleTypeEnum.invisible
    const isHost = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(userRole)

    const config = {
      hideOffPodium: [EduRoomType.SceneTypeMiddleClass, EduRoomType.SceneTypeBigClass].includes(roomType) ? false : true,
      hideOffAllPodium: roomType === EduRoomType.SceneTypeMiddleClass ? false : true,
      isHost: isHost,
      hideBoardGranted: [EduRoomType.SceneTypeBigClass].includes(roomType) ? true : false,
    }

    return config
  }


  @computed
  get sceneType() {
    const roomType = get(this.roomInfo, 'roomType', 1)
    return roomType
  }

  private getUserBy(userUuid: string): EduUser {
    return this.userList.find((it: EduUser) => it.userUuid === userUuid) as EduUser
  }

  private getStreamBy(userUuid: string): EduStream {
    return this.streamList.find((it: EduStream) => get(it.userInfo, 'userUuid', 0) as string === userUuid && it.videoSourceType === EduVideoSourceType.camera) as EduStream
  }

  private getRemoteVideoStatsBy(streamUuid: string): any {
    return this.appStore.mediaStore.remoteVideoStats.get(streamUuid)
  }

  @computed
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
      return this.screenShareStreamList.reduce((acc: EduMediaStream[], stream: EduStream) => {
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
    return this.appStore.userUuid === stream.userInfo.userUuid
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

  @computed
  get localVolume(): number {
    let volume = 0
    // TODO: native adapter
    if (this.appStore.isElectron) {
      // native sdk默认0是本地音量
      volume = this.appStore.mediaStore.speakers.get(0) || 0
      return this.fixNativeVolume(volume)
    }
    if (this.appStore.isWeb && get(this, 'cameraEduStream.streamUuid', 0)) {
      volume = this.appStore.mediaStore.speakers.get(+this.cameraEduStream.streamUuid) || 0
      return this.fixWebVolume(volume)
    }
    return volume
  }

  @computed
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
          holderState: props.holderState,
          placeHolderText: props.text,
          micVolume: volumeLevel,
          whiteboardGranted: this.appStore.boardStore.checkUserPermission(`${user.userUuid}`),
        } as any)
        return acc;
      }
    , [])

    const localUser = this.localUser

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
        hideControl: this.hideControl(this.appStore.userUuid),
        holderState: props.holderState,
        placeHolderText: props.text,
        micVolume: this.localVolume,
        whiteboardGranted: this.appStore.boardStore.checkUserPermission(`${this.appStore.userUuid}`),
      } as any].concat(streamList.filter((it: any) => it.userUuid !== this.appStore.userUuid))
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
      holderState: this.defaultStudentPlaceholder.holderState,
      micVolume: 0,
      whiteboardGranted: false,
      defaultStream: true
    } as any]
  }

  @action.bound
  async startClass() {
    try {
      await eduSDKApi.updateClassState({
        roomUuid: `${this.roomUuid}`,
        state: 1
      })
      // await this.roomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStart)
      // this.classState = true
      this.appStore.uiStore.fireToast('toast.course_started_successfully')
    } catch (err) {
      BizLogger.info(err)
      this.appStore.uiStore.fireToast('toast.setting_start_failed')
    }
  }

  @action.bound
  async stopClass() {
    try {
      await eduSDKApi.updateClassState({
        roomUuid: `${this.roomUuid}`,
        state: 2
      })
      // await this.roomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStop)
      this.appStore.uiStore.fireToast('toast.the_course_ends_successfully')
    } catch (err) {
      BizLogger.info(err)
      this.appStore.uiStore.fireToast('toast.setting_ended_failed')
    }
  }

  @computed
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

  @action.bound
  async muteChat() {
    await eduSDKApi.muteChat({
      roomUuid: this.roomInfo.roomUuid,
      muteChat: 1
    })
    this._canChatting = true
  }

  @action.bound
  async unmuteChat() {
    await eduSDKApi.muteChat({
      roomUuid: this.roomInfo.roomUuid,
      muteChat: 0
    })
    this._canChatting = false
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

  @action.bound
  async muteAudio(userUuid: string, isLocal: boolean) {
    const targetStream = this.getStreamBy(userUuid)
    if (!targetStream) {
      BizLogger.info('stream not found')
      return
    }
    const local = userUuid === this.roomInfo.userUuid
    BizLogger.info("muteAudio", userUuid, local)
    if (local) {
      BizLogger.info('before muteLocalAudio', this.microphoneLock)
      await this.muteLocalMicrophone()
      BizLogger.info('after muteLocalAudio', this.microphoneLock)
    } else {
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      
      try {
        this.setLoadingMicrophone(true, userUuid)
        await Promise.all([
          this.roomManager?.userService.remoteStopStudentMicrophone(targetStream as EduStream),
          // this.waitFor(() => {
          //   const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
          //   return !!targetStream?.hasAudio === false
          // }, 10000, 200)
        ])
        this.setLoadingMicrophone(false, userUuid)
      }catch(err) {
        this.setLoadingMicrophone(false, userUuid)
        throw err
      }
    }
  }

  @action.bound
  async unmuteAudio(userUuid: string, isLocal: boolean) {
    const targetStream = this.getStreamBy(userUuid)
    if (!targetStream) {
      BizLogger.info('stream not found')
      return
    }
    const local = userUuid === this.roomInfo.userUuid
    BizLogger.info("unmuteAudio", userUuid, local)
    if (local) {
      await this.unmuteLocalMicrophone()
    } else {
      const stream = this.getStreamBy(userUuid)
      if (stream && this.mediaService.isElectron) {
        await this.mediaService.muteRemoteAudio(+stream.streamUuid, false)
      }
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      try {
        this.setLoadingMicrophone(true, userUuid)
        await Promise.all([
          this.roomManager?.userService.remoteStartStudentMicrophone(targetStream as EduStream),
          // this.waitFor(() => {
          //   const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
          //   return !!targetStream?.hasAudio === true
          // }, 10000, 200)
        ])
        this.setLoadingMicrophone(false, userUuid)
      }catch(err) {
        this.setLoadingMicrophone(false, userUuid)
        throw err
      }
    }
  }

  @action.bound
  async muteVideo(userUuid: string, isLocal: boolean) {
    const targetStream = this.getStreamBy(userUuid)
    if (!targetStream) {
      BizLogger.info('stream not found')
      return
    }
    const local = userUuid === this.roomInfo.userUuid
    BizLogger.info("muteVideo", userUuid, local)
    if (local) {
      BizLogger.info('before muteLocalCamera', this.cameraLock)
      await this.muteLocalCamera()
      BizLogger.info('after muteLocalCamera', this.cameraLock)
    } else {
      const stream = this.getStreamBy(userUuid)
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      try {
        this.setClosingCamera(true, userUuid)
        await Promise.all([
          this.roomManager?.userService.remoteStopStudentCamera(targetStream as EduStream),
          this.waitFor(() => {
            const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
            return !!targetStream?.hasVideo === false
          }, 10000, 200)
        ])

        this.setClosingCamera(false, userUuid)
      } catch(err) {
        this.setClosingCamera(false, userUuid)
        throw err
      }
    }
  }

  @action.bound
  async unmuteVideo(userUuid: string, isLocal: boolean) {
    const targetStream = this.getStreamBy(userUuid)
    if (!targetStream) {
      BizLogger.info('stream not found')
      return
    }
    const local = userUuid === this.roomInfo.userUuid
    BizLogger.info("unmuteVideo", userUuid, local)
    if (local) {
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
        this.setOpeningCamera(true, userUuid)
        await Promise.all([
          this.roomManager?.userService.remoteStartStudentCamera(targetStream as EduStream),
          this.waitFor(() => {
            const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
            return !!targetStream?.hasVideo === true
          }, 10000, 200)
        ])
        this.setOpeningCamera(false, userUuid)
      } catch(err) {
        this.setOpeningCamera(false, userUuid)
        throw err
      }
    }
  }

  @action.bound
  async muteUserChat(userUuid: string) {
    try {
      await eduSDKApi.muteStudentChat({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: userUuid
      })
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  @action.bound
  async unmuteUserChat(userUuid: string) {
    try {
      await eduSDKApi.unmuteStudentChat({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: userUuid
      })
    } catch (err) {
      throw GenericErrorWrapper(err)
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

  @action.bound
  async startRecording() {
    try {
      await eduSDKApi.updateRecordingState({
        roomUuid: this.roomUuid,
        url: this.appStore.params.config.recordUrl,
        state: 1
      })
      // let {recordId} = await this.recordService.startRecording(this.roomUuid)
      // this.recordId = recordId
      this.appStore.uiStore.fireToast('toast.start_recording_successfully')
    } catch (err) {
      this.appStore.uiStore.fireToast('toast.start_recording_failed', {reason: `${err.message}`})
    }
  }

  @action.bound
  async stopRecording() {
    try {
      await eduSDKApi.updateRecordingState({
        roomUuid: this.roomUuid,
        state: 0
      })
      // await this.recordService.stopRecording(this.roomUuid, this.recordId)
      this.appStore.uiStore.fireToast('toast.successfully_ended_recording')
      this.recordId = ''
    } catch (err) {
      const error = GenericErrorWrapper(err)
      this.appStore.uiStore.fireToast('toast.failed_to_end_recording', { reason: `${error}`})
    }
  }

  @action.bound
  async revokeCoVideo(userUuid: string) {
    try {
      await eduSDKApi.revokeCoVideo({
        roomUuid: this.roomInfo.roomUuid,
        toUserUuid: userUuid
      })
    } catch (err) {
      const error = GenericErrorWrapper(err)
      const {result, reason} = BusinessExceptions.getErrorText(error)
      this.appStore.uiStore.fireToast(result, {reason})
    }
  }

  async revokeAllCoVideo() {
    try {
      await eduSDKApi.revokeAllCoVideo({
        roomUuid: this.roomInfo.roomUuid
      })
    } catch(err) {
      const error = GenericErrorWrapper(err)
      const {result, reason} = BusinessExceptions.getErrorText(error)
      this.appStore.uiStore.fireToast(result, {reason})
    }
  }
}