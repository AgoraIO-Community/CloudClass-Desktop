import { dialogManager } from 'agora-aclass-ui-kit';
import {
  EduLogger,
  PeerInviteEnum,
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
import { SimpleInterval } from '../mixin/simple-interval';
import { EduBoardService } from '@/modules/board/edu-board-service';
import { EduRecordService } from '@/modules/record/edu-record-service';
import { RoomApi } from '../../services/room-api';
import { AppStore } from '@/stores/app/index';
import { observable, computed, action, runInAction } from 'mobx';
import { ChatMessage } from '@/utils/types';
import { t } from '@/i18n';
import { DialogType } from '@/components/dialog';
import { BizLogger } from '@/utils/biz-logger';
import { get } from 'lodash';
import {EduClassroomStateEnum} from '@/stores/app/scene';
import { UploadService } from '@/services/upload-service';
import { reportService } from '@/services/report-service';

export enum EduClassroomCountdownEnum {
  first = 5,
  second = 3,
  third = 1,
}

type ProcessType = {
  reward: number,
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
  students: Record<string, ProcessType>,
}

type MinimizeType = Array<{
  id: string,
  type: string,
  content: string,
  isHidden: boolean,
  animation: string,
  zIndex: number,
}>

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
  showControls: boolean
}

export class AcadsocRoomStore extends SimpleInterval {

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
  notice?: any = undefined

  @observable
  classState: number = 0

  @observable
  timeShift: number = 0

  @observable
  startTime: number = 0   // 课程开始时间

  @observable
  duration: number = 0   // 课程持续时间

  @observable
  closeDelay: number = 0  // 教室延长关闭时间

  @observable
  timeToStart: number = 0   // 距离开始还剩时间

  @observable
  startedTime: number = 0   // 已经开始了多长时间

  @observable
  studentsReward: Record<string, number> = {}

  @observable
  showTranslate: boolean = false

  @observable
  disableTrophy: boolean = false

  @observable
  translateText?: string = ''

  @observable
  minutes: number = 0

  @observable
  seconds: number = 0

  @observable
  classTime: number = 0

  @observable
  classTimeText: string = ''

  @observable
  timer: any = null

  @observable
  additionalState: number = 0

  @observable
  showTrophyAnimation: boolean = false

  @observable
  trophyNumber: number = 0

  @observable
  unwind: MinimizeType = []  // 最小化

  @observable
  isBespread: boolean = true  // 是否铺满

  @observable
  isRed: boolean = false  // 是否变红

  @observable
  minimizeView: MinimizeType = [
    {
      id: 'teacher'+Math.ceil(Math.random()*10),
      type: 'teacher',
      content: '',
      isHidden: false,
      animation: '',
      zIndex: 0,
    },
    {
      id: 'student'+Math.ceil(Math.random()*10),
      type: 'student',
      content: '',
      isHidden: false,
      animation: '',
      zIndex: 0,
    },
    {
      id: 'chat'+Math.ceil(Math.random()*10),
      type: 'chat',
      content: 'Chat',
      isHidden: false,
      animation: '',
      zIndex: 0,
    },
  ]

