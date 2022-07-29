import { action, computed, IReactionDisposer, Lambda, reaction } from 'mobx';
import dayjs from 'dayjs';
import { bound, Scheduler } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import {
  AgoraEduClassroomEvent,
  ClassroomState,
  ClassState,
  EduClassroomConfig,
  EduErrorCenter,
  EduEventCenter,
  EduRoleTypeEnum,
  LeaveReason,
} from 'agora-edu-core';
import { ToastFilter } from '@/infra/utils/toast-filter';
import { getEduErrorMessage } from '@/infra/utils/error';
import { Duration } from 'dayjs/plugin/duration';
import { transI18n } from '~ui-kit';

export class NotificationUIStore extends EduUIStoreBase {
  private _notificationTask?: Scheduler.Task;
  private _prevClassState = ClassState.beforeClass;
  private _disposers: (IReactionDisposer | Lambda)[] = [];

  /** Observables */

  /** Methods */

  private _filterUsers(
    users: string[],
    userList: Map<string, { userUuid: string; userName: string }>,
  ) {
    return users
      .filter((userUuid: string) => userList.has(userUuid))
      .map((userUuid: string) => userList.get(userUuid)?.userName || 'unknown');
  }

  @bound
  private _handleError(code: string, error: Error) {
    if (ToastFilter.shouldBlockToast(error)) {
      return;
    }
    const emsg =
      getEduErrorMessage(error) ||
      (error.message.length > 64 ? `${error.message.substr(0, 64)}...` : error.message);

    this.shareUIStore.addToast(emsg, 'error');
  }

