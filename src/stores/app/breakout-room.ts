import { EduBoardService } from '../../sdk/board/edu-board-service';
import { EduRecordService } from '@/sdk/record/edu-record-service';
import { EduAudioSourceType, EduTextMessage, EduClassroomStateType, EduSceneType, EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d';
import { RemoteUserRenderer } from '@/sdk/education/core/media-service/renderer/index';
import { RoomApi } from '@/services/room-api';
import { EduClassroomManager } from '@/sdk/education/room/edu-classroom-manager';
import { PeerInviteEnum } from '@/sdk/education/user/edu-user-service';
import { LocalUserRenderer, UserRenderer } from '@/sdk/education/core/media-service/renderer/index';
import { AppStore } from '@/stores/app/index';
import { AgoraWebRtcWrapper } from '@/sdk/education/core/media-service/web/index';
import { toJS, observable, computed, action, runInAction, autorun } from 'mobx';
import { AgoraElectronRTCWrapper } from '@/sdk/education/core/media-service/electron';
import { StartScreenShareParams, PrepareScreenShareParams } from '@/sdk/education/core/media-service/interfaces';
import { MediaService } from '@/sdk/education/core/media-service';
import { debounce, get } from 'lodash';
import { EduCourseState, EduUser, EduStream, EduVideoSourceType, EduRoleType } from '@/sdk/education/interfaces/index.d';
import { ChatMessage } from '@/utils/types';
import { t } from '@/i18n';
import { SimpleInterval } from '@/stores/mixin/simple-interval';
import { DialogType } from '@/components/dialog';
import { Mutex } from '@/utils/mutex';
import { BizLogger } from '@/utils/biz-logger';
import { GenericErrorWrapper } from '@/sdk/education/core/utils/generic-error';

const delay = 2000

const ms = 500

const networkQualityLevel = [
  'unknown',
  'excellent',
  'good',
  'poor',
  'bad',
  'very bad',
  'down',
]

export const networkQualities: {[key: string]: string} = {
  'excellent': 'network-good',
  'good': 'network-good',
  'poor': 'network-normal',
  'bad': 'network-normal',
  'very bad': 'network-bad',
  'down': 'network-bad',
  'unknown': 'network-normal'
}

export type EduMediaStream = {
  streamUuid: string
  userUuid: string
  renderer?: UserRenderer
  account: string
  local: boolean
  audio: boolean
  video: boolean
  // chat: boolean
  showControls: boolean
}

export class BreakoutRoomStore extends SimpleInterval {

  static resolutions: any[] = [
    {
      name: '480p',
      value: '480p_1',
    },
    {
      name: '720p',
      value: '720p_1',
    },
    {
      name: '1080p',
      value: '1080p_1'
    }
  ]

  @observable
  resolutionIdx: number = 0

  @observable
  deviceList: any[] = []

  @observable
  cameraLabel: string = '';

  @observable
  microphoneLabel: string = '';
  _totalVolume: any;

  @observable
  _cameraId: string = '';

  @observable
  _microphoneId: string = '';
  private _boardService?: EduBoardService;
  private _recordService?: EduRecordService;

  @computed
  get cameraId(): string {
    const defaultValue = ''
    const idx = this.cameraList.findIndex((it: any) => it.label === this.cameraLabel)
    if (this.cameraList[idx]) {
      return this.cameraList[idx].deviceId
    }
    return defaultValue
  }

  @computed
  get microphoneId(): string {
    const defaultValue = ''
    const idx = this.microphoneList.findIndex((it: any) => it.label === this.microphoneLabel)
    if (this.microphoneList[idx]) {
      return this.microphoneList[idx].deviceId
    }
    return defaultValue
  }

  @observable
  resolution: string = '480p_1'

  @computed
  get playbackVolume(): number {
    if (this._playbackVolume) {
      return this._playbackVolume
    }
    return this.mediaService.getPlaybackVolume()
  }

  @observable
  _playbackVolume: number = 0

  @action
  changePlaybackVolume(volume: number) {
    this.mediaService.changePlaybackVolume(volume)
    this._playbackVolume = volume
  }

  @observable
  _microphoneTrack?: any = undefined;
  @observable
  _cameraRenderer?: LocalUserRenderer = undefined;
  @observable
  _screenVideoRenderer?: LocalUserRenderer = undefined;

  @computed
  get cameraRenderer(): LocalUserRenderer | undefined {
    return this._cameraRenderer;
  }

  @observable
  totalVolume: number = 0;

  @computed
  get screenVideoRenderer(): LocalUserRenderer | undefined {
    return this._screenVideoRenderer;
  }

  appStore: AppStore;

  @observable
  currentWindowId: string = ''

  @observable
  customScreenShareWindowVisible: boolean = false;

  @observable
  customScreenShareItems: any[] = []

  @observable
  settingVisible: boolean = false

  // autoplay: boolean = false

  @observable
  recordState: boolean = false

  @computed
  get remoteUsersRenderer() {
    return this.appStore.mediaStore.remoteUsersRenderer
  }

  constructor(appStore: AppStore) {
    super()
    this.appStore = appStore
    this.handlePopState = this.handlePopState.bind(this)
  }

  get boardService(): EduBoardService {
    return this.appStore.boardService
  }

  get recordService(): EduRecordService {
    return this.appStore.recordService
  }

  @observable
  sharing: boolean = false;

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

  @action
  reset() {
    this.studentRoomUserList = []
    this.teacherRoomUserList = []
    this.studentRoomStreamList = []
    this.teacherRoomStreamList = []
    this.appStore.mediaStore.resetRoomState()
    this.currentStudentRoomUuid = ''
    this.delInterval('timer')
    this.appStore.mediaStore.resetRoomState()
    // this.remoteUsersRenderer = []
    this.recording = false
    this.resolutionIdx = 0
    this.totalVolume = 0
    this.cameraLabel = ''
    this.microphoneLabel = ''
    this.mediaService.reset()
    this.closeCamera()
    this.closeMicrophone()
    this.resetScreenStream()
    this.customScreenShareWindowVisible = false
    this.currentWindowId = ''
    this.customScreenShareItems = []
    this._roomChatMessages = []
    this.isMuted = undefined
    this._cameraEduStream = undefined
    this._screenEduStream = undefined
    this._microphoneTrack = undefined
    this.recordId = ''
    this.joined = false
    this._hasCamera = undefined
    this._hasMicrophone = undefined
    this.microphoneLock = false
    this.cameraLock = false
    this.joiningRTC = false
    this.recordState = false
    this._courseList = []
    this.joinedGroup = false
  }

  @observable
  _courseList: any[] = []

  @computed
  get courseList() {
    return this._courseList
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
    return this.largeClassroomManager?.roomUuid
  }

  @action
  async startNativeScreenShareBy(windowId: number) {
    try {
      this.waitingShare = true
      await this.largeClassroomManager?.userService.startShareScreen()
      const params: any = {
        channel: this.largeClassroomManager?.roomUuid,
        uid: +this.largeClassroomManager?.userService.screenStream.stream.streamUuid,
        token: this.largeClassroomManager?.userService.screenStream.token,
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
      BizLogger.warn(err)
      // if (!this.mediaService.screenRenderer) {
      //   await this.mediaService.stopScreenShare()
      // }
      this.waitingShare = false
      this.appStore.uiStore.addToast(t('toast.failed_to_initiate_screen_sharing') + `${err.message}`)
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

  @computed
  get cameraList() {
    return this.deviceList.filter((it: any) => it.kind === 'videoinput')
  }

  @computed
  get microphoneList() {
    return this.deviceList.filter((it: any) => it.kind === 'audioinput')
  }

  @observable
  teacherChannel: string = ''

  init(option: {video?: boolean, audio?: boolean} = {video: true, audio: true}) {
    if (option.video) {
      this.mediaService.getCameras().then((list: any[]) => {
        runInAction(() => {
          this.deviceList = list;
        })
      })
    }
    if (option.audio) {
      this.mediaService.getMicrophones().then((list: any[]) => {
        runInAction(() => {
          this.deviceList = list;
        })
      })
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

  private _hasCamera?: boolean = undefined
  private _hasMicrophone?: boolean = undefined

  @action
  async openCamera() {
    if (this._cameraRenderer) {
      return BizLogger.warn('[demo] Camera already exists')
    }
    if (this.cameraLock) {
      return BizLogger.warn('[demo] openCamera locking')
    }
    this.lockCamera()
    try {
      const deviceId = this._cameraId
      await this.mediaService.openCamera({deviceId})
      this._cameraRenderer = this.mediaService.cameraRenderer
      this.cameraLabel = this.mediaService.getCameraLabel()
      this._cameraId = this.cameraId
      BizLogger.info('[demo] action in openCamera ### openCamera')
      this.unLockCamera()
    } catch (err) {
      this.unLockCamera()
      BizLogger.info('[demo] action in openCamera ### openCamera')
      BizLogger.warn(err)
      throw err
    }
  }

  @action
  async closeCamera() {
    try {
      await this.mediaService?.closeCamera()
      this.resetCameraTrack()
    } catch (err) {
      this.resetCameraTrack()
      BizLogger.info('[breakout-room] err', err)
    }
  }

  @action
  async changeCamera(deviceId: string) {
    await this.mediaService.changeCamera(deviceId)
    this.cameraLabel = this.mediaService.getCameraLabel()
    this._cameraId = deviceId
  }

  public cameraLock: boolean = false

  lockCamera() {
    this.cameraLock = true
    BizLogger.info('[demo] lockCamera ')
  }

  unLockCamera() {
    this.cameraLock = false
    BizLogger.info('[demo] unlockCamera ')
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

  public microphoneLock: boolean = false

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
      const deviceId = this._microphoneId
      await this.mediaService.openMicrophone({deviceId})
      this._microphoneTrack = this.mediaService.microphoneTrack
      this.microphoneLabel = this.mediaService.getMicrophoneLabel()
      BizLogger.info('[breakout-demo] action in openMicrophone ### openMicrophone')
      this._microphoneId = this.microphoneId
      this.unLockMicrophone()
    } catch (err) {
      this.unLockMicrophone()
      BizLogger.info('[demo] action in openMicrophone ### openMicrophone')
      BizLogger.warn(err)
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
  async changeMicrophone(deviceId: string) {
    await this.mediaService.changeMicrophone(deviceId)
    this.microphoneLabel = this.mediaService.getMicrophoneLabel()
    this._microphoneId = deviceId
  }

  @action
  async changeResolution(resolution: any) {
    await this.mediaService.changeResolution(resolution)
    runInAction(() => {
      this.resolution = resolution
    })
  }

  @observable
  waitingShare: boolean = false

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
        await this.largeClassroomManager?.userService.stopShareScreen()
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
      await this.largeClassroomManager?.userService.startShareScreen()
      const params: any = {
        channel: this.largeClassroomManager?.roomUuid,
        uid: +this.largeClassroomManager?.userService.screenStream.stream.streamUuid,
        token: this.largeClassroomManager?.userService.screenStream.token,
      }
      BizLogger.info("screenStreamData params ", params)
      BizLogger.info("screenStreamData ", this.largeClassroomManager?.userService.screenStream)

      await this.mediaService.startScreenShare({
        params
      })
      this._screenEduStream = this.largeClassroomManager?.userService.screenStream.stream
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
      BizLogger.info(err)
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
      await this.largeClassroomManager?.userService.stopShareScreen()
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

  @action
  async startScreenShare(option: StartScreenShareParams) {
  }

  @computed
  get userList(): EduUser[] {
    return this.teacherRoomUserList.concat(this.studentRoomUserList)
  }

  @computed
  get streamList(): EduStream[] {
    return this.teacherRoomStreamList.concat(this.studentRoomStreamList)
  }

  @observable
  teacherRoomUserList: EduUser[] = []

  @observable
  teacherRoomStreamList: EduStream[] = []

  @action
  async stopScreenShare() {

  }

  @observable
  unreadMessageCount: number = 0

  @observable
  messages: any[] = []

  @action
  async sendMessageToCurrentRoom(message: any) {
    if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
      try {
        const fromRoomUuid = this.currentStudentRoomUuid || ''
        const payload = JSON.stringify({
          content: message,
          role: EduRoleTypeEnum.teacher,
          fromRoomName: this.groupClassroomManager?.roomName || '',
          fromRoomUuid: fromRoomUuid
        })
        await this.largeClassroomManager?.userService.sendRoomChatMessage(payload)
        this.addChatMessage({
          id: this.userUuid,
          ts: +Date.now(),
          text: message,
          account: this.roomInfo.userName,
          sender: true,
          role: EduRoleTypeEnum.teacher,
          fromRoomName: '',
          fromRoomUuid: fromRoomUuid
        })
        BizLogger.info('[chat-message] teacher sent', fromRoomUuid, ' isMain ', fromRoomUuid ? 'true' : 'false')
      } catch (err) {
        this.appStore.uiStore.addToast(t('toast.failed_to_send_chat'))
        BizLogger.warn(err)
      }
    }

    if (this.roomInfo.userRole === EduRoleTypeEnum.assistant) {
      try {
        const fromRoomUuid = this.currentStudentRoomUuid
        const payload = JSON.stringify({
          content: message,
          role: EduRoleTypeEnum.assistant,
          fromRoomUuid: fromRoomUuid,
          fromRoomName: this.groupClassroomManager?.roomName || '',
        })
        await this.largeClassroomManager?.userService.sendRoomChatMessage(payload)
        await this.groupClassroomManager?.userService.sendRoomChatMessage(payload)
        this.addChatMessage({
          id: this.userUuid,
          ts: +Date.now(),
          text: message,
          account: this.roomInfo.userName,
          sender: true,
          role: EduRoleTypeEnum.assistant,
          fromRoomName: this.groupClassroomManager?.roomName || '',
          fromRoomUuid: fromRoomUuid,
        })
        BizLogger.info('[chat-message] assistant sent', fromRoomUuid)
      } catch (err) {
        this.appStore.uiStore.addToast(t('toast.failed_to_send_chat'))
        BizLogger.warn(err)
      }
    }
  }

  @action
  async sendMessage(message: any) {

    const fromRoomUuid = this.groupClassroomManager.roomUuid
    const payload = JSON.stringify({
      content: message,
      role: EduRoleTypeEnum.student,
      fromRoomUuid: this.groupClassroomManager.roomUuid,
      fromRoomName: this.groupClassroomManager?.roomName || '',
    })
    
    if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
      try {
        await this.largeClassroomManager?.userService.sendRoomChatMessage(payload)
        await this.groupClassroomManager?.userService.sendRoomChatMessage(payload)
        this.addChatMessage({
          id: this.userUuid,
          ts: +Date.now(),
          text: message,
          account: this.roomInfo.userName,
          sender: true,
          role: EduRoleTypeEnum.student,
          fromRoomName: this.groupClassroomManager?.roomName || '',
          fromRoomUuid: fromRoomUuid,
        })
        BizLogger.info('[chat-message] student sent', fromRoomUuid)
      } catch (err) {
        this.appStore.uiStore.addToast(t('toast.failed_to_send_chat'))
        BizLogger.warn(err)
      }
    }
  }

  @observable
  joined: boolean = false

  @observable
  menuVisible: boolean = false

  @action
  toggleMenu() {
    this.menuVisible = !this.menuVisible
  }

  @action
  resetTab() {
    this.currentStudentRoomUuid = ''
    this.switchTab('first')
  }

  @observable
  activeTab: string = 'first'

  @action
  switchTab(tab: string) {
    this.activeTab = tab
  }

  @action
  switchTabToRoom(roomUuid: string) {
    this.switchTab('second')
    this.currentStudentRoomUuid = roomUuid
  }

  @computed
  get roomInfo() {
    return this.appStore.roomInfo
  }

  @action
  resetRoomInfo() {
    this.appStore.resetRoomInfo()
  }

  get userUuid() {
    return `${this.appStore.userUuid}`
  }

  @observable
  classState: number = 0

  // @observable
  // _delay: number = 0

  @computed
  get delay(): string {
    return `${this.appStore.mediaStore._delay}`
  }

  @observable
  time: number = 0

  @computed
  get networkQuality(): string {
    return this.appStore.mediaStore.networkQuality
  }

  // @observable
  // networkQuality: string = 'unknown'

  // @action
  // updateNetworkQuality(v: string) {
  //   this.networkQuality = v
  // }

  @observable
  _cpuRate: number = 0

  @computed
  get cpuRate(): string {
    return `${this._cpuRate}%`
  }

  get roomManager(): EduClassroomManager | undefined {
    if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
      return this.largeClassroomManager
    }

    if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
      return this.groupClassroomManager
    }
  }

  // _largeClassroomManager?: EduClassroomManager = undefined;

  get largeClassroomManager(): EduClassroomManager {
    return this.appStore.roomManager as EduClassroomManager
  }

  // _groupClassroomManager?: EduClassroomManager = undefined;

  get groupClassroomManager(): EduClassroomManager {
    return this.appStore.groupClassroomManager as EduClassroomManager
  }

  @observable
  _cameraEduStream?: EduStream = undefined

  @observable
  _screenEduStream?: EduStream = undefined

  @computed
  get screenEduStream(): EduStream {
    return this._screenEduStream as EduStream
  }

  @computed
  get cameraEduStream(): EduStream {
    return this._cameraEduStream as EduStream
  }

  roomApi!: RoomApi

  @observable
  joiningRTC: boolean = false

  handlePopState(evt: any) {
    window.history.pushState(null, document.title, null);
    const uiStore = this.appStore.uiStore
    const breakoutRoomStore = this
    const hash = evt.currentTarget.location.hash
    const isClass = hash.match(/\/assistant\/courses\/\S+/)
    BizLogger.info("[popstate] isClass", isClass, hash)
    if (isClass) {
      if (breakoutRoomStore.joinedGroup && !uiStore.hasDialog('exitRoom')) {
        uiStore.showDialog({
          type: 'exitRoom',
          message: t('icon.exit-room'),
        })
      }
    } else {
      if (breakoutRoomStore.joined && !uiStore.hasDialog('exitRoom')) {
        uiStore.showDialog({
          type: 'exitRoom',
          message: t('icon.exit-room'),
        })
      }
    }
  }
  
  @action
  async joinRtcAsTeacher(args: any) {
    try {
      // if (!this.mediaService.isWeb) throw 'electron not support'
      await this.mediaService.join(args)
      this.joiningRTC = true
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_join_rtc_please_refresh_and_try_again'))
      BizLogger.warn(err)
      throw err
    }
  }

  @action
  async joinRtcAsStudent(args: any) {
    try {
      BizLogger.info('[breakout] ', args)
      await this.mediaService.join(args.studentChannel)
      await this.mediaService.joinSubChannel(args.teacherChannel)
      this.teacherChannel = args.teacherChannel.channel
      this.joiningRTC = true
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_join_rtc_please_refresh_and_try_again'))
      BizLogger.warn(err)
      throw err
    }
  }

  @action
  async joinRtcAsAssistant(args: any) {
    try {
      // if (!this.mediaService.isWeb) throw 'electron not supported'
      await this.mediaService.join(args.studentChannel)
      await this.mediaService.joinSubChannel(args.teacherChannel)
      this.teacherChannel = args.teacherChannel.channel
      this.joiningRTC = true
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_join_rtc_please_refresh_and_try_again'))
      BizLogger.warn(err)
      throw err
    }
  }

  async leaveRtc() {
    try {
      if (!this.joiningRTC) return
      this.joiningRTC = false
      // if (this.mediaGroup) {
      //   await this.mediaGroup?.leave()
      //   this.mediaGroup.removeAllListeners()
      //   this.mediaGroup = null as any
      //   BizLogger.info("[rtc] mediaGroup success")
      // }
      if (this.mediaService) {
        // await this.closeCamera()
        // await this.closeMicrophone()
        await this.mediaService.leave()
        let role = this.roomInfo.userRole
        if(role === EduRoleTypeEnum.student || role === EduRoleTypeEnum.assistant) {
          await this.mediaService.leaveSubChannel(this.teacherChannel)
          this.teacherChannel = ''
        }
        this.appStore.uiStore.addToast(t('toast.leave_rtc_channel'))
      }
      this.appStore.reset()
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_leave_rtc'))
      BizLogger.warn(err)
      throw err;
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

  isBigClassStudent(): boolean {
    const userRole = this.roomInfo.userRole
    return +this.roomInfo.roomType === 2 && userRole === EduRoleTypeEnum.student
  }

  get eduManager() {
    return this.appStore.eduManager
  }

  public readonly mutex = new Mutex()

  handlePeerMessage() {
    const decodeMsg = (str: string) => {
      try {
        return JSON.parse(str)
      } catch(err) {
        BizLogger.warn(err)
        return null
      }
    }
    this.eduManager.on('user-message', async (evt: any) => {
      await this.mutex.dispatch<Promise<void>>(async () => {
        if (!this.joiningRTC) {
          return
        }
        try {
          BizLogger.info('[rtm] user-message', evt)
          const fromUserUuid = evt.message.fromUser.userUuid
          const fromUserName = evt.message.fromUser.userName
          const msg = decodeMsg(evt.message.message)
          BizLogger.info("user-message", msg)
          if (msg) {
            const {cmd, data} = msg
            const {type, userName} = data
            BizLogger.info("data", data)
            this.showNotice(type as PeerInviteEnum, fromUserUuid)
            if (type === PeerInviteEnum.studentApply) {
              this.showDialog(fromUserName)
            }
            if (type === PeerInviteEnum.teacherStop) {
              try {
                await this.closeCamera()
                await this.closeMicrophone()
                this.appStore.uiStore.addToast(t('toast.co_video_close_success'))
              } catch (err) {
                this.appStore.uiStore.addToast(t('toast.co_video_close_failed'))
                BizLogger.warn(err)
              }
            }
            if (type === PeerInviteEnum.teacherAccept 
              && this.isBigClassStudent()) {
              try {
                await this.prepareCamera()
                await this.prepareMicrophone()
                BizLogger.info("propertys ", this._hasCamera, this._hasMicrophone)
                if (this._hasCamera) {
                  await this.openCamera()
                }
  
                if (this._hasMicrophone) {
                  await this.openMicrophone()
                }
              } catch (err) {
                BizLogger.warn('published failed', err) 
                throw err
              }
              this.appStore.uiStore.addToast(t('toast.publish_rtc_success'))
            }
          }
        } catch (err) {
          BizLogger.error(`[demo] [breakout] user-message async handler failed`)
          const error = new GenericErrorWrapper(err)
          BizLogger.error(`${error}`)
        }
      })
    })
  }

  async prepareLargeClassroom(roomUuid: string, userRole: EduRoleTypeEnum) {
    const roomManager = this.eduManager.createClassroom({
      roomUuid: roomUuid,
      roomName: this.roomInfo.roomName
    })
    roomManager.on('seqIdChanged', (evt: any) => {
      BizLogger.info("seqIdChanged", evt)
      if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
        this.appStore.uiStore.updateCurSeqId(evt.curSeqId)
        this.appStore.uiStore.updateLastSeqId(evt.latestSeqId)
      }
    })
    // 本地用户更新
    roomManager.on('local-user-updated', (evt: any) => {
      this.teacherRoomUserList =roomManager.getFullUserList()
      BizLogger.info("local-user-updated", evt)
    })
    // 本地流加入
    // roomManager.on('local-stream-added', (evt: any) => {
    //   this.teacherRoomStreamList = roomManager.getFullStreamList()
    //   BizLogger.info("local-stream-added", evt)
    // })
    // 本地流更新
    roomManager.on('local-stream-updated', async (evt: any) => {
      await this.mutex.dispatch<Promise<void>>(async () => {
        if (!this.joiningRTC) {
          return
        }
        try {
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) return
          if (evt.type === 'main') {
            const localStream = roomManager.getLocalStreamData()
            BizLogger.info("[demo] [breakout] largeClassroom local-stream-updated# localStream ", localStream, this.joiningRTC)
            if (localStream && localStream.state !== 0) {
              this._cameraEduStream = localStream.stream
              await this.prepareCamera()
              await this.prepareMicrophone()
              BizLogger.info("[demo] [breakout] largeClassroom this._cameraEduStream", this._cameraEduStream)
              if (this.joiningRTC) {
                if (this._hasCamera) {
                  if (this.cameraEduStream.hasVideo) {
                    await this.openCamera()
                  } else {
                    await this.closeCamera()
                  }
                }
                if (this._hasMicrophone) {
                  if (this.cameraEduStream.hasAudio) {
                    await this.openMicrophone()
                  } else {
                    await this.closeMicrophone()
                  }
                }
              }
            } else {
              BizLogger.info("[demo] [breakout] largeClassroom reset camera edu stream", localStream, localStream && localStream.state)
              this._cameraEduStream = undefined
            }
          }
  
          if (evt.type === 'screen') {
            const screenStream = roomManager.getLocalScreenData()
            BizLogger.info("[demo] [breakout] largeClassroom getLocalScreenData#screenStream ", screenStream)
            if (screenStream && screenStream.state !== 0) {
              this._screenEduStream = screenStream.stream
              this.sharing = true
            } else {
              BizLogger.info("reset screen edu stream", screenStream, screenStream && screenStream.state)
              this._screenEduStream = undefined
              this.sharing = false
            }
          }
          BizLogger.info("[demo] [breakout] largeClassroom# local-stream-updated", evt)
        } catch (err) {
          BizLogger.error('[demo] [breakout] largeClassroom# local-stream-updated ', err.message)
          const error = new GenericErrorWrapper(err)
          BizLogger.error(`${error}`)
        }
      })
    })
    // 本地流移除
    roomManager.on('local-stream-removed', async (evt: any) => {
      await this.mutex.dispatch<Promise<void>>(async () => {
        if (!this.joiningRTC) {
          return
        }
        try {
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) return
          if (evt.type === 'main') {
            this._cameraEduStream = undefined
            await this.closeCamera()
            await this.closeMicrophone()
          }
          BizLogger.info("local-stream-removed", evt)
        } catch (err) {
          BizLogger.error('[demo] [breakout] LargeClassroom# local-stream-removed ', err.message)
          const error = new GenericErrorWrapper(err)
          BizLogger.error(`${error}`)
        }
      })
    })
    // 远端人加入
    roomManager.on('remote-user-added', (evt: any) => {
      runInAction(() => {
        this.teacherRoomUserList =roomManager.getFullUserList()
      })
      BizLogger.info("remote-user-added", evt)
    })
    // 远端人更新
    roomManager.on('remote-user-updated', (evt: any) => {
      runInAction(() => {
        this.teacherRoomUserList =roomManager.getFullUserList()
      })
      BizLogger.info("remote-user-updated", evt)
    })
    // 远端人移除
    roomManager.on('remote-user-removed', (evt: any) => {
      runInAction(() => {
        this.teacherRoomUserList =roomManager.getFullUserList()
      })
      BizLogger.info("remote-user-removed", evt)
    })
    // 远端流加入
    roomManager.on('remote-stream-added', (evt: any) => {
      runInAction(() => {
        this.teacherRoomStreamList = roomManager.getFullStreamList()
        if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
          if (this.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
            this.sharing = true
          } else { 
            this.sharing = false
          }
        }
      })
      BizLogger.info("remote-stream-added", evt)
    })
    // 远端流移除
    roomManager.on('remote-stream-removed', (evt: any) => {
      runInAction(() => {
        this.teacherRoomStreamList = roomManager.getFullStreamList()
        if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
          if (this.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
            this.sharing = true
          } else { 
            this.sharing = false
          }
        }
      })
      BizLogger.info("remote-stream-removed", evt)
    })
    // 远端流更新
    roomManager.on('remote-stream-updated', (evt: any) => {
      runInAction(() => {
        this.teacherRoomStreamList = roomManager.getFullStreamList()
        if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
          if (this.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
            this.sharing = true
          } else { 
            this.sharing = false
          }
        }
      })
      BizLogger.info("remote-stream-updated", evt)
    })
    // 教室更新
    roomManager.on('classroom-property-updated', (classroom: any) => {
      BizLogger.info("classroom-property-updated", classroom)
      const groups = get(classroom, 'roomProperties.groups')
      if (groups) {
        this._courseList = groups
      }
      const record = get(classroom, 'roomProperties.record')
      if (record) {
        const state = record.state
        if (state === 1) {
          this.recordState = true
        } else {
          if (state === 0 && this.recordState) {
            this.addChatMessage({
              id: 'system',
              ts: Date.now(),
              text: '',
              account: 'system',
              link: this.roomUuid,
              sender: false,
              fromRoomUUid: '',
              role: EduRoleTypeEnum.teacher,
              // toRoomUuid: 'all',
            })
            this.recordState = false
            this.recordId = ''
          }
        }
      }
        const prevClassState = this.classState

        const newClassState = classroom.roomStatus.courseState

        if (prevClassState !== newClassState) {
          this.classState = newClassState
          
          if (this.classState === 1) {
            this.startTime = get(classroom, 'roomStatus.startTime', 0)
            this.addInterval('timer', () => {
              this.appStore.updateTime(+this.startTime)
            }, ms)
          } else {
            this.startTime = get(classroom, 'roomStatus.startTime', 0)
            this.delInterval('timer')
          }
        }
        this.isMuted = !classroom.roomStatus.isStudentChatAllowed
    })
    // teacher room manager
    roomManager.on('room-chat-message', (evt: any) => {
      BizLogger.info('[teacher] room-chat-message ', JSON.stringify(evt))
      const {textMessage} = evt;
      const message = textMessage as EduTextMessage
      const payload = JSON.parse(message.message)
      if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
        if (+payload.role === EduRoleTypeEnum.teacher) {
          this.addChatMessage({
            id: message.fromUser.userUuid,
            ts: message.timestamp,
            text: payload.content,
            account: message.fromUser.userName,
            sender: false,
            role: +payload.role,
            fromRoomName: payload.fromRoomName,
            fromRoomUuid: payload.fromRoomUuid,
          })
        }
      }

      if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
        this.addChatMessage({
          id: message.fromUser.userUuid,
          ts: message.timestamp,
          text: payload.content,
          account: message.fromUser.userName,
          sender: false,
          role: +payload.role,
          fromRoomName: payload.fromRoomName,
          fromRoomUuid: payload.fromRoomUuid,
        })
      }
    })

    const roles: Record<string, string> = {
      [EduRoleTypeEnum.teacher]: 'host',
      [EduRoleTypeEnum.student]: 'audience',
      [EduRoleTypeEnum.assistant]: 'assistant'
    }

    BizLogger.info("[rules] current Role", roles[userRole])

    await roomManager.join({
      userRole: roles[userRole],
      roomUuid,
      userName: `${this.roomInfo.userName}`,
      userUuid: `${this.userUuid}`,
      autoPublish: true,
    })

    const roomInfo = roomManager.getClassroomInfo()
    this.classState = roomInfo.roomStatus.courseState
    this.startTime = get(roomInfo, 'roomStatus.startTime', 0)

    if (this.classState === 1) {
      this.addInterval('timer', () => {
        this.appStore.updateTime(+this.startTime)
      }, ms)
    } else {
      this.appStore.resetTime()
    }
    this.isMuted = !roomInfo.roomStatus.isStudentChatAllowed
    const classroomInfo = roomManager.getClassroomInfo()
    const courseList = get(classroomInfo, 'roomProperties.groups', null)
    if (courseList) {
      this._courseList = courseList
    }
    return roomManager
  }

  @observable
  studentRoomUserList: EduUser[] = []

  @observable
  studentRoomStreamList: EduStream[] = []

  @action
  async prepareStudentClassroom(roomUuid: string, roomName: string, userRole: EduRoleTypeEnum) {
    const roomManager = this.eduManager.createClassroom({
      roomUuid: roomUuid,
      roomName: roomName
    })

    const roles: Record<string, string> = {
      [EduRoleTypeEnum.student]: 'broadcaster',
      [EduRoleTypeEnum.assistant]: 'assistant'
    }

    roomManager.on('seqIdChanged', (evt: any) => {
      // BizLogger.info("[student] seqIdChanged", evt)
      if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
        this.appStore.uiStore.updateCurSeqId(evt.curSeqId)
        this.appStore.uiStore.updateLastSeqId(evt.latestSeqId)
      }
    })
    // 本地用户更新
    roomManager.on('local-user-updated', (evt: any) => {
      // this.teacherRoomUserList = roomManager.getFullUserList()
      console.log('[student] local-user-updated', evt)
    })
    // 本地流加入
    // roomManager.on('local-stream-added', (evt: any) => {
    //   this.teacherRoomStreamList = roomManager.getFullStreamList()
    //   BizLogger.info("local-stream-added", evt)
    // })
    // 本地流更新
    roomManager.on('local-stream-updated', async (evt: any) => {
      await this.mutex.dispatch<Promise<void>>(async () => {
        if (!this.joiningRTC) {
          return
        }
        try {
          if (this.roomInfo.userRole !== EduRoleTypeEnum.student) return
          if (evt.type === 'main') {
            const localStream = roomManager.getLocalStreamData()
            BizLogger.info("[demo] [breakout] [student] local-stream-updated# localStream ", localStream, this.joiningRTC)
            if (localStream && localStream.state !== 0) {
              this._cameraEduStream = localStream.stream

              await this.prepareCamera()
              await this.prepareMicrophone()
              BizLogger.info("[demo] [breakout] [student] this._cameraEduStream", this._cameraEduStream)
              if (this.joiningRTC) {
                if (this._hasCamera) {
                  if (this.cameraEduStream.hasVideo) {
                    await this.openCamera()
                  } else {
                    await this.closeCamera()
                  }
                }
                if (this._hasMicrophone) {
                  if (this.cameraEduStream.hasAudio) {
                    await this.openMicrophone()
                  } else {
                    await this.closeMicrophone()
                  }
                }
              }
            } else {
              BizLogger.info("[demo] [breakout] [student] reset camera edu stream", localStream, localStream && localStream.state)
              this._cameraEduStream = undefined
            }
          }

          if (evt.type === 'screen') {
            // if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
            const screenStream = roomManager.getLocalScreenData()
            BizLogger.info("[demo] [breakout] [student] getLocalScreenData#screenStream ", screenStream)
            if (screenStream && screenStream.state !== 0) {
              this._screenEduStream = screenStream.stream
              this.sharing = true
            } else {
              BizLogger.info("[demo] [breakout] [student] reset screen edu stream", screenStream, screenStream && screenStream.state)
              this._screenEduStream = undefined
              this.sharing = false
            }
            // }
          }
          BizLogger.info("[demo] [breakout] [student] local-stream-updated", evt)
        } catch (err) {
          BizLogger.error('[demo] [breakout] [student] Classroom# local-stream-updated ', err.message)
          const error = new GenericErrorWrapper(err)
          BizLogger.error(`${error}`)
        }
      })
    })
    // 本地流移除
    roomManager.on('local-stream-removed', async (evt: any) => {
      await this.mutex.dispatch<Promise<void>>(async () => {
        if (!this.joiningRTC) {
          return
        }
        try {
          if (this.roomInfo.userRole !== EduRoleTypeEnum.student) return
          if (evt.type === 'main') {
            this._cameraEduStream = undefined
            await this.closeCamera()
            await this.closeMicrophone()
          }
          BizLogger.info("[demo] [breakout] [student] local-stream-removed", evt)
        } catch (err) {
          BizLogger.error('[demo] [breakout] [student] Classroom# local-stream-removed ', err.message)
          const error = new GenericErrorWrapper(err)
          BizLogger.error(`${error}`)
        }
      })
    })
    // 远端人加入
    roomManager.on('remote-user-added', (evt: any) => {
      runInAction(() => {
        this.studentRoomUserList  = roomManager.getFullUserList()
      })
      BizLogger.info('[student] remote-stream-added', evt)
    })
    // 远端人更新
    roomManager.on('remote-user-updated', (evt: any) => {
      runInAction(() => {
        this.studentRoomUserList  = roomManager.getFullUserList()
      })
      BizLogger.info('[student] remote-stream-updated', evt)
    })
    // 远端人移除
    roomManager.on('remote-user-removed', (evt: any) => {
      runInAction(() => {
        this.studentRoomUserList  = roomManager.getFullUserList()
      })
      BizLogger.info('[student] remote-stream-removed', evt)
    })
    // 远端流加入
    roomManager.on('remote-stream-added', (evt: any) => {
      runInAction(() => {
        this.studentRoomStreamList = roomManager.getFullStreamList()
      })
      BizLogger.info('[student] remote-stream-added', evt)
    })
    // 远端流移除
    roomManager.on('remote-stream-removed', (evt: any) => {
      runInAction(() => {
        this.studentRoomStreamList = roomManager.getFullStreamList()
      })
      BizLogger.info('[student] remote-stream-removed', evt)
    })
    // 远端流更新
    roomManager.on('remote-stream-updated', (evt: any) => {
      runInAction(() => {
        this.studentRoomStreamList = roomManager.getFullStreamList()
      })
      BizLogger.info('[student] remote-stream-updated', evt)
    })
    // student room manager
    roomManager.on('room-chat-message', (evt: any) => {
      BizLogger.info('[student] room-chat-message ', JSON.stringify(evt))
      const {textMessage} = evt;
      const message = textMessage as EduTextMessage

      const payload = JSON.parse(message.message)
      this.addChatMessage({
        id: message.fromUser.userUuid,
        ts: message.timestamp,
        text: payload.content,
        account: message.fromUser.userName,
        sender: false,
        role: +payload.role,
        fromRoomUuid: payload.fromRoomUuid,
      })
    })

    await roomManager.join({
      userRole: roles[userRole],
      roomUuid,
      userName: `${this.roomInfo.userName}`,
      userUuid: `${this.userUuid}`,
      autoPublish: true,
    })
    BizLogger.info('EDU-STATE #EduClassroomManager#join ', JSON.stringify(roomManager.getClassroomInfo()))
    return roomManager
  }

  getLargeClassroomRole(role: EduRoleTypeEnum) {
    if (role === EduRoleTypeEnum.teacher) {
      return 'host'
    }
    if (role === EduRoleTypeEnum.assistant) {
      return EduRoleTypeEnum.assistant
    }
    return 'audience'
  }

  @action
  async prepareClassroom(role: EduRoleTypeEnum) {
    this.roomApi = new RoomApi({
      appId: this.appStore.params.config.agoraAppId,
      sdkDomain: this.appStore.params.config.sdkDomain,
      rtmToken: this.appStore.params.config.rtmToken,
      rtmUid: this.appStore.params.config.rtmUid,
    })
    let {roomUuid} = await this.roomApi.fetchRoom({
      roomName: `${this.roomInfo.roomName}`,
      // roomUuid: `${this.roomInfo.roomName}${this.roomInfo.roomType}`,
      roomUuid: `${this.roomInfo.roomUuid}`,
      roomType: +this.roomInfo.roomType as number,
    })
    BizLogger.info('[breakout] uuid', this.userUuid)
    this.handlePeerMessage()
    await this.eduManager.login(this.userUuid)
    BizLogger.info('[breakout] login succeed', this.userUuid)
    const roomManager = await this.prepareLargeClassroom(roomUuid, role)
    BizLogger.info('[breakout] prepareLargeClassroom succeed')
    if ([EduRoleTypeEnum.student].includes(role)) {
      let groupData = await this.prepareGroup(roomUuid, roomManager.userToken)
      const studentRoomManager = await this.prepareStudentClassroom(groupData.roomUuid, groupData.roomName, role)
      this.appStore.groupClassroomManager = studentRoomManager
      BizLogger.info('[breakout] prepareStudentClassroom succeed')
    }
    this.appStore.roomManager = roomManager
    const roomInfo = this.largeClassroomManager.getClassroomInfo()
    this.classState = roomInfo.roomStatus.courseState
    this.isMuted = !roomInfo.roomStatus.isStudentChatAllowed
  }

  @action
  async joinAsStudent() {
    try {
      await this.prepareClassroom(this.roomInfo.userRole)
      BizLogger.info('[breakout] joinAsStudent')
      const groupManager = this.groupClassroomManager
      const largeRoomManager = this.largeClassroomManager
      BizLogger.info('[breakout] groupManager', groupManager)
      this.appStore._boardService = new EduBoardService({
        prefix: '',
        sdkDomain: this.appStore.params.config.sdkDomain,
        appId: this.appStore.params.config.agoraAppId,
        rtmToken: this.appStore.params.config.rtmToken,
        rtmUid: this.appStore.params.config.rtmUid,
        roomUuid: largeRoomManager.roomUuid,
        userToken: largeRoomManager.userToken,
      })
      this.appStore._recordService = new EduRecordService({
        prefix: '',
        sdkDomain: this.appStore.params.config.sdkDomain,
        appId: this.appStore.params.config.agoraAppId,
        rtmToken: this.appStore.params.config.rtmToken,
        rtmUid: this.appStore.params.config.rtmUid,
        roomUuid: largeRoomManager.roomUuid,
        // userToken: largeRoomManager.userToken,
      })
      BizLogger.info('[breakout whiteboard] invoke init')
      await this.appStore.boardStore.fetchInit()
      BizLogger.info('[breakout whiteboard] after invoke init')
      const mainStream = groupManager.data.streamMap['main']
      const largeRoomMainStream = largeRoomManager.data.streamMap['main']
      const roomInfo = this.largeClassroomManager.getClassroomInfo()
      const groupRoom = groupManager.getClassroomInfo()

      BizLogger.info('[breakout], groupRoom', groupRoom, ' roomInfo ', roomInfo)
  
      const localStreamData = groupManager.data.localStreamData
      await groupManager.userService.publishStream({
        videoSourceType: EduVideoSourceType.camera,
        audioSourceType: EduAudioSourceType.mic,
        streamUuid: mainStream.streamUuid,
        streamName: '',
        hasVideo: localStreamData && localStreamData.stream ? localStreamData.stream.hasVideo : true,
        hasAudio: localStreamData && localStreamData.stream ? localStreamData.stream.hasAudio : true,
        userInfo: {} as EduUser
      })

      await this.joinRtcAsStudent({
        studentChannel:{
          uid: +mainStream.streamUuid,
          channel: groupRoom.roomInfo.roomUuid,
          token: mainStream.rtcToken
        },
        teacherChannel: {
          uid: +largeRoomMainStream.streamUuid,
          channel: roomInfo.roomInfo.roomUuid,
          token: largeRoomMainStream.rtcToken
        }
      })

      this.currentStudentRoomUuid = groupRoom.roomInfo.roomUuid

      const courseList = get(groupRoom, 'roomProperties.groups', null)
      if (courseList) {
        this._courseList = courseList
      }

      this.appStore.uiStore.addToast(t('toast.publish_business_flow_successfully'))
      this._cameraEduStream = this.groupClassroomManager.userService.localStream.stream
      try {
        await this.prepareCamera()
        await this.prepareMicrophone()
        if (this._cameraEduStream) {
          if (this._cameraEduStream.hasVideo) {
            await this.openCamera()
          } else {
            await this.closeCamera()
          }
          if (this._cameraEduStream.hasAudio) {
            await this.openMicrophone()
          } else {
            await this.closeMicrophone()
          }
        }
      } catch (err) {
        this.appStore.uiStore.addToast(t('toast.media_method_call_failed') + `: ${err.message}`)
        BizLogger.warn(err)
      }
    
      const roomProperties = groupManager.getClassroomInfo().roomProperties
      if (roomProperties) {
        this.recordId = get(roomProperties, 'record.recordId', '')
      } else {
        this.recordId = ''
      }
    
      this.studentRoomUserList = groupManager.getFullUserList()
      this.teacherRoomUserList = largeRoomManager.getFullUserList()
      this.studentRoomStreamList = groupManager.getFullStreamList()
      this.teacherRoomStreamList = largeRoomManager.getFullStreamList()
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
      throw error
    }
  }

  @action
  async joinAsTeacher() {
    await this.prepareClassroom(this.roomInfo.userRole)
    BizLogger.info('[breakout] classroom as teacher')
    const roomManager = this.largeClassroomManager
    this.appStore._boardService = new EduBoardService({
      prefix: '',
      sdkDomain: this.appStore.params.config.sdkDomain,
      appId: this.appStore.params.config.agoraAppId,
      rtmToken: this.appStore.params.config.rtmToken,
      rtmUid: this.appStore.params.config.rtmUid,
      roomUuid: roomManager.roomUuid,
      userToken: roomManager.userToken,
    })
    this.appStore._recordService = new EduRecordService({
      prefix: '',
      sdkDomain: this.appStore.params.config.sdkDomain,
      appId: this.appStore.params.config.agoraAppId,
      rtmToken: this.appStore.params.config.rtmToken,
      rtmUid: this.appStore.params.config.rtmUid,
      roomUuid: roomManager.roomUuid,
      // userToken: roomManager.userToken,
    })
    BizLogger.info('[breakout whiteboard] invoke init')
    await this.appStore.boardStore.fetchInit()
    BizLogger.info('[breakout whiteboard] after invoke init')
    const mainStream = roomManager.data.streamMap['main']
    const roomInfo = this.largeClassroomManager.getClassroomInfo()
    BizLogger.info("[breakout] joinAsTeacher ", JSON.stringify({mainStream, roomInfo}))
    await this.joinRtcAsTeacher({
      uid: +mainStream.streamUuid,
      channel: roomInfo.roomInfo.roomUuid,
      token: mainStream.rtcToken
    })

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
    this.appStore.uiStore.addToast(t('toast.publish_business_flow_successfully'))
    this._cameraEduStream = this.largeClassroomManager.userService.localStream.stream
    try {
      await this.prepareCamera()
      await this.prepareMicrophone()
      if (this._cameraEduStream) {
        if (this._cameraEduStream.hasVideo) {
          await this.openCamera()
        } else {
          await this.closeCamera()
        }
        if (this._cameraEduStream.hasAudio) {
          await this.openMicrophone()
        } else {
          await this.closeMicrophone()
        }
      }
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.media_method_call_failed') + `: ${err.message}`)
      BizLogger.warn(err)
    }

    const roomProperties = roomManager.getClassroomInfo().roomProperties
    if (roomProperties) {
      this.recordId = get(roomProperties, 'record.recordId', '')
    } else {
      this.recordId = ''
    }
  
    const classroomInfo = roomManager.getClassroomInfo()
    const courseList = get(classroomInfo, 'roomProperties.groups', null)
    if (courseList) {
      this._courseList = courseList
    }

    this.teacherRoomUserList = roomManager.getFullUserList()
    this.teacherRoomStreamList = roomManager.getFullStreamList()
  }

  startTime: number = 0
  @action
  async assistantJoinLargeClassroom() {
    this.roomApi = new RoomApi({
      appId: this.appStore.params.config.agoraAppId,
      sdkDomain: this.appStore.params.config.sdkDomain,
      rtmToken: this.appStore.params.config.rtmToken,
      rtmUid: this.appStore.params.config.rtmUid,
    })
    let {roomUuid} = await this.roomApi.fetchRoom({
      roomName: `${this.roomInfo.roomName}`,
      // roomUuid: `${this.roomInfo.roomName}${this.roomInfo.roomType}`,
      roomUuid: `${this.roomInfo.roomUuid}`,
      roomType: +this.roomInfo.roomType as number,
    })
    BizLogger.info('[breakout] uuid', this.userUuid)
    this.handlePeerMessage()
    await this.eduManager.login(this.userUuid)
    BizLogger.info('[breakout] login succeed', this.userUuid)
    const role = this.roomInfo.userRole
    const roomManager = await this.prepareLargeClassroom(roomUuid, role)
    BizLogger.info('[breakout] prepareLargeClassroom succeed')
    this.appStore.roomManager = roomManager
  }

  @action
  async assistantJoinGroupClassroomByCourse(studentRoomUuid: string, studentRoomName: string) {
    const studentRoomManager = await this.prepareStudentClassroom(studentRoomUuid, studentRoomName, this.roomInfo.userRole)
    this.appStore.groupClassroomManager = studentRoomManager
  }

  @action
  async loginAsAssistant() {
    try {
      window.addEventListener('popstate', this.handlePopState, false)
      this.appStore.uiStore.startLoading()
      if (this.roomInfo) {
        if (this.roomInfo.userRole === EduRoleTypeEnum.assistant) {
          if (!this.largeClassroomManager) {
            await this.assistantJoinLargeClassroom()
          }
        }
      }
      this.appStore.uiStore.stopLoading()
      this.joined = true
    } catch (err) {
      window.removeEventListener('popstate', this.handlePopState, false)
      this.appStore.uiStore.stopLoading()
      throw err
    }
  }

  @observable
  joinedGroup: boolean =false

  @action
  async joinAsAssistant(groupUuid: string, groupName: string) {
    try {
      BizLogger.info("[breakout] joinAsAssistant ", JSON.stringify({groupUuid, groupName}))
      if (!this.largeClassroomManager) {
        await this.assistantJoinLargeClassroom()
      }
      await this.joinGroupAsAssistant(groupUuid, groupName)
      this.currentStudentRoomUuid = groupUuid
      this.joinedGroup = true
    } catch (err) {
      BizLogger.warn(err)
      throw err
    }
  }

  // @action
  // async joinGroupBy(courseName: string) {
  //   try {
  //     this.appStore.uiStore.startLoading()
  //     if (this.roomInfo) {
  //       if (this.roomInfo.userRole === EduRoleTypeEnum.assistant) {
  //         await this.joinGroupAsAssistant(courseName)
  //       }
  //     }
  //     this.appStore.uiStore.stopLoading()
  //     this.joined = true
  //   } catch (err) {
  //     this.appStore.uiStore.stopLoading()
  //     throw err
  //   }
  // }

  @action
  async leaveGroupBy(courseName: string){
    try {
      this.appStore.uiStore.startLoading()
      if (this.roomInfo) {
        if (this.roomInfo.userRole === EduRoleTypeEnum.assistant) {
          await this.leaveGroupAsAssistant(courseName)
        }
      }
      this.appStore.uiStore.stopLoading()
      this.joined = true
    } catch (err) {
      this.appStore.uiStore.stopLoading()
      throw err
    }
  }

  @action
  resetAssistantState() {
    this.currentStudentRoomUuid = ''
    // this.remoteUsersRenderer = []
    this.appStore.mediaStore.resetRoomState()
    this.recording = false
    this.resolutionIdx = 0
    this.totalVolume = 0
    this.cameraLabel = ''
    this.microphoneLabel = ''
    this.mediaService.reset()
    this.resetScreenStream()
    this.teacherRoomStreamList = []
    this.teacherRoomUserList =[]
    this.customScreenShareWindowVisible = false
    this.currentWindowId = ''
    this.customScreenShareItems = []
    this._roomChatMessages = []
    this.isMuted = undefined
    this._cameraEduStream = undefined
    this._screenEduStream = undefined
    this._microphoneTrack = undefined
    this.recordId = ''
    this.joined = false
    this._hasCamera = undefined
    this._hasMicrophone = undefined
    this.joiningRTC = false
    this.recordState = false
    this._courseList = []
  }

  @action
  async leaveGroupAsAssistant(courseName: string) {
    try {
      await this.leaveRtc()
      await this.appStore.boardStore.leave()
      await this.groupClassroomManager?.leave()
      this.appStore.uiStore.addToast(t('toast.successfully_left_the_business_channel'))
      this.resetAssistantState()
      this.appStore.uiStore.updateCurSeqId(0)
      this.appStore.uiStore.updateLastSeqId(0)
    } catch (err) {
      BizLogger.warn(err)
      throw err
    }
  }

  @action
  async joinGroupAsAssistant(courseName: string, groupName: string) {
    try {
      BizLogger.info('[assistant] ', courseName, groupName)
      await this.assistantJoinGroupClassroomByCourse(courseName, groupName)
      const groupManager = this.groupClassroomManager
      const largeRoomManager = this.largeClassroomManager
      this.appStore._boardService = new EduBoardService({
        prefix: '',
        sdkDomain: this.appStore.params.config.sdkDomain,
        appId: this.appStore.params.config.agoraAppId,
        rtmToken: this.appStore.params.config.rtmToken,
        rtmUid: this.appStore.params.config.rtmUid,
        roomUuid: largeRoomManager.roomUuid,
        userToken: largeRoomManager.userToken,
      })
      this.appStore._recordService = new EduRecordService({
        prefix: '',
        sdkDomain: this.appStore.params.config.sdkDomain,
        appId: this.appStore.params.config.agoraAppId,
        rtmToken: this.appStore.params.config.rtmToken,
        rtmUid: this.appStore.params.config.rtmUid,
        roomUuid: largeRoomManager.roomUuid,
        // userToken: largeRoomManager.userToken,
      })
      BizLogger.info('[breakout whiteboard] invoke init')
      await this.appStore.boardStore.fetchInit()
      BizLogger.info('[breakout whiteboard] after invoke init')
      const mainStream = groupManager.data.streamMap['main']
      const largeRoomMainStream = largeRoomManager.data.streamMap['main']
      const roomInfo = this.largeClassroomManager.getClassroomInfo()
      const groupRoom = groupManager.getClassroomInfo()

      const config = {
        studentChannel:{
          uid: +mainStream.streamUuid,
          channel: groupRoom.roomInfo.roomUuid,
          token: mainStream.rtcToken
        },
        teacherChannel: {
          uid: +largeRoomMainStream.streamUuid,
          channel: roomInfo.roomInfo.roomUuid,
          token: largeRoomMainStream.rtcToken
        }
      }
  
      BizLogger.info("[breakout] joinRtcAsAssistant ", JSON.stringify(config), " largeRoomMainStream ", JSON.stringify(largeRoomMainStream), " groupRoom ", JSON.stringify(groupRoom.roomInfo), " mainStream ", JSON.stringify(mainStream))
      await this.joinRtcAsAssistant(config)
      
      const roomProperties = groupManager.getClassroomInfo().roomProperties
      if (roomProperties) {
        this.recordId = get(roomProperties, 'record.recordId', '')
      } else {
        this.recordId = ''
      }

      const classroomInfo = largeRoomManager.getClassroomInfo()
      const courseList = get(classroomInfo, 'roomProperties.groups', null)
      if (courseList) {
        this._courseList = courseList
      }
    
      this.studentRoomUserList = groupManager.getFullUserList()
      this.teacherRoomUserList = largeRoomManager.getFullUserList()
      this.studentRoomStreamList = groupManager.getFullStreamList()
      this.teacherRoomStreamList = largeRoomManager.getFullStreamList()
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
      throw error
    }
  }



  async prepareGroup(roomUuid: string, userToken: string) {
    let res = await this.roomApi.acquireRoomGroupBy(roomUuid, userToken)
    this.roomInfo.groupName = res.roomName
    this.roomInfo.groupUuid = res.groupUuid
    return res
  }


  @action
  async assistantJoinRoom(courseUuid: string) {
    try {
      this.appStore.uiStore.startLoading()
      if (this.roomInfo) {
        if (this.roomInfo.userRole === EduRoleTypeEnum.assistant) {
          await this.joinAsAssistant(courseUuid, this.roomInfo.groupName as string)
        }
      }
      this.appStore.uiStore.stopLoading()
      this.joined = true
    } catch (err) {
      this.appStore.uiStore.stopLoading()
      throw err
    }
  }

  @action
  async join() {
    try {
      window.addEventListener('popstate', this.handlePopState, false)
      this.appStore.uiStore.startLoading()
      if (this.roomInfo) {
        if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
          await this.joinAsTeacher()
        }
        if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
          await this.joinAsStudent()
        }
      }
      this.appStore.uiStore.stopLoading()
      this.joined = true
    } catch (err) {
      this.appStore.uiStore.stopLoading()
      window.removeEventListener('popstate', this.handlePopState, false)
      throw err
    }
  }

  @computed
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
      return this.teacherRoomStreamList.reduce((acc: EduMediaStream[], stream: EduStream) => {
        const teacher = this.teacherRoomUserList.find((user: EduUser) => user.role === 'host')
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
    let streamList = this.studentRoomStreamList.reduce(
      (acc: EduMediaStream[], stream: EduStream) => {
        const user = this.studentRoomUserList.find((user: EduUser) => (user.userUuid === stream.userInfo.userUuid && ['broadcaster'].includes(user.role)))
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

    BizLogger.info('[rtm] streamList', streamList)

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
      } as EduMediaStream].concat(streamList)
    }
    return streamList
  }

  @action
  async leaveCourse() {
    try {
      await this.leaveRtc()
      await this.appStore.boardStore.leave()
      // this.appStore.boardStore.setReady(false)
      await this.eduManager.logout()
      await this.largeClassroomManager?.leave()
      await this.groupClassroomManager?.leave()
      await this.largeClassroomManager?.removeAllListeners()
      await this.groupClassroomManager?.removeAllListeners()
      this.appStore.groupClassroomManager = undefined
      this.appStore.roomManager = undefined
      this.appStore.uiStore.addToast(t('toast.successfully_left_the_business_channel'))
      this.reset()
      this.appStore.uiStore.updateCurSeqId(0)
      this.appStore.uiStore.updateLastSeqId(0)
      // this.appStore.uiStore.reset()
    } catch (err) {
      this.reset()
      const error = new GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
    }
  }

  @action
  async leave() {
    try {
      window.removeEventListener('popstate', this.handlePopState, false)
      await this.leaveRtc()
      await this.appStore.boardStore.leave()
      // this.appStore.boardStore.setReady(false)
      await this.eduManager.logout()
      await this.largeClassroomManager?.leave()
      await this.groupClassroomManager?.leave()
      await this.largeClassroomManager?.removeAllListeners()
      await this.groupClassroomManager?.removeAllListeners()
      this.appStore.groupClassroomManager = undefined
      this.appStore.roomManager = undefined
      this.appStore.uiStore.addToast(t('toast.successfully_left_the_business_channel'))
      this.reset()
      this.resetRoomInfo()
      this.appStore.uiStore.updateCurSeqId(0)
      this.appStore.uiStore.updateLastSeqId(0)
      // this.appStore.uiStore.reset()
    } catch (err) {
      this.reset()
      const error = new GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
    }
  }

  @action
  async startClass() {
    try {
      await this.largeClassroomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStart)
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
      await this.largeClassroomManager?.userService.updateCourseState(EduCourseState.EduCourseStateStop)
      // this.classState = false
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
    const classroom = this.largeClassroomManager?.getClassroomInfo()
    if (classroom && classroom.roomStatus) {
      return !classroom.roomStatus.isStudentChatAllowed
    }
    return true
  }

  @observable
  isMuted?: boolean = undefined

  @action
  async muteChat() {
    const sceneType = +this.roomInfo.roomType === 3 ? EduSceneType.SceneLarge : +this.roomInfo.roomType
    const roles = ['broadcaster']
    if (sceneType === EduSceneType.SceneLarge) {
      roles.push('audience')
    }
    await this.largeClassroomManager?.userService.muteStudentChatByRoles(roles)
    this.isMuted = true
  }

  @action
  async unmuteChat() {
    const sceneType = +this.roomInfo.roomType === 3 ? EduSceneType.SceneLarge : +this.roomInfo.roomType
    const roles = ['broadcaster']
    if (sceneType === EduSceneType.SceneLarge) {
      roles.push('audience')
    }
    await this.largeClassroomManager?.userService.unmuteStudentChatByRoles(roles)
    this.isMuted = false
  }

  canControl(userUuid: string): boolean {
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole) || this.userUuid === userUuid
  }

  private _unreadMessageCount: number = 0

  // @computed
  // get unreadMessageCount(): number {
  //   return this._unreadMessageCount
  // }

  @observable
  _roomChatMessages: ChatMessage[] = []

  @action
  addChatMessage(args: any) {
    this._roomChatMessages.push(args)
  }

  @computed
  get currentStudentRoomName(): string {
    if (this.currentStudentRoomUuid) {
      return this._courseList.find((it: any) => it.roomUuid === this.currentStudentRoomUuid)?.roomName
    }
    return ''
  }

  @observable
  currentStudentRoomUuid: string = ''

  @computed
  get roomChatMessages(): ChatMessage[] {
    if ([EduRoleTypeEnum.student, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole)) {
      if (this.currentStudentRoomUuid) {
        return this._roomChatMessages
          .filter(
            (chat: ChatMessage) => 
            `${chat.fromRoomUuid}` === `${this.currentStudentRoomUuid}` || !chat.fromRoomUuid
          )
      }
    }
    if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
      if (this.currentStudentRoomUuid) {
        return this._roomChatMessages
          .filter(
            (chat: ChatMessage) => 
            `${chat.fromRoomUuid}` === `${this.currentStudentRoomUuid}`
          )
      }
    }
    return this._roomChatMessages
  }

  @computed
  get muteControl(): boolean {
    if (this.roomInfo) {
      return this.roomInfo.userRole === EduRoleTypeEnum.teacher
    }
    return false
  }

  @observable
  mediaGroup: MediaService = null as any

  @action
  async muteStudentChat(userUuid: string, isLocal: boolean) {
    if (isLocal) {
      // await this.groupClassroomManager?.userService.updateUserState({'chat': false})
    } else {
      const user = this.getUserBy(userUuid)
      // await this.groupClassroomManager?.userService.remoteStopStudentCamera(targetStream as EduStream)
    }
  }

  @action
  async unmuteStudentChat(userUuid: string, isLocal: boolean) {
    if (isLocal) {
      // await this.groupClassroomManager?.userService.updateUserState({'chat': false})
    } else {
      const user = this.getUserBy(userUuid)
      // await this.groupClassroomManager?.userService.remoteStopStudentCamera(targetStream as EduStream)
    }
  }

  @action
  async muteStudentVideo(userUuid: string, isLocal: boolean) {
    if (isLocal) {
      await this.closeCamera()
      await this.groupClassroomManager?.userService.updateMainStreamState({'videoState': false})
    } else {
      const stream = this.getStreamBy(userUuid)
      if (stream) {
        // await this.mediaGroup.muteRemoteVideo(+stream.streamUuid, true)
        // await this.mediaService.muteRemoteVideoByClient(this.mediaGroup, +stream.streamUuid, true)
      }
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      await this.groupClassroomManager?.userService.remoteStopStudentCamera(targetStream as EduStream)
    }
  }

  @action
  async unmuteStudentVideo(userUuid: string, isLocal: boolean) {
    if (isLocal) {
      await this.openCamera()
      await this.groupClassroomManager?.userService.updateMainStreamState({'videoState': true})
    } else {
      const stream = this.getStreamBy(userUuid)
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      await this.groupClassroomManager?.userService.remoteStartStudentCamera(targetStream as EduStream)
    }
  }

  @action
  async muteStudentAudio(userUuid: string, isLocal: boolean) {
    if (isLocal) {
      await this.closeMicrophone()
      await this.groupClassroomManager?.userService.updateMainStreamState({'audioState': false})
    } else {
      const stream = this.getStreamBy(userUuid)
      if (stream) {
        // await this.mediaService.muteRemoteAudioByClient(this.mediaGroup, +stream.streamUuid, true)
      }
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      await this.groupClassroomManager?.userService.remoteStopStudentMicrophone(targetStream as EduStream)
    }
  }

  @action
  async unmuteStudentAudio(userUuid: string, isLocal: boolean) {
    if (isLocal) {
      await this.groupClassroomManager?.userService.updateMainStreamState({'audioState': true})
    } else {
      const stream = this.getStreamBy(userUuid)
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      await this.groupClassroomManager?.userService.remoteStartStudentMicrophone(targetStream as EduStream)
    }
  }

  @action
  async muteAudio(userUuid: string, isLocal: boolean, userRole: EduRoleTypeEnum) {
    if (userRole === EduRoleTypeEnum.teacher) {
      if (isLocal) {
        BizLogger.info('before muteLocalAudio', this.microphoneLock)
        await this.muteLocalMicrophone()
        BizLogger.info('after muteLocalAudio', this.microphoneLock)
      } else {
        const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
        await this.largeClassroomManager?.userService.remoteStopStudentMicrophone(targetStream as EduStream)
      }
    }
  }

  async unmuteAudio(userUuid: string, isLocal: boolean, userRole: EduRoleTypeEnum) {
    if (userRole === EduRoleTypeEnum.teacher) {
      if (isLocal) {
        BizLogger.info('before unmuteLocalMicrophone', this.microphoneLock)
        await this.unmuteLocalMicrophone()
        BizLogger.info('after unmuteLocalMicrophone', this.microphoneLock)
      } else {
        const stream = this.getStreamBy(userUuid)
        const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
        await this.largeClassroomManager?.userService.remoteStartStudentMicrophone(targetStream as EduStream)
      }
    }
  }

  async muteVideo(userUuid: string, isLocal: boolean, userRole: EduRoleTypeEnum) {
    if (isLocal) {
      BizLogger.info('before muteLocalCamera', this.cameraLock)
      await this.muteLocalCamera()
      BizLogger.info('after muteLocalCamera', this.cameraLock)
    } else {
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      await this.largeClassroomManager?.userService.remoteStopStudentCamera(targetStream as EduStream)
    }
  }

  async unmuteVideo(userUuid: string, isLocal: boolean, userRole: EduRoleTypeEnum) {
    if (isLocal) {
      BizLogger.info('before unmuteLocalCamera', this.cameraLock)
      await this.unmuteLocalCamera()
      BizLogger.info('after unmuteLocalCamera', this.cameraLock)
    } else {
      const stream = this.getStreamBy(userUuid)
      const targetStream = this.streamList.find((it: EduStream) => it.userInfo.userUuid === userUuid)
      await this.largeClassroomManager?.userService.remoteStartStudentCamera(targetStream as EduStream)
    }
  }

  @observable
  recordId: string = ''

  @observable
  recording: boolean = false

  @computed
  get isRecording(): boolean {
    if (this.recordId) return true
    return false
  }

  async startOrStopRecording(){
    try {
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
      let {recordId} = await this.recordService.startRecording(this.roomUuid)
      this.recordId = recordId
      this.appStore.uiStore.addToast(t('toast.start_recording_successfully'))
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.start_recording_failed') + `, ${err.message}`)
    }
  }

  @action
  async stopRecording() {
    try {
      await this.recordService.stopRecording(this.roomUuid, this.recordId)
      this.appStore.uiStore.addToast(t('toast.successfully_ended_recording'))
      this.recordId = ''
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_end_recording') + `, ${err.message}`)
    }
  }

  @observable
  notice?: any = undefined

  removeDialogBy(userUuid: any) {
    const target = this.appStore
    .uiStore
    .dialogs.filter((it: DialogType) => it.dialog.option)
    .find((it: DialogType) => it.dialog.option === userUuid)
    if (target) {
      this.appStore.uiStore.removeDialog(target.id)
    }
  }

  @action
  showNotice(type: PeerInviteEnum, userUuid: string) {
    let text = t('toast.you_have_a_default_message')
    switch(type) {
      case PeerInviteEnum.teacherAccept: {
        text = t('toast.the_teacher_agreed')
        break;
      }
      case PeerInviteEnum.studentApply: {
        text = t('toast.student_applied')
        break;
      }
      case PeerInviteEnum.teacherStop: {
        text = t('toast.you_were_dismissed_by_the_teacher')
        break;
      }
      case PeerInviteEnum.studentStop:
      case PeerInviteEnum.studentCancel: 
        text = t('toast.student_canceled')
        this.removeDialogBy(userUuid)
        break;
      case PeerInviteEnum.teacherReject: {
        text = t('toast.the_teacher_refused')
        break;
      }
      case PeerInviteEnum.teacherReject: {
        text = t('toast.the_teacher_refused')
        break;
      }
    }
    this.notice = {
      reason: text,
      userUuid
    }
    this.appStore.uiStore.addToast(this.notice.reason)
  }

  @action
  async callApply() {
    try {
      const teacher = this.largeClassroomManager?.getFullUserList().find((it: EduUser) => it.userUuid === this.teacherStream.userUuid)
      if (teacher) {
        await this.largeClassroomManager?.userService.sendCoVideoApply(teacher)
      }
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_initiate_a_raise_of_hand_application') + ` ${err.message}`)
    }
  }

  @action
  async callEnded() {
    try {
      const teacher = this.largeClassroomManager?.getFullUserList().find((it: EduUser) => it.userUuid === this.teacherStream.userUuid)
      if (teacher) {
        await this.largeClassroomManager?.userService.studentCancelApply(teacher)
      }
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_end_the_call') + ` ${err.message}`)
    }
  }

  showDialog(userName: string) {
    this.appStore.uiStore.showDialog({
      type: 'apply',
      message: `${userName}` + t('icon.requests_to_connect_the_microphone')
    })
  }

  async teacherRejectApply() {
    const userUuid = (this.notice as any).userUuid
    const user = this.largeClassroomManager?.getFullUserList().find(it => it.userUuid === userUuid)
    if (user) {
      await this.largeClassroomManager?.userService.rejectCoVideoApply(user)
    }
  }

  async teacherAcceptApply() {
    const userUuid = (this.notice as any).userUuid
    const user = this.largeClassroomManager?.data.userList.find(it => it.user.userUuid === userUuid)
    if (user) {
      await this.largeClassroomManager?.userService.acceptCoVideoApply(user.user)
      await this.largeClassroomManager?.userService.inviteStreamBy({
        roomUuid: this.roomUuid,
        streamUuid: user.streamUuid,
        userUuid: user.user.userUuid
      })
    }
  }

}