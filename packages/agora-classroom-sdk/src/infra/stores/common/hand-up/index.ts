import {
    AGServiceErrorCode,
    EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum, EduRoomSubtypeEnum, EduRoomTypeEnum, HandUpProgress, PodiumSrouce, RteRole2EduRole
} from 'agora-edu-core';
import { AGError, bound, Lodash } from 'agora-rte-sdk';
import { action, computed, observable, runInAction } from 'mobx';
import { EduUIStoreBase } from '../base';

import { transI18n } from '~ui-kit';
import { FetchUserParam, FetchUserType, OnPodiumStateEnum } from '../type';

export type UserWaveArmInfo = {
  userUuid: string;
  userName: string;
  onPodium: boolean;
};

export type UserHandUpInfo = {
  name: string;
  uid: string;
  role: EduRoleTypeEnum;
  onPodiumState: OnPodiumStateEnum;
};

export class HandUpUIStore extends EduUIStoreBase {
  onInstall() {}

  private _curInvitedInfo: HandUpProgress | undefined = undefined;
  private _refuseInvitedTs = 0;

  /**
   * 当前是否为职教
   */
  get isVocational() {
    return EduClassroomConfig.shared.sessionInfo.roomSubtype === EduRoomSubtypeEnum.Vocational;
  }

  /**
   * 当前是否为混合模式
   */
  get isMixCDNRTC() {
    return (
      this.isVocational &&
      EduClassroomConfig.shared.sessionInfo.roomServiceType === EduRoomServiceTypeEnum.Fusion
    );
  }

  /**
   * 持续挥手时间
   */
  get waveArmDurationTime() {
    if (this.isMixCDNRTC) {
      return 5;
    }
    return 3;
  }

  /**
   * 查询下一页的参数
   */
  get fetchUserListParams() {
    return {
      nextId: this._nextPageId,
      count: 10000,
      type: FetchUserType.all,
    };
  }

  /**
   * 查询下一页的ID
   */
  @observable
  private _nextPageId: number | string | undefined = 0;

  /**
   * 分页查询到的用户列表
   */
  @observable
  private _userList = [];

  @computed
  get userList(): UserHandUpInfo[] {
    const _acceptedList = this.classroomStore.roomStore.acceptedList;
    const _waveArmList = this.classroomStore.roomStore.waveArmList;
    const _inviteList = this.classroomStore.roomStore.inviteList;
    const acceptedList: UserHandUpInfo[] = [];
    const waveArmList: UserHandUpInfo[] = [];
    const inviteList: UserHandUpInfo[] = [];
    const idleList: UserHandUpInfo[] = [];
    this._userList.forEach(({ userUuid, userName, role }) => {
      const userRole = RteRole2EduRole(EduRoomTypeEnum.RoomBigClass, role);
      if (userRole === EduRoleTypeEnum.student) {
        const isOnPodiuming = _acceptedList.some((item) => {
          return item.userUuid === userUuid;
        });
        const isWaveArming = _waveArmList.some((item) => {
          return item.userUuid === userUuid;
        });
        const isInviteding = _inviteList.some((item) => {
          return item.userUuid === userUuid;
        });
        if (isOnPodiuming) {
          acceptedList.push({
            name: userName,
            uid: userUuid,
            role: userRole,
            onPodiumState: OnPodiumStateEnum.onPodiuming,
          });
        } else if (isWaveArming) {
          waveArmList.push({
            name: userName,
            uid: userUuid,
            role: userRole,
            onPodiumState: OnPodiumStateEnum.waveArming,
          });
        } else if (isInviteding) {
          inviteList.push({
            name: userName,
            uid: userUuid,
            role: userRole,
            onPodiumState: OnPodiumStateEnum.inviteding,
          });
        } else {
          idleList.push({
            name: userName,
            uid: userUuid,
            role: userRole,
            onPodiumState: OnPodiumStateEnum.idleing,
          });
        }
      }
    });
    return acceptedList.concat(waveArmList).concat(inviteList).concat(idleList);
  }

  /**
   * 是否达到最大邀请人数
   */
  @computed
  get inviteListMaxLimit(): boolean {
    const inviteList = this.classroomStore.roomStore.inviteList;
    const waveArmList = this.classroomStore.roomStore.waveArmList;
    const maxCount = this.classroomStore.handUpStore.handsUpLimit.maxWait;
    return inviteList.length + waveArmList.length >= maxCount;
  }

  /**
   * 是否达到最大上台人数
   */
  @computed
  get acceptedListMaxLimit(): boolean {
    const acceptedList = this.classroomStore.roomStore.acceptedList;
    const maxCount = this.classroomStore.handUpStore.handsUpLimit.maxAccept;
    return acceptedList.length >= maxCount;
  }

