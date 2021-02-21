import { BizLogger } from '@/utils/biz-logger';
import { InvitationEnum } from './../../services/middle-room-api';
import { EduAudioSourceType, EduUser, EduVideoSourceType } from '@/sdk/education/interfaces/index.d';
import { AppStore } from '@/stores/app/index';
import { observable, computed, action, when } from 'mobx';
import { get } from 'lodash';
import { t } from '@/i18n';
import { MiddleRoomPropertiesChangeCause } from './middle-room';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

export type SetInterval = ReturnType<typeof setInterval>

export enum MediaState {
  hasVideo = 1,
  hasAudio = 1,
  disableVideo = 0,
  disableAudio = 0
}

type ApplyUser = {
  userName: string
  userUuid: string
  streamUuid: string
  state: boolean
}

// 控制管理扩展工具的状态显示
export class ExtensionStore {
  appStore!: AppStore

  @observable
  applyUsers: ApplyUser[] = []

  @computed
  get userList() {
    return this.applyUsers.filter((_, id) => id < 4)
  }

  @computed
  get coVideoStudentsList () {
    const userUuids = this.sceneStore.streamList.map(e => e.userInfo.userUuid)
    return this.applyUsers
      .filter((user) => userUuids.find(ids => ids === user.userUuid) ? true : false)
  }

  constructor(appStore: AppStore) {
    this.appStore = appStore
    // when(
    //   () => !!this.enableCoVideo && this.timer === undefined,
    //   () => {
    //     this.startTimer()
    //   }
    // )
    // when(
    //   () => !!this.handsUpDelay,
    //   () => {
    //     this.resetApply()
    //   }
    // )
  }

  get sceneStore() {
    return this.appStore.sceneStore
  }

  @observable
  controlGrouping: boolean = false

  @action 
  showGrouping() {
    this.controlGrouping = true
  }

  @observable
  controlSpread: boolean = false

  @action 
  showspread() {
    this.controlSpread = true
  }
  
  @action 
  hiddenGrouping() {
    this.controlGrouping = false
  }

  @observable
  controlCreate: boolean = false

  @action 
  showCreate() {
    this.controlCreate = true
  }

  @action
  hiddenCreate() {
    this.controlCreate = false
  }

  @observable
  handVisible: boolean = false

  @action
  showHand() {
    this.handVisible = true
  }
  
  @action
  hiddenHand() {
    this.handVisible = false
  }

  @computed
  get enableAutoHandUpCoVideo(): boolean {
    return !!get(this.appStore.middleRoomStore,'roomProperties.handUpStates.autoCoVideo', 0)
  }

  @computed
  get enableCoVideo(): boolean {
    return !!get(this.appStore.middleRoomStore,'roomProperties.handUpStates.state', 0)
  }

  @action
  async updateHandUpState(enableCoVideo: boolean, enableAutoHandUpCoVideo: boolean) {
    await this.middleRoomApi.setInvitation()
    await this.appStore.middleRoomStore.roomManager?.userService?.updateRoomBatchProperties(
      {
        properties: {
          "handUpStates": {
            "state": +enableCoVideo,
            "autoCoVideo": +enableAutoHandUpCoVideo
          }
        },
        cause: {
          cmd: `${MiddleRoomPropertiesChangeCause.handUpStateChanged}`
        }
      }
    )
  }

  @observable
  visibleCard: boolean = false

  @observable
  insideGroupControl: boolean = false

  showInsideGroup() {
    this.insideGroupControl = true
  }

  hiddenInsideGroup() {
    this.insideGroupControl = false
  }

  @action
  toggleCard() {
    this.visibleCard = !this.visibleCard
  }

  hideCard() {
    this.visibleCard = false
  }

  async acceptApply(userUuid: string, streamUuid: string) {
    const exists = this.sceneStore.streamList.find((stream) => stream.streamUuid === streamUuid)
    const idx = this.applyUsers.findIndex((user) => user.userUuid === userUuid)
    this.applyUsers.splice(idx, 1)
    this.applyUsers = this.applyUsers.filter((user) => user.userName !== userUuid)
    if (exists) {
      return
    }
    await this.answerAcceptInvitationApply(userUuid, streamUuid);
  }

  @computed
  get userRole() {
    return this.appStore.sceneStore.localUser.userRole
  }

  @computed
  get showStudentHandsTool(): boolean {
    if (this.userRole === EduRoleTypeEnum.student && this.enableCoVideo) {
      return true
    }
    return false
  }

  @computed
  get showTeacherHandsTool(): boolean {
    if (this.userRole === EduRoleTypeEnum.teacher && this.enableCoVideo) {
      return true
    }
    return false
  }

  @observable
  tick: number = 3000

  interval?: SetInterval

  @observable
  inTick: boolean = false

  @computed
  get roomManager() {
    return this.appStore.middleRoomStore.roomManager
  }

  @computed
  get coVideo(): boolean {
    if (this.appStore.sceneStore._cameraEduStream) return true
    return false
  }

  @computed
  get middleRoomApi() {
    return this.appStore.middleRoomStore.middleRoomApi
  }

  @computed
  get teacherUuid() {
    return this.appStore.sceneStore.teacherUuid
  }

  @observable
  handsUp: boolean = false

