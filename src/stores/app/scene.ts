import { eduSDKApi } from '@/services/edu-sdk-api';
import { roomTypes } from './../../pages/breakout-class/breakout-class';
import { Mutex } from './../../utils/mutex';
import { SimpleInterval } from './../mixin/simple-interval';
import { EduBoardService } from './../../sdk/board/edu-board-service';
import { EduRecordService } from './../../sdk/record/edu-record-service';
import { EduSceneType } from './../../sdk/education/interfaces/index.d';
import { RemoteUserRenderer } from './../../sdk/education/core/media-service/renderer/index';
import { RoomApi } from './../../services/room-api';
import { EduClassroomManager } from '@/sdk/education/room/edu-classroom-manager';
import { PeerInviteEnum } from '@/sdk/education/user/edu-user-service';
import { LocalUserRenderer, UserRenderer } from '../../sdk/education/core/media-service/renderer/index';
import { AppStore } from '@/stores/app/index';
import { AgoraWebRtcWrapper } from '../../sdk/education/core/media-service/web/index';
import { observable, computed, action, runInAction } from 'mobx';
import { AgoraElectronRTCWrapper } from '@/sdk/education/core/media-service/electron';
import { StartScreenShareParams, PrepareScreenShareParams } from '@/sdk/education/core/media-service/interfaces';
import { MediaService } from '@/sdk/education/core/media-service';
import { get } from 'lodash';
import { EduCourseState, EduUser, EduStream, EduVideoSourceType, EduRoleType } from '@/sdk/education/interfaces/index.d';
import { t } from '@/i18n';
import { DialogType } from '@/components/dialog';
import { BizLogger } from '@/utils/biz-logger';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';
import { GenericErrorWrapper } from '@/sdk/education/core/utils/generic-error';

const delay = 2000

