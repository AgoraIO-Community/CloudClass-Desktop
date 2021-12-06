import { AGError, AGNetworkQuality } from 'agora-rte-sdk';
import { computed, action, observable, reaction, runInAction, observe } from 'mobx';
import { EduUIStoreBase } from './base';
import { DialogCategory, EduClassroomConfig, EduRoleTypeEnum } from '../../..';
import { number2Percent } from '../../../utils';
import { ClassState, RecordStatus } from '../../domain/common/room/type';
import dayjs from 'dayjs';
import { bound } from 'agora-rte-sdk';
import { transI18n } from './i18n';
import { LeaveReason } from '../../domain/common/connection';

export interface EduNavAction {
  title: string;
  iconType: string;
  iconColor?: string;
  onClick: () => void;
}

export enum TimeFormatType {
  Timeboard,
  Message,
}

export class NavigationBarUIStore extends EduUIStoreBase {
  onInstall() {
    reaction(
      () => this.classroomStore.roomStore.recordStatus,
      (recordStatus: RecordStatus) => {
        this.isRecording = recordStatus === RecordStatus.started;
      },
    );
  }
  //observables
  @observable isRecording: boolean = false;

  //computed
  @computed
  get readyToMount() {
    return this.classroomStore.connectionStore.engine !== undefined;
  }

  @computed
  get actions(): EduNavAction[] {
    const { isRecording } = this;
    const recordingTitle = isRecording
      ? transI18n('toast.stop_recording.title')
      : transI18n('toast.start_recording.title');
    const recordingBody = isRecording
      ? transI18n('toast.stop_recording.body')
      : transI18n('toast.start_recording.body');
    let teacherActions: EduNavAction[] = [
      {
        title: recordingTitle,
        iconType: isRecording ? 'recording' : 'record',
        iconColor: isRecording ? '#2962F4' : undefined,
        onClick: async () => {
          this.shareUIStore.addConfirmDialog(recordingTitle, recordingBody, () => {
            if (isRecording) {
              this.classroomStore.recordingStore.stopRecording().catch((e: AGError) => {
                this.shareUIStore.addGenericErrorDialog(e);
                this.revertRecordingState();
              });
            } else {
              this.classroomStore.recordingStore.startRecording().catch((e: AGError) => {
                this.shareUIStore.addGenericErrorDialog(e);
                this.revertRecordingState();
              });
            }
            runInAction(() => {
              this.isRecording = !isRecording;
            });
          });
        },
      },
    ];
    let commonActions: EduNavAction[] = [
      {
        title: 'Settings',
        iconType: 'set',
        onClick: () => {
          this.shareUIStore.addDialog(DialogCategory.DeviceSetting);
        },
      },
      {
        title: 'Exit',
        iconType: 'exit',
        onClick: async () => {
          this.shareUIStore.addConfirmDialog(
            transI18n('toast.leave_room'),
            transI18n('toast.quit_room'),
            () => {
              this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
            },
          );
        },
      },
    ];

    let actions = commonActions;
    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
      actions = teacherActions.concat(actions);
    }