  /**
   * 是否被邀请上台
   * @returns
   */

  @computed
  get beingInvited() {
    const _inviteList = this.classroomStore.roomStore.inviteList;
    const _userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
    return _inviteList.some((v) => {
      const flag = v.userUuid === _userUuid && this._refuseInvitedTs < v.ts;
      if (flag) {
        this._curInvitedInfo = v;
      }
      return flag;
    });
  }

  /**
   * 挥手用户列表
   * @returns
   */
  @computed
  get userWaveArmList() {
    const waveArmList = this.classroomStore.roomStore.waveArmList;
    const acceptedList = this.classroomStore.roomStore.acceptedList;

    const userWaveArmList = waveArmList.reduce<UserWaveArmInfo[]>((list, waveArmItem) => {
      const isOnPodiuming = acceptedList.some((item) => {
        return item.userUuid === waveArmItem.userUuid;
      });
      list.push({
        userUuid: waveArmItem.userUuid,
        userName: waveArmItem.userName,
        onPodium: isOnPodiuming,
      });
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
   * 学生上台(接受学生举手)
   * @param userUuid
   */
  @bound
  onPodium(userUuid: string) {
    this.classroomStore.handUpStore
      .onPodium(userUuid, PodiumSrouce.AcceptedByTeacher)
      .catch((e) => {
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
   * 邀请学生上台
   * @param userUuid
   */
  invite(userUuid: string, duration: number, payload?: any) {
    console.warn('邀请');
    this.classroomStore.handUpStore
      .invitePodium(userUuid, duration, payload)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  /**
   * 学生同意上台
   * @param userUuid
   */
  confirmInvited() {
    console.warn('同意上台');
    this.classroomStore.handUpStore
      .confirmInvited()
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  /**
   * 学生拒绝上台邀请
   * @param userUuid
   */
  @bound
  refuseInvited() {
    if (this._curInvitedInfo) this._refuseInvitedTs = this._curInvitedInfo.ts;
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
   * 学生挥手
   *
   * @param teacherUuid
   * @param duration 挥手的时间，单位：秒，-1 为持续举手
   */
  @bound
  waveArm(teacherUuid: string, duration: number, payload?: any) {
    if (EduClassroomConfig.shared.isLowAPIVersionCompatibleRequired) {
      this.classroomStore.handUpStore.handUp(teacherUuid).catch((e) => {
        if (
          !AGError.isOf(
            e,
            AGServiceErrorCode.SERV_HAND_UP_CONFLICT,
            AGServiceErrorCode.SERV_PROCESS_CONFLICT,
          )
        ) {
          this.shareUIStore.addGenericErrorDialog(e);
        }
      });
    } else {
      const teachers = this.classroomStore.userStore.teacherList;
      const teacherCount = teachers.size;

      if (!teacherCount) {
        return;
      }
      // take first teacher's uuid
      const teacherUuid = teachers.keys().next().value;

      this.classroomStore.handUpStore
        .waveArm(teacherUuid, duration as 3 | -1, payload)
        .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
    }
  }

  /**
   * 获取下一页的用户列表
   */
  @Lodash.debounced(300, { trailing: true })
  fetchUsersList(override?: Partial<FetchUserParam>, reset?: boolean) {
    const params = {
      ...this.fetchUserListParams,
      ...override,
    } as FetchUserParam;
    this.classroomStore.userStore
      .fetchUserList(params)
      .then((data) => {
        runInAction(() => {
          this._nextPageId = data.nextId;
          this._userList = (reset ? [] : this._userList).concat(data.list);
        });
      })
      .catch((e) => {
        this.shareUIStore.addGenericErrorDialog(e);
      });
  }

  /**
   * 重置学生列表及查询条件
   */
  @action.bound
  resetStudentList() {
    this._userList = [];
    this._nextPageId = 0;
  }

  @Lodash.debounced(300, { trailing: true })
  invitePodium(user: UserHandUpInfo) {
    if (user.onPodiumState === OnPodiumStateEnum.waveArming) {
      this.onPodium(user.uid);
    }
    if (user.onPodiumState === OnPodiumStateEnum.onPodiuming) {
      this.offPodium(user.uid);
    }
    if (
      user.onPodiumState === OnPodiumStateEnum.idleing &&
      !this.inviteListMaxLimit &&
      !this.acceptedListMaxLimit
    ) {
      this.invite(user.uid, 5);
    }
  }

  onDestroy() {}
}