const ms = 500

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
  streamUuid: string
  userUuid: string
  renderer?: UserRenderer
  account: string
  local: boolean
  audio: boolean
  video: boolean
  showControls: boolean
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

  @observable
  totalVolume: number = 0;

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
  streamList: EduStream[] = []

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
  isMuted?: boolean = undefined

  _roomManager?: EduClassroomManager = undefined;

  appStore!: AppStore;

  @action
  reset() {
    this.mediaService.reset()
    // this.cameraLabel = '';
    // this.microphoneLabel = '';
    // this._cameraId = '';
    // this._microphoneId = '';
    this.resolution = '480_p1';
    this._microphoneTrack = undefined;
    this._cameraRenderer = undefined;
    this._screenVideoRenderer = undefined;
    this.totalVolume = 0
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
    this.streamList = []    
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
    this.isMuted = undefined
    this._roomManager = undefined
  }

  constructor(appStore: AppStore) {
    super()
    this.appStore = appStore
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

  @action
  showSetting() {
    this.settingVisible = true
  }

  @action
  hideSetting() {
    this.settingVisible = false
  }

  @action
  resetCameraTrack () {
    this._cameraRenderer = undefined
  }

  @action
  resetMicrophoneTrack() {
    this._microphoneTrack = undefined
  }

  @action
  resetScreenTrack () {
    this._screenVideoRenderer = undefined
  }

  @action
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
        if (err.code === 'ELECTRON_PERMISSION_DENIED') {
          this.appStore.uiStore.addToast(t('toast.failed_to_enable_screen_sharing_permission_denied'))
        } else {
          this.appStore.uiStore.addToast(t('toast.failed_to_enable_screen_sharing') + ` code: ${err.code}, msg: ${err.message}`)
        }
      })
    }
  }

  get roomUuid(): string {
    return this.appStore.roomInfo.roomUuid
  }

  @action
  async startNativeScreenShareBy(windowId: number) {
    try {
      this.waitingShare = true
      await this.roomManager?.userService.startShareScreen()
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
        this.appStore.uiStore.addToast(t('create_screen_share_failed'))
        return
      } else {
        this._screenVideoRenderer = this.mediaService.screenRenderer
      }
      this.removeScreenShareWindow()
      this.sharing = true
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      this.waitingShare = false
      this.appStore.uiStore.addToast(t('toast.failed_to_initiate_screen_sharing') + `${err.message}`)
    }
  }

  @action
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

  @action
  async openCamera(encoderConfig?:any) {
    if (this._cameraRenderer) {
      return BizLogger.warn('[demo] Camera already exists')
    }
    if (this.cameraLock) {
      return BizLogger.warn('[demo] openCamera locking')
    }
    this.lockCamera()
    try {
      const deviceId = this.appStore.deviceStore.cameraId
      await this.mediaService.openCamera({deviceId, encoderConfig})
      this._cameraRenderer = this.mediaService.cameraRenderer
      // this.cameraLabel = this.mediaService.getCameraLabel()
      // this._cameraId = this.cameraId
      BizLogger.info('[demo] action in openCamera >>> openCamera')
      this.unLockCamera()
    } catch (err) {
      this.unLockCamera()
      BizLogger.info('[demo] action in openCamera >>> openCamera')
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      throw err
    }
  }

  @action
  async muteLocalCamera() {
    if (this.cameraLock) {
      return BizLogger.warn('[demo] openCamera locking')
    }
    BizLogger.info('[demo] [local] muteLocalCamera')
    if (this._cameraRenderer) {
      await this.closeCamera()
      this.unLockCamera()
    }
    await this.roomManager?.userService.updateMainStreamState({'videoState': false})
  }

  @action 
  async unmuteLocalCamera() {
    BizLogger.info('[demo] [local] unmuteLocalCamera')
    if (this.cameraLock) {
      return BizLogger.warn('[demo] [mic lock] unmuteLocalCamera')
    }
    await this.openCamera()
    await this.roomManager?.userService.updateMainStreamState({'videoState': true})
  }

  @action
  async muteLocalMicrophone() {
    BizLogger.info('[demo] [local] muteLocalMicrophone')
    if (this.microphoneLock) {
      return BizLogger.warn('[demo] [mic lock] muteLocalMicrophone')
    }
    await this.closeMicrophone()
    this.unLockMicrophone()
    await this.roomManager?.userService.updateMainStreamState({'audioState': false})
  }

  @action 
  async unmuteLocalMicrophone() {
    BizLogger.info('[demo] [local] unmuteLocalMicrophone')
    if (this.microphoneLock) {
      return BizLogger.warn('[demo] [mic lock] unmuteLocalMicrophone')
    }
    await this.openMicrophone()
    await this.roomManager?.userService.updateMainStreamState({'audioState': true})
  }

  @action
  async closeCamera() {
    await this.mediaService.closeCamera()
    this.resetCameraTrack()
  }

  lockMicrophone() {
    this.microphoneLock = true
    BizLogger.info('[demo] lockMicrophone ')
  }

  unLockMicrophone() {
    this.microphoneLock = false
    BizLogger.info('[demo] unLockMicrophone ')
  }

  @action
  async openMicrophone() {
    if (this._microphoneTrack) {
      return BizLogger.warn('[demo] Microphone already exists')
    }

    if (this.microphoneLock) {
      return BizLogger.warn('[demo] openMicrophone locking 1')
    }
    this.lockMicrophone()
    try {
      const deviceId = this.appStore.deviceStore.microphoneId
      await this.mediaService.openMicrophone({deviceId})
      this._microphoneTrack = this.mediaService.microphoneTrack
      // this.microphoneLabel = this.mediaService.getMicrophoneLabel()
      BizLogger.info('[demo] action in openMicrophone >>> openMicrophone')
      // this._microphoneId = this.microphoneId
      this.unLockMicrophone()
    } catch (err) {
      this.unLockMicrophone()
      BizLogger.info('[demo] action in openMicrophone >>> openMicrophone')
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      throw err
    }
  }

  @action
  async closeMicrophone() {
    if (this.microphoneLock) return BizLogger.warn('[demo] closeMicrophone microphone is locking')
    await this.mediaService.closeMicrophone()
    this.resetMicrophoneTrack()
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
      this.appStore.uiStore.addToast(t('toast.failed_to_end_screen_sharing') + `${err.message}`)
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
        this.appStore.uiStore.addToast(t('toast.failed_to_initiate_screen_sharing_to_remote') + `${err.message}`)
      } else {
        if (err.code === 'PERMISSION_DENIED') {
          this.appStore.uiStore.addToast(t('toast.failed_to_enable_screen_sharing_permission_denied'))
        } else {
          this.appStore.uiStore.addToast(t('toast.failed_to_enable_screen_sharing') + ` code: ${err.code}, msg: ${err.message}`)
        }
      }
      BizLogger.info('SCREEN-SHARE ERROR ', err)
      const error = new GenericErrorWrapper(err)
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

  @action
  async prepareScreenShare(params: PrepareScreenShareParams = {}) {
    const res = await this.mediaService.prepareScreenShare(params)
    if (this.mediaService.screenRenderer) {
      this._screenVideoRenderer = this.mediaService.screenRenderer
    }
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
    return +this.roomInfo.roomType === 2 && userRole === EduRoleTypeEnum.student
  }

  get eduManager() {
    return this.appStore.eduManager
  }

  getStudentConfig() {
    const roomType = +this.roomInfo.roomType
    if (roomType === 2 || roomType === 4) {
      return {
        sceneType: EduSceneType.SceneLarge,
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
      this.appStore.uiStore.addToast(t('toast.failed_to_join_rtc_please_refresh_and_try_again'))
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      throw err
    }
  }

  async leaveRtc() {
    try {
      this.joiningRTC = false
      await this.closeCamera()
      await this.closeMicrophone()
      await this.mediaService.leave()
      this.appStore.uiStore.addToast(t('toast.leave_rtc_channel'))
      this.appStore.reset()
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_leave_rtc'))
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  @action
  async prepareCamera() {
    if (this._hasCamera === undefined) {
      const cameras = await this.mediaService.getCameras()
      this._hasCamera = !!cameras.length
      if (this._hasCamera && this.mediaService.isWeb) {
        this.mediaService.web.publishedVideo = true
      }
    }
  }

  @action
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
  get teacherStream(): EduMediaStream {
    // 当本地是老师时
    const localUser = this.localUser
    if (localUser && localUser.userRole === EduRoleTypeEnum.teacher
      && this.cameraEduStream) {
      return {
        local: true,
        userUuid: this.appStore.userUuid,
        account: localUser.userName,
        streamUuid: this.cameraEduStream.streamUuid,
        video: this.cameraEduStream.hasVideo,
        audio: this.cameraEduStream.hasAudio,
        renderer: this.cameraRenderer as LocalUserRenderer,
        showControls: this.canControl(this.appStore.userUuid)
      }
    }

    // 当远端是老师时
    const teacherStream = this.streamList.find((it: EduStream) => it.userInfo.role as string === 'host' && it.userInfo.userUuid === this.teacherUuid && it.videoSourceType !== EduVideoSourceType.screen) as EduStream
    if (teacherStream) {
      const user = this.getUserBy(teacherStream.userInfo.userUuid as string) as EduUser
      return {
        local: false,
        account: user.userName,
        userUuid: user.userUuid,
        streamUuid: teacherStream.streamUuid,
        video: teacherStream.hasVideo,
        audio: teacherStream.hasAudio,
        renderer: this.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +teacherStream.streamUuid) as RemoteUserRenderer,
        showControls: this.canControl(user.userUuid)
      }
    }

    return {
      account: 'teacher',
      streamUuid: '',
      userUuid: '',
      local: false,
      video: false,
      audio: false,
      renderer: undefined,
      showControls: false
    }
  }

  private getUserBy(userUuid: string): EduUser {
    return this.userList.find((it: EduUser) => it.userUuid === userUuid) as EduUser
  }

  private getStreamBy(userUuid: string): EduStream {
    return this.streamList.find((it: EduStream) => it.userInfo.userUuid as string === userUuid) as EduStream
  }

  @computed
  get screenShareStream(): EduMediaStream {
    // 当本地存在业务流时
    if (this.screenEduStream) {
      return {
        local: true,
        account: '',
        userUuid: this.screenEduStream.userInfo.userUuid as string,
        streamUuid: this.screenEduStream.streamUuid,
        video: this.screenEduStream.hasVideo,
        audio: this.screenEduStream.hasAudio,
        renderer: this._screenVideoRenderer as LocalUserRenderer,
        showControls: false
      }
    } else {
      return this.streamList.reduce((acc: EduMediaStream[], stream: EduStream) => {
        const teacher = this.userList.find((user: EduUser) => user.role === 'host')
        if (!teacher || stream.userInfo.userUuid !== teacher.userUuid || stream.videoSourceType !== EduVideoSourceType.screen) {
          return acc;
        } else {
          acc.push({
            local: false,
            account: '',
            userUuid: stream.userInfo.userUuid,
            streamUuid: stream.streamUuid,
            video: stream.hasVideo,
            audio: stream.hasAudio,
            renderer: this.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +stream.streamUuid) as RemoteUserRenderer,
            showControls: false
          })
        }
        return acc;
      }, [])[0]
    }
  }

  isLocalStream(stream: EduStream): boolean {
    return this.appStore.userUuid === stream.userInfo.userUuid
  }

  @computed
  get studentStreams(): EduMediaStream[] {
    let streamList = this.streamList.reduce(
      (acc: EduMediaStream[], stream: EduStream) => {
        const user = this.userList.find((user: EduUser) => (user.userUuid === stream.userInfo.userUuid && ['broadcaster', 'audience'].includes(user.role)))
        if (!user || this.isLocalStream(stream)) return acc;
        acc.push({
          local: false,
          account: user.userName,
          userUuid: stream.userInfo.userUuid as string,
          streamUuid: stream.streamUuid,
          video: stream.hasVideo,
          audio: stream.hasAudio,
          renderer: this.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +stream.streamUuid) as RemoteUserRenderer,
          showControls: this.canControl(user.userUuid)
        })
        return acc;
      }
    , [])

    const localUser = this.localUser

    const isStudent = [EduRoleTypeEnum.student].includes(localUser.userRole)

    if (this.cameraEduStream && isStudent) {
      streamList = [{
        local: true,
        account: localUser.userName,
        userUuid: this.cameraEduStream.userInfo.userUuid as string,
        streamUuid: this.cameraEduStream.streamUuid,
        video: this.cameraEduStream.hasVideo,
        audio: this.cameraEduStream.hasAudio,
        renderer: this.cameraRenderer as LocalUserRenderer,
        showControls: this.canControl(this.appStore.userUuid)
      } as EduMediaStream].concat(streamList.filter((it: any) => it.userUuid !== this.appStore.userUuid))
    }
    return streamList
  }

  @action
  async startClass() {
    try {
      await eduSDKApi.updateClassState({
        roomUuid: `${this.roomUuid}`,
        state: 1
      })
      // await this.roomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStart)
      // this.classState = true
      this.appStore.uiStore.addToast(t('toast.course_started_successfully'))
    } catch (err) {
      BizLogger.info(err)
      this.appStore.uiStore.addToast(t('toast.setting_start_failed'))
    }
  }

  @action
  async stopClass() {
    try {
      await eduSDKApi.updateClassState({
        roomUuid: `${this.roomUuid}`,
        state: 2
      })
      // await this.roomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStop)
      this.appStore.uiStore.addToast(t('toast.the_course_ends_successfully'))
    } catch (err) {
      BizLogger.info(err)
      this.appStore.uiStore.addToast(t('toast.setting_ended_failed'))
    }
  }

  @computed
  get mutedChat(): boolean {
    if (this.isMuted !== undefined) {
      return this.isMuted
    }
    const classroom = this.roomManager?.getClassroomInfo()
    if (classroom && classroom.roomStatus) {
      return !classroom.roomStatus.isStudentChatAllowed
    }
    return true
  }

  @action
  async muteChat() {
    await eduSDKApi.muteChat({
      roomUuid: this.roomInfo.roomUuid,
      muteChat: 1
    })
    this.isMuted = true
  }

  @action
  async unmuteChat() {
    await eduSDKApi.muteChat({
      roomUuid: this.roomInfo.roomUuid,
      muteChat: 0
    })
    this.isMuted = false
  }

  /**
   * @note only teacher or myself return true
   * @param userUuid string
   */
  canControl(userUuid: string): boolean {
    return this.roomInfo.userRole === EduRoleTypeEnum.teacher || this.userUuid === userUuid
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
      await this.roomManager?.userService.remoteStopStudentMicrophone(targetStream as EduStream)
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
      await this.roomManager?.userService.remoteStartStudentMicrophone(targetStream as EduStream)
    }
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
      await this.roomManager?.userService.remoteStopStudentCamera(targetStream as EduStream)
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
      await this.roomManager?.userService.remoteStartStudentCamera(targetStream as EduStream)
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

  @action
  async startRecording() {
    try {
      await eduSDKApi.updateRecordingState({
        roomUuid: this.roomUuid,
        state: 1
      })
      // let {recordId} = await this.recordService.startRecording(this.roomUuid)
      // this.recordId = recordId
      this.appStore.uiStore.addToast(t('toast.start_recording_successfully'))
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.start_recording_failed') + `, ${err.message}`)
    }
  }

  @action
  async stopRecording() {
    try {
      await eduSDKApi.updateRecordingState({
        roomUuid: this.roomUuid,
        state: 0
      })
      // await this.recordService.stopRecording(this.roomUuid, this.recordId)
      this.appStore.uiStore.addToast(t('toast.successfully_ended_recording'))
      this.recordId = ''
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_end_recording') + `, ${err.message}`)
    }
  }
}