    return actions;
  }

  @computed
  get classroomSchedule() {
    return this.classroomStore.roomStore.classroomSchedule;
  }

  @computed
  get classState() {
    return this.classroomSchedule.state;
  }

  @computed
  get calibratedTime() {
    const { clockTime, clientServerTimeShift } = this.classroomStore.roomStore;
    return clockTime + clientServerTimeShift;
  }

  @computed
  get classTimeDuration(): number {
    let duration = -1;
    if (this.classroomSchedule) {
      switch (this.classState) {
        case ClassState.beforeClass:
          if (this.classroomSchedule.startTime !== undefined) {
            duration = Math.max(this.classroomSchedule.startTime - this.calibratedTime, 0);
          }
          break;
        case ClassState.ongoing:
          if (this.classroomSchedule.startTime !== undefined) {
            duration = Math.max(this.calibratedTime - this.classroomSchedule.startTime, 0);
          }
          break;
        case ClassState.afterClass:
          if (
            this.classroomSchedule.startTime !== undefined &&
            this.classroomSchedule.duration !== undefined
          ) {
            duration = Math.max(this.calibratedTime - this.classroomSchedule.startTime, 0);
          }
          break;
      }
    }
    return duration;
  }

  // computed
  @computed
  get classStatusText() {
    const duration = this.classTimeDuration || 0;

    if (duration < 0) {
      return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
    }
    switch (this.classState) {
      case ClassState.beforeClass:
        return `${transI18n('nav.to_start_in')}${this.formatCountDown(
          duration,
          TimeFormatType.Timeboard,
        )}`;
      case ClassState.ongoing:
        return `${transI18n('nav.started_elapse')}${this.formatCountDown(
          duration,
          TimeFormatType.Timeboard,
        )}`;
      case ClassState.afterClass:
        return `${transI18n('nav.ended_elapse')}${this.formatCountDown(
          duration,
          TimeFormatType.Timeboard,
        )}`;
      default:
        return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
    }
  }

  @computed
  get classStatusTextColor() {
    switch (this.classState) {
      case ClassState.beforeClass:
        return '#677386';
      case ClassState.ongoing:
        return '#677386';
      case ClassState.afterClass:
        return '#F04C36';
      default:
        return undefined;
    }
  }

  @computed
  get isBeforeClass() {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    if (sessionInfo.role === EduRoleTypeEnum.teacher) {
      return this.classState === ClassState.beforeClass;
    }
    return false;
  }

  @computed
  get networkQualityClass(): string {
    switch (this.networkQuality) {
      case AGNetworkQuality.good:
        return 'good';
      case AGNetworkQuality.great:
        return 'excellent';
      case AGNetworkQuality.poor:
      case AGNetworkQuality.bad:
        return 'bad';
    }
    return `unknown`;
  }

  @computed
  get networkQualityIcon(): 'normal-signal' | 'bad-signal' | 'unknown-signal' {
    switch (this.networkQuality) {
      case AGNetworkQuality.good:
        return 'normal-signal';
      case AGNetworkQuality.great:
        return 'normal-signal';
      case AGNetworkQuality.poor:
      case AGNetworkQuality.bad:
        return 'bad-signal';
    }
    return `unknown-signal`;
  }

  @computed
  get networkQualityLabel(): string {
    switch (this.networkQuality) {
      case AGNetworkQuality.good:
        return 'Good';
      case AGNetworkQuality.great:
        return 'Excellent';
      case AGNetworkQuality.poor:
      case AGNetworkQuality.bad:
        return 'Bad';
    }
    return `Unknown`;
  }

  @computed
  get cpuValue() {
    return this.classroomStore.statisticsStore.cpu;
  }

  @computed
  get cpuLabel() {
    if (
      this.classroomStore.statisticsStore.cpu === -1 ||
      this.classroomStore.statisticsStore.cpu === undefined ||
      this.classroomStore.statisticsStore.cpuTotal === -1 ||
      this.classroomStore.statisticsStore.cpuTotal === undefined
    ) {
      return '-- %';
    }
    return `${number2Percent(this.classroomStore.statisticsStore.cpu, 0)} / ${number2Percent(
      this.classroomStore.statisticsStore.cpuTotal,
      0,
    )}`;
  }

  @computed
  get packetLoss() {
    if (this.classroomStore.statisticsStore.packetLoss === undefined) {
      return '-- %';
    }
    return number2Percent(this.classroomStore.statisticsStore.packetLoss, 2);
  }

  @computed
  get networkQuality() {
    return this.classroomStore.statisticsStore.networkQuality || AGNetworkQuality.unknown;
  }

  @computed
  get delay() {
    if (this.classroomStore.statisticsStore.delay === undefined) {
      return '-- ms';
    }
    return `${this.classroomStore.statisticsStore.delay} ms`;
  }

  //@action
  @action revertRecordingState() {
    this.isRecording = this.classroomStore.roomStore.recordStatus === RecordStatus.started;
  }

  //others
  get navigationTitle() {
    return EduClassroomConfig.shared.sessionInfo.roomName;
  }

  formatCountDown(time: number, mode: TimeFormatType): string {
    let seconds = Math.floor(time / 1000);
    let duration = dayjs.duration(time);
    let formatItems: string[] = [];

    let hours_text = duration.hours() === 0 ? '' : `H [${transI18n('nav.hours')}]`;
    let mins_text =
      duration.minutes() === 0
        ? ''
        : duration.seconds() === 0
        ? `m [${transI18n('nav.short.minutes')}]`
        : `m [${transI18n('nav.minutes')}]`;
    let seconds_text = duration.seconds() === 0 ? '' : `s [${transI18n('nav.seconds')}]`;
    let short_hours_text = `HH [${transI18n('nav.short.hours')}]`;
    let short_mins_text = `mm [${transI18n('nav.short.minutes')}]`;
    let short_seconds_text = `ss [${transI18n('nav.short.seconds')}]`;
    if (mode === TimeFormatType.Timeboard) {
      // always display all time segment
      if (seconds < 60 * 60) {
        // less than a min
        formatItems = [short_mins_text, short_seconds_text];
      } else {
        formatItems = [short_hours_text, short_mins_text, short_seconds_text];
      }
    } else {
      // do not display time segment if it's 0
      if (seconds < 60) {
        // less than a min
        formatItems = [seconds_text];
      } else if (seconds < 60 * 60) {
        [mins_text, seconds_text].forEach((item) => item && formatItems.push(item));
      } else {
        [hours_text, mins_text, seconds_text].forEach((item) => item && formatItems.push(item));
      }
    }
    return duration.format(formatItems.join(' '));
  }

  @bound
  async startClass() {
    try {
      await this.classroomStore.roomStore.updateClassState(ClassState.ongoing);
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  onDestroy() {}
}