  roomApi!: RoomApi;

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
    this.roomChatMessages = []
    this.unreadMessageCount = 0
    this.messages = []
    this.joined = false
    this.roomJoined = false
    this.time = 0
    this.notice = undefined
    this.minutes = 0
    this.seconds = 0
    this.timeToStart = 0
    this.startedTime = 0
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
      await eduSDKApi.sendChat({
        roomUuid: this.roomInfo.roomUuid,
        userUuid: this.roomInfo.userUuid,
        data: {
          message,
          type: 1,
        }
      })
      // await this.roomManager?.userService.sendRoomChatMessage(message)
      return {
        id: this.userUuid,
        ts,
        text: message,
        account: this.roomInfo.userName,
        sender: true,
        fromRoomName: this.roomInfo.userName,
      }
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_send_chat'))
      const error = new GenericErrorWrapper(err)
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
        this.roomChatMessages.unshift({
          text:item.message,
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
      const error = new GenericErrorWrapper(err)
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
      this.appStore.uiStore.addToast(t('toast.failed_to_translate_chat'))
      const error = new GenericErrorWrapper(err)
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
      this.appStore.uiStore.addToast(t('toast.failed_to_send_reward'))
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  @action
  showTimerToast(time: number) {
    if(this.sceneStore.classState === EduClassroomStateEnum.beforeStart) {
      this.appStore.uiStore.addToast(t('toast.time_interval_between_start', {reason: time}))
    }
    if(this.sceneStore.classState === EduClassroomStateEnum.start) {
      this.appStore.uiStore.addToast(t('toast.time_interval_between_end', {reason: time}))
    }
  }

  @action
  getTimer(time: number, step: number) {
    this.timer && clearTimeout(this.timer)
    this.timer = setInterval(async() => {
      if(this.minutes === this.secondsToMinutes(this.duration + this.closeDelay).minutes && step === 1) {
        await this.appStore.releaseRoom()
        this.appStore.isNotInvisible && dialogManager.confirm({
          title: t(`aclass.class_end`),
          text: t(`aclass.leave_room`),
          showConfirm: true,
          showCancel: true,
          confirmText: t('aclass.confirm.yes'),
          visible: true,
          cancelText: t('aclass.confirm.no'),
          onConfirm: () => {
            this.history.push('/')
          },
          onCancel: () => {
          }
        })
        clearTimeout(this.timer)
        return
      } else if(this.minutes === 0 && this.seconds === 1 && step === -1) {
        this.seconds = 0
        clearTimeout(this.timer)
        return
      } else {
        time += step
        this.seconds += step
      }
      // 正在上课 正计时
      if(step === 1 && time >= 59) {
        this.minutes += step
        // 课程未结束
        let classIsStart:number = this.secondsToMinutes(this.duration).minutes
        if(this.minutes === (classIsStart - 5)) {
          this.appStore.uiStore.addToast(t('toast.time_interval_between_end', {reason: 5}))
        }
        if(this.minutes === (classIsStart - 1)) {
          this.appStore.uiStore.addToast(t('toast.time_interval_between_end', {reason: 1}))
        }
        // 课程结束
        if(this.minutes === classIsStart) {
          this.appStore.uiStore.addToast(t('toast.class_is_end', {reason: this.secondsToMinutes(this.closeDelay).minutes}))
        }
        // 课程结束 教室未关闭提示
        let classIsEnd:number = this.secondsToMinutes(this.duration + this.closeDelay).minutes
        if(this.minutes === (classIsEnd - 1)) {
          this.appStore.uiStore.addToast(t('toast.time_interval_between_close', {reason: 1}))
        }
        this.seconds = 0 
        this.getTimer(-1, step)
      }
      // 倒计时
      if(step === -1 && time <= 0) {
        this.minutes += step
        if([1, 3, 5].includes(this.minutes)) {
          this.appStore.uiStore.addToast(t('toast.time_interval_between_start', {reason: this.minutes}))
        }
        this.seconds = 59
        this.getTimer(60, step)
      }
    }, 1000)
  }

  @computed
  get roomInfo() {
    return this.appStore.roomInfo
  }
  @action 
  resetUnreadMessageCount(){
    this.unreadMessageCount = 0
  }
  @action
  timeCalibration(time: number) {
    // 误差小于一秒 忽略
    if((this.timeShift / 1000) < 1) {
      return 0
    } else {
      return time - new Date().getTime()
    }
  }

  // ms 转分秒 首次获取时间
  @action
  msToMinutes(time: number) {
    return {
      minutes: parseInt(String(time / (60 * 1000))),
      seconds: parseInt(String((time % (60 * 1000)) / 1000))
    }
  }

  @action
  secondsToMinutes(time: number) {
    return {
      minutes: parseInt(String(time / 60)),
      seconds: parseInt(String(time % 60))
    }
  }  

  @action
  getStartedTime() {
    this.startedTime = new Date().getTime() - this.startTime + this.timeShift
  }

  @computed
  get shiftClassTime(): string {
    let minutes:any = this.minutes < 10? '0'+this.minutes : this.minutes
    let seconds:any = this.seconds < 10? '0'+this.seconds : this.seconds
    if(isNaN(minutes) || isNaN(seconds)) {
      minutes = 0
      seconds = 0
    }
    return minutes + t('nav.minutes') + seconds + t('nav.seconds')
  }

  @computed
  get delay(): string {
    return `${this.appStore.mediaStore.delay}`
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

  joinRoom() {
    
  }

  @action
  async join() {
    try {
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
      console.log('***** checkInResult', checkInResult)
      EduLogger.info("## classroom ##: checkIn:  ", JSON.stringify(checkInResult))
      this.additionalState = checkInResult.state
      this.timeShift = this.timeCalibration(checkInResult.ts)
      this.startTime = checkInResult.startTime
      this.duration = checkInResult.duration
      this.closeDelay = checkInResult.closeDelay
      // 课程开始之前
      if(checkInResult.state === EduClassroomStateEnum.beforeStart) {
        this.classTimeText = t('nav.class_time_text')
        this.timeToStart = this.startTime - new Date().getTime() + this.timeShift
        this.minutes = this.msToMinutes(this.timeToStart).minutes
        this.seconds = this.msToMinutes(this.timeToStart).seconds
        this.getTimer(this.seconds, -1)
      }
      // 正在上课
      if(checkInResult.state === EduClassroomStateEnum.start) {
        this.classTimeText = t('nav.start_in')
        this.getStartedTime()  // 获取初始进入教室时间值
        this.minutes = this.msToMinutes(this.startedTime).minutes
        this.seconds = this.msToMinutes(this.startedTime).seconds
        this.getTimer(this.seconds, 1)
      }
      // 课程结束
      if (checkInResult.state === EduClassroomStateEnum.end) {
        try {
          await this.appStore.releaseRoom()
        } catch (err) {
          EduLogger.info(" appStore.releaseRoom ", JSON.stringify(err))
        }
        this.appStore.isNotInvisible && dialogManager.show({
          title: t(`aclass.class_end`),
          text: t(`aclass.leave_room`),
          showConfirm: true,
          showCancel: true,
          confirmText: t('aclass.confirm.yes'),
          visible: true,
          cancelText: t('aclass.confirm.no'),
          onConfirm: () => {
            this.history.push('/')
          },
          onCancel: () => {
          }
        })
        this.appStore.uiStore.stopLoading()
        return
      }
      this.sceneStore.isMuted = checkInResult.muteChat
      this.sceneStore.recordState = !!checkInResult.isRecording
      this.sceneStore.classState = checkInResult.state
      this.appStore.boardStore.aClassInit({
        boardId: checkInResult.board.boardId,
        boardToken: checkInResult.board.boardToken,
      }).catch((err) => {
        const error = new GenericErrorWrapper(err)
        BizLogger.warn(`${error}`)
        this.appStore.isNotInvisible && this.appStore.uiStore.addToast(t('toast.failed_to_join_board'))
      })
      this.appStore.uiStore.stopLoading()

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
            const error = new GenericErrorWrapper(err)
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
                  await this.sceneStore.openCamera()
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
          const error = new GenericErrorWrapper(err)
          BizLogger.warn(`${error}`)
          return null
        }
      }
      this.eduManager.on('user-message', async (evt: any) => {
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
          if (!this.sceneStore.joiningRTC) {
            return 
          }
          try {
            BizLogger.info('[rtm] user-message', evt)
            // const fromUserUuid = evt.message.fromUser.userUuid
            // const fromUserName = evt.message.fromUser.userName
            const msg = decodeMsg(evt.message.message)
            // const messageData = JSON.parse(msg.message)
            BizLogger.info("user-message", msg)
            if (msg) {
              const {cmd, data} = msg
              const {type, userName: fromUserName, userId: fromUserUuid} = data
              BizLogger.info("data", data)
              this.showNotice(type as PeerInviteEnum, fromUserUuid)
              if (type === PeerInviteEnum.studentApply) {
                this.showDialog(fromUserName, fromUserUuid)
              }
              if (type === PeerInviteEnum.teacherStop) {
                try {
                  await this.sceneStore.closeCamera()
                  await this.sceneStore.closeMicrophone()
                  this.appStore.uiStore.addToast(t('toast.co_video_close_success'))
                } catch (err) {
                  this.appStore.uiStore.addToast(t('toast.co_video_close_failed'))
                  const error = new GenericErrorWrapper(err)
                  BizLogger.warn(`${error}`)
                }
              }
              if (type === PeerInviteEnum.teacherAccept 
                && this.isBigClassStudent()) {
                try {
                  // await this.sceneStore.prepareCamera()
                  // await this.sceneStore.prepareMicrophone()
                  BizLogger.info("propertys ", this.sceneStore._hasCamera, this.sceneStore._hasMicrophone)
                  // if (this.sceneStore._hasCamera) {
                  await this.sceneStore.openCamera()
                  // }
      
                  // if (this.sceneStore._hasMicrophone) {
                  BizLogger.info('open microphone')
                  await this.sceneStore.openMicrophone()
                  // }
                } catch (err) {
                  // BizLogger.warn('published failed', err) 
                  const error = new GenericErrorWrapper(err)
                  BizLogger.error(`published failed:${error}`)
                  throw error
                }
                this.appStore.isNotInvisible && this.appStore.uiStore.addToast(t('toast.publish_rtc_success'))
              }
            }
          } catch (err) {
            BizLogger.error(`[demo] user-message async handler failed`)
            const error = new GenericErrorWrapper(err)
            BizLogger.error(`${error}`)
          }
        })
      })
      // 教室更新
      roomManager.on('classroom-property-updated', async (classroom: any, cause: any) => {
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
          BizLogger.info("## classroom ##: ", JSON.stringify(classroom))
          const classState = get(classroom, 'roomStatus.courseState')
          if (classState === EduClassroomStateEnum.end) {
            // await this.appStore.releaseRoom()
            // this.appStore.isNotInvisible && dialogManager.confirm({
            //   title: t(`aclass.class_end`),
            //   text: t(`aclass.leave_room`),
            //   showConfirm: true,
            //   showCancel: true,
            //   confirmText: t('aclass.confirm.yes'),
            //   visible: true,
            //   cancelText: t('aclass.confirm.no'),
            //   onConfirm: () => {
            //   },
            //   onClose: () => {
            //   }
            // })
            // return
          }
        
          const record = get(classroom, 'roomProperties.record')
          if (record) {
            const state = record.state
            if (state === 1) {
              this.sceneStore.recordState = true
            } else {
              if (state === 0 && this.sceneStore.recordState) {
                this.addChatMessage({
                  id: 'system',
                  ts: Date.now(),
                  text: '',
                  account: 'system',
                  link: this.sceneStore.roomUuid,
                  sender: false
                })
                this.sceneStore.recordState = false
                // this.sceneStore.recordId = ''
              }
            }
          }
          const newClassState = classroom.roomStatus.courseState
          if (this.sceneStore.classState !== newClassState) {
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
          this.disableTrophy = this.roomInfo.userRole !== EduRoleTypeEnum.teacher
          this.studentsReward = get(classroom, 'roomProperties.students', {})
          this.showTrophyAnimation = cause && cause.cmd === acadsocRoomPropertiesChangeCause.studentRewardStateChanged
          if(this.minutes === 0 && this.seconds === 0 && this.additionalState === 0) {
            clearTimeout(this.timer)
          }
          if(this.sceneStore.classState === 1 && this.additionalState === 0) {
            clearTimeout(this.timer)
            this.classTimeText = t('nav.start_in')
            // 上课后 初始化计时
            this.minutes = 0
            this.seconds = 0
            this.getTimer(this.seconds, 1)
          }
          if(this.sceneStore.classState === 2) {
            console.log('提示：课程已结束')
            this.isRed = true
          }
        })
      })
      roomManager.on('room-chat-message', (evt: any) => {
        const {textMessage} = evt;
        const message = textMessage as EduTextMessage
        this.addChatMessage({
          id: message.fromUser.userUuid,
          ts: message.timestamp,
          text: message.message,
          account: message.fromUser.userName,
          sender: false
        })
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
  
      let canPublish = this.roomInfo.userRole === EduRoleTypeEnum.teacher ||
         localStreamData && !!(+localStreamData.state) ||
         (this.roomInfo.userRole === EduRoleTypeEnum.student && +this.roomInfo.roomType !== 2)
  
      if (canPublish) {
  
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
        this.appStore.isNotInvisible && this.appStore.uiStore.addToast(t('toast.publish_business_flow_successfully'))
        this.sceneStore._cameraEduStream = this.roomManager.userService.localStream.stream
        try {
          // await this.sceneStore.prepareCamera()
          // await this.sceneStore.prepareMicrophone()
          if (this.sceneStore._cameraEduStream) {
            if (this.sceneStore._cameraEduStream.hasVideo) {
              await this.sceneStore.openCamera()
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
          this.appStore.isNotInvisible && this.appStore.uiStore.addToast(t('toast.media_method_call_failed') + `: ${err.message}`)
          const error = new GenericErrorWrapper(err)
          BizLogger.warn(`${error}`)
        }
      }
  
      const roomProperties = roomManager.getClassroomInfo().roomProperties
    
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
      this.appStore.uiStore.stopLoading()
      // throw new GenericEerr
      throw new GenericErrorWrapper(err)
    }
  }

  @action
  getRewardByUid(uid: string): number {
    return get(this.studentsReward, `${uid}.reward`, 0)
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
      const teacher = this.roomManager?.getFullUserList().find((it: EduUser) => it.userUuid === this.sceneStore.teacherStream.userUuid)
      if (teacher) {
        const res = await eduSDKApi.handsUp({
          roomUuid: this.roomInfo.roomUuid,
          toUserUuid: teacher.userUuid,
          payload: {
            userId: this.roomInfo.userUuid,
            userName: this.roomInfo.userName,
            type: PeerInviteEnum.studentApply,
          }
        })
        if (res === 0) {
          throw new GenericErrorWrapper('callApply failure')
        }
        // await this.roomManager?.userService.sendCoVideoApply(teacher)
      }
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_initiate_a_raise_of_hand_application') + ` ${err.message}`)
    }
  }

  @action
  async callEnded() {
    try {
      await this.sceneStore.closeStream(this.roomInfo.userUuid, true)
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_end_the_call') + ` ${err.message}`)
    }
  }

  showDialog(userName: string, userUuid: any) {
    const isExists = this.appStore
      .uiStore
      .dialogs.filter((it: DialogType) => it.dialog.option)
      .find((it: DialogType) => it.dialog.option.userUuid === userUuid)
    if (isExists) {
      return
    }
    this.appStore.uiStore.showDialog({
      type: 'apply',
      option: {
        userUuid,
      },
      message: `${userName}` + t('icon.requests_to_connect_the_microphone')
    })
  }

  removeDialogBy(userUuid: any) {
    const target = this.appStore
    .uiStore
    .dialogs.filter((it: DialogType) => it.dialog.option)
    .find((it: DialogType) => it.dialog.option.userUuid === userUuid)
    if (target) {
      this.appStore.uiStore.removeDialog(target.id)
    }
  }


  async teacherRejectApply() {
    const userUuid = (this.notice as any).userUuid
    const user = this.roomManager?.getFullUserList().find(it => it.userUuid === userUuid)
    if (user) {
      const res = await eduSDKApi.handsUp({
        roomUuid: this.roomInfo.roomUuid,
        toUserUuid: user.userUuid,
        payload: {
          userId: user.userUuid,
          userName: user.userName,
          type: PeerInviteEnum.teacherReject,
        }
      })
      // if (res === 0) {
      //   throw new GenericErrorWrapper('callApply failure')
      // }
      // await this.roomManager?.userService.rejectCoVideoApply(user)
    }
  }

  async teacherAcceptApply() {
    const userUuid = (this.notice as any).userUuid
    const user = this.roomManager?.data.userList.find(it => it.user.userUuid === userUuid)
    if (user) {
      const res = await eduSDKApi.handsUp({
        roomUuid: this.roomInfo.roomUuid,
        toUserUuid: user.user.userUuid,
        payload: {
          userId: user.user.userUuid,
          userName: user.user.userName,
          type: PeerInviteEnum.teacherAccept,
        }
      })
      if (res === 0) {
        throw new GenericErrorWrapper('callApply failure')
      }
      await this.roomManager?.userService.inviteStreamBy({
        roomUuid: this.sceneStore.roomUuid,
        streamUuid: user.streamUuid,
        userUuid: user.user.userUuid
      })
    }
  }

  @action
  async leave() {
    try {
      this.sceneStore.joiningRTC = false
      await this.sceneStore.leaveRtc()
      await this.appStore.boardStore.leave()
      await this.eduManager.logout()
      await this.roomManager?.leave()
      this.appStore.uiStore.addToast(t('toast.successfully_left_the_business_channel'))
      this.delInterval('timer')
      this.reset()
      this.appStore.uiStore.updateCurSeqId(0)
      this.appStore.uiStore.updateLastSeqId(0)
    } catch (err) {
      this.reset()
      const error = new GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
    }
  }

  async endRoom() {
    await eduSDKApi.updateClassState({
      roomUuid: this.roomInfo.roomUuid,
      state: 2
    })
    await this.appStore.releaseRoom()
    dialogManager.confirm({
      title: t(`aclass.class_end`),
      text: t(`aclass.leave_room`),
      showConfirm: true,
      showCancel: true,
      confirmText: t('aclass.confirm.yes'),
      visible: true,
      cancelText: t('aclass.confirm.no'),
      onConfirm: () => {
        this.history.push('/')
      },
      onClose: () => {
      }
    })
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

}