  onInstall() {
    EduErrorCenter.shared.on('error', this._handleError);
    // class is end
    this._disposers.push(
      reaction(
        () => this.classroomStore.roomStore.classroomSchedule.state,
        (state) => {
          this._notificationTask?.stop();
          if (ClassState.ongoing === state) {
            this._notificationTask = Scheduler.shared.addIntervalTask(
              this.checkClassroomNotification,
              Scheduler.Duration.second(1),
            );
            this._prevClassState = ClassState.ongoing;
          } else if (
            ClassState.afterClass === state &&
            ClassState.ongoing === this._prevClassState
          ) {
            const { classroomSchedule } = this.classroomStore.roomStore;

            const delayDuration = dayjs.duration({ seconds: classroomSchedule.closeDelay });

            this.addClassStateNotification(state, delayDuration.asMinutes());

            this._notificationTask = Scheduler.shared.addIntervalTask(
              this.checkClassroomNotification,
              Scheduler.Duration.second(1),
            );
          } else if (ClassState.close === state) {
            this.classroomStore.connectionStore.leaveClassroomUntil(
              LeaveReason.leave,
              new Promise((resolve) => {
                this.shareUIStore.addConfirmDialog(
                  transI18n('toast.leave_room'),
                  transI18n('error.class_end'),
                  {
                    onOK: resolve,
                    actions: ['ok'],
                  },
                );
              }),
            );
          }
        },
      ),
    );
    // connection error
    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.classroomState,
        (state) => {
          if (ClassroomState.Error === state) {
            this.classroomStore.connectionStore.leaveClassroomUntil(
              LeaveReason.leave,
              new Promise((resolve) => {
                this.shareUIStore.addConfirmDialog(
                  transI18n('toast.leave_room'),
                  this._getStateErrorReason(
                    this.classroomStore.connectionStore.classroomStateErrorReason,
                  ),
                  {
                    onOK: resolve,
                    actions: ['ok'],
                  },
                );
              }),
            );
          }
        },
      ),
    );

    // interaction events
    EduEventCenter.shared.onClassroomEvents(this._handleClassroomEvent);
  }

  @bound
  private _handleClassroomEvent(event: AgoraEduClassroomEvent, param: any) {
    // kick out
    if (event === AgoraEduClassroomEvent.KickOut) {
      const user = param;

      const { sessionInfo } = EduClassroomConfig.shared;

      if (user.userUuid === sessionInfo.userUuid) {
        this.classroomStore.connectionStore.leaveClassroom(LeaveReason.kickOut);
      }
    }
    // teacher turn on my mic
    if (event === AgoraEduClassroomEvent.TeacherTurnOnMyMic) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.turn.on.my.mic'));
    }
    // teacher turn off my mic
    if (event === AgoraEduClassroomEvent.TeacherTurnOffMyMic) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.turn.off.my.mic'), 'error');
    }
    // teacher turn on my mic
    if (event === AgoraEduClassroomEvent.TeacherTurnOnMyCam) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.turn.on.my.cam'));
    }
    // teacher turn off my mic
    if (event === AgoraEduClassroomEvent.TeacherTurnOffMyCam) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.turn.off.my.cam'), 'error');
    }
    // teacher grant permission
    if (event === AgoraEduClassroomEvent.TeacherGrantPermission) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.grant.permission'));
    }
    // teacher revoke permission
    if (event === AgoraEduClassroomEvent.TeacherRevokePermission) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.revoke.permission'));
    }
    // user accpeted to stage
    if (event === AgoraEduClassroomEvent.UserAcceptToStage) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.accept.onpodium'));
    }
    // teacher leave stage
    if (event === AgoraEduClassroomEvent.UserLeaveStage) {
      this.shareUIStore.addToast(transI18n('toast2.teacher.revoke.onpodium'));
    }
    // reward received
    if (
      event === AgoraEduClassroomEvent.RewardReceived ||
      event === AgoraEduClassroomEvent.BatchRewardReceived
    ) {
      const userNames = param;
      if (userNames.length > 3) {
        this.shareUIStore.addToast(
          transI18n('toast2.teacher.reward2', {
            reason1: userNames.slice(0, 3).join(','),
            reason2: userNames.length,
          }),
        );
      } else {
        this.shareUIStore.addToast(
          transI18n('toast2.teacher.reward', { reason: userNames.join(',') }),
        );
      }
    }
    // capture screen permission denied received
    if (event === AgoraEduClassroomEvent.CaptureScreenPermissionDenied) {
      this.shareUIStore.addToast(transI18n('toast2.screen_permission_denied'), 'error');
    }
    // user join group
    if (event === AgoraEduClassroomEvent.UserJoinGroup) {
      const { role } = EduClassroomConfig.shared.sessionInfo;
      const { groupUuid, users }: { groupUuid: string; users: [] } = param;
      const { teacherList, studentList, assistantList } =
        this.classroomStore.userStore.mainRoomDataStore;

      const teachers = this._filterUsers(users, teacherList);
      const students = this._filterUsers(users, studentList);
      const assistants = this._filterUsers(users, assistantList);

      const isCurrentRoom = this.classroomStore.groupStore.currentSubRoom === groupUuid;

      if (isCurrentRoom) {
        if (teachers.length) {
          if (role === EduRoleTypeEnum.student) {
            this.shareUIStore.addToast(
              transI18n('fcr_group_enter_group', {
                reason1: transI18n('role.teacher'),
                reason2: teachers.join(','),
              }),
            );
          }
        }

        if (assistants.length) {
          if (role === EduRoleTypeEnum.student) {
            this.shareUIStore.addToast(
              transI18n('fcr_group_enter_group', {
                reason1: transI18n('role.assistant'),
                reason2: assistants.join(','),
              }),
            );
          }
        }

        if (students.length) {
          if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role)) {
            this.shareUIStore.addToast(
              transI18n('fcr_group_enter_group', {
                reason1: transI18n('role.student'),
                reason2: students.join(','),
              }),
            );
          }
        }
      }
    }
    // user leave group
    if (event === AgoraEduClassroomEvent.UserLeaveGroup) {
      const { role } = EduClassroomConfig.shared.sessionInfo;
      const { groupUuid, users }: { groupUuid: string; users: [] } = param;
      const { teacherList, studentList, assistantList } =
        this.classroomStore.userStore.mainRoomDataStore;

      const teachers = this._filterUsers(users, teacherList);
      const students = this._filterUsers(users, studentList);
      const assistants = this._filterUsers(users, assistantList);

      const isCurrentRoom = this.classroomStore.groupStore.currentSubRoom === groupUuid;

      if (isCurrentRoom) {
        if (teachers.length) {
          if (role === EduRoleTypeEnum.student) {
            this.shareUIStore.addToast(
              transI18n('fcr_group_exit_group', {
                reason1: transI18n('role.teacher'),
                reason2: teachers.join(','),
              }),
              'warning',
            );
          }
        }

        if (assistants.length) {
          if (role === EduRoleTypeEnum.student) {
            this.shareUIStore.addToast(
              transI18n('fcr_group_exit_group', {
                reason1: transI18n('role.assistant'),
                reason2: assistants.join(','),
              }),
              'warning',
            );
          }
        }

        if (students.length) {
          if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role)) {
            this.shareUIStore.addToast(
              transI18n('fcr_group_exit_group', {
                reason1: transI18n('role.student'),
                reason2: students.join(','),
              }),
              'warning',
            );
          }
        }
      }
    }

    if (event === AgoraEduClassroomEvent.RejectedToGroup) {
      const { inviting } = param;
      const { role } = EduClassroomConfig.shared.sessionInfo;
      if (role === EduRoleTypeEnum.student && inviting) {
        this.shareUIStore.addConfirmDialog(
          transI18n('fcr_group_help_title'),
          transI18n('fcr_group_help_teacher_busy_msg'),
          {
            actions: ['ok'],
          },
        );
      }
    }
  }

  onDestroy() {
    EduErrorCenter.shared.off('error', this._handleError);
    EduEventCenter.shared.offClassroomEvents(this._handleClassroomEvent);
    this._notificationTask?.stop();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }

  /**
   * add class state notification
   * @param state
   * @param minutes
   */
  protected addClassStateNotification(state: ClassState, minutes: number) {
    const transMap = {
      [ClassState.ongoing]: 'toast.time_interval_between_end',
      [ClassState.afterClass]: 'toast.time_interval_between_close',
    } as Record<ClassState, string>;

    const text = transI18n(transMap[state as ClassState], {
      reason: `${minutes}`,
    });

    this.shareUIStore.addToast(text);
  }

  /** Actions */
  /**
   * check classroom notification
   */
  @action.bound
  protected checkClassroomNotification() {
    const { classroomSchedule } = this.classroomStore.roomStore;

    const { state } = classroomSchedule;

    if (classroomSchedule) {
      switch (state) {
        case ClassState.beforeClass:
          //距离上课的时间
          break;
        case ClassState.ongoing:
          //距离下课的时间
          this._checkMinutesThrough([5, 1], this.durationToClassEnd, (minutes) => {
            this.addClassStateNotification(ClassState.ongoing, minutes);
          });
          break;
        case ClassState.afterClass:
          //距离教室关闭的时间
          this._checkMinutesThrough([1], this.durationToRoomClose, (minutes) => {
            this.addClassStateNotification(ClassState.afterClass, minutes);
          });
          break;
      }
    }
  }

  private _checkMinutesThrough = (
    throughMinutes: number[],
    duration: Duration,
    cb: (minutes: number) => void,
  ) => {
    throughMinutes.forEach((minutes) => {
      if (duration.hours() === 0 && duration.minutes() === minutes && duration.seconds() === 0) {
        cb(minutes);
      }
    });
  };

  /** Computed */
  /**
   * 根据课堂状态获取时长，
   * 未开始：距开始时间
   * 进行中：距离结束时间
   * 课程结束：距离教室关闭时间
   * @returns
   */
  @computed
  get classDuration() {
    const { classroomSchedule, clientServerTimeShift } = this.classroomStore.roomStore;

    const { startTime = 0, duration = 0, state } = classroomSchedule;

    const calibratedTime = Date.now() + clientServerTimeShift;

    const invalid = -1;

    if (!classroomSchedule || !duration) {
      return invalid;
    }

    switch (state) {
      case ClassState.beforeClass:
        return Math.max(startTime - calibratedTime, 0);
      case ClassState.ongoing:
        return Math.max(calibratedTime - startTime, 0);
      case ClassState.afterClass:
        return Math.max(calibratedTime - startTime - duration * 1000, 0);
      default:
        return invalid;
    }
  }

  /**
   * 距离教室关闭的时间
   * @returns
   */
  @computed
  get durationToRoomClose() {
    const { classroomSchedule } = this.classroomStore.roomStore;

    const classDuration = this.classDuration;

    const durationToClose = dayjs.duration(
      (classroomSchedule.closeDelay || 0) * 1000 - classDuration,
    );

    return durationToClose;
  }

  /**
   * 距离课程结束的时间
   * @returns
   */
  get durationToClassEnd() {
    const { classroomSchedule } = this.classroomStore.roomStore;

    const duration = dayjs.duration({
      seconds: classroomSchedule.duration,
    });

    const classDuration = this.classDuration;

    const durationToEnd = dayjs.duration(duration.asMilliseconds() - classDuration);

    return durationToEnd;
  }

  /** others */
  /** 错误提示信息
   * get state error reason
   * @param reason
   * @returns
   */
  private _getStateErrorReason(reason?: string): string {
    switch (reason) {
      case 'REMOTE_LOGIN':
        return transI18n('toast.kick_by_other_side');
      case 'BANNED_BY_SERVER':
        return transI18n('error.banned');
      default:
        return reason ?? transI18n('error.unknown');
    }
  }
}
