import { computed } from 'mobx';
import { EduUIStoreBase } from '../base';
import { iterateMap } from '../../../../utils/collection';
import { bound } from 'agora-rte-sdk';
import { EduClassroomConfig } from '../../../../configs';
export type UserWaveArmInfo = {
  userUuid: string;
  userName: string;
  onPodium: boolean;
};

export class HandUpUIStore extends EduUIStoreBase {
  onInstall() {}
  @computed
  get userWaveArmList() {
    const waveArmList = this.classroomStore.roomStore.waveArmList;
    const acceptedList = this.classroomStore.roomStore.acceptedList;
    const userList = this.classroomStore.userStore.users;

    const userWaveArmList = waveArmList.reduce<UserWaveArmInfo[]>((list, waveArmItem) => {
      const userItem = userList.get(waveArmItem.userUuid);
      if (userItem) {
        const isOnPodiuming = acceptedList.some((item) => {
          return item.userUuid === waveArmItem.userUuid;
        });
        list.push({
          userUuid: waveArmItem.userUuid,
          userName: userItem.userName,
          onPodium: isOnPodiuming,
        });
        return list;
      }
      return list;
    }, []);

    return userWaveArmList;
  }

  @computed
  get hasWaveArmUser() {
    return this.userWaveArmList.length > 0;
  }

  @computed
  get waveArmCount() {
    return this.userWaveArmList.length;
  }

  @computed
  get teacherUuid() {
    const teacherList = this.classroomStore.userStore.teacherList;
    const teachers = Array.from(teacherList.values());
    if (teachers.length > 0) {
      return teachers[0].userUuid;
    }
    return '';
  }

  //others
  @bound
  onPodium(userUuid: string) {
    this.classroomStore.handUpStore
      .onPodium(userUuid)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  @bound
  offPodium(userUuid: string) {
    this.classroomStore.handUpStore
      .offPodium(userUuid)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  @bound
  rejectHandUp(userUuid: string) {
    this.classroomStore.handUpStore
      .rejectHandUp(userUuid)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  @bound
  async cancelHandUp() {
    this.classroomStore.handUpStore
      .cancelHandUp()
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  @bound
  handUp(teacherUuid: string) {
    this.classroomStore.handUpStore
      .handUp(teacherUuid)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  @bound
  waveArm(teacherUuid: string, duration: -1 | 3) {
    this.classroomStore.handUpStore
      .waveArm(teacherUuid, duration)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  onDestroy() {}
}
