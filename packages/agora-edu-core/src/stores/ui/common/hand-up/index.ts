import { computed } from 'mobx';
import { EduUIStoreBase } from '../base';
import { bound, AGError } from 'agora-rte-sdk';
import { AGServiceErrorCode } from '../../../../services/error';
import { transI18n } from '../i18n';
export type UserWaveArmInfo = {
  userUuid: string;
  userName: string;
  onPodium: boolean;
};

export class HandUpUIStore extends EduUIStoreBase {
  onInstall() {}
  /**
   * 挥手用户列表
   * @returns
   */
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

  /**
   * 是否有用户在挥手
   * @returns
   */
  @computed
  get hasWaveArmUser() {
    return this.userWaveArmList.length > 0;
  }

  /**
   * 挥手用户数
   * @returns
   */
  @computed
  get waveArmCount() {
    return this.userWaveArmList.length;
  }

  /**
   * 老师的唯一标识
   * @returns
   */
  @computed
  get teacherUuid() {
    const teacherList = this.classroomStore.userStore.teacherList;
    const teachers = Array.from(teacherList.values());
    if (teachers.length > 0) {
      return teachers[0].userUuid;
    }
    return '';
  }

  /**
   * 学生上台
   * @param userUuid
   */
  @bound
  onPodium(userUuid: string) {
    this.classroomStore.handUpStore.onPodium(userUuid).catch((e) => {
      if (AGError.isOf(e, AGServiceErrorCode.SERV_ACCEPT_MAX_COUNT)) {
        this.shareUIStore.addToast(transI18n('on_podium_max_count'), 'warning');
      } else if (
        !AGError.isOf(
          e,
          AGServiceErrorCode.SERV_PROCESS_CONFLICT,
          AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
        )
      ) {
        this.shareUIStore.addGenericErrorDialog(e);
      }
    });
  }

  /**
   * 学生下台
   * @param userUuid
   */
  @bound
  offPodium(userUuid: string) {
    this.classroomStore.handUpStore
      .offPodium(userUuid)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  /**
   * 老师拒绝学生上台
   * @param userUuid
   */
  @bound
  rejectHandUp(userUuid: string) {
    this.classroomStore.handUpStore
      .rejectHandUp(userUuid)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  /**
   * 学生取消举手
   */
  @bound
  async cancelHandUp() {
    this.classroomStore.handUpStore
      .cancelHandUp()
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  /**
   * 学生举手
   * @param teacherUuid
   */
  @bound
  handUp(teacherUuid: string) {
    this.classroomStore.handUpStore
      .handUp(teacherUuid)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  /**
   * 学生挥手
   *
   * @param teacherUuid
   * @param duration 挥手的时间，单位：秒，-1 为持续举手
   */
  @bound
  waveArm(teacherUuid: string, duration: -1 | 3) {
    this.classroomStore.handUpStore
      .waveArm(teacherUuid, duration)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  onDestroy() {}
}
