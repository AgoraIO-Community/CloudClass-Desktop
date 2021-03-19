import {
  EduLogger,
  UserRenderer,
  EduAudioSourceType,
  EduTextMessage,
  EduSceneType,
  EduRoleTypeEnum,
  GenericErrorWrapper,
  EduUser,
  EduStream,
  EduRoleType,
  EduVideoSourceType,
} from 'agora-rte-sdk';
import { eduSDKApi } from '@/services/edu-sdk-api';
import uuidv4 from 'uuid/v4';
import { SimpleInterval } from '@/stores/mixin/simple-interval';
import { EduBoardService } from '@/modules/board/edu-board-service';
import { EduRecordService } from '@/modules/record/edu-record-service';
import { RoomApi } from '@/services/room-api';
import { AppStore } from '@/stores/app/index';
import { observable, computed, action, runInAction, reaction, IReactionDisposer } from 'mobx';
import { t } from '@/i18n';
import { BizLogger } from '@/utils/utils';
import { get } from 'lodash';
import { EduClassroomStateEnum } from '@/stores/app/scene';
import { UploadService } from '@/services/upload-service';
import { reportService } from '@/services/report-service';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import { QuickTypeEnum, ChatMessage} from '@/types';
import { filterChatText } from '@/utils/utils';
import { Button, Modal, Toast } from 'agora-scenario-ui-kit';

dayjs.extend(duration)

type ProcessType = {
  reward: number,
}

enum TimeFormatType {
  Timeboard,
  Message
}

