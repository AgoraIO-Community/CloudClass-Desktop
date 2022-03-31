import {
  AGError,
  AGNetworkQuality,
  AgoraRteAudioSourceType,
  AgoraRteMediaSourceState,
  AgoraRteVideoSourceType,
} from 'agora-rte-sdk';
import { computed, action, observable, reaction, runInAction } from 'mobx';
import { EduUIStoreBase } from './base';
import dayjs from 'dayjs';
import { bound } from 'agora-rte-sdk';
import { transI18n } from './i18n';
import {
  ClassroomState,
  ClassState,
  EduClassroomConfig,
  EduRoleTypeEnum,
  LeaveReason,
  RecordStatus,
} from 'agora-edu-core';
import { DialogCategory } from './share-ui';
import { number2Percent } from '@/infra/utils';

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

    reaction(
      () => this.networkQuality,
      (networkQuality) => {
        if (networkQuality === AGNetworkQuality.bad) {
          this.shareUIStore.addToast(transI18n('nav.singal_poor_tip'), 'warning');
        }

        if (networkQuality === AGNetworkQuality.down) {
          this.shareUIStore.addToast(transI18n('nav.singal_down_tip'), 'error');
        }
      },
    );
  }
  //observables
  @observable isRecording = false;

  buffer: ArrayBuffer[] = [];
  pcmBlob: Blob | null = null;

  //computed
  /**
   * 准备好挂载到 DOM
   * @returns
   */
  @computed
  get readyToMount() {
    return this.classroomStore.connectionStore.engine !== undefined;
  }

  /**
   * 顶部导航栏按钮列表
   * @returns
   */
  @computed
  get actions(): EduNavAction[] {
    const { isRecording } = this;
    const recordingTitle = isRecording
      ? transI18n('toast.stop_recording.title')
      : transI18n('toast.start_recording.title');
    const recordingBody = isRecording
      ? transI18n('toast.stop_recording.body')
      : transI18n('toast.start_recording.body');
    const teacherActions: EduNavAction[] = [
      {
        title: recordingTitle,
        iconType: isRecording ? 'recording' : 'record',
        onClick: async () => {
          this.shareUIStore.addConfirmDialog(recordingTitle, recordingBody, {
            onOK: () => {
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
            },
          });
        },
      },
    ];

    const studentActions: EduNavAction[] = [
      {
        title: 'AskForHelp',
        iconType: 'ask-for-help',
        iconColor: this.teacherInCurrentRoom ? '#D2D2E2' : undefined,
        onClick: () => {
          const { updateGroupUsers, currentSubRoom } = this.classroomStore.groupStore;
          const teachers = this.classroomStore.userStore.mainRoomDataStore.teacherList;

          if (!teachers.size) {
            this.shareUIStore.addConfirmDialog(
              transI18n('breakout_room.confirm_invite_teacher_title'),
              transI18n('breakout_room.confirm_ask_for_help_absent_content'),
            );
            return;
          }
          if (this.teacherGroupUuid === currentSubRoom) {
            this.shareUIStore.addToast(transI18n('toast.teacher_already_in_group'), 'warning');
            return;
          }

          const teacherUuid = teachers.keys().next().value;

          this.shareUIStore.addConfirmDialog(
            transI18n('breakout_room.confirm_invite_teacher_title'),
            transI18n('breakout_room.confirm_ask_for_help_content'),
            {
              onOK: () => {
                updateGroupUsers(
                  [
                    {
                      groupUuid: currentSubRoom as string,
                      addUsers: [teacherUuid],
                    },
                  ],
                  true,
                );
              },
              actions: ['ok', 'cancel'],
              btnText: {
                ok: transI18n('breakout_room.confirm_ask_for_help_btn_ok'),
                cancel: transI18n('breakout_room.confirm_ask_for_help_btn_cancel'),
              },
            },
          );
        },
      },
    ];
    const commonActions: EduNavAction[] = [
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
          const isInSubRoom = this.classroomStore.groupStore.currentSubRoom;
          this.shareUIStore.addDialog(DialogCategory.Quit, {
            onOk: (back: boolean) => {
              if (back) {
                this._leaveSubRoom();
              } else {
                this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
              }
            },
            showOption: isInSubRoom,
          });
        },
      },
    ];

    const isInSubRoom = this.classroomStore.groupStore.currentSubRoom;

    let actions = commonActions;
    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
      if (!isInSubRoom) {
        actions = teacherActions.concat(actions);
      }
    }

    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student) {
      if (isInSubRoom) {
        actions = studentActions.concat(actions);
      }
    }

    return actions;
  }

  @computed
  get teacherInCurrentRoom() {
    return (
      this.teacherGroupUuid &&
      this.teacherGroupUuid === this.classroomStore.groupStore.currentSubRoom
    );
  }

  /**
   * 老师所在房间
   */
  @computed
  get teacherGroupUuid() {
    if (this.classroomStore.connectionStore.classroomState !== ClassroomState.Connected) {
      return false;
    }
    const teachers = this.classroomStore.userStore.mainRoomDataStore.teacherList;

    if (teachers.size) {
      const teacherUuid = teachers.keys().next().value;
      const { groupUuidByUserUuid } = this.classroomStore.groupStore;

      const teacherGroupUuid = groupUuidByUserUuid.get(teacherUuid);
      return teacherGroupUuid;
    }
    return undefined;
  }

  /**
   * 教室时间信息
   * @returns
   */
  @computed
  get classroomSchedule() {
    return this.classroomStore.roomStore.classroomSchedule;
  }

  /**
   * 教室状态
   * @returns
   */
  @computed
  get classState() {
    return this.classroomSchedule.state;
  }

  /**
   * 服务器时间
   * @returns
   */
  @computed
  get calibratedTime() {
    const { clockTime, clientServerTimeShift } = this.classroomStore.roomStore;
    return clockTime + clientServerTimeShift;
  }

  /**
   * 教室持续时间
   * @returns
   */
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
  /**
   * 教室状态文字
   * @returns
   */
  @computed
  get classStatusText() {
    const duration = this.classTimeDuration || 0;

    if (duration < 0) {
      // return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
      return `-- : --`;
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
        // return `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`;
        return `-- : --`;
    }
  }

  /**
   * 教室状态文字颜色
   * @returns
   */
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

  /**
   * 是否为开始上课
   * @returns
   */
  @computed
  get isBeforeClass() {
    const sessionInfo = EduClassroomConfig.shared.sessionInfo;
    if (sessionInfo.role === EduRoleTypeEnum.teacher) {
      return this.classState === ClassState.beforeClass;
    }
    return false;
  }

  /**
   * 网络质量状态
   * @returns
   */
  @computed
  get networkQualityClass(): string {
    switch (this.networkQuality) {
      case AGNetworkQuality.good:
      case AGNetworkQuality.great:
        return 'excellent';
      case AGNetworkQuality.poor:
      case AGNetworkQuality.bad:
        return 'bad';
      case AGNetworkQuality.down:
        return 'down';
    }
    return `excellent`;
  }

  /**
   * 网络质量状态图标
   * @returns
   */
  @computed
  get networkQualityIcon(): 'normal-signal' | 'bad-signal' | 'unknown-signal' | 'down-signal' {
    switch (this.networkQuality) {
      case AGNetworkQuality.good:
      case AGNetworkQuality.great:
        return 'normal-signal';
      case AGNetworkQuality.poor:
      case AGNetworkQuality.bad:
        return 'bad-signal';
      case AGNetworkQuality.down:
        return 'down-signal';
    }
    return `unknown-signal`;
  }

  /**
   * 网络质量状态
   * @returns
   */
  @computed
  get networkQualityLabel(): string {
    switch (this.networkQuality) {
      case AGNetworkQuality.good:
      case AGNetworkQuality.great:
        return transI18n('nav.signal_excellent');
      case AGNetworkQuality.poor:
      case AGNetworkQuality.bad:
        return transI18n('nav.signal_bad');
      case AGNetworkQuality.down:
        return transI18n('nav.signal_down');
    }
    return transI18n('nav.signal_excellent');
  }

  /**
   * CPU 用量
   * @returns
   */
  @computed
  get cpuValue() {
    return this.classroomStore.statisticsStore.cpu;
  }

  /**
   * CPU 负载百分比
   * @returns
   */
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

  /**
   * 丢包率
   * @returns
   */
  @computed
  get packetLoss() {
    if (this.classroomStore.statisticsStore.packetLoss === undefined) {
      return '-- %';
    }
    return number2Percent(this.classroomStore.statisticsStore.packetLoss, 2);
  }

  /**
   * 网络质量状态
   * @returns
   */
  @computed
  get networkQuality() {
    let hasPublishedScreenStream = false;
    let hasPublishedCameraStream = false;
    let hasPublishedMicStream = false;

    const { streamByStreamUuid, streamByUserUuid } = this.classroomStore.streamStore;

    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    const streamUuids = streamByUserUuid.get(userUuid) || new Set();

    for (const streamUuid of streamUuids) {
      const stream = streamByStreamUuid.get(streamUuid);
      if (stream && stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
        hasPublishedScreenStream = true;
      }

      if (
        stream &&
        stream.videoSourceType === AgoraRteVideoSourceType.Camera &&
        stream.audioSourceState === AgoraRteMediaSourceState.started
      ) {
        hasPublishedCameraStream = true;
      }

      if (
        stream &&
        stream.audioSourceType === AgoraRteAudioSourceType.Mic &&
        stream.audioSourceState === AgoraRteMediaSourceState.started
      ) {
        hasPublishedMicStream = true;
      }
    }

    const { downlinkNetworkQuality, uplinkNetworkQuality } = this.classroomStore.statisticsStore;

    if ([downlinkNetworkQuality, uplinkNetworkQuality].includes(AGNetworkQuality.down)) {
      return AGNetworkQuality.down;
    }

    if (hasPublishedScreenStream || hasPublishedCameraStream || hasPublishedMicStream) {
      return Math.min(
        downlinkNetworkQuality || AGNetworkQuality.unknown,
        uplinkNetworkQuality || AGNetworkQuality.unknown,
      ) as AGNetworkQuality;
    }

    return downlinkNetworkQuality || AGNetworkQuality.unknown;
  }

  /**
   * 网络延时
   * @returns
   */
  @computed
  get delay() {
    if (this.classroomStore.statisticsStore.delay === undefined) {
      return `-- ${transI18n('nav.ms')}`;
    }
    return `${Math.floor(this.classroomStore.statisticsStore.delay)} ${transI18n('nav.ms')}`;
  }

  /**
   * 设置录制状态
   */
  @action revertRecordingState() {
    this.isRecording = this.classroomStore.roomStore.recordStatus === RecordStatus.started;
  }

  //others
  /**
   * 导航栏标题
   * @returns
   */
  @computed
  get navigationTitle() {
    return this.currentSubRoomName || EduClassroomConfig.shared.sessionInfo.roomName;
  }

  /**
   * 所在房间名称
   */
  @computed
  get currentSubRoomName() {
    let groupName = null;
    const { currentSubRoom, groupDetails } = this.classroomStore.groupStore;
    if (currentSubRoom) {
      groupDetails.forEach((group, groupUuid) => {
        if (groupUuid === currentSubRoom) {
          groupName = group.groupName;
        }
      });
    }
    return groupName;
  }
  /**
   * 倒计时格式化
   * @param time
   * @param mode
   * @returns
   */
  formatCountDown(time: number, mode: TimeFormatType): string {
    const seconds = Math.floor(time / 1000);
    const duration = dayjs.duration(time);
    let formatItems: string[] = [];

    const hours_text = duration.hours() === 0 ? '' : `H :`;
    const mins_text = duration.minutes() === 0 ? '' : duration.seconds() === 0 ? `m :` : `m :`;
    const seconds_text = duration.seconds() === 0 ? '' : `s`;
    const short_hours_text = `HH :`;
    const short_mins_text = `mm :`;
    const short_seconds_text = `ss`;
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

  /**
   * 开始上课
   */
  @bound
  async startClass() {
    try {
      await this.classroomStore.roomStore.updateClassState(ClassState.ongoing);
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  getBuffer = (_buffer: AudioBuffer) => {
    for (let channel = 0; channel < _buffer.numberOfChannels; channel += 1) {
      // Float32Array with PCM data
      const currentChannelData = _buffer.getChannelData(channel);
      this.buffer.push(currentChannelData.buffer);
    }
    this.pcmBlob = new Blob(this.buffer);
  };

  download = () => {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(this.pcmBlob as Blob);
    link.download = 'pcm.pcm';
    link.click();
    window.URL.revokeObjectURL(link.href);
  };

  addMediaListener = () => {
    this.classroomStore.mediaStore.addRawDataListener(this.getBuffer);
  };

  removeMediaListner = () => {
    this.classroomStore.mediaStore.removeRawDataListener(this.getBuffer);
  };

  private _leaveSubRoom() {
    const currentRoomUuid = this.classroomStore.groupStore.currentSubRoom;
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    if (currentRoomUuid) {
      this.classroomStore.groupStore.removeGroupUsers(currentRoomUuid, [userUuid]);
    }
  }

  onDestroy() {}
}
