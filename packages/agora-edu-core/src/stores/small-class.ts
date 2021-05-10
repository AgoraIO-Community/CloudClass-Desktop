import { EduSceneType } from 'agora-rte-sdk';
import { GenericErrorWrapper } from 'agora-rte-sdk';
import { eduSDKApi } from '../services/edu-sdk-api';
import { EduScenarioAppStore as EduScenarioAppStore } from './index';
import { RoomStore } from './room';
import { action, computed } from 'mobx';
import { get } from 'lodash';
import { EduStream, EduUser, EduVideoSourceType, EduRoleTypeEnum, RemoteUserRenderer, LocalUserRenderer } from 'agora-rte-sdk';
import { EduMediaStream } from './scene';
import { BusinessExceptions } from '../utilities/biz-error';


export type RosterUserInfo = {
  name: string,
  uid: string,
  onlineState: boolean,
  onPodium: boolean,
  micDevice: boolean,
  cameraDevice: boolean,
  cameraEnabled: boolean,
  chatEnabled: boolean,
  micEnabled: boolean,
  whiteboardGranted: boolean,
  canCoVideo: boolean,
  canGrantBoard: boolean,
  stars: number,
  disabled: boolean
}

export class SmallClassStore {

  private roomStore: RoomStore;

  private appStore: EduScenarioAppStore;

  constructor(roomStore: RoomStore) {
    this.roomStore = roomStore;
    this.appStore = roomStore.appStore;
  }

  roleToString(role: EduRoleTypeEnum) {
    switch(role) {
      case EduRoleTypeEnum.assistant: {
        return 'assistant'
      }
      case EduRoleTypeEnum.teacher: {
        return 'teacher'
      }
      case EduRoleTypeEnum.student: {
        return 'student'
      }
      default: {
        return 'invisible'
      }
    }
  }

  @computed
  get onlineUserCount () {
    return this.sceneStore.userList.filter((it) => ['audience'].includes(it.role)).length
  }

  @computed
  get processUserCount () {
    return this.applyCoVideoUserList.length
  }

  @computed
  get role() {
    return this.roleToString(this.appStore.userRole)
  }

  @computed
  get teacherInfo(): EduUser | undefined {
    return this.roomStore.sceneStore.userList.find((user: EduUser) => user.role === 'host')
  }

  @computed
  get sceneStore() {
    return this.appStore.sceneStore
  }

  @computed
  get teacherName() {
    return this.teacherInfo?.userName ?? 'teacher' 
  }

  @computed
  get studentStreams(): EduMediaStream[] {
    let streamList = this.acceptedList.reduce((acc: any[], acceptedUser: EduUser) => {
      const stream = this.sceneStore.streamList.find((stream: EduStream) => stream.userInfo.userUuid === acceptedUser.userUuid)
      const props = this.sceneStore.getRemotePlaceHolderProps(acceptedUser.userUuid, 'student')
      const volumeLevel = this.sceneStore.getFixAudioVolume(+get(stream, 'streamUuid',-1))
      const user = get(this.studentsMap, `${acceptedUser.userUuid}`, {})
      if (acceptedUser.userUuid !== this.roomInfo.userUuid) {
        acc.push({
          local: false,
          account: get(user, 'name', ''),
          userUuid: acceptedUser.userUuid,
          streamUuid: get(stream, 'streamUuid', ''),
          video: get(stream, 'hasVideo', ''),
          audio: get(stream, 'hasAudio', ''),
          renderer: this.sceneStore.remoteUsersRenderer.find((it: RemoteUserRenderer) => +it.uid === +get(stream, 'streamUuid', -1)) as RemoteUserRenderer,
          hideControl: this.sceneStore.hideControl(user.userUuid),
          holderState: props.holderState,
          placeHolderText: props.text,
          micVolume: volumeLevel,
          stars: +get(this.studentsMap, `${acceptedUser.userUuid}.reward`, 0),
          whiteboardGranted: this.appStore.boardStore.checkUserPermission(`${acceptedUser.userUuid}`),
        })
      }
      return acc
    }, [])

    const localUser = this.sceneStore.localUser

    const isStudent = [EduRoleTypeEnum.student].includes(localUser.userRole)

    if (this.sceneStore.cameraEduStream && isStudent) {
      const props = this.sceneStore.getLocalPlaceHolderProps()
      streamList = [{
        local: true,
        account: localUser.userName,
        userUuid: this.sceneStore.cameraEduStream.userInfo.userUuid as string,
        streamUuid: this.sceneStore.cameraEduStream.streamUuid,
        video: this.sceneStore.cameraEduStream.hasVideo,
        audio: this.sceneStore.cameraEduStream.hasAudio,
        renderer: this.sceneStore.cameraRenderer as LocalUserRenderer,
        hideControl: this.sceneStore.hideControl(this.appStore.userUuid),
        holderState: props.holderState,
        placeHolderText: props.text,
        stars: +get(this.studentsMap, `${this.roomInfo.userUuid}.reward`, 0),
        whiteboardGranted: this.appStore.boardStore.checkUserPermission(`${this.appStore.userUuid}`),
        micVolume: this.sceneStore.localVolume,
      } as any].concat(streamList.filter((it: any) => it.userUuid !== this.appStore.userUuid))
    }
    if (streamList.length) {
      return streamList  
    }
    return []
  }

