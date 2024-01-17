import {
  AGServiceErrorCode,
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  HandUpProgress,
  PodiumSrouce,
  RteRole2EduRole,
} from 'agora-edu-core';
import { AGError, bound, Lodash } from 'agora-rte-sdk';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { EduUIStoreBase } from '../base';
import { transI18n } from 'agora-common-libs';
import { OnPodiumStateEnum } from './type';
import { FetchUserParam, FetchUserType } from '../roster/type';
import { listenChannelMessage } from '@classroom/infra/utils/ipc';
import { ChannelType, IPCMessageType } from '@classroom/infra/utils/ipc-channels';
import { interactionThrottleHandler } from '@classroom/infra/utils/interaction';

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
  private _disposers: (() => void)[] = [];
  onInstall() {
    this._disposers.push(
      listenChannelMessage(ChannelType.Message, (event, message) => {
        if (message.type == IPCMessageType.InviteStage) {
          const { type, userUuid } = message.payload as { type: 'on' | 'off'; userUuid: string };
          if (type === 'on') {
            this.onPodium(userUuid);
          } else {
            this.offPodium(userUuid);
          }
        }
      }),
    );

    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
      this._disposers.push(
        reaction(
          () => [this.getters.videoGalleryStarted],
          () => {
            if (this.getters.videoGalleryStarted) {
              this.classroomStore.handUpStore.allowHandsUp(1, false);
            } else {
              this.classroomStore.handUpStore.allowHandsUp(1, true);
            }
          },
        ),
      );
    }
  }

  private _curInvitedInfo: HandUpProgress | undefined = undefined;
  private _refuseInvitedTs = 0;

  /**
   * 持续挥手时间
   */
  get waveArmDurationTime() {
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
  get isOnPodiuming() {
    const _acceptedList = this.classroomStore.roomStore.acceptedList;
    const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
    return _acceptedList.some((item) => {
      return item.userUuid === userUuid;
    });
  }
  @computed
  get isWavingArm() {
    const _waveArmList = this.classroomStore.roomStore.waveArmList;
    const userUuid = EduClassroomConfig.shared.sessionInfo.userUuid;
    return _waveArmList.some((item) => {
      return item.userUuid === userUuid;
    });
  }
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
  onPodium = interactionThrottleHandler(
    (userUuid: string) => {
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
    },
    (message) => this.shareUIStore.addToast(message, 'warning'),
  );

  /**
   * 邀请学生上台
   * @param userUuid
   */
  invite(userUuid: string, duration: number, payload?: any) {
    this.classroomStore.handUpStore
      .invitePodium(userUuid, duration, payload)
      .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
  }

  /**
   * 学生同意上台
   * @param userUuid
   */
  confirmInvited() {
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
  offPodium = interactionThrottleHandler(
    (userUuid: string) => {
      this.classroomStore.handUpStore
        .offPodium(userUuid)
        .catch((e) => this.shareUIStore.addGenericErrorDialog(e));
    },
    (message) => this.shareUIStore.addToast(message, 'warning'),
  );

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
  @bound
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

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
