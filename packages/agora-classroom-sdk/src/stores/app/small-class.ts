import { eduSDKApi } from './../../services/edu-sdk-api';
import { AppStore } from '@/stores/app';
import { RoomStore } from './room';
import { computed } from 'mobx';
import { get } from 'lodash';
import { EduStream, EduUser, EduVideoSourceType, EduRoleTypeEnum, RemoteUserRenderer, LocalUserRenderer } from 'agora-rte-sdk';
import { RosterUserInfo } from '../types';
import { EduMediaStream } from './scene';
export class SmallClassStore {

  private roomStore: RoomStore;

  private appStore: AppStore;

  constructor(roomStore: RoomStore) {
    this.roomStore = roomStore;
    this.appStore = roomStore.appStore;
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
  get teachers() {
    return get(this.roomStore, 'roomProperties.teachers', {})
  }

  @computed
  get teacherName() {
    const teacherUid = Object.keys(this.teachers)[0]
    return get(this.teachers, `${teacherUid}.${name}`, '')
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
          placeHolderType: props.placeHolderType,
          placeHolderText: props.text,
          volumeLevel: volumeLevel,
          stars: +get(this.studentsMap, `${acceptedUser.userUuid}.reward`, 0),
          whiteboardGranted: false,
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
        placeHolderType: props.placeHolderType,
        placeHolderText: props.text,
        stars: +get(this.studentsMap, `${this.roomInfo.userUuid}.reward`, 0),
        volumeLevel: this.sceneStore.localVolume,
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
    return this.acceptedList.find((it: any) => it.userUuid=== meUid)
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
    const reward = +get(this.studentsMap, `${uid}.reward`, 0)
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
    const studentsMap = get(this.roomStore, 'roomProperties.students', {})
    return studentsMap
  }

  async studentHandsUp(teacherUuid: string) {
    await eduSDKApi.startHandsUp({
      roomUuid: this.roomUuid,
      toUserUuid: teacherUuid
    })
  }

  async studentDismissHandsUp(teacherUuid: string) {
    await eduSDKApi.dismissHandsUp({
      roomUuid: this.roomUuid,
      toUserUuid: teacherUuid
    })
  }

  async teacherAcceptHandsUp(userUuid: string) {
    await eduSDKApi.acceptHandsUp({
      roomUuid: this.roomUuid,
      toUserUuid: userUuid
    })
  }

  async teacherRejectHandsUp(userUuid: string) {
    await eduSDKApi.refuseHandsUp({
      roomUuid: this.roomUuid,
      toUserUuid: userUuid
    })
  }

  async teacherInviteHandsUp(userUuid: string) {
    // await eduSDKApi.({
    //   roomUuid: this.roomUuid,
    //   toUserUuid: userUuid
    // })
  }


  transformRosterUserInfo (user: EduUser, stream: EduStream, role: EduRoleTypeEnum): RosterUserInfo {
    return {
      name: user.userName,
      uid: user.userUuid,
      onlineState: true,
      micDevice: !!get(user, 'userProperties.microphone', 0),
      cameraDevice: !!get(user, 'userProperties.camera', 0),
      cameraEnabled: !!get(stream, 'hasVideo', 0),
      micEnabled: !!get(stream, 'hasAudio', 0),
      whiteboardGranted: this.appStore.boardStore.grantUsers.includes(user.userUuid),
      // whiteboardGranted: !!get,
      canCoVideo: [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role),
      canGrantBoard: [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role),
      stars: +get(this.studentsMap, `${user.userUuid}.reward`, 0),
      disabled: [EduRoleTypeEnum.student].includes(role) ? true : false,
    }
  }

  @computed
  get localUserRosterInfo() {
    const localUserUuid = this.roomStore.roomInfo.userUuid 
    const user = this.roomStore.sceneStore.userList.find((user: EduUser) => user.userUuid === localUserUuid)
    if (user) {
      const stream = this.roomStore.sceneStore
        .streamList.find((stream: EduStream) => stream.userInfo.userUuid === user.userUuid && stream.videoSourceType === EduVideoSourceType.camera)
      return this.transformRosterUserInfo(user, stream!, this.roomInfo.userRole)
    }
    return {
      uid: localUserUuid,
      name: this.roomInfo.userName,
      onlineState: false,
      micDevice: false,
      cameraDevice: false,
      cameraEnabled: false,
      micEnabled: false,
      whiteboardGranted: false,
      canGrantBoard: [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(this.roomInfo.userRole),
      stars: 0,
      disabled: [EduRoleTypeEnum.student].includes(this.roomInfo.userRole) ? true : false,
    }
  }

  @computed
  get rosterUserList() {
    const localUserUuid = this.roomStore.roomInfo.userUuid    

    const userList = this.roomStore.sceneStore.userList
      .filter((user: EduUser) => !['host', 'assistant'].includes(user.role) && user.userUuid !== localUserUuid)
      .reduce((acc: any[], user: EduUser) => {
        const stream = this.roomStore.sceneStore.streamList.find((stream: EduStream) => stream.userInfo.userUuid === user.userUuid && stream.videoSourceType === EduVideoSourceType.camera)
        const rosterUser = this.transformRosterUserInfo(user, stream!, this.roomInfo.userRole)
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

  async handleRosterClick (actionType: string, uid: string) {

    const userList = this.rosterUserList

    const sceneStore = this.appStore.sceneStore

    const user = userList.find((user: RosterUserInfo) => user.uid === uid)

    if (!user) {
      return
    }

    switch (actionType) {
      case 'podium': {
        // await 
        break;
      }
      case 'whiteboard': {
        if (user.whiteboardGranted) {
          await this.appStore.boardStore.revokeBoardPermission(uid)
        } else {
          await this.appStore.boardStore.grantBoardPermission(uid)
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
        await eduSDKApi.kick({
          roomUuid: this.roomInfo.roomUuid,
          toUserUuid: uid
        })
        break;
      }
    }
  }
  
}