  @computed
  get teacherUuid(): string {
    if (this.teacherInfo) {
      return this.teacherInfo.userUuid
    }
    return ''
  }

  @computed
  get isCoVideo(): boolean {
    const meUid = this.roomInfo.userUuid
    return !!this.acceptedList.find((it: any) => it.userUuid=== meUid)
  }

  @computed
  get coVideoUsers() {
    const userList = get(this.roomStore, 'roomProperties.coVideo.users', [])
    return userList
  }

  get roomInfo() {
    return this.roomStore.roomInfo
  }

  get roomUuid() {
    return this.roomInfo.roomUuid
  }

  @computed
  get acceptedUserList() {
    const userList = get(this.roomStore.sceneStore, 'userList', [])
    const progressList = get(this.roomStore, 'roomProperties.processes.handsUp.accepted', [])
    const ids = progressList.map((e: any) => e.userUuid)
    return userList.filter(({userUuid}: EduUser) => ids.includes(userUuid))
    .map(({userUuid, userName}: EduUser) => ({
      userUuid,
      userName,
      coVideo: false,
    }))
  }

  @computed
  get applyCoVideoUserList() {
    const userList = get(this.roomStore.sceneStore, 'userList', [])
    const progressList = get(this.roomStore, 'roomProperties.processes.handsUp.progress', [])
    const ids = progressList.map((e: any) => e.userUuid)
    return userList.filter(({userUuid}: EduUser) => ids.includes(userUuid))
    .map(({userUuid, userName}: EduUser) => ({
      userUuid,
      userName,
      coVideo: false,
    }))
  }

  @computed
  get acceptedList() {
    const acceptedList = get(this.roomStore, 'roomProperties.processes.handsUp.accepted', [])
    return acceptedList
  }

  @computed
  get acceptedIds() {
    return this.acceptedList.map((it: any) => it.userUuid)
  }

  @computed
  get acceptedCoVideoUserList() {
    const userList = get(this.roomStore.sceneStore, 'userList', [])
    const acceptedList = this.acceptedList
    const ids = acceptedList.map((e: any) => e.userUuid)
    return userList.filter(({userUuid}: EduUser) => ids.includes(userUuid))
    .map(({userUuid, userName}: EduUser) => ({
      userUuid,
      userName,
      coVideo: true,
    }))
  }

  async sendReward(uid: string) {
    await eduSDKApi.sendRewards({
      roomUuid: this.roomInfo.roomUuid,
      rewards: [{
        userUuid: uid,
        changeReward: 1
      }]
    })
  }

  @computed
  get handsUpStudentList() {
    return this.applyCoVideoUserList.concat(this.acceptedCoVideoUserList)
  }

  @computed
  get studentsMap() {
    if (this.roomInfo.roomType === EduSceneType.SceneLarge) {
      const map = {}
      return this.sceneStore.userList.reduce((acc: any, user: EduUser) => {
        acc[user.userUuid] = {
          uid: user.userUuid,
          name: user.userName,
          role: user.role,
          userProperties: user.userProperties
        }
        return acc;
      }, map)
    } else {
      const studentsMap = get(this.roomStore, 'roomProperties.students', {})
      return studentsMap
    }
  }

  @action.bound
  async studentHandsUp(teacherUuid: string) {
    try {
      await eduSDKApi.startHandsUp({
        roomUuid: this.roomUuid,
        toUserUuid: teacherUuid
      })
    } catch (err) {
      const error = GenericErrorWrapper(err)
      const {result, reason} = BusinessExceptions.getErrorText(error)
      this.appStore.uiStore.fireToast(result, {reason})
      console.log('studentHandsUp err', error)
      throw error;
    }
  }

  @action.bound
  async studentCancelHandsUp() {
    await eduSDKApi.cancelHandsUp({
      roomUuid: this.roomUuid,
    })
  }

  @action.bound
  async studentDismissHandsUp(teacherUuid: string) {
    await eduSDKApi.dismissHandsUp({
      roomUuid: this.roomUuid,
      toUserUuid: teacherUuid
    })
  }

