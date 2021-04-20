import { EduAudioSourceType, EduLogger, EduRoleTypeEnum, EduRoomType, EduSceneType, EduStream, EduTextMessage, EduUser, EduVideoSourceType, GenericErrorWrapper, StreamSubscribeOptions } from "agora-rte-sdk"
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { get } from "lodash"
import { action, computed, IReactionDisposer, observable, reaction, runInAction } from "mobx"
import { v4 as uuidv4 } from 'uuid'
import { EduScenarioAppStore } from "."
import { IAgoraExtApp, regionMap } from "../api/declare"
import { EduBoardService } from "../services/edu-board-service"
import { EduRecordService } from "../services/edu-record-service"
import { eduSDKApi } from "../services/edu-sdk-api"
import { reportService } from "../services/report"
import { RoomApi } from "../services/room-api"
import { UploadService } from "../services/upload-service"
import { ChatMessage, QuickTypeEnum } from "../types"
import { escapeExtAppIdentifier } from "../utilities/ext-app"
import { BizLogger } from "../utilities/kit"
import { EduClassroomStateEnum, SimpleInterval } from "./scene"
import { SmallClassStore } from "./small-class"


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
    cmd: number,
    extAppCause: any
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

export type ProgressUserInfo = {
  userUuid: string,
  ts: number
}

dayjs.extend(duration)

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
  /**
   * 课程开始时刻 单位：ms
   */
  startTime: number,
  /**
   * 课程时长 单位：s
   */
  duration: number,
  /**
   * 课程结束后延迟关闭时长 单位：s
   */
  closeDelay: number
}

export enum RoomPropertiesChangeCause {
  studentRewardStateChanged = 1101, // 单个人的奖励发生
}

const delay = 2000

const ms = 500

export const networkQualities: { [key: string]: string } = {
  'excellent': 'network-good',
  'good': 'network-good',
  'poor': 'network-normal',
  'bad': 'network-normal',
  'very bad': 'network-bad',
  'down': 'network-bad',
  'unknown': 'network-normal',
}
export class RoomStore extends SimpleInterval {

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

  history: any

  @observable
  operator: any = {
    userUuid: '',
    role: '',
    userName: '',
    action: '',
    cmd: 0
  };

  setHistory(history: any) {
    this.history = history
  }

  resetRoomProperties() {
    this.roomProperties = {
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
  }

  @observable
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

  @observable
  roomChatMessages: ChatMessage[] = []

  @computed
  get chatMessageList(): any[] {
    return this.roomChatMessages.map((item: ChatMessage, key: number) => ({
      id: `${item.id}${item.ts}${key}`,
      uid: item.id,
      username: `${item.account}`,
      timestamp: item.ts,
      isOwn: item.sender,
      content: item.text,
      role: item.role
    }))
  }

  @observable
  unreadMessageCount: number = 0

  @observable
  joined: boolean = false

  @observable
  roomJoined: boolean = false

  @observable
  time: number = 0

  @observable
  isStudentChatAllowed: boolean | undefined

  @observable
  windowWidth: number = 0

  @observable
  windowHeight: number = 0

  @observable
  trophyFlyout: TrophyType = {
    minimizeTrigger: false,
    startPosition: {
      x: 0,
      y: 0,
    },
    endPosition: {
      x: 0,
      y: 0,
    }
  }

  /**
   * 当前时间（校验之后的）
   */
  @computed
  get calibratedTime(): number {
    return this.time + this.timeShift
  }


  @observable
  timeShift: number = 0

  @observable
  classroomSchedule?: ClassroomScheduleType

  @computed
  get studentsReward() {
    return get(this.roomProperties, 'students', {})
  }

  @computed
  get roomReward() {
    return get(this.roomProperties, 'reward', { room: 0, config: { roomLimit: 0 } })
  }

  @computed
  get liveClassStatus() {
    let timeText = ""
    const duration = this.classTimeDuration
    // const placeholder = `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`

    // duration is always >= 0, if it's smaller than 0, display placeholder
    if (duration < 0) {
      return {
        classState: 'default',
        duration,
      }
    }

    switch (this.sceneStore.classState) {
      case EduClassroomStateEnum.beforeStart:
        // timeText = `${transI18n('nav.to_start_in')}${this.formatTimeCountdown(duration, TimeFormatType.Timeboard)}`
        return {
          classState: 'pre-class',
          duration,
        }
      case EduClassroomStateEnum.start:
        return {
          classState: 'in-class',
          duration,
        }
      case EduClassroomStateEnum.end:
        // timeText = `${transI18n('nav.started_elapse')}${this.formatTimeCountdown(duration, TimeFormatType.Timeboard)}`
        return {
          classState: 'end-class',
          duration,
        }
    }

    return {
      classState: 'default',
      duration,
    }
  }

  /**
   * 当前所属于状态的时间段 单位：ms
   * 课程开始之前表示：距离开始上课多久
   * 课程正在开始表示：已经上课多久
   * 课程已经结束表示：已经下课多久
   */
  @computed
  get classTimeDuration(): number {
    let duration = -1
    if (this.classroomSchedule) {
      switch (this.sceneStore.classState) {
        case EduClassroomStateEnum.beforeStart:
          duration = Math.max(this.classroomSchedule.startTime - this.calibratedTime, 0)
          break;
        case EduClassroomStateEnum.start:
          duration = Math.max(this.calibratedTime - this.classroomSchedule.startTime, 0);
          break;
        case EduClassroomStateEnum.end:
          duration = Math.max(this.calibratedTime - this.classroomSchedule.startTime - this.classroomSchedule.duration*1000, 0)
          break;
      }
    }
    return duration
  }

  @computed
  get isClassroomDelayed() {
    return this.sceneStore.classState === EduClassroomStateEnum.end
  }

  @observable
  showTranslate: boolean = false

  timer: any = null

  @observable
  trophyNumber: number = 0

  @computed
  get isTrophyLimit(): boolean {
    if (this.roomReward.room >= this.roomReward.config.roomLimit) {
      return true
    }
    return false
  }

  @observable
  unwind: MinimizeType[] = []  // 最小化

  @observable
  isBespread: boolean = true  // 是否铺满

  @observable
  isRed: boolean = false  // 是否变红

  @observable
  additional: boolean = false

  roomApi!: RoomApi;
  disposers: IReactionDisposer[] = [];
  appStore!: EduScenarioAppStore;

  get sceneStore() {
    return this.appStore.sceneStore
  }

  smallClassStore: SmallClassStore;

  coVideoUsers: Record<string, any> = {};

  constructor(appStore: EduScenarioAppStore) {
    super()
    this.appStore = appStore
    this.smallClassStore = new SmallClassStore(this)
  }

  @action.bound
  reset() {
    this.appStore.resetStates()
    this.sceneStore.reset()
    this.resetRoomProperties()
    this.roomChatMessages = []
    this.unreadMessageCount = 0
    this.joined = false
    this.roomJoined = false
    this.time = 0
    this.coVideoUsers = {}
    this.classroomSchedule = undefined
    this.disposers.forEach(disposer => disposer())
    clearTimeout(this.timer)
  }

  @action.bound
  addChatMessage(args: any) {
    this.roomChatMessages.push(args)
  }

  get roomManager() {
    return this.sceneStore.roomManager
  }

  @computed
  get userUuid(): string {
    return this.sceneStore.userUuid
  }

  @computed
  get isTeacher(): boolean {
    if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(this.appStore.roomInfo.userRole)) {
      return true
    }
    return false
  }