  @action
  async startInvitationApply () {
    try {
      const teacherUuid = this.teacherUuid
      await this.middleRoomApi.raiseHands(
        InvitationEnum.Apply,
        teacherUuid,
      )
      const localStream = this.roomManager.userService.localStream
      if (localStream.state === 0 && this.enableAutoHandUpCoVideo) {
        const localStreamData = this.roomManager.data.localStreamData
        await this.roomManager.userService.publishStream({
          videoSourceType: EduVideoSourceType.camera,
          audioSourceType: EduAudioSourceType.mic,
          streamName: '',
          streamUuid: localStream.stream.streamUuid,
          hasVideo: true,
          hasAudio: true,
          userInfo: {} as EduUser
        })
      }
      this.appStore.uiStore.addToast(t(`invitation.apply_success`))
      this.appStore.middleRoomStore.didHandsUp = true
      console.log('apply success')
    } catch (err) {
      console.warn(err)
      console.log('apply failed')
      this.appStore.uiStore.addToast(t(`invitation.apply_failed`))
    }
  }

  @action
  async stopInvitationApply () {
    try {
      const teacherUuid = this.teacherUuid
      await this.middleRoomApi.handInvitationEnd(
        InvitationEnum.Cancel,
        teacherUuid
      )
      this.handsUp = false
      setInterval(this.timer)
      this.timer = undefined
      this.appStore.uiStore.addToast(t(`invitation.stop_success`))
      this.appStore.middleRoomStore.didHandsUp = false
      console.log('stop invitation success')
    } catch (err) {
      console.warn(err)
      console.log('stop invitation failed')
      this.appStore.uiStore.addToast(t(`invitation.stop_failed`))
    }
  }

  @action
  async rejectInvitationApply (toUserUuid: string) {
    try {
      await this.middleRoomApi.handInvitationEnd(
        InvitationEnum.Reject,
        toUserUuid
      )
      console.log('reject success')
      this.appStore.uiStore.addToast(t(`invitation.reject_success`))
    } catch (err) {
      console.warn(err)
      console.log('reject failed')
      this.appStore.uiStore.addToast(t(`invitation.reject_failed`))
    }
  }

  @action
  async answerAcceptInvitationApply (userUuid: string, streamUuid: string) {
    try {
      // 老师接受学生举手需要走结束接口
      await this.middleRoomApi.handInvitationEnd(
        InvitationEnum.Accept,
        userUuid,
      )
      if (this.enableCoVideo) {
        await this.appStore.middleRoomStore.batchUpdateStreamAttributes([{
          streamUuid: streamUuid,
          userUuid: userUuid,
          videoSourceType: EduVideoSourceType.camera,
          audioSourceType: EduAudioSourceType.mic,
          videoState: MediaState.hasVideo,
          audioState: MediaState.hasAudio,
        }])
      }
      this.appStore.uiStore.addToast(t(`invitation.accept_success`))
      console.log('accept success')
    } catch (err) {
      console.warn(err)
      console.log('accept failed')
      this.appStore.uiStore.addToast(t(`invitation.accept_failed`))
    }
  }
  
  @action
  startTick() {
    if (this.interval !== undefined) {
      this.stopTick()
    }
    this.tick = 3000
    this.inTick = true
    this.interval = setInterval(async () => {
      if (this.tick === 1000) {
        if (this.interval) {
          clearInterval(this.interval)
          this.interval = undefined
        }
        this.inTick = false
        if (!this.appStore.middleRoomStore.didHandsUp) {
          await this.startInvitationApply()
        } else {
          await this.stopInvitationApply()
        }
        return
      }
      this.tick -= 1000
    }, 1000)
  }

  @action
  stopTick() {
    this.interval && clearInterval(this.interval)
    this.interval = undefined
    this.inTick = false
  }

  @observable
  timer: any = undefined

  @observable
  time: number = 0

  @computed
  get delaysSeconds(): number {
    const roomUuid = this.appStore.sceneStore.roomUuid
    const roomProperties = this.appStore.middleRoomStore.roomProperties
    const delaysSeconds = get(roomProperties, `processes.${roomUuid}.timeout`, -1)
    return delaysSeconds
  }

  @action
  startTimer() {
    BizLogger.info('start hands up delay timer')
    if (this.timer) {
      return BizLogger.info('delay timer already setup')
    }
    this.timer = setInterval(() => {
      if (this.time === this.delaysSeconds) {
        clearInterval(this.timer)
        this.timer = undefined
      }
      this.time += 1
    }, 1000)
  }

  @computed
  get handsUpDelay(): boolean {
    const delaysSeconds = this.delaysSeconds
    if (delaysSeconds !== -1) {
      if (this.enableCoVideo) {
        if (this.time === delaysSeconds) {
          return true
        }
      }
    }
    return false
  }

  @action
  resetApply() {
    this.appStore.uiStore.addToast(t('extension.hands_up_timeout'))
    BizLogger.info('hands up over max wait reset apply user list')
    this.applyUsers = []
    this.visibleUserList = false
    this.handsUp = false
  }

  @action
  async raiseHands() {

  }

  @action
  async acceptRaiseHands(userUuid: string) {
    // await this.appStore.middleRoomStore.middleRoomApi.handInvitationStart()
  }

  @observable
  visibleUserList: boolean = false

  @action
  toggleApplyUserList() {
    this.visibleUserList = !this.visibleUserList
  }

  @action
  hideApplyUserList() {
    this.visibleUserList = false
  }

  @action
  async removeApplyUserBy (userUuid: string) {
    const idx = this.applyUsers.findIndex((user) => user.userUuid === userUuid)
    this.applyUsers.splice(idx, 1)
    this.applyUsers = this.applyUsers.filter((user) => user.userName !== userUuid)
    // 清空举手列表
    await this.rejectInvitationApply(userUuid)
  }
}