  @action.bound
  async teacherAcceptHandsUp(userUuid: string) {
    try {
      await eduSDKApi.acceptHandsUp({
        roomUuid: this.roomUuid,
        toUserUuid: userUuid
      })
    } catch(err) {
      const error = GenericErrorWrapper(err)
      const {result, reason} = BusinessExceptions.getErrorText(error)
      this.appStore.uiStore.fireToast(result, {reason})
      console.log('teacherAcceptHandsUp err', error)
      throw error;
    }
  }

  @action.bound
  async revokeCoVideo(userUuid: string) {
    if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
      await eduSDKApi.revokeCoVideo({
        roomUuid: this.roomUuid,
      })
    } else {
      await eduSDKApi.revokeCoVideo({
        roomUuid: this.roomUuid,
        toUserUuid: userUuid
      })
    }
  }

  @action.bound
  async teacherRejectHandsUp(userUuid: string) {
    await eduSDKApi.refuseHandsUp({
      roomUuid: this.roomUuid,
      toUserUuid: userUuid
    })
  }

  @action.bound
  async teacherInviteHandsUp(userUuid: string) {
    // await eduSDKApi.({
    //   roomUuid: this.roomUuid,
    //   toUserUuid: userUuid
    // })
  }

  checkDisable(user: EduUser, role: EduRoleTypeEnum, stream?: EduStream): boolean {
    if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role)) {
      return false
    }

    if (role === EduRoleTypeEnum.student 
        && this.appStore.roomInfo.userUuid === user.userUuid
        && this.acceptedIds.includes(user.userUuid)
      ) {
      return false
    }
    return true
  }


  transformRosterUserInfo (user: EduUser, role: EduRoleTypeEnum, stream?: EduStream): RosterUserInfo {
    return {
      name: user.userName,
      uid: user.userUuid,
      onlineState: true,
      onPodium: this.acceptedUserList.find((it: any) => it.userUuid === user.userUuid) ? true : false,
      micDevice: !!get(user, 'userProperties.microphone', 0),
      cameraDevice: !!get(user, 'userProperties.camera', 0),
      cameraEnabled: stream?.hasVideo ?? false,
      chatEnabled: !get(user, 'userProperties.mute.muteChat', 0),
      micEnabled: stream?.hasAudio ?? false,
      whiteboardGranted: this.appStore.boardStore.checkUserPermission(user.userUuid),
      // whiteboardGranted: !!get,
      canCoVideo: [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role),
      canGrantBoard: [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role),
      stars: +get(this.studentsMap, `${user.userUuid}.reward`, 0),
      disabled: this.checkDisable(user, role, stream)
      // disabled: [EduRoleTypeEnum.student].includes(role) ? true : false,
    }
  }

  @computed
  get localUserRosterInfo() {
    const localUserUuid = this.roomStore.roomInfo.userUuid 
    const user = this.roomStore.sceneStore.userList.find((user: EduUser) => user.userUuid === localUserUuid)
    if (user) {
      const stream = this.roomStore.sceneStore
        .streamList.find((stream: EduStream) => stream.userInfo.userUuid === user.userUuid && stream.videoSourceType === EduVideoSourceType.camera)
      return this.transformRosterUserInfo(user, this.roomInfo.userRole, stream)
    }
    return {
      uid: localUserUuid,
      name: this.roomInfo.userName,
      onPodium: this.acceptedUserList.find((it: any) => it.userUuid === localUserUuid) ? true : false,
      onlineState: true,
      micDevice: false,
      cameraDevice: false,
      cameraEnabled: !!get(this.sceneStore, 'cameraEduStream.hasVideo',0),
      micEnabled: !!get(this.sceneStore, 'cameraEduStream.hasAudio',0),
      whiteboardGranted: false,
      canGrantBoard: [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(this.roomInfo.userRole),
      stars: 0,
      disabled: false,
    }
  }

  @computed
  get studentInfoList() {
    return this.roomStore.sceneStore.userList
    // return Object.keys(this.studentsMap).reduce((acc: any[], userUuid: string) => {
    //   const user = this.roomStore.sceneStore.userList.find((user) => user.userUuid === userUuid)
    //   if (user) {
    //     acc.push(user)
    //   } else {
    //     acc.push({userUuid: userUuid, userName: this.studentsMap[userUuid]?.name ?? ''})
    //   }
    //   return acc;
    // }, [])
  }

  @computed
  get bigClassUserList() {
    const localUserUuid = this.roomStore.roomInfo.userUuid    
    const userList = this.sceneStore.userList
      .filter((user: EduUser) => ['audience', 'broadcaster'].includes(user.role))
      .filter((user: EduUser) => user.userUuid !== localUserUuid)
      .reduce((acc: any[], user: EduUser) => {
        const stream = this.roomStore.sceneStore.streamList.find((stream: EduStream) => stream.userInfo.userUuid === user.userUuid && stream.videoSourceType === EduVideoSourceType.camera)
        const rosterUser = this.transformRosterUserInfo(user, this.roomInfo.userRole, stream)
        acc.push(rosterUser)
        return acc
      }, [])

    if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
      return [this.localUserRosterInfo].concat(userList)
    }
    return userList
  }

  @computed
  get rosterUserList() {
    const localUserUuid = this.roomStore.roomInfo.userUuid    
    const userList = this.studentInfoList
      .filter((user: EduUser) => ['audience'].includes(user.role))
      .filter((user: EduUser) => user.userUuid !== localUserUuid)
      .reduce((acc: any[], user: EduUser) => {
        const stream = this.roomStore.sceneStore.streamList.find((stream: EduStream) => stream.userInfo.userUuid === user.userUuid && stream.videoSourceType === EduVideoSourceType.camera)
        const rosterUser = this.transformRosterUserInfo(user, this.roomInfo.userRole, stream)
        acc.push(rosterUser)
        return acc
      }, [])

    if (this.roomInfo.userRole === EduRoleTypeEnum.student) {
      return [this.localUserRosterInfo].concat(userList)
    }
    return userList
  }

  reset() {

  }

  @action.bound
  async handleRosterClick (actionType: string, uid: string) {

    const userList = this.rosterUserList

    const sceneStore = this.appStore.sceneStore

    const user = userList.find((user: RosterUserInfo) => user.uid === uid)

    if (!user) {
      return
    }

    switch (actionType) {
      case 'podium': {
        if (user.onPodium) {
          if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(this.roomInfo.userRole)) {
            await this.revokeCoVideo(user.uid)
          }
        } else {
          if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(this.roomInfo.userRole)) {
            await this.teacherAcceptHandsUp(user.uid)
          }
        }
        break;
      }
      case 'whiteboard': {
        if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(this.roomInfo.userRole)) {
          if (user.whiteboardGranted) {
            await this.appStore.boardStore.revokeBoardPermission(uid)
          } else {
            await this.appStore.boardStore.grantBoardPermission(uid)
          }
        }
        break;
      }
      case 'camera': {
        const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === uid)
        if (targetStream) {
          const isLocal = sceneStore.roomInfo.userUuid === uid
          if (targetStream.hasVideo) {
            await sceneStore.muteVideo(uid, isLocal)
          } else {
            await sceneStore.unmuteVideo(uid, isLocal)
          }
        }
        break;
      }
      case 'mic': {
        const targetStream = sceneStore.streamList.find((stream: EduStream) => get(stream.userInfo, 'userUuid', 0) === uid)
        if (targetStream) {
          const isLocal = sceneStore.roomInfo.userUuid === uid
          if (targetStream.hasAudio) {
            await sceneStore.muteAudio(uid, isLocal)
          } else {
            await sceneStore.unmuteAudio(uid, isLocal)
          }
        }
        break;
      }
      case 'kick-out': {
        if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(this.roomInfo.userRole)) {
          this.appStore.uiStore.fireDialog('kick-dialog', {userUuid: uid, roomUuid: this.roomInfo.roomUuid})
        }
        break;
      }
    }
  }
  
  @computed
  get handsUpState() {
    // 学生举手状态
    const accepted = this.acceptedUserList.find((it: any) => it.userUuid === this.roomInfo.userUuid)
    if (accepted) {
      return 'forbidden'
    }

    const applied = this.applyCoVideoUserList.find((it: any) => it.userUuid === this.roomInfo.userUuid)
    if (applied) {
      return 'actived'
    }

    return 'default'
  }

  @computed
  get teacherHandsUpState () {
    // 老师端举手状态
    return this.processUserCount === 0 ? 'default' : 'actived'
  }

  @computed
  get inPrivateConversation() {
    const streamGroups = get(this.roomStore, 'roomProperties.streamGroups', {})
    let localUser = this.sceneStore.localUser
    let groupKey = Object.keys(streamGroups).find(groupKey => streamGroups[groupKey] !== 'deleted')
    return groupKey ? groupKey.includes(localUser.userUuid) : false
  }

  @computed
  // has any private conversation within this room
  get hasPrivateConversation() {
    const streamGroups = get(this.roomStore, 'roomProperties.streamGroups', {})
    return Object.values(streamGroups).filter(group => group !== "deleted").length > 0
  }
}