  @action.bound
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
      this.appStore.uiStore.fireToast(
        'toast.failed_to_send_chat',
      )
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
      return {
        id: this.userUuid,
        ts,
        text: message,
        account: this.roomInfo.userName,
        sender: true,
        fromRoomName: this.roomInfo.userName,
        status: 'fail'
      }
    }
  }

  @action.bound
  setMessageList(messageList: ChatMessage[]) {
    this.roomChatMessages = messageList
  }

  @action.bound
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
      historyMessage.list.map((item: any) => {
        this.roomChatMessages.unshift({
          text: item.message,
          ts: item.sendTime,
          id: item.sequences,
          fromRoomUuid: item.fromUser.userUuid,
          userName: item.fromUser.userName,
          role: item.fromUser.role,
          sender: item.fromUser.userUuid === this.roomInfo.userUuid,
          account: item.fromUser.userName
        } as ChatMessage)

      })
      return historyMessage
    } catch (err) {
      const error = GenericErrorWrapper(err)
      this.appStore.uiStore.fireToast('toast.failed_to_send_chat', { reason: error })
      BizLogger.warn(`${error}`)
    }
  }
  // 奖杯
  @action.bound
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
      this.appStore.uiStore.fireToast(
        'toast.failed_to_send_reward',
      )
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  @action.bound
  async kickOutOnce(userUuid: string, roomUuid: string) {
    await eduSDKApi.kickOutOnce({
      roomUuid,
      toUserUuid: userUuid
    })
  }

  @action.bound
  async kickOutBan(userUuid: string, roomUuid: string) {
    await eduSDKApi.kickOutBan({
      roomUuid,
      toUserUuid: userUuid
    })
  }

  @action.bound
  tickClassroom() {
    // update time
    this.time = dayjs().valueOf()
    this.checkClassroomNotification()
    clearTimeout(this.timer)
    this.timer = setTimeout(() => { this.tickClassroom() }, 1000)
  }

  @action.bound
  chatIsBanned(isStudentChatAllowed: boolean) {
    const isFirstLoad = () => {
      return this.isStudentChatAllowed === undefined
    }
    if (!this.joined) {
      return
    }
    // 判断是否等于上一次的值 相同则不更新
    if (!isFirstLoad() && this.isStudentChatAllowed !== isStudentChatAllowed) {
      if (this.isStudentChatAllowed) {
        this.appStore.uiStore.fireToast(
          'toast.chat_disable',
        )
      } else {
        this.appStore.uiStore.fireToast(
          'toast.chat_enable',
        )
      }
    }
    this.isStudentChatAllowed = isStudentChatAllowed
  }

  @action.bound
  async checkClassroomNotification() {
    if (this.classroomSchedule) {
      switch (this.sceneStore.classState) {
        case EduClassroomStateEnum.beforeStart:
          //距离上课的时间
          let duration = this.classTimeDuration
          let dDuration = dayjs.duration(duration);
          [5, 3, 1].forEach(min => {
            if (dDuration.minutes() === min && dDuration.seconds() === 0) {
              this.appStore.uiStore.fireToast(
                'toast.time_interval_between_start',
                { reason: duration }
              )
            }
          })
          break;
        case EduClassroomStateEnum.start:
          //距离下课的时间
          let durationToEnd = this.classroomSchedule.duration * 1000 - this.classTimeDuration;
          let dDurationToEnd = dayjs.duration(durationToEnd);
          [5, 1].forEach(min => {
            if (dDurationToEnd.minutes() === min && dDurationToEnd.seconds() === 0) {
              this.appStore.uiStore.fireToast(
                'toast.time_interval_between_end',
                { reason: durationToEnd }
                // {reason: this.formatTimeCountdown(durationToEnd, TimeFormatType.Message)}
              )
            }
          })
          if (dDurationToEnd.minutes() === 0 && dDurationToEnd.seconds() === 0 && durationToEnd >= 0) {
            this.appStore.uiStore.fireToast(
              'toast.class_is_end', {
              reason: ((this.classroomSchedule.closeDelay || 0) * 1000)
            })
          }
          break;
        case EduClassroomStateEnum.end:
          //距离教室关闭的时间
          let durationToClose = this.classroomSchedule.closeDelay*1000 - this.classTimeDuration;
          let dDurationToClose = dayjs.duration(durationToClose)
          if (dDurationToClose.minutes() === 1 && dDurationToClose.seconds() === 0) {
            this.appStore.uiStore.fireToast(
              'toast.time_interval_between_close',
              { reason: durationToClose }
            )
          }
          if (durationToClose < 0) {
            // close
            this.sceneStore.classState = EduClassroomStateEnum.close
          }
          break;
      }
    }
  }


  @computed
  get roomInfo() {
    return this.appStore.roomInfo
  }
  @action.bound
  resetUnreadMessageCount() {
    this.unreadMessageCount = 0
  }

  @action.bound
  incrementUnreadMessageCount() {
    this.unreadMessageCount++
  }

  @computed
  get delay(): string {
    return `${this.appStore.mediaStore.delay}`
  }

  isBigClassStudent(): boolean {
    const userRole = this.roomInfo.userRole
    return +this.roomInfo.roomType === EduRoomType.SceneTypeBigClass && userRole === EduRoleTypeEnum.student
  }


  updateRewardInfo() {

  }

  get eduManager() {
    return this.appStore.eduManager
  }

  getSessionConfig(): { sceneType: number, userRole: string } {
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
    if (userRole === 'invisible') {
      return EduRoleTypeEnum.invisible
    } else if (userRole === 'assistant') {
      return EduRoleTypeEnum.assistant
    } else if (userRole === 'teacher') {
      return EduRoleTypeEnum.teacher
    }
    return EduRoleTypeEnum.student
  }

  @computed
  get videoEncoderConfiguration() {
    return this.appStore.sceneStore.videoEncoderConfiguration
  }

  pluginRoomProperties(extApp: IAgoraExtApp) {
    const props = get(this.roomProperties, `extApps.${escapeExtAppIdentifier(extApp.appIdentifier)}`)
    return props
  }

  @action.bound
  async join() {
    try {
      this.disposers.push(reaction(() => this.sceneStore.classState, this.onClassStateChanged.bind(this)))

      this.appStore.uiStore.startLoading()
      this.roomApi = new RoomApi({
        appId: this.eduManager.config.appId,
        sdkDomain: this.eduManager.config.sdkDomain as string,
        rtmToken: this.appStore.params.config.rtmToken,
        rtmUid: this.appStore.params.config.rtmUid,
      })
      const roomUuid = this.roomInfo.roomUuid

      const startTime = this.appStore.params.startTime
      const duration = this.appStore.params.duration

      // REPORT
      // CRITICAL REPORT ONLY STARTS AFTER BELOW LINE
      reportService.initReportParams({
        appId: this.eduManager.config.appId,
        uid: this.appStore.params.config.rtmUid,
        rid: roomUuid,
        sid: this.eduManager.sessionId
      })
      reportService.reportEC('joinRoom', 'start')

      const region = regionMap[this.appStore.params.config.region!] ?? 'cn-hz'

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
      this.timeShift = checkInResult.ts - dayjs().valueOf()
      this.classroomSchedule = {
        startTime: checkInResult.startTime,
        duration: checkInResult.duration,
        closeDelay: checkInResult.closeDelay
      }
      this.tickClassroom()

      this.sceneStore.canChatting = checkInResult.muteChat ? false : true
      this.sceneStore.recordState = !!checkInResult.isRecording
      this.sceneStore.classState = checkInResult.state
      this.appStore.boardStore.init({
        boardId: checkInResult.board.boardId,
        boardToken: checkInResult.board.boardToken,
        boardRegion: checkInResult.board.boardRegion,
      }).catch((err) => {
        const error = GenericErrorWrapper(err)
        BizLogger.warn(`${error}`)
        this.appStore.isNotInvisible && this.appStore.uiStore.fireToast('toast.failed_to_join_board')
      })
      this.appStore.uiStore.stopLoading()

      // logout will clean up eduManager events, so we need to put the listener here
      this.eduManager.on('ConnectionStateChanged', async ({ newState, reason }) => {
        if (newState === "ABORTED" && reason === "REMOTE_LOGIN") {
          await this.appStore.releaseRoom()
          this.appStore.uiStore.fireToast('toast.classroom_remote_join')
          this.noticeQuitRoomWith(QuickTypeEnum.Kick)
        }
        reportService.updateConnectionState(newState)
      })

      await this.eduManager.login(this.userUuid)

      const roomManager = this.eduManager.createClassroom({
        roomUuid: roomUuid,
        roomName: this.roomInfo.roomName
      })
      roomManager.on('seqIdChanged', (evt: any) => {
        BizLogger.info("seqIdChanged", evt)
        this.appStore.uiStore.updateCurSeqId(evt.curSeqId)
        this.appStore.uiStore.updateLastSeqId(evt.latestSeqId)
      })
      // 本地用户更新
      roomManager.on('local-user-updated', (evt: any) => {
        this.sceneStore.userList = roomManager.getFullUserList()
        BizLogger.info("ode", evt)
      })
      roomManager.on('local-user-removed', async (evt: any) => {
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
          BizLogger.info("local-user-removed ", evt)
          const { user, type } = evt
          if (user.user.userUuid === this.roomInfo.userUuid && type === 2) {
            await this.appStore.releaseRoom()
            this.appStore.uiStore.fireToast('toast.kick_by_teacher')
            this.noticeQuitRoomWith(QuickTypeEnum.Kicked)
          }
        })
      })
      // 本地流移除
      roomManager.on('local-stream-removed', async (evt: any) => {
        const { operator, data, cause } = evt
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
          if (!this.sceneStore.joiningRTC) {
            return
          }
          try {
            const tag = uuidv4()
            BizLogger.info(`[demo] tag: ${tag}, [${Date.now()}], handle event: local-stream-removed, `, JSON.stringify(evt))
            if (evt.type === 'main') {
              this.sceneStore._cameraEduStream = undefined
              await this.sceneStore.closeCamera()
              await this.sceneStore.closeMicrophone()
              if (cause && cause.cmd === 501) {
                const roleMap = {
                  'host': 'role.teacher',
                  'assistant': 'role.assistant'
                }
                const role = roleMap[operator.userRole] ?? 'unknown'
                this.appStore.uiStore.fireToast(`roster.close_student_co_video`, { teacher: role })
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
        const { operator, data, cause } = evt
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
          this.sceneStore.streamList = roomManager.getFullStreamList()
          if (!this.sceneStore.joiningRTC) {
            return
          }
          const tag = uuidv4()
          BizLogger.info(`[demo] tag: ${tag}, seq[${evt.seqId}] time: ${Date.now()} local-stream-updated, `, JSON.stringify(evt))
          if (evt.type === 'main') {
            if (this.isAssistant) {
              return
            }
            const localStream = roomManager.getLocalStreamData()
            BizLogger.info(`[demo] local-stream-updated tag: ${tag}, time: ${Date.now()} local-stream-updated, main stream `, JSON.stringify(localStream), this.sceneStore.joiningRTC)
            const causeCmd = cause?.cmd ?? 0
            if (localStream && localStream.state !== 0) {
              if (causeCmd === 501) {
                const roleMap = {
                  'host': 'role.teacher',
                  'assistant': 'role.assistant'
                }
                const role = roleMap[operator.userRole] ?? 'unknown'
                this.appStore.uiStore.fireToast(`roster.open_student_co_video`, { teacher: role })
              }
              BizLogger.info(`[demo] local-stream-updated tag: ${tag}, time: ${Date.now()} local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC)
              if (this.sceneStore._cameraEduStream) {
                if (!!localStream.stream.hasVideo !== !!this.sceneStore._cameraEduStream.hasVideo) {
                  console.log("### [demo] localStream.stream.hasVideo ", localStream.stream.hasVideo, "this.sceneStore._cameraEduStream.hasVideo ", this.sceneStore._cameraEduStream.hasVideo)
                  this.sceneStore._cameraEduStream.hasVideo = !!localStream.stream.hasVideo
                  if (causeCmd !== 501) {
                    const i18nRole = operator.role === 'host' ? 'teacher' : 'assistant'
                    const operation = this.sceneStore._cameraEduStream.hasVideo ? 'co_video.remote_open_camera' : 'co_video.remote_close_camera'
                    this.appStore.uiStore.fireToast(operation, { reason: `role.${i18nRole}` })
                  }
                  // this.operator = {
                  //   ...operator,
                  //   cmd: cause?.cmd ?? 0,
                  //   action: 'video'
                  // }
                }
                if (!!localStream.stream.hasAudio !== !!this.sceneStore._cameraEduStream.hasAudio) {
                  console.log("### [demo] localStream.stream.hasAudio ", localStream.stream.hasAudio, "this.sceneStore._cameraEduStream.hasAudio ", this.sceneStore._cameraEduStream.hasAudio)
                  this.sceneStore._cameraEduStream.hasAudio = !!localStream.stream.hasAudio
                  if (causeCmd !== 501) {
                    const i18nRole = operator.role === 'host' ? 'teacher' : 'assistant'
                    const operation = this.sceneStore._cameraEduStream.hasAudio ? 'co_video.remote_open_microphone' : 'co_video.remote_close_microphone'
                    this.appStore.uiStore.fireToast(operation, { reason: `role.${i18nRole}` })
                  }
                  // this.operator = {
                  //   ...operator,
                  //   cmd: cause?.cmd ?? 0,
                  //   action: 'audio'
                  // }
                }
              } else {
                this.sceneStore._cameraEduStream = localStream.stream
                // this.operator = {
                //   ...operator,
                //   cmd: cause?.cmd ?? 0,
                //   action: 'all'
                // }
              }
              BizLogger.info(`[demo] tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
              if (this.sceneStore.joiningRTC) {
                if (this.sceneStore.cameraEduStream.hasVideo) {

                  await this.sceneStore.openCamera(this.videoEncoderConfiguration)
                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after openCamera  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                } else {

                  await this.sceneStore.closeCamera()
                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after closeCamera  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                }
                // if (this.sceneStore._hasMicrophone) {
                if (this.sceneStore.cameraEduStream.hasAudio) {
                  BizLogger.info('open microphone')
                  await this.sceneStore.openMicrophone()

                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} after openMicrophone  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                } else {
                  BizLogger.info('close local-stream-updated microphone')
                  await this.sceneStore.closeMicrophone()
                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after closeMicrophone  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                }
              }
            } else {
              BizLogger.info("reset camera edu stream", JSON.stringify(localStream), localStream && localStream.state)
              this.sceneStore._cameraEduStream = undefined
            }
          }

          if (evt.type === 'screen') {
            if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
              const screenStream = roomManager.getLocalScreenData()
              BizLogger.info("local-stream-updated getLocalScreenData#screenStream ", JSON.stringify(screenStream))
              if (screenStream && screenStream.state !== 0) {
                this.sceneStore._screenEduStream = screenStream.stream
                this.sceneStore.sharing = true
              } else {
                BizLogger.info("local-stream-updated reset screen edu stream", screenStream, screenStream && screenStream.state)
                this.sceneStore._screenEduStream = undefined
                this.sceneStore.sharing = false
              }
            }
          }

          BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated emit done`, evt)
          BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated emit done`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
        })
      })
      // 远端人加入
      roomManager.on('remote-user-added', (evt: any) => {
        runInAction(() => {
          this.sceneStore.userList = roomManager.getFullUserList()
        })
        BizLogger.info("remote-user-added", evt)
      })
      // 远端人更新
      roomManager.on('remote-user-updated', (evt: any) => {
        runInAction(() => {
          this.sceneStore.userList = roomManager.getFullUserList()
        })
        BizLogger.info("remote-user-updated", evt)
      })
      // 远端人移除
      roomManager.on('remote-user-removed', (evt: any) => {
        runInAction(() => {
          this.sceneStore.userList = roomManager.getFullUserList()
        })
        BizLogger.info("remote-user-removed", evt)
      })
      // 远端流加入
      roomManager.on('remote-stream-added', (evt: any) => {
        runInAction(() => {
          this.sceneStore.streamList = roomManager.getFullStreamList()
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
            if (this.sceneStore.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
              this.sceneStore.sharing = true
            } else {
              this.sceneStore.sharing = false
            }
          }
        })
        BizLogger.info("remote-stream-added", evt)
      })
      // 远端流移除
      roomManager.on('remote-stream-removed', (evt: any) => {
        runInAction(() => {
          this.sceneStore.streamList = roomManager.getFullStreamList()
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
            if (this.sceneStore.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
              this.sceneStore.sharing = true
            } else {
              this.sceneStore.sharing = false
            }
          }
        })
        BizLogger.info("remote-stream-removed", evt)
      })
      // 远端流更新
      roomManager.on('remote-stream-updated', (evt: any) => {
        runInAction(() => {
          this.sceneStore.streamList = roomManager.getFullStreamList()
          if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
            if (this.sceneStore.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
              this.sceneStore.sharing = true
            } else {
              this.sceneStore.sharing = false
            }
          }
        })
        BizLogger.info("remote-stream-updated", evt)
      })
      const decodeMsg = (str: string) => {
        try {
          return JSON.parse(str)
        } catch (err) {
          const error = GenericErrorWrapper(err)
          BizLogger.warn(`${error}`)
          return null
        }
      }
      // 教室更新
      roomManager.on('classroom-property-updated', async (evt: any) => {
        console.log('## classroom-property-updated', evt)
        const { classroom, cause, operator } = evt
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {

          let oldRoomProperties = this.roomProperties
          let newRoomProperties = get(classroom, 'roomProperties')
          cause && this.handleCause(operator, { oldRoomProperties, newRoomProperties })

          this.roomProperties = get(classroom, 'roomProperties')
          this.roomProperties = newRoomProperties
          const newClassState = get(classroom, 'roomStatus.courseState')

          const record = get(classroom, 'roomProperties.record')
          if (record) {
            const state = record.state
            if (state === 1) {
              this.sceneStore.recordState = true
            } else {
              if (state === 0 && this.sceneStore.recordState) {
                // this.addChatMessage({
                //   id: 'system',
                //   ts: Date.now(),
                //   text: '',
                //   account: 'system',
                //   link: this.sceneStore.roomUuid,
                //   sender: false
                // })
                this.sceneStore.recordState = false
              }
            }
          }

          // update scene store
          if (newClassState !== undefined && this.sceneStore.classState !== newClassState) {
            this.sceneStore.classState = newClassState
            if (this.sceneStore.classState === 1) {
              this.sceneStore.startTime = get(classroom, 'roomStatus.startTime', 0)
              this.addInterval('timer', () => {
                this.appStore.updateTime(+get(classroom, 'roomStatus.startTime', 0))
              }, ms)
            } else {
              this.sceneStore.startTime = get(classroom, 'roomStatus.startTime', 0)
              BizLogger.info("end time", this.sceneStore.startTime)
              this.delInterval('timer')
            }
          }
          const isStudentChatAllowed = classroom?.roomStatus?.isStudentChatAllowed ?? true
          console.log('## isStudentChatAllowed , ', isStudentChatAllowed, classroom)
          this.sceneStore.canChatting = isStudentChatAllowed
          this.chatIsBanned(isStudentChatAllowed)
        })
      })
      roomManager.on('room-chat-message', (evt: any) => {
        const { textMessage } = evt;
        console.log('### room-chat-message ', evt)
        const message = textMessage as EduTextMessage

        const fromUser = message.fromUser

        const chatMessage = message.message

        this.addChatMessage({
          id: fromUser.userUuid,
          ts: message.timestamp,
          text: chatMessage,
          account: fromUser.userName,
          role: `${this.getRoleEnumValue(fromUser.role)}`,
          isOwn: false
        })
        if (this.appStore.uiStore.chatCollapse) {
          this.incrementUnreadMessageCount()
        }
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
      this.sceneStore._roomManager = roomManager;

      this.appStore._uploadService = new UploadService({
        // prefix: '',
        sdkDomain: this.appStore.params.config.sdkDomain,
        appId: this.appStore.params.config.agoraAppId,
        rtmToken: this.appStore.params.config.rtmToken,
        rtmUid: this.appStore.params.config.rtmUid,
        // region: this.appStore.params.config.region
        // roomUuid: roomManager.roomUuid,
        // userToken: roomManager.userToken,
      })

      this.appStore._uploadService.setRegion(region)

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
      })

      const roomInfo = roomManager.getClassroomInfo()
      this.sceneStore.startTime = +get(roomInfo, 'roomStatus.startTime', 0)

      const mainStream = roomManager.data.streamMap['main']

      // this.sceneStore.classState = roomInfo.roomStatus.courseState

      if (this.sceneStore.classState === 1) {
        this.addInterval('timer', () => {
          this.appStore.updateTime(+get(roomInfo, 'roomStatus.startTime', 0))
        }, ms)
      }
      // this.sceneStore.canChatting = !roomInfo.roomStatus.isStudentChatAllowed

      await this.sceneStore.joinRTC({
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
        // this.appStore.isNotInvisible && this.appStore.uiStore.fireToast(t('toast.publish_business_flow_successfully'))
        this.sceneStore._cameraEduStream = this.roomManager.userService.localStream.stream
        try {
          // await this.sceneStore.prepareCamera()
          // await this.sceneStore.prepareMicrophone()
          if (this.sceneStore._cameraEduStream) {
            if (this.sceneStore._cameraEduStream.hasVideo) {
              this.appStore.sceneStore.setOpeningCamera(true, this.roomInfo.userUuid)
              try {
                await this.sceneStore.openCamera(this.videoEncoderConfiguration)
                this.appStore.sceneStore.setOpeningCamera(false, this.roomInfo.userUuid)
              } catch (err) {
                this.appStore.sceneStore.setOpeningCamera(false, this.roomInfo.userUuid)
                throw err
              }
            } else {
              await this.sceneStore.closeCamera()
            }
            if (this.sceneStore._cameraEduStream.hasAudio) {
              BizLogger.info('open microphone')
              await this.sceneStore.openMicrophone()
            } else {
              BizLogger.info('close microphone')
              await this.sceneStore.closeMicrophone()
            }
          }
        } catch (err) {
          if (this.appStore.isNotInvisible) {
            this.appStore.uiStore.fireToast(
              'toast.media_method_call_failed',
              { reason: `${err.message}` }
            )
          }
          const error = GenericErrorWrapper(err)
          BizLogger.warn(`${error}`)
        }
      }

      const roomProperties = roomManager.getClassroomInfo().roomProperties as any

      //@ts-ignore
      this.roomProperties = roomProperties

      this.sceneStore.userList = roomManager.getFullUserList()
      this.sceneStore.streamList = roomManager.getFullStreamList()
      if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
        if (this.sceneStore.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
          this.sceneStore.sharing = true
        } else {
          this.sceneStore.sharing = false
        }
      }
      this.joined = true
      this.roomJoined = true
    } catch (err) {
      this.eduManager.removeAllListeners()
      this.appStore.uiStore.stopLoading()
      try {
        await this.appStore.destroy()
      } catch (err) {
        EduLogger.info(" appStore.destroyRoom ", err.message)
      }
      const error = GenericErrorWrapper(err)
      reportService.reportElapse('joinRoom', 'end', { result: false, errCode: `${error.message}` })
      // TODO 需要把Dialog UI和业务解耦，提供事件即可
      this.appStore.uiStore.fireDialog('generic-error-dialog', {
        error
      })
      // this.appStore.uiStore.addDialog(GenericErrorDialog, {error})
      throw error
    }
  }

  // TODO 需要把Dialog UI和业务解耦，提供事件即可
  async onClassStateChanged(state: EduClassroomStateEnum) {
    if (state === EduClassroomStateEnum.close) {
      try {
        await this.appStore.releaseRoom()
      } catch (err) {
        EduLogger.info("appStore.destroyRoom failed: ", err.message)
      }
      this.appStore.uiStore.fireDialog('room-end-notice', {
        state
      })
      // this.appStore.uiStore.addDialog(RoomEndNotice)
    } else if (state === EduClassroomStateEnum.end) {
      this.appStore.uiStore.fireToast('toast.class_is_end',{
        reason: this.classroomSchedule ? this.classroomSchedule.closeDelay*1000 - this.classTimeDuration : 0
      });
    }
  }

  @computed
  get isAssistant() {
    if (this.appStore.roomInfo.userRole === EduRoleTypeEnum.assistant) {
      return true
    }
    return false
  }

  @action.bound
  getRewardByUid(uid: string): number {
    return get(this.studentsReward, `${uid}.reward`, 0)
  }

  @action.bound
  async leave() {
    try {
      this.sceneStore.joiningRTC = false
      try {
        await this.sceneStore.leaveRtc()
      } catch (err) {
        BizLogger.error(`${err}`)
      }
      try {
        await this.appStore.boardStore.leave()
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
      // this.appStore.uiStore.fireToast(t('toast.successfully_left_the_business_channel'))
      this.delInterval('timer')
      this.reset()
      this.appStore.uiStore.updateCurSeqId(0)
      this.appStore.uiStore.updateLastSeqId(0)
    } catch (err) {
      this.reset()
      const error = GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
    }
  }

  // TODO 需要把Dialog UI和业务解耦，提供事件即可
  noticeQuitRoomWith(quickType: QuickTypeEnum) {
    switch (quickType) {
      case QuickTypeEnum.Kick: {
        this.appStore.uiStore.fireDialog('kick-end')
        // this.appStore.uiStore.addDialog(KickEnd)
        break;
      }
      case QuickTypeEnum.End: {
        this.appStore.uiStore.fireDialog('room-end-notice')
        // this.appStore.uiStore.addDialog(RoomEndNotice)
        break;
      }
      case QuickTypeEnum.Kicked: {
        this.appStore.uiStore.fireDialog('kicked-end')
        // this.appStore.uiStore.addDialog(KickedEnd)
        break;
      }
    }
  }

  async endRoom() {
    await eduSDKApi.updateClassState({
      roomUuid: this.roomInfo.roomUuid,
      state: 2
    })
    await this.appStore.releaseRoom()
    this.noticeQuitRoomWith(QuickTypeEnum.End)
  }

  @computed
  get signalLevel(): number {
    const best = ['good', 'excellent']
    if (best.includes(this.appStore.mediaStore.networkQuality)) {
      return 3
    }

    const qualities = ['poor', 'bad']
    if (qualities.includes(this.appStore.mediaStore.networkQuality)) {
      return 2
    }

    const level1Qualities = ['very bad', 'down']
    if (level1Qualities.includes(this.appStore.mediaStore.networkQuality)) {
      return 1
    }

    return 0
  }

  // formatTimeCountdown(milliseconds: number, mode: TimeFormatType):string {
  //   let seconds = Math.floor(milliseconds / 1000)
  //   let duration = dayjs.duration(milliseconds);
  //   let formatItems:string[] = []

  //   let hours_text = duration.hours() === 0 ? '' : `HH [${transI18n('nav.hours')}]`;
  //   let mins_text = duration.minutes() === 0 ? '' : `mm [${transI18n('nav.minutes')}]`;
  //   let seconds_text = duration.seconds() === 0 ? '' : `ss [${transI18n('nav.seconds')}]`;
  //   let short_hours_text = `HH [${transI18n('nav.short.hours')}]`;
  //   let short_mins_text = `mm [${transI18n('nav.short.minutes')}]`;
  //   let short_seconds_text = `ss [${transI18n('nav.short.seconds')}]`;
  //   if(mode === TimeFormatType.Timeboard) {
  //     // always display all time segment
  //     if(seconds < 60 * 60) {
  //       // less than a min
  //       formatItems = [short_mins_text, short_seconds_text]
  //     } else {
  //       formatItems = [short_hours_text, short_mins_text, short_seconds_text]
  //     }
  //   } else {
  //     // do not display time segment if it's 0
  //     if(seconds < 60) {
  //       // less than a min
  //       formatItems = [seconds_text]
  //     } else if (seconds < 60 * 60) {
  //       [mins_text, seconds_text].forEach(item => item && formatItems.push(item))
  //     } else {
  //       [hours_text, mins_text, seconds_text].forEach(item => item && formatItems.push(item))
  //     }
  //   }
  //   return duration.format(formatItems.join(' '))
  // }

  @computed
  get navigationState() {
    return {
      cpuUsage: this.appStore.mediaStore.cpuUsage,
      isStarted: !!this.sceneStore.classState,
      title: this.sceneStore.roomInfo.roomName,
      signalQuality: this.appStore.mediaStore.networkQuality as any,
      networkLatency: +this.appStore.mediaStore.delay,
      networkQuality: this.appStore.mediaStore.networkQuality,
      packetLostRate: this.appStore.mediaStore.localPacketLostRate,
      // classTimeText: this.classTimeText,
      isNative: this.appStore.isElectron,
    }
  }

  handleCause(operator: unknown, { oldRoomProperties, newRoomProperties }: { oldRoomProperties: any, newRoomProperties: any }) {
    const actionOperator = operator as CauseOperator
    const { cmd, data } = actionOperator
    console.log('[hands-up] ###### ', JSON.stringify({ cmd, data }))
    if (cmd === 501) {
      const process = data.processUuid
      if (process === 'handsUp') {
        switch (data.actionType) {
          case CoVideoActionType.studentHandsUp: {
            if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole)) {
              this.appStore.uiStore.fireToast("co_video.received_student_hands_up")
            }
            console.log('学生举手')
            break;
          }
          // case CoVideoActionType.teacherAccept: {
          //   if (data.addAccepted) {
          //     const exists = data.addAccepted.find((it: any) => it.userUuid === this.roomInfo.userUuid)
          //     if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
          //       exists && this.appStore.uiStore.fireToast(transI18n('co_video.teacher_accept_co_video'))
          //     }
          //   }
          //   break;
          // }
          case CoVideoActionType.teacherRefuse: {
            if ([EduRoleTypeEnum.student].includes(this.roomInfo.userRole)) {
              const includedRemoveProgress: ProgressUserInfo[] = data?.removeProgress ?? []
              if (includedRemoveProgress.find((it) => it.userUuid === this.roomInfo.userUuid)) {
                this.appStore.uiStore.fireToast("co_video.received_teacher_refused")
              }
            }
            console.log('老师拒绝')
            break;
          }
          case CoVideoActionType.studentCancel: {
            if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.roomInfo.userRole)) {
              this.appStore.uiStore.fireToast("co_video.received_student_cancel")
            }
            console.log('学生取消')
            break;
          }
          // case CoVideoActionType.teacherReplayTimeout: {
          //   this.appStore.uiStore.fireToast(transI18n("co_video.received_message_timeout"), 'error')
          //   console.log('超时')
          //   break;
          // }
        }
      }
    } else if (cmd === 7) {
      // extApp
      // emit events for app plugins
      const { extAppCause } = data
      this.appStore.uiStore.activeAppPlugins.forEach(appPlugin => {
        let oldProps = get(oldRoomProperties, `extApps.${escapeExtAppIdentifier(appPlugin.appIdentifier)}`)
        let newProps = get(newRoomProperties, `extApps.${escapeExtAppIdentifier(appPlugin.appIdentifier)}`)
        if (oldProps !== newProps) {
          appPlugin.extAppRoomPropertiesDidUpdate(newProps, extAppCause)
        }
      })
    } else if (cmd === 600) {
      this.appStore.uiStore.fireToast("private_media_chat.chat_started")
      if (this.appStore.eduManager.streamCoordinator) {
        const streamGroups = newRoomProperties.streamGroups
        let groupKey = Object.keys(streamGroups).find(groupKey => streamGroups[groupKey] !== 'deleted')
        let group = groupKey ? streamGroups[groupKey] : null
        if (group) {
          let { streams, users } = group
          let localUser = this.sceneStore.localUser

          users.map((user: { userUuid: string }) => user.userUuid)

          let includeVideoStreams: string[] = []
          let includeAudioStreams: string[] = []
          let excludeVideoStreams: string[] = []
          let excludeAudioStreams: string[] = []

          if (users.includes(localUser.userUuid)) {
            // i'm in private chat
            streams.forEach(({ streamUuid, audio, video }: { streamUuid: string, audio: boolean, video: boolean }) => {
              if (audio) {
                // audio is private
                includeAudioStreams.push(streamUuid)
              }
              if (video) {
                includeVideoStreams.push(streamUuid)
              }
            })
          } else {
            // i'm not in private chat
            streams.forEach(({ streamUuid, audio, video }: { streamUuid: string, audio: boolean, video: boolean }) => {
              if (audio) {
                // audio is private
                excludeAudioStreams.push(streamUuid)
              }
              if (video) {
                excludeVideoStreams.push(streamUuid)
              }
            })
          }

          let options: StreamSubscribeOptions = {
            includeAudioStreams: (includeAudioStreams.length > 0) ? includeAudioStreams : undefined,
            includeVideoStreams: (includeVideoStreams.length > 0) ? includeVideoStreams : undefined,
            excludeAudioStreams: (excludeAudioStreams.length > 0) ? excludeAudioStreams : undefined,
            excludeVideoStreams: (excludeVideoStreams.length > 0) ? excludeVideoStreams : undefined
          };
          this.appStore.eduManager.streamCoordinator.updateSubscribeOptions(options)
        }
      }
    } else if (cmd === 601) {
      this.appStore.uiStore.fireToast("private_media_chat.chat_ended")
      if (this.appStore.eduManager.streamCoordinator) {
        this.appStore.eduManager.streamCoordinator.updateSubscribeOptions({
          includeAudioStreams: undefined,
          includeVideoStreams: undefined,
          excludeAudioStreams: undefined,
          excludeVideoStreams: undefined
        })
      }
    }
  }
}