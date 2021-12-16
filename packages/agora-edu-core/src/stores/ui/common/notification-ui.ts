import { action, computed, reaction } from 'mobx';
import dayjs from 'dayjs';
import { Scheduler } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import { transI18n } from './i18n';
import { ClassState } from '../../domain/common/room/type';
import { ClassroomState, EduEventCenter } from '../../..';
import { AgoraEduInteractionEvent } from '../../../type';
import { LeaveReason } from '../../domain/common/connection';
import { checkMinutesThrough } from '../../../utils/time';

export class NotificationUIStore extends EduUIStoreBase {
  private _notificationTask?: Scheduler.Task;
  private _prevClassState = ClassState.beforeClass;

  /** Observables */

  /** Methods */
  onInstall() {
    // class is end
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
        } else if (ClassState.afterClass === state && ClassState.ongoing === this._prevClassState) {
          const { classroomSchedule } = this.classroomStore.roomStore;

          let delayDuration = dayjs.duration({ seconds: classroomSchedule.closeDelay });

          this.addClassStateNotification(state, delayDuration.asMinutes());

          this._notificationTask = Scheduler.shared.addIntervalTask(
            this.checkClassroomNotification,
            Scheduler.Duration.second(1),
          );
        } else if (ClassState.close === state) {
          this.shareUIStore.addConfirmDialog(
            transI18n('toast.leave_room'),
            transI18n('error.class_end'),
            () => {
              this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
            },
            ['ok'],
          );
        }
      },
    );
    // connection error
    reaction(
      () => this.classroomStore.connectionStore.classroomState,
      (state) => {
        if (ClassroomState.Error === state) {
          this.shareUIStore.addConfirmDialog(
            transI18n('toast.leave_room'),
            this._getStateErrorReason(
              this.classroomStore.connectionStore.classroomStateErrorReason,
            ),
            () => {
              this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
            },
            ['ok'],
          );
        }
      },
    );
    // interaction events
    EduEventCenter.shared.onInteractionEvents((event, ...args) => {
      // kick out
      if (event === AgoraEduInteractionEvent.KickOut) {
        this.classroomStore.connectionStore.leaveClassroom(LeaveReason.kickOut);
      }
      // teacher turn on my mic
      if (event === AgoraEduInteractionEvent.TeacherTurnOnMyMic) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.turn.on.my.mic'));
      }
      // teacher turn off my mic
      if (event === AgoraEduInteractionEvent.TeacherTurnOffMyMic) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.turn.off.my.mic'), 'error');
      }
      // teacher turn on my mic
      if (event === AgoraEduInteractionEvent.TeacherTurnOnMyCam) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.turn.on.my.cam'));
      }
      // teacher turn off my mic
      if (event === AgoraEduInteractionEvent.TeacherTurnOffMyCam) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.turn.off.my.cam'), 'error');
      }
      // teacher grant permission
      if (event === AgoraEduInteractionEvent.TeacherGrantPermission) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.grant.permission'));
      }
      // teacher revoke permission
      if (event === AgoraEduInteractionEvent.TeacherRevokePermission) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.revoke.permission'), 'error');
      }
      // user accpeted to stage
      if (event === AgoraEduInteractionEvent.UserAcceptToStage) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.accept.onpodium'));
      }
      // teacher leave stage
      if (event === AgoraEduInteractionEvent.UserLeaveStage) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.revoke.onpodium'));
      }
      // reward received
      if (event === AgoraEduInteractionEvent.RewardReceived) {
        this.shareUIStore.addToast(transI18n('toast2.teacher.reward', { reason: args }));
      }
    });
  }

  onDestroy() {
    this._notificationTask?.stop();
  }

  addClassStateNotification(state: ClassState, minutes: number) {
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
  @action.bound
  private checkClassroomNotification() {
    const { classroomSchedule } = this.classroomStore.roomStore;

    const { state } = classroomSchedule;

    if (classroomSchedule) {
      switch (state) {
        case ClassState.beforeClass:
          //距离上课的时间
          break;
        case ClassState.ongoing:
          //距离下课的时间
          checkMinutesThrough([5, 1], this.durationToClassEnd, (minutes) => {
            this.addClassStateNotification(ClassState.ongoing, minutes);
          });
          break;
        case ClassState.afterClass:
          //距离教室关闭的时间
          checkMinutesThrough([1], this.durationToRoomClose, (minutes) => {
            this.addClassStateNotification(ClassState.afterClass, minutes);
          });
          break;
      }
    }
  }
  /** Computed */
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

  @computed
  get durationToRoomClose() {
    const { classroomSchedule } = this.classroomStore.roomStore;

    const classDuration = this.classDuration;

    let durationToClose = dayjs.duration(
      (classroomSchedule.closeDelay || 0) * 1000 - classDuration,
    );

    return durationToClose;
  }

  get durationToClassEnd() {
    const { classroomSchedule } = this.classroomStore.roomStore;

    let duration = dayjs.duration({
      seconds: classroomSchedule.duration,
    });

    const classDuration = this.classDuration;

    let durationToEnd = dayjs.duration(duration.asMilliseconds() - classDuration);

    return durationToEnd;
  }

  /** others */
  _getStateErrorReason(reason?: string): string {
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
