import { EduLogger } from './../../sdk/education/core/logger/index';
import { eduSDKApi } from '@/services/edu-sdk-api';
import uuidv4 from 'uuid/v4';
import { SimpleInterval } from './../mixin/simple-interval';
import { EduBoardService } from './../../sdk/board/edu-board-service';
import { EduRecordService } from './../../sdk/record/edu-record-service';
import { EduAudioSourceType, EduTextMessage, EduSceneType, RoomProperties, EduClassroomStateEnum } from './../../sdk/education/interfaces/index.d';
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
import { ChatMessage } from '@/utils/types';
import { t } from '@/i18n';
import { DialogType } from '@/components/dialog';
import { BizLogger } from '@/utils/biz-logger';
import { SceneStore } from './scene';
import { GenericErrorWrapper } from '@/sdk/education/core/utils/generic-error';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

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
    // this.appStore.mediaStore.resetRoomState()
    // this.appStore.resetTime()
    // this.appStore.resetRoomInfo()
    // this.appStore.resetStates()
    this.sceneStore.reset()
    this.roomChatMessages = []
    this.unreadMessageCount = 0
    this.messages = []
    this.joined = false
    this.roomJoined = false
    this.time = 0
    this.notice = undefined
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

  @action
  async sendMessage(message: any) {
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
      this.addChatMessage({
        id: this.userUuid,
        ts: +Date.now(),
        text: message,
        account: this.roomInfo.userName,
        sender: true,
      })
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_send_chat'))
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
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

  @computed
  get videoEncoderConfiguration(): any {
    const userRole = this.roomInfo.userRole
    if(+this.roomInfo.roomType === 0) {
      // 1v1 use 640 x 480
      return {
        width: 640,
        height: 480,
        frameRate: 15
      }
    } else if(+this.roomInfo.roomType === 2) {
      // large classroom, teacher use 640 x 480, student use 320 x 240
      if(userRole === EduRoleTypeEnum.teacher) {
        return {
          width: 640,
          height: 480,
          frameRate: 15
        }
      }
    }
    return {
      width: 320,
      height: 240,
      frameRate: 15
    }
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
      let checkInResult: any = {}
      try {
        checkInResult = await eduSDKApi.checkIn({
          roomUuid,
          roomName: `${this.roomInfo.roomName}`,
          roomType: +this.roomInfo.roomType as number,
          userUuid: this.roomInfo.userUuid,
          role: this.roomInfo.userRole,
        })      
      } catch (err) {
        if (err.code === 20410100) {
          try {
            this.appStore.uiStore.stopLoading()
            this.appStore.uiStore.showDialog({
              type: 'classSessionEnded',
              message: t('class_ended'),
            })
          } catch (err) {
            EduLogger.info(" appStore.releaseRoom ", JSON.stringify(err))
          }
          return
        }
        console.log('err', err)
      }

      EduLogger.info("## classroom ##: checkIn:  ", JSON.stringify(checkInResult))
      if (checkInResult.state === EduClassroomStateEnum.end) {
        // try {
        //   await this.appStore.releaseRoom()
        // } catch (err) {
        //   EduLogger.info(" appStore.releaseRoom ", JSON.stringify(err))
        // }
        this.appStore.uiStore.stopLoading()
        this.appStore.uiStore.showDialog({
          type: 'classSessionEnded',
          message: t('class_ended'),
        })
        return
      }
      this.sceneStore.isMuted = checkInResult.muteChat
      this.sceneStore.recordState = !!checkInResult.isRecording
      this.sceneStore.classState = checkInResult.state
      this.appStore.boardStore.init({
        boardId: checkInResult.board.boardId,
        boardToken: checkInResult.board.boardToken,
      }).catch((err) => {
        const error = new GenericErrorWrapper(err)
        BizLogger.warn(`${error}`)
        this.appStore.uiStore.addToast(t('toast.failed_to_join_board'))
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
              await this.sceneStore.prepareCamera()
              await this.sceneStore.prepareMicrophone()
              BizLogger.info(`[demo] tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()} local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
              if (this.sceneStore.joiningRTC) {
                if (this.sceneStore._hasCamera) {
                  if (this.sceneStore.cameraEduStream.hasVideo) {
                    await this.sceneStore.openCamera(this.videoEncoderConfiguration)
                    BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after openCamera  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                  } else {
                    await this.sceneStore.closeCamera()
                    BizLogger.info(`[demo] local-stream-updated tag: ${tag}, seq[${evt.seqId}], time: ${Date.now()}  after closeCamera  local-stream-updated, main stream is online`, ' _hasCamera', this.sceneStore._hasCamera, ' _hasMicrophone ', this.sceneStore._hasMicrophone, this.sceneStore.joiningRTC, ' _eduStream', JSON.stringify(this.sceneStore._cameraEduStream))
                  }
                }
                if (this.sceneStore._hasMicrophone) {
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
                  await this.sceneStore.prepareCamera()
                  await this.sceneStore.prepareMicrophone()
                  BizLogger.info("propertys ", this.sceneStore._hasCamera, this.sceneStore._hasMicrophone)
                  if (this.sceneStore._hasCamera) {
                    await this.sceneStore.openCamera(this.videoEncoderConfiguration)
                  }
      
                  if (this.sceneStore._hasMicrophone) {
                    BizLogger.info('open microphone')
                    await this.sceneStore.openMicrophone()
                  }
                } catch (err) {
                  // BizLogger.warn('published failed', err) 
                  const error = new GenericErrorWrapper(err)
                  BizLogger.error(`published failed:${error}`)
                  throw error
                }
                this.appStore.uiStore.addToast(t('toast.publish_rtc_success'))
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
      roomManager.on('classroom-property-updated', async (classroom: any) => {
        await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
          BizLogger.info("## classroom ##: ", JSON.stringify(classroom))
          const classState = get(classroom, 'roomStatus.courseState')
          if (classState === EduClassroomStateEnum.end) {
            await this.appStore.releaseRoom()
            this.appStore.uiStore.showDialog({
              type: 'classSessionEnded',
              message: t('class_ended'),
            })
            return
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
        BizLogger.info('room-chat-message', evt)
      })
  
      if (this.roomInfo.userRole === EduRoleTypeEnum.teacher) {
        await roomManager.join({
          userRole: `host`,
          roomUuid,
          userName: `${this.roomInfo.userName}`,
          userUuid: `${this.userUuid}`,
        })
      } else {
        const {sceneType, userRole} = this.getStudentConfig()
        await roomManager.join({
          userRole: userRole,
          roomUuid,
          userName: `${this.roomInfo.userName}`,
          userUuid: `${this.userUuid}`,
          sceneType,
        })
      }
      this.sceneStore._roomManager = roomManager;
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
        this.appStore.uiStore.addToast(t('toast.publish_business_flow_successfully'))
        this.sceneStore._cameraEduStream = this.roomManager.userService.localStream.stream
        try {
          await this.sceneStore.prepareCamera()
          await this.sceneStore.prepareMicrophone()
          if (this.sceneStore._cameraEduStream) {
            if (this.sceneStore._cameraEduStream.hasVideo) {
              await this.sceneStore.openCamera(this.videoEncoderConfiguration)
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
          this.appStore.uiStore.addToast(t('toast.media_method_call_failed') + `: ${err.message}`)
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
    this.appStore.releaseRoom()
    this.appStore.uiStore.showDialog({
      type: 'classSessionEnded',
      message: t('class_ended'),
    })
  }

}