type AcadsocRoomProperties = {
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

export enum acadsocRoomPropertiesChangeCause {
  studentRewardStateChanged = 1101, // 单个人的奖励发生
}

const delay = 2000

const ms = 500

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
  hideControl: boolean
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
  roomProperties: AcadsocRoomProperties = {
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

  @observable
  unreadMessageCount: number = 0

  @observable
  messages: any[] = []

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
    return get(this.roomProperties, 'reward', {room: 0, config: {roomLimit: 0}})
  }

  @computed
  get classTimeText() {
    let timeText = ""
    const duration = this.classTimeDuration
    const placeholder = `-- ${t('nav.short.minutes')} -- ${t('nav.short.seconds')}`

    // duration is always >= 0, if it's smaller than 0, display placeholder
    if(duration < 0) {
      timeText = `${t('nav.to_start_in')}${placeholder}`
      return timeText
    }

    switch(this.sceneStore.classState){
      case EduClassroomStateEnum.beforeStart: 
        timeText = `${t('nav.to_start_in')}${this.formatTimeCountdown(duration, TimeFormatType.Timeboard)}`
        break;
      case EduClassroomStateEnum.start:
      case EduClassroomStateEnum.end:
        timeText = `${t('nav.started_elapse')}${this.formatTimeCountdown(duration, TimeFormatType.Timeboard)}`
        break;
    }
    return timeText
  }

  @computed
  get classTimeDuration():number {
    let duration = -1
    if(this.classroomSchedule){
      switch(this.sceneStore.classState){
        case EduClassroomStateEnum.beforeStart: 
          duration = Math.max(this.classroomSchedule.startTime - this.calibratedTime, 0)
          break;
        case EduClassroomStateEnum.start:
        case EduClassroomStateEnum.end:
          duration = Math.max(this.calibratedTime - this.classroomSchedule.startTime, 0)
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
  showTrophyAnimation: boolean = false

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

  @observable
  minimizeView: MinimizeType[] = [
    {
      id: 'teacher'+Math.ceil(Math.random()*10),
      type: 'teacher',
      content: '',
      isHidden: false,
      animation: '',
      zIndex: 0,
      height: 194,
    },
    {
      id: 'student'+Math.ceil(Math.random()*10),
      type: 'student',
      content: '',
      isHidden: false,
      animation: '',
      zIndex: 0,
      height: 194,
    },
    {
      id: 'chat'+Math.ceil(Math.random()*10),
      type: 'chat',
      content: 'Chat',
      isHidden: false,
      animation: '',
      zIndex: 0,
      height: 212,
    },
  ]

  roomApi!: RoomApi;
  disposers: IReactionDisposer[] = [];
  appStore!: AppStore;

  get sceneStore() {
    return this.appStore.sceneStore
  }

  constructor(appStore: AppStore) {
    super()
    this.appStore = appStore
  }

  @action
  reset() {
    this.appStore.resetStates()
    this.sceneStore.reset()
    this.resetRoomProperties()
    this.roomChatMessages = []
    this.unreadMessageCount = 0
    this.messages = []
    this.joined = false
    this.roomJoined = false
    this.time = 0
    this.classroomSchedule = undefined
    this.disposers.forEach(disposer => disposer())
    clearTimeout(this.timer)
  }

  @action
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


  @action
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
        if (sensitiveWords.length) {
          this.appStore.uiStore.addToast(t('toast.warning_sensitive_words'))
        }
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
      Toast.show({
        type: 'error',
        text: t('toast.failed_to_send_chat'),
        duration: 1.5,
      })
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
  
  @action setMessageList(messageList: ChatMessage[]) {
    this.roomChatMessages = messageList
  }
  @action
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
        const text = filterChatText(this.roomInfo.userRole, {
          fromUser: item.fromUser,
          message: item.message,
          sensitiveWords: get(item, 'sensitiveWords', [])
        } as any)
        this.roomChatMessages.unshift({
          text: text,
          ts:item.sendTime,
          id:item.sequences,
          fromRoomUuid:item.fromUser.userUuid,
          userName:item.fromUser.userName,
          role:item.fromUser.role,
          sender: item.fromUser.userUuid === this.roomInfo.userUuid,
          account:item.fromUser.userUuid
        } as ChatMessage)
        
      })
      return historyMessage
    } catch (err) {
      // this.appStore.uiStore.addToast(t('toast.failed_to_send_chat'))
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  @action 
  async getTranslationContent(content: string) {
    try {
      return await eduSDKApi.translateChat({
        content: content,
        from: 'auto',
        to: 'auto',
        // this.appStore.params.translateLanguage
      })
    } catch (err) {
      Toast.show({
        type: 'error',
        text: t('toast.failed_to_translate_chat'),
        duration: 1.5,
      })
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }
  
  // 奖杯
  @action
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
      Toast.show({
        type: 'error',
        text: t('toast.failed_to_send_reward'),
        duration: 1.5,
      })
      const error = GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  @action
  tickClassroom() {
    // update time
    this.time = dayjs().valueOf()
    this.checkClassroomNotification()
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {this.tickClassroom()}, 1000)
  }

  @action
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
        Toast.show({
          type: 'error',
          text: t('toast.chat_disable'),
          duration: 1.5,
        })
      } else {
        Toast.show({
          type: 'error',
          text: t('toast.chat_enable'),
          duration: 1.5,
        })
      }
    } 
    this.isStudentChatAllowed = isStudentChatAllowed
  }

  async checkClassroomNotification() {
    if(this.classroomSchedule) {
      let duration = this.classTimeDuration
      let durationToEnd = this.classroomSchedule.duration * 1000 - this.classTimeDuration
      let durationToClose = this.classroomSchedule.duration * 1000 + this.classroomSchedule.closeDelay * 1000 - this.classTimeDuration

      switch(this.sceneStore.classState){
        case EduClassroomStateEnum.beforeStart:
          [5, 3, 1].forEach(min => {
            let dDuration = dayjs.duration(duration)
            if(dDuration.minutes() === min && dDuration.seconds() === 0) {
              Toast.show({
                type: 'error',
                text: t('toast.time_interval_between_start', {reason: this.formatTimeCountdown(duration, TimeFormatType.Message)}),
                duration: 1.5,
              })
            }
          })
          break;
        case EduClassroomStateEnum.start:
          [5, 1].forEach(min => {
            let dDurationToEnd = dayjs.duration(durationToEnd)
            if(dDurationToEnd.minutes() === min && dDurationToEnd.seconds() === 0) {
              Toast.show({
                type: 'error',
                text: t('toast.time_interval_between_end', {reason: this.formatTimeCountdown(durationToEnd, TimeFormatType.Message)}),
                duration: 1.5,
              })
            }
          })
          break;
        case EduClassroomStateEnum.end:
          let dDurationToClose = dayjs.duration(durationToClose)
          if(dDurationToClose.minutes() === 1 && dDurationToClose.seconds() === 0) {
            Toast.show({
              type: 'error',
              text: t('toast.time_interval_between_close', {reason: this.formatTimeCountdown(durationToClose, TimeFormatType.Message)}),
              duration: 1.5,
            })
          }
          if(durationToClose < 0) {
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
  @action 
  resetUnreadMessageCount(){
    this.unreadMessageCount = 0
  }

  @computed
  get delay(): string {
    return `${this.appStore.mediaStore.delay}`
  }

  isBigClassStudent(): boolean {
    const userRole = this.roomInfo.userRole
    return +this.roomInfo.roomType === 2 && userRole === EduRoleTypeEnum.student
  }
  

  updateRewardInfo() {
    
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

  joinRoom() {
    
  }

  @computed
  get videoEncoderConfiguration() {
    return this.appStore.sceneStore.videoEncoderConfiguration
  }

  @action
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
      
      let checkInResult = await eduSDKApi.checkIn({
        roomUuid,
        roomName: `${this.roomInfo.roomName}`,
        roomType: +this.roomInfo.roomType as number,
        userUuid: this.roomInfo.userUuid,
        role: this.roomInfo.userRole,
        startTime: startTime,  // 单位：毫秒
        duration: duration,    // 秒
      })
      EduLogger.info("## classroom ##: checkIn:  ", JSON.stringify(checkInResult))
      this.timeShift = checkInResult.ts - dayjs().valueOf()
      this.classroomSchedule = {
        startTime: checkInResult.startTime,
        duration: checkInResult.duration,
        closeDelay: checkInResult.closeDelay
      }
      this.tickClassroom()

      this.sceneStore.isMuted = checkInResult.muteChat
      this.sceneStore.recordState = !!checkInResult.isRecording
      this.sceneStore.classState = checkInResult.state
      this.appStore.boardStore.aClassInit({
        boardId: checkInResult.board.boardId,
        boardToken: checkInResult.board.boardToken,
      }).catch((err) => {
        const error = GenericErrorWrapper(err)
        BizLogger.warn(`${error}`)
        this.appStore.isNotInvisible && Toast.show({
          type: 'error',
          text: t('toast.failed_to_join_board'),
          duration: 1.5,
        })
      })
      this.appStore.uiStore.stopLoading()

      // logout will clean up eduManager events, so we need to put the listener here
      this.eduManager.on('ConnectionStateChanged', async ({newState, reason}) => {
        if (newState === "ABORTED" && reason === "REMOTE_LOGIN") {
          await this.appStore.releaseRoom()
          this.appStore.uiStore.addToast(t('toast.classroom_remote_join'))
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
        BizLogger.info("local-user-updated", evt)
      })
      // 本地流移除
      roomManager.on('local-stream-removed', async (evt: any) => {
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
      // 本地流加入
      // roomManager.on('local-stream-added', (evt: any) => {
      //   this.streamList = roomManager.getFullStreamList()
      //   BizLogger.info("local-stream-added", evt)
      // })
      // 本地流更新
      roomManager.on('local-stream-updated', async (evt: any) => {
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
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
            if (localStream && localStream.state !== 0) {
              BizLogger.info(`[demo] local-stream-updated tag: ${tag}, time: ${Date.now()} local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC)
              this.sceneStore._cameraEduStream = localStream.stream
              // await this.sceneStore.prepareCamera()
              // await this.sceneStore.prepareMicrophone()
              BizLogger.info(`[demo] tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
              if (this.sceneStore.joiningRTC) {
                // if (this.sceneStore._hasCamera) {
                if (this.sceneStore.cameraEduStream.hasVideo) {
                  await this.sceneStore.openCamera(this.videoEncoderConfiguration)
                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after openCamera  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                } else {
                  await this.sceneStore.closeCamera()
                  BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after closeCamera  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                }
                // }
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
                // }
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
        } catch(err) {
          const error = GenericErrorWrapper(err)
          BizLogger.warn(`${error}`)
          return null
        }
      }
      // this.eduManager.on('user-message', async (evt: any) => {
      // })
      // 教室更新
      roomManager.on('classroom-property-updated', async (classroom: any, cause: any) => {
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
          this.roomProperties = get(classroom, 'roomProperties')
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
                // this.sceneStore.recordId = ''
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
              BizLogger.info("end timeer", this.sceneStore.startTime)
              this.delInterval('timer')
            }
          }
          this.sceneStore.isMuted = !classroom.roomStatus.isStudentChatAllowed
          // acadsoc
          const isStudentChatAllowed = classroom.roomStatus.isStudentChatAllowed
          this.chatIsBanned(isStudentChatAllowed)
          this.showTrophyAnimation = cause && cause.cmd === acadsocRoomPropertiesChangeCause.studentRewardStateChanged
        })
      })
      roomManager.on('room-chat-message', (evt: any) => {
        const {textMessage} = evt;
        const message = textMessage as EduTextMessage

        const fromUser = message.fromUser

        const chatMessage = filterChatText(this.roomInfo.userRole, message)
        
        this.addChatMessage({
          id: fromUser.userUuid,
          ts: message.timestamp,
          text: chatMessage,
          account: fromUser.userName,
          sender: false
        })
        console.log(' room-chat-message ', JSON.stringify(evt))
         const minimizeView = this.minimizeView.find((item) => item.type === 'chat' )
        if (minimizeView?.isHidden) { this.unreadMessageCount = this.unreadMessageCount + 1 }
        else {
          this.unreadMessageCount = 0
        }
        BizLogger.info('room-chat-message', evt)
      })
      const userRole = EduRoleTypeEnum[this.roomInfo.userRole]
      const { sceneType } = this.getStudentConfig()
      await roomManager.join({
        userRole: EduRoleType[userRole],
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
        // roomUuid: roomManager.roomUuid,
        // userToken: roomManager.userToken,
      })

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
      // this.sceneStore.isMuted = !roomInfo.roomStatus.isStudentChatAllowed
  
      await this.sceneStore.joinRTC({
        uid: +mainStream.streamUuid,
        channel: roomInfo.roomInfo.roomUuid,
        token: mainStream.rtcToken
      })
  
      const localStreamData = roomManager.data.localStreamData

      const canPublishRTC = (localStreamData: any): boolean => {
        const canPublishRTCRoles = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.student]
        if (canPublishRTCRoles.includes(this.roomInfo.userRole)) {
          return true
        }
        return false
      }
  
      if (canPublishRTC(localStreamData)) {
  
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
        // this.appStore.isNotInvisible && this.appStore.uiStore.addToast(t('toast.publish_business_flow_successfully'))
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
            Toast.show({
              text: (t('toast.media_method_call_failed') + `: ${err.message}`),
              type: 'error',
              duration: 1.5
            })
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
      // this.appStore.uiStore.stopLoading()
      this.joined = true
      this.roomJoined = true
    } catch (err) {
      this.eduManager.removeAllListeners()
      this.appStore.uiStore.stopLoading()
      throw GenericErrorWrapper(err)
    }
  }

  async onClassStateChanged(state: EduClassroomStateEnum) {
    if(state === EduClassroomStateEnum.close) {
      try {
        await this.appStore.releaseRoom()
      } catch (err) {
        EduLogger.info("appStore.destroyRoom failed: ", err.message)
      }
      Modal.show({
        title: t(`error.class_end`),
        footer: [
          <Button type="ghost" action='ok'>{t('aclass.confirm.yes')}</Button>,
          <Button type="primary" action='cancel'>{t('aclass.confirm.no')}</Button>
        ],
        onOk: async () => {
          await this.appStore.destroyRoom()
        },
        onCancel: () => {
        }
      })
    } else if(state === EduClassroomStateEnum.end) {
      const text = t('toast.class_is_end', {reason: this.formatTimeCountdown((this.classroomSchedule?.closeDelay || 0) * 1000, TimeFormatType.Message)})
      Toast.show({
        type: 'error',
        text: text,
        duration: 1.5
      })
    }
  }

  @computed
  get isAssistant() {
    if (this.appStore.roomInfo.userRole === EduRoleTypeEnum.assistant) {
      return true
    }
    return false
  }

  @action
  getRewardByUid(uid: string): number {
    return get(this.studentsReward, `${uid}.reward`, 0)
  }
  
  @action
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
      // this.appStore.uiStore.addToast(t('toast.successfully_left_the_business_channel'))
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

  noticeQuitRoomWith(quickType: QuickTypeEnum) {
    switch(quickType) {
      case QuickTypeEnum.Kick: {
        Modal.show({
          title: t(`aclass.notice`),
          children: t(`toast.kick`),
          footer: [
            <Button type="ghost" action='ok'>{t('aclass.confirm.yes')}</Button>,
            <Button type="primary" action='cancel'>{t('aclass.confirm.no')}</Button>
          ],
          onOk: async () => {
            await this.appStore.destroyRoom()
          }
        })
        break;
      }
      case QuickTypeEnum.End: {
        // Modal.confirm({
        //   title: t(`aclass.class_end`),
        //   text: t(`aclass.leave_room`),
        //   showConfirm: true,
        //   showCancel: true,
        //   confirmText: t('aclass.confirm.yes'),
        //   visible: true,
        //   cancelText: t('aclass.confirm.no'),
        //   onConfirm: async () => {
        //     await this.appStore.destroyRoom()
        //   },
        //   onClose: () => {
        //   }
        // })
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

    const level1Qualities = ['very bad','down']
    if (level1Qualities.includes(this.appStore.mediaStore.networkQuality)) {
      return 1
    }

    return 0
  }

  formatTimeCountdown(milliseconds: number, mode: TimeFormatType):string {
    let seconds = Math.floor(milliseconds / 1000)
    let duration = dayjs.duration(milliseconds);
    let formatItems:string[] = []

    let hours_text = duration.hours() === 0 ? '' : `HH [${t('nav.hours')}]`;
    let mins_text = duration.minutes() === 0 ? '' : `mm [${t('nav.minutes')}]`;
    let seconds_text = duration.seconds() === 0 ? '' : `ss [${t('nav.seconds')}]`;
    let short_hours_text = `HH [${t('nav.short.hours')}]`;
    let short_mins_text = `mm [${t('nav.short.minutes')}]`;
    let short_seconds_text = `ss [${t('nav.short.seconds')}]`;
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
}