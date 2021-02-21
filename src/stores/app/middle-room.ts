import { SimpleInterval } from './../mixin/simple-interval';
import { CauseType } from './../../sdk/education/core/services/edu-api';
import { InvitationEnum, MiddleRoomApi } from '../../services/middle-room-api';
import uuidv4 from 'uuid/v4';
import { EduAudioSourceType, EduTextMessage, EduSceneType, EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d';
import { RoomApi } from './../../services/room-api';
import { UserRenderer } from '../../sdk/education/core/media-service/renderer/index';
import { AppStore } from '@/stores/app/index';
import { observable, computed, action, runInAction } from 'mobx';
import { get } from 'lodash';
import { EduUser, DeleteStreamType, EduStream, StreamType, EduVideoSourceType, EduRoleType, UserGroup, RoomProperties } from '@/sdk/education/interfaces/index.d';
import { ChatMessage } from '@/utils/types';
import { t } from '@/i18n';
import { DialogType } from '@/components/dialog';
import { BizLogger } from '@/utils/biz-logger';
import { EduBoardService } from '@/sdk/board/edu-board-service';
import { EduRecordService } from '@/sdk/record/edu-record-service';
import { CustomPeerApply, UnmuteMediaEnum } from './scene';
import { GenericErrorWrapper } from '@/sdk/education/core/utils/generic-error';

type VideoMarqueeItem = {
  mainStream: EduMediaStream | null
  studentStreams: EduMediaStream[]
}

type ProcessType = {
  maxWait: number
  maxAccept: number
  timeout: number
}

type MiddleRoomProperties = {
  handUpStates: {
    state: number,
    autoCoVideo: number
  },
  groups: any[],
  students: Record<string, any>,
  teachers: Record<string, any>,
  interactOutGroups: {
    g1?: string,
    g2?: string,
  }
  processes: Record<string, ProcessType>,
}

type MiddleRoomSchema = Partial<MiddleRoomProperties>

const ms = 500

export enum MiddleRoomPropertiesChangeCause {
  groupingStateChanged = 101, // 开关分组
  updateGroupStateChanged = 102, // 分组更新
  groupingDiscussStateChanged = 103, // 开关组内讨论
  groupingPKStateChanged = 104, // 开关PK

  groupAudioStateChanged = 201, // 整组音频状态变化
  groupRewardNoticeStateChanged = 202, // 整组奖励状态通知
  handUpStateChanged = 301, // 举手状态变化

  studentListChanged = 401, // 课堂内的学生名单发生变化
  studentRewardStateChanged = 402, // 单个人的奖励发生
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
  showMediaBtn?: boolean
}

export class MiddleRoomStore extends SimpleInterval {
  constructor(appStore: AppStore) {
    super()
    this.appStore = appStore
  }

  @observable
  quit: boolean = false

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

  middleRoomApi!: MiddleRoomApi;
  roomApi!: RoomApi;
  appStore: AppStore;
  get sceneStore() {
    return this.appStore.sceneStore
  }
  
  get roomManager() {
    return this.sceneStore.roomManager
  }

  get extensionStore() {
    return this.appStore.extensionStore;
  }

  @computed 
  get canOperator() {
    if (this.teacherExists) {
      const classStarted = this.sceneStore.classState === 1
      if (classStarted) {
        return true
      }
      return false
    }
    return false
  }

  @computed
  get teacherExists(): boolean {
    return !!this.sceneStore.userList.find((it: any) => it.role === 'host')
  }

  @computed
  get userUuid(): string {
    return this.sceneStore.userUuid
  }

  get uiStore() {
    return this.appStore.uiStore;
  }

  @action
  resetRoomInfo() {
    this.appStore.resetRoomInfo()
  }

  // @action
  // releaseStarTimer() {
  //   this.incomingStars = []
  // }

  @action
  reset() {
    // this.releaseStarTimer()
    this.didHandsUp = false
    this.appStore.mediaStore.resetRoomState()
    this.appStore.resetTime()
    this.sceneStore.reset()
    this.roomChatMessages = []
    this.userGroups = []
    this.pkList = []
    this.messages = []
    this.notice = undefined
    this.groupingSolution = 0
    this.quit = false
  }

  @observable
  roomChatMessages: ChatMessage[] = []

  @action
  addChatMessage(args: any) {
    this.roomChatMessages.push(args)
  }
  
  @observable
  unreadMessageCount: number = 0

  @observable
  messages: any[] = []

  @observable
  didHandsUp: boolean = false

  @observable
  isReject: boolean = false

  @observable
  userGroups: UserGroup[] = []

  @observable
  pkList: any[] = []

  @observable
  prepareGroups: any[] = []

  @observable
  notice?: any = undefined

  @action
  async showNotice(cmd: number, action: number, userUuid: string, userName: string) {
    BizLogger.info(`type: ${action}, userUuid: ${userUuid}`)
    let text = t('toast.you_have_a_default_message')
    if (cmd === CustomPeerApply.unmuteAction) {
      switch(action) {
        case UnmuteMediaEnum.audio: {
          this.showUnmuteApplyDialog(userName, userUuid, "audio")
          break;
        }
        case UnmuteMediaEnum.video: {
          this.showUnmuteApplyDialog(userName, userUuid, "video")
          break;
        }
      }
    } else {
      switch(action) {
        case InvitationEnum.Apply: {
          text = t('middle_room.student_hands_up', {reason: userName})
          break;
        }
        case InvitationEnum.Cancel: {
          text = t('middle_room.student_hands_down', {reason: userName})
          break;
        }
        case InvitationEnum.Reject: {
          text = t('middle_room.the_teacher_rejected')
          break;
        }
        case InvitationEnum.Accept: {
          text = t('middle_room.the_teacher_accepted')
          break;
        }
        
      }
      this.notice = {
        reason: text,
        userUuid
      }
      this.appStore.uiStore.addToast(this.notice.reason)
  
      if (action === InvitationEnum.Reject) {
        this.didHandsUp = false
        this.isReject = true
      }
      if (action === InvitationEnum.Accept) {
        // this.disable_handsUp = true
        this.didHandsUp = false
      }
      if (action === InvitationEnum.Apply) {
        const userExists = this.extensionStore.applyUsers.find((user) => user.userUuid === userUuid)
        const user = this.roomManager?.data.userList.find(it => it.user.userUuid === userUuid)
        if (!userExists && user && !this.extensionStore.enableAutoHandUpCoVideo) {
          this.extensionStore.applyUsers.push({
            userName: userName,
            userUuid: userUuid,
            streamUuid: user.streamUuid,
            state: true
          })
        }
        this.uiStore.showShakeHands()
      }
      if (action === InvitationEnum.Cancel) {
        const applyUsers = this.extensionStore.applyUsers.filter((it) => it.userUuid !== userUuid)
        this.extensionStore.applyUsers = applyUsers
      }
      if (action === InvitationEnum.Accept
        && this.isStudent()) {
        try {
          await this.sceneStore.prepareCamera()
          await this.sceneStore.prepareMicrophone()
          BizLogger.info("propertys ", this.sceneStore._hasCamera, this.sceneStore._hasMicrophone)
          if (this.sceneStore._hasCamera) {
            await this.sceneStore.openCamera()
          }
  
          if (this.sceneStore._hasMicrophone) {
            BizLogger.info('open microphone')
            await this.sceneStore.openMicrophone()
          }
        } catch (err) {
          BizLogger.warn('published failed', err) 
          throw err
        }
        this.appStore.uiStore.addToast(t('toast.publish_rtc_success'))
      }
    }
  }

  @action
  async callApply() {
    try {
      const teacher = this.roomManager?.getFullUserList().find((it: EduUser) => it.userUuid === this.sceneStore.teacherStream.userUuid)
      if (teacher) {
        await this.roomManager?.userService.sendCoVideoApply(teacher)
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
      .dialogs.filter((it: DialogType) => get(it.dialog, 'option.userUuid', ''))
      .find((it: DialogType) => get(it.dialog, 'option.userUuid', '') === userUuid)
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

  showUnmuteApplyDialog(userName: string, userUuid: any, type: string) {
    // TODO: uniq dialog by user uuid
    const isExists = this.appStore
      .uiStore
      .dialogs.filter((it: DialogType) => get(it.dialog, 'option.userUuid', ''))
      .find((it: DialogType) => get(it.dialog, 'option.userUuid', '') === userUuid && get(it.dialog, 'option.type') === type)
    if (isExists) {
      return
    }
    this.appStore.uiStore.showDialog({
      type: 'unmuteApply',
      option: {
        userUuid,
        type,
      },
      message: `${userName}` + (type === 'video'? t("icon.apply_unmute_video") : t("icon.apply_unmute_audio"))
    })
  }

  removeDialogBy(userUuid: any) {
    const target = this.appStore
    .uiStore
    .dialogs.filter((it: DialogType) => get(it.dialog, 'option.userUuid',''))
    .find((it: DialogType) => get(it.dialog, 'option.userUuid','') === userUuid)
    if (target) {
      this.appStore.uiStore.removeDialog(target.id)
    }
  }

  @action
  async join() {
    try {
      this.appStore.uiStore.startLoading()
      this.roomApi = new RoomApi({
        appId: this.appStore.params.config.agoraAppId,
        sdkDomain: this.appStore.params.config.sdkDomain,
        rtmToken: this.appStore.params.config.rtmToken,
        rtmUid: this.appStore.params.config.rtmUid,
      })
      this.middleRoomApi = new MiddleRoomApi({
        appId: this.eduManager.config.appId,
        sdkDomain: this.eduManager.config.sdkDomain as string,
        rtmToken: this.eduManager.config.rtmToken,
        rtmUid: this.eduManager.config.rtmUid,
      })
      let {roomUuid} = await this.roomApi.fetchRoom({
        roomName: `${this.roomInfo.roomName}`,
        roomUuid: `${this.roomInfo.roomUuid}`,
        roomType: +this.roomInfo.roomType as number,
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
            const error = new GenericErrorWrapper(err)
            BizLogger.error(`${error}`)
          }
        })
      })
      // 监听本地用户是否被删除
      roomManager.on('local-user-removed', async (evt: any) => {
        console.log(" local-user-removed ", JSON.stringify(evt))
        const {user, type} = evt
        if (type === 2 && this.roomInfo.userRole === EduRoleTypeEnum.student) {
          BizLogger.info(`[demo] local-user-removed`, JSON.stringify(user))
          this.appStore.uiStore.addToast(t('toast.kick_by_teacher'))
          this.quit = true
        }
        // await this.leave()
      })
      // 本地流加入
      // roomManager.on('local-stream-added', (evt: any) => {
      //   this.sceneStore.streamList = roomManager.getFullStreamList()
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
                    await this.sceneStore.openCamera()
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
          BizLogger.warn(err)
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
            const fromUserUuid = evt.message.fromUser.userUuid
            const fromUserName = evt.message.fromUser.userName
            const msg = decodeMsg(evt.message.message)
            BizLogger.info("user-message", msg)
            if (msg) {
              const {cmd, data} = msg
              const {action, fromUser, payload} = data
              const {userUuid, userName, role} = fromUser
              await this.showNotice(cmd, action, userUuid, userName)
              if (action === InvitationEnum.Apply) {
                const userExists = this.extensionStore.applyUsers.find((user) => user.userUuid === userUuid)
                const user = this.roomManager?.data.userList.find((it: any) => it.user.userUuid === userUuid)
                if (!userExists && user && !this.extensionStore.enableAutoHandUpCoVideo) {
                  this.extensionStore.applyUsers.push({
                    userName: userName,
                    userUuid: userUuid,
                    streamUuid: user.streamUuid,
                    state: true
                  })
                }
                this.uiStore.showShakeHands()
              }
              if (action === InvitationEnum.Cancel) {
                const applyUsers = this.extensionStore.applyUsers.filter((it) => it.userUuid !== userUuid)
                this.extensionStore.applyUsers = applyUsers
              }
              if (action === InvitationEnum.Accept 
                && this.isStudent()) {
                try {
                  await this.sceneStore.prepareCamera()
                  await this.sceneStore.prepareMicrophone()
                  BizLogger.info("propertys ", this.sceneStore._hasCamera, this.sceneStore._hasMicrophone)
                  if (this.sceneStore._hasCamera) {
                    await this.sceneStore.openCamera()
                  }
      
                  if (this.sceneStore._hasMicrophone) {
                    BizLogger.info('open microphone')
                    await this.sceneStore.openMicrophone()
                  }
                } catch (err) {
                  BizLogger.warn('published failed', err) 
                  throw err
                }
                this.appStore.uiStore.addToast(t('toast.publish_rtc_success'))
              }
            }
          } catch (error) {
            BizLogger.error(`[demo] user-message async handler failed`)
            BizLogger.error(error)
          }
        })
      })
      // this.eduManager.on('user-message', async (evt: any) => {
      //   await this.sceneStore.mutex.dispatch<Promise<void>>(async () => {
      //     if (!this.sceneStore.joiningRTC) {
      //       return 
      //     }
      //     try {
      //       BizLogger.info('[rtm] user-message', evt)
      //       const fromUserUuid = evt.message.fromUser.userUuid
      //       const fromUserName = evt.message.fromUser.userName
      //       const msg = decodeMsg(evt.message.message)
      //       BizLogger.info("user-message", msg)
      //       if (msg) {
      //         const {cmd, payload} = msg
      //         const {action} = payload
      //         // const payload = msg.payload
      //         const {name, role, uuid} = payload.fromUser
      //         await this.showNotice(cmd, action, uuid, name)
      //         if (action === InvitationEnum.Apply) {
      //           const userExists = this.extensionStore.applyUsers.find((user) => user.userUuid === uuid)
      //           const user = this.roomManager?.data.userList.find((it: any) => it.user.userUuid === uuid)
      //           if (!userExists && user && !this.extensionStore.enableAutoHandUpCoVideo) {
      //             this.extensionStore.applyUsers.push({
      //               userName: name,
      //               userUuid: uuid,
      //               streamUuid: user.streamUuid,
      //               state: true
      //             })
      //           }
      //           this.uiStore.showShakeHands()
      //         }
      //         if (action === InvitationEnum.Cancel) {
      //           const applyUsers = this.extensionStore.applyUsers.filter((it) => it.userUuid !== uuid)
      //           this.extensionStore.applyUsers = applyUsers
      //         }
      //         if (action === PeerInviteEnum.teacherAccept 
      //           && this.isStudent()) {
      //           try {
      //             await this.sceneStore.prepareCamera()
      //             await this.sceneStore.prepareMicrophone()
      //             BizLogger.info("propertys ", this.sceneStore._hasCamera, this.sceneStore._hasMicrophone)
      //             if (this.sceneStore._hasCamera) {
      //               await this.sceneStore.openCamera()
      //             }
      
      //             if (this.sceneStore._hasMicrophone) {
      //               BizLogger.info('open microphone')
      //               await this.sceneStore.openMicrophone()
      //             }
      //           } catch (err) {
      //             BizLogger.warn('published failed', err) 
      //             throw err
      //           }
      //           this.appStore.uiStore.addToast(t('toast.publish_rtc_success'))
      //         }
      //       }
      //     } catch (error) {
      //       BizLogger.error(`[demo] user-message async handler failed`)
      //       BizLogger.error(error)
      //     }
      //   })
      // })

      // 教室更新
      roomManager.on('classroom-property-updated', (classroom: any) => {
        BizLogger.info("classroom-property-updated", classroom)
        // if (evt.reason === EduClassroomStateType.EduClassroomStateTypeRoomAttrs) {
          this.roomProperties = classroom.roomProperties
          console.log("roomProperties >>>>>>> ", classroom.roomProperties)
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
                this.sceneStore.recordId = ''
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
          // 中班功能
          this.roomProperties = classroom.roomProperties
          const groups = get(classroom, 'roomProperties.groups')
          const students = get(classroom, 'roomProperties.students')
          let userGroups: UserGroup[] = []
          if (groups) {
            Object.keys(groups).forEach(groupUuid => {
              let group = groups[groupUuid]
              let userGroup: UserGroup = {
                groupName: group.groupName,
                groupUuid: groupUuid,
                members: [],
              }
              group.members.forEach((stuUuid: string) => {
                let info = students[stuUuid]
                userGroup.members.push({
                  userUuid: stuUuid,
                  userName: info.userName,
                  reward: info.reward,
                  streamUuid: info.streamUuid,
                })
              })
              userGroups.push(userGroup)
            })
            this.userGroups = userGroups
          }
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
      this.roomProperties = roomInfo.roomProperties as any
      this.sceneStore.startTime = +get(roomInfo, 'roomStatus.startTime', 0)

      if (this.roomProperties) {
        let stuName = this.sceneStore.localUser.userName
        let stuUuid = this.sceneStore.localUser.userUuid
        const keyExists = get(this.roomProperties, `students.${stuUuid}`, null)
        // let uid = this.roomProperties.students && this.roomProperties.students[stuUuid]
        let streamUuid = this.roomManager.localUser.streams["main"].streamUuid
        if(this.sceneStore.localUser.userRole === EduRoleTypeEnum.student && !keyExists) {
          let properties = {}
          properties[`students.${stuUuid}`] = {
            userName: stuName,
            reward: 0,
            avatar: "",
            streamUuid: streamUuid,
          }
          let cause = { cmd: "401" }
          await this.updateRoomBatchProperties({ properties, cause })
        }
      }

      this.middleRoomApi.setSessionInfo({
        roomName: roomManager.roomName,
        roomUuid: roomManager.roomUuid,
        userUuid: this.sceneStore.roomInfo.userUuid,
        userToken: roomManager.userToken,
        userName: this.sceneStore.roomInfo.userName,
        role: this.sceneStore.roomInfo.userRole
      })
      const mainStream = roomManager.data.streamMap['main']
  
      this.sceneStore.classState = roomInfo.roomStatus.courseState

      if (this.sceneStore.classState === 1) {
        this.addInterval('timer', () => {
          this.appStore.updateTime(+get(roomInfo, 'roomStatus.startTime', 0))
        }, ms)
      }
      this.sceneStore.isMuted = !roomInfo.roomStatus.isStudentChatAllowed
  
      await this.sceneStore.joinRTC({
        uid: +mainStream.streamUuid,
        channel: roomInfo.roomInfo.roomUuid,
        token: mainStream.rtcToken
      })
  
      const localStreamData = roomManager.data.localStreamData

      const localStreamExists = !!(+localStreamData.state)
  
      let canPublish = this.roomInfo.userRole === EduRoleTypeEnum.teacher ||
         localStreamData && localStreamExists
  
      if (canPublish) {
  
        const localStreamData = roomManager.data.localStreamData
  
        BizLogger.info("localStreamData", localStreamData)
        await roomManager.userService.publishStream({
          videoSourceType: EduVideoSourceType.camera,
          audioSourceType: EduAudioSourceType.mic,
          streamUuid: mainStream.streamUuid,
          streamName: '',
          hasVideo: get(localStreamData, 'stream.hasVideo', true),
          hasAudio: get(localStreamData, 'stream.hasAudio', true),
          userInfo: {} as EduUser
        })
        this.appStore.uiStore.addToast(t('toast.publish_business_flow_successfully'))
        this.sceneStore._cameraEduStream = this.roomManager.userService.localStream.stream
        try {
          await this.sceneStore.prepareCamera()
          await this.sceneStore.prepareMicrophone()
          if (this.sceneStore._cameraEduStream) {
            if (this.sceneStore._cameraEduStream && this.sceneStore._cameraEduStream.hasVideo) {
              await this.sceneStore.openCamera()
            } else {
              await this.sceneStore.closeCamera()
            }
            if (this.sceneStore._cameraEduStream && this.sceneStore._cameraEduStream.hasAudio) {
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
  
      await this.appStore.boardStore.fetchInit()
  
      const roomProperties = roomManager.getClassroomInfo().roomProperties
      if (roomProperties) {
        this.sceneStore.recordId = get(roomProperties, 'record.recordId', '')
      } else {
        this.sceneStore.recordId = ''
      }
    
      this.sceneStore.userList = roomManager.getFullUserList()
      this.sceneStore.streamList = roomManager.getFullStreamList()
      if (this.roomInfo.userRole !== EduRoleTypeEnum.teacher) {
        if (this.sceneStore.streamList.find((it: EduStream) => it.videoSourceType === EduVideoSourceType.screen)) {
          this.sceneStore.sharing = true
        } else { 
          this.sceneStore.sharing = false
        }
      }
      this.appStore.uiStore.stopLoading()
      this.joined = true
    } catch (err) {
      this.appStore.uiStore.stopLoading()
      throw err
    }
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

  @computed
  get allStudentStreams() {
    const allStudents: VideoMarqueeItem = {
      studentStreams: [],
      mainStream: null
    }

    const userUuids = this.sceneStore.userList.map((user: any) => user.userUuid)
    if (userUuids) {
        const streams = this.sceneStore.studentStreams.filter((stream: any) => userUuids.includes(stream.userUuid))
        allStudents.studentStreams = streams.map((stream) => ({
        ...stream,
        showStar: true,
        showControls: false,
        showHover: this.roomInfo.userRole === EduRoleTypeEnum.teacher,
        rewardNum: this.getUserReward(stream.userUuid)
        }))
    }
    return allStudents
  }

  @computed
  get historyBoardGroups() {
    return this.userGroups.map(group => group.members.map(user => ({userUuid: user.userUuid, userName: user.userName})))
  }

  // @observable
  // incomingStars: any[] = []

  @computed
  get g1PlatformStreams() {
    return [...this.platformState.g1Members, ...this.handsUpStreams]
  }

  @computed
  get handsUpStreams() {
    let oldPlatformStreamIds = [...this.platformState.g1Members, ...this.platformState.g2Members].map(e => e.streamUuid)
    return this.allStudentStreams.studentStreams.filter(e => !oldPlatformStreamIds.includes(e.streamUuid))
      .map((stream: any) => ({...stream, showMediaBtn: true}))
  }

  @computed
  get platformState () {
    let outGroups = get(this.roomProperties, 'groupStates.interactOutGroup', '')
    let g1 = get(this.roomProperties, 'interactOutGroups.g1', '')
    let g2 = get(this.roomProperties, 'interactOutGroups.g2', '')
    // let g1 = this.roomProperties?.interactOutGroups?.
    let g1MemberIds = g1? get(this.roomProperties, `groups.${g1}.members`, []) : []
    let g2MemberIds = g2? get(this.roomProperties, `groups.${g2}.members`, []) : []

    let g1Members: EduMediaStream[] = []
    let g2Members: EduMediaStream[] = []
    this.allStudentStreams.studentStreams.forEach((e: EduMediaStream) => {
      g1MemberIds.forEach((uid: any) => {
        if(uid === e.userUuid) {
          e.showMediaBtn = true
          g1Members.push(e)
        }
      })
      g2MemberIds.forEach((uid: any) => {
        if(uid === e.userUuid) {
          e.showMediaBtn = true
          g2Members.push(e)
        }
      })
    })
    return {
      g1,
      g2, 
      g1Members,
      g2Members,
      outGroups
    }
  }

  @action
  // 整组关麦
  async groupControlMicrophone (group:any, control:number) {
    // 如果已经开麦 关麦 如果当前为关麦 即开
    let streams:any = []
    group.members.forEach((item:any) => {
      let stu = {
        userUuid: item.userUuid,
        streamUuid: item.streamUuid,
        streamName: item.userUuid + 'stream',
        videoSourceType: 1,
        audioSourceType: 1,
        videoState: 1,
        audioState: control,
      }
      streams.push(stu)        
    })
    await this.batchUpsertStream(streams)
    let properties = {

    }
    let cause = {cmd:"201"} // 整组开关麦
    await this.updateRoomBatchProperties({ properties, cause })
  }

async groupPlatform (group:any) {
  try {
    let id = group.groupUuid
    let cause = {cmd:"104"} // 开关 pk

    // 该组在台上 下台
    if (this.platformState.g1 === id || this.platformState.g2 === id) {
      // 先删流后更新数据 ---司大佬要求的，否则会造成其他端频闪问题
      let streams:any = []
      group.members.forEach((item:any) => {
        let stu = {
          userUuid: item.userUuid,
          streamUuid: item.streamUuid,
        }
        streams.push(stu)
      })
      await this.batchDeleteStream(streams)
      let properties: any = {}
      console.log('该组在台上 下台')
      let t = this.platformState.g1 === id? 'g1' : 'g2'
      // 当前下台的组是最后一组 关闭 pk 状态
      if((t === 'g1' && !this.platformState.g2) || (t === 'g2' && !this.platformState.g1)) {
        properties = {
          'groupStates.interactOutGroup': 0, // 组外讨论 包括分组，pk
          [`interactOutGroups.${t}`]: '',
        }
      } else {
        properties = {
          [`interactOutGroups.${t}`]: '',
        }
      }
      await this.updateRoomBatchProperties({properties, cause})
      return
    }
    // 台上两组满
    if (this.platformState.g1 && this.platformState.g2) {
      console.log('两组在台上 下台')
      return
    }
    console.log('该组不在台上 上台')

    // 以上条件都不满足，台上有空位 上台
    // 先更新再增流 ---司大佬要求的，否则会造成其他端频闪问题
    let t = !this.platformState.g1 ? 'g1' : 'g2'
    let properties: any = {
      'groupStates.state':1,
      'groupStates.interactInGroup': 0, // 组内
      'groupStates.interactOutGroup': 1, // 组外讨论 包括分组，pk
      [`interactOutGroups.${t}`]: id,
    }
    let oldValue = this.platformState[t]
    this.platformState[t] = id
    try {
      await this.updateRoomBatchProperties({ properties, cause })
    } catch(err) {
      this.platformState[t] = oldValue
    }

    let streams:any = []
    group.members.forEach((item:any) => {
      let stu = {
        userUuid: item.userUuid,
        streamUuid: item.streamUuid,
        streamName: item.userUuid + 'stream',
        videoSourceType: 1,
        audioSourceType: 1,
        videoState: 1,
        audioState: 1,
      }
      streams.push(stu)
    })
    // 增流
    await this.batchUpsertStream(streams)
  } catch (err) {

  }
}

  @computed
  get onStage(): boolean {
    if (this.platformState.outGroups === 1) {
      const g1Exists = this.userGroups.find((group: UserGroup) => group.groupUuid === this.platformState.g1)
      if (g1Exists) {
        return true
      }

      const g2Exists = this.userGroups.find((group: UserGroup) => group.groupUuid === this.platformState.g2)
      if (g2Exists) {
        return true
      }
    }
    return false
  }

  // 整组加星
  @action
  async addGroupStar (group: any) {
    let properties: any = {}
    group.members.forEach(async (stu: any) => {
      properties[`students.${stu.userUuid}.reward`] = stu.reward + 1
    })
    let cause: any = {
      groupUuid: group.groupUuid,
      cmd:"202"
    } // 整组奖励
    await this.updateRoomBatchProperties({ properties, cause })
  }

  // 删除
  @action
  async removeGroup () {
    let cause = {cmd:"101"}
    let properties: any = {
      groupStates: {
        state: 0,
        interactInGroup: 0, // 组内
        interactOutGroup: 0, // 组外讨论 包括分组，pk
      },
      interactOutGroups: {}, // 组外互动
      groups: {}
    }
    await this.updateRoomBatchProperties({ properties, cause })
  }

  @action
  async groupOnSave (groups:any) {
    let backendGroups: Object = {}
    for(let i = 0; i < groups.length; i++) {
      if(groups[i].length === 0) {
        console.log('当前有小组为空，请重新分组')
        this.appStore.uiStore.addToast(t('middle_room.group_is_empty'))
        return
      }
      let groupNum: number = i + 1
      let groupItem: any = {
        groupName: "",
        members: [],
      }
      groupItem.groupName = "group" + groupNum
      groupItem.members = groups[i].map((stu:any) => stu.userUuid)
      backendGroups[`group_id_${groupNum}`] = groupItem
    }
    let properties:any = {
      groupStates: {
        state: 1,
        interactInGroup: 0, // 组内
        interactOutGroup: 0, // 组外讨论 包括分组，pk
      },
      groups: backendGroups
    }
    let cause = {cmd:"102"}
    await this.updateRoomBatchProperties({ properties, cause })
    this.appStore.extensionStore.hiddenGrouping()
  }

  @computed
  get groups() {
    const firstGroup: VideoMarqueeItem = {
      mainStream: null,
      studentStreams: [],
    }

    // TODO: only need in PRD PK mode. Still not implemented
    const secondGroup: VideoMarqueeItem = {
      mainStream: null,
      studentStreams: [],
    }

    const userIds = this.sceneStore.userList.map((u: any) => u.userUuid)

    const streams = this.sceneStore.studentStreams.filter((stream: any) => userIds.includes(stream.userUuid))
    firstGroup.studentStreams = firstGroup.studentStreams.concat(streams)
    firstGroup.studentStreams = firstGroup.studentStreams.map((stream) => ({
      ...stream,
      // showStar: true,
      showControls: false,
      showHover: this.roomInfo.userRole === EduRoleTypeEnum.teacher,
      showMediaBtn: true
    }))

    return [firstGroup, secondGroup]
  }

  // @observable
  // groups: any[] = [
  //   {
  //     mainStream: null,
  //     studentStreams: [],
  //     // studentStreams: genStudentStreams(20),
  //   },
  //   {
  //     mainStream: null,
  //     studentStreams: [],
  //     // studentStreams: genStudentStreams(20),
  //   }
  // ]

  getUserReward(userUuid: string) {
    const user = this.roomStudentUserList.find((it) => it.userUuid === userUuid)
    if (user) {
      return user.reward
    }
    return 0
  }

  @action
  async sendReward(userUuid: string, reward: number) {
    await this.roomManager.userService.updateRoomBatchProperties(
      {
        properties: {
          [`students.${userUuid}.reward`]: reward+1,
        },
        cause: {
          userUuid: userUuid,
          cmd: `${MiddleRoomPropertiesChangeCause.studentRewardStateChanged}`
        }
      }
    )
  }

  @action
  async sendClose(userUuid: string) {
    const isLocal = this.roomInfo.userUuid === userUuid
    await this.sceneStore.closeStream(userUuid, isLocal)
    this.didHandsUp = false
  }

  @action
  async updateRoomBatchProperties(payload: {properties: MiddleRoomSchema, cause: CauseType}) {
    await this.roomManager.userService.updateRoomBatchProperties(payload)
  }

  @action
  async batchUpsertStream(streams: Array<StreamType>) {
    await this.roomManager.userService.batchUpsertStream(streams)
  }

  @action
  async batchDeleteStream(streams: Array<DeleteStreamType>) {
    await this.roomManager.userService.batchDeleteStream(streams)
  }

  @observable
  roomProperties: MiddleRoomProperties = {
    handUpStates: {
      state: 0,
      autoCoVideo: 0
    },
    groups: [],
    students: {},
    teachers: {},
    interactOutGroups: {},
    processes: {}
  }

  @computed
  get studentsList() {
    const showControls = this.roomInfo.userRole !== EduRoleTypeEnum.student
    const streams = this.sceneStore.studentStreams
    const streamUserIds = streams.map((stream: any) => stream.userUuid)
    const userList = this.roomStudentUserList
      .filter(
        (e => 
          streamUserIds
          .indexOf(e.userUuid) === -1
        )
      )
      .map((it) => ({
        ...it,
        account: it.userName,
        audio: false,
        video: false,
        showControls: showControls,
        renderer: undefined,
        local: it.userUuid === this.roomInfo.userUuid,
      }))
    return streams
    .concat(userList)
    .filter((it: any) => {
      const userList = this.sceneStore.userList.find((user: any) => user.userUuid === it.userUuid)
      if (userList) {
        return true
      } else {
        return false
      }
    })
    .map((it: any) => ({
      ...it,
      // offline: this.sceneStore.userList.find((user) => user.userUuid === it.userUuid) ? false : true
    }))
  }
  

  @computed
  get onLineStudentsList() {
    return this.roomStudentUserList.filter((item) => this.studentsList.find((it) => item.userUuid === it.userUuid))
  }

  @computed
  get onLineStuUuidList() {
    return this.onLineStudentsList.map((e)=> e.userUuid)
  }

  @computed
  get rawStudentsList() {
    const showControls = this.roomInfo.userRole !== EduRoleTypeEnum.student
    const streams = this.sceneStore.studentStreams
    const streamUserIds = streams.map((stream: any) => stream.userUuid)
    const userList = this.roomStudentUserList
      .filter(
        (e => 
          streamUserIds
          .indexOf(e.userUuid) === -1
        )
      )
      .map((it) => ({
        ...it,
        account: it.userName,
        audio: false,
        video: false,
        showControls: showControls,
        renderer: undefined,
        local: it.userUuid === this.roomInfo.userUuid,
      }))
    return streams
    .concat(userList)
    .map((it: any) => ({
      ...it,
      offline: this.sceneStore.userList.find((user: any) => user.userUuid === it.userUuid) ? false : true
    }))
  }

  @computed
  get studentTotal(): number {
    // return this.roomStudentUserList.length
    return this.onLineStudentsList.length
  }

  @computed
  get roomStudentUserList() {
    const studentRecords = get(this.roomProperties, 'students', {})
    const students = Object.keys(studentRecords).map((uuid) => ({
      userUuid: uuid,
      streamUuid: studentRecords[uuid].streamUuid,
      userName: studentRecords[uuid].userName,
      account: studentRecords[uuid].userName,
      reward: studentRecords[uuid].reward,
    }))
    return students
  }

  @computed
  get studentUserList() {
    return this.sceneStore.userList.filter((item: any) => item.role !== 'host') 
  }

  async batchUpdateStreamAttributes(streams: any[]) {
    try {
      await this.roomManager?.userService.batchUpdateStreamAttributes(streams)
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  async batchRemoveStreamAttributes(streams: any[]) {
    try {
      await this.roomManager?.userService.batchRemoveStreamAttributes(streams)
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  async batchUpdateRoomAttributes(properties: any) {
    try {
      await this.roomManager?.userService.batchUpdateRoomAttributes(properties)
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  async batchRemoveRoomAttributes() {
    try {
      await this.roomManager?.userService.batchRemoveRoomAttributes()
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  async batchRemoveUserAttributes(userUuid: string) {
    try {
      await this.roomManager?.userService.batchRemoveUserAttributes(userUuid)
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  @action
  async sendMessage(message: string) {
    try {
      await this.roomManager.userService.sendRoomChatMessage(message)
      this.addChatMessage({
        id: this.userUuid,
        ts: +Date.now(),
        text: message,
        account: this.roomInfo.userName,
        sender: true,
      })
    } catch (err) {
      const error = new GenericErrorWrapper(err)
      BizLogger.warn(`${error}`)
    }
  }

  isStudent(): boolean {
    const userRole = this.roomInfo.userRole
    return userRole === EduRoleTypeEnum.student
  }

  get eduManager() {
    return this.appStore.eduManager
  }

  @observable
  joined: boolean = false


  @computed
  get roomInfo() {
    return this.appStore.roomInfo
  }

  @computed
  get studentSum() {
    if(this.roomProperties.students) {
      return Object.keys(this.roomProperties.students).length
    }
    return 0
  }


  @action
  async leave() {
    try {
      this.sceneStore.joiningRTC = true
      await this.sceneStore.leaveRtc()
      await this.appStore.boardStore.leave()
      await this.eduManager.logout()
      await this.roomManager?.leave()
      this.appStore.uiStore.addToast(t('toast.successfully_left_the_business_channel'))
      this.delInterval('timer')
      this.reset()
      this.resetRoomInfo()
      this.appStore.uiStore.updateCurSeqId(0)
      this.appStore.uiStore.updateLastSeqId(0)
    } catch (err) {
      this.reset()
      const error = new GenericErrorWrapper(err)
      BizLogger.error(`${error}`)
    }
  }

  @observable
  groupingSolution: number = 0

  @computed
  get savedGroupList () {
    return []
  }

  @action
  updateGroupItemList(type: number, count: number) {

  }

  private getMediaStreamBy(userUuid: string) {
    return this.rawStudentsList.find((it: any) => it.userUuid === userUuid)
  }

  async unmuteVideo(userUuid: string, isLocal: boolean) {
    BizLogger.info("unmuteVideo userUuid", userUuid, " isLocal ", isLocal)
    if (isLocal) {
      await this.sceneStore.unmuteLocalCamera()
    } else {
      const stream = this.getMediaStreamBy(userUuid)
      if (!stream) {
        return BizLogger.warn("unmuteVideo userUuid stream not found")
      }
      await this.batchUpsertStream([{
        userUuid: stream.userUuid,
        streamUuid: stream.streamUuid,
        streamName: stream.userUuid + 'stream',
        videoSourceType: EduVideoSourceType.camera,
        audioSourceType: EduAudioSourceType.mic,
        videoState: 1,
        audioState: +stream.audio,
      }])
    }
  }
  async muteVideo(userUuid: string, isLocal: boolean) {
    BizLogger.info("muteVideo userUuid", userUuid, " isLocal ", isLocal)
    if (isLocal) {
      await this.sceneStore.muteLocalCamera()
    } else {
      const stream = this.getMediaStreamBy(userUuid)
      if (!stream) {
        return BizLogger.warn("muteVideo userUuid stream not found")
      }
      await this.batchUpsertStream([{
        userUuid: stream.userUuid,
        streamUuid: stream.streamUuid,
        streamName: stream.userUuid + 'stream',
        videoSourceType: EduVideoSourceType.camera,
        audioSourceType: EduAudioSourceType.mic,
        videoState: 0,
        audioState: +stream.audio,
      }])
    }
  }
  async unmuteAudio(userUuid: string, isLocal: boolean) {
    BizLogger.info("unmuteAudio userUuid", userUuid, " isLocal ", isLocal)
    if (isLocal) {
      await this.sceneStore.unmuteLocalMicrophone()
    } else {
      const stream = this.getMediaStreamBy(userUuid)
      if (!stream) {
        return BizLogger.warn("unmuteAudio userUuid stream not found")
      }
      await this.batchUpsertStream([{
        userUuid: stream.userUuid,
        streamUuid: stream.streamUuid,
        streamName: stream.userUuid + 'stream',
        videoSourceType: EduVideoSourceType.camera,
        audioSourceType: EduAudioSourceType.mic,
        videoState: +stream.video,
        audioState: 1,
      }])
    }
  }
  async muteAudio(userUuid: string, isLocal: boolean) {
    BizLogger.info("muteAudio userUuid", userUuid, " isLocal ", isLocal)
    if (isLocal) {
      await this.sceneStore.muteLocalMicrophone()
    } else {
      const stream = this.getMediaStreamBy(userUuid)
      if (!stream) {
        return BizLogger.warn("unmuteAudio userUuid stream not found")
      }
      await this.batchUpsertStream([{
        userUuid: stream.userUuid,
        streamUuid: stream.streamUuid,
        streamName: stream.userUuid + 'stream',
        videoSourceType: EduVideoSourceType.camera,
        audioSourceType: EduAudioSourceType.mic,
        videoState: +stream.video,
        audioState: 0,
      }])
    }
  }
}
