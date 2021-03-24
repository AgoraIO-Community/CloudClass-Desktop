import { eduSDKApi } from './../../services/edu-sdk-api';
import { AppStore } from '@/stores/app';
import { RoomStore } from './room';
import { computed } from 'mobx';
import { get } from 'lodash';
import { EduUser } from 'agora-rte-sdk';
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
  get teacherUuid(): string {
    if (this.teacherInfo) {
      return this.teacherInfo.userUuid
    }
    return ''
  }

  @computed
  get isCoVideo(): boolean {
    const meUid = this.roomInfo.userUuid
    return this.coVideoUsers.includes(meUid)
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
  get acceptedCoVideoUserList() {
    const userList = get(this.roomStore.sceneStore, 'userList', [])
    const acceptedList = get(this.roomStore, 'roomProperties.processes.handsUp.accepted', [])
    const ids = acceptedList.map((e: any) => e.userUuid)
    return userList.filter(({userUuid}: EduUser) => ids.includes(userUuid))
    .map(({userUuid, userName}: EduUser) => ({
      userUuid,
      userName,
      coVideo: true,
    }))
  }

  @computed
  get handsUpStudentList() {
    return this.applyCoVideoUserList.concat(this.acceptedCoVideoUserList)
  }

  @computed
  get studentRewardMap() {
    const studentRewardMap = get(this.roomStore, 'roomProperties.students', {})
    return studentRewardMap
  }

  async studentHandsUp(teacherUuid: string) {
    await eduSDKApi.startHandsUp({
      roomUuid: this.roomUuid,
      toUserUuid: teacherUuid
    })
  }

  async studentDismissHandsUp(teacherUuid: string) {
    await eduSDKApi.cancelHandsUp({
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

  reset() {

  }
  
}