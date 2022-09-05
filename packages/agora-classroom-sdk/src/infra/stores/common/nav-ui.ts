import { AgoraEduSDK } from '@/infra/api';
import { number2Percent } from '@/infra/utils';
import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@/infra/utils/event-center';
import {
  AGServiceErrorCode,
  ClassroomState,
  ClassState,
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomServiceTypeEnum,
  LeaveReason,
  RecordMode,
  RecordStatus,
} from 'agora-edu-core';
import {
  AGError,
  AGNetworkQuality,
  AgoraRteAudioSourceType,
  AgoraRteMediaSourceState,
  AgoraRteVideoSourceType,
  bound,
} from 'agora-rte-sdk';
import dayjs from 'dayjs';
import { action, computed, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { SvgIconEnum, transI18n } from '~ui-kit';
import { NetworkStateColors } from '~utilities/state-color';
import { EduUIStoreBase } from './base';
import { DialogCategory } from './share-ui';

export interface EduNavAction<P = undefined> {
  id: 'Record' | 'AskForHelp' | 'Settings' | 'Exit' | 'Camera' | 'Mic' | 'Share';
  title: string;
  iconType: SvgIconEnum;
  iconColor?: string;
  onClick?: () => void;
  payload?: P;
}

export interface EduNavRecordActionPayload {
  text: string;
  recordStatus: RecordStatus;
}

export enum TimeFormatType {
  Timeboard,
  Message,
}

export class NavigationBarUIStore extends EduUIStoreBase {
  private _disposers: IReactionDisposer[] = [];
  onInstall() {
    this._disposers.push(
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
      ),
    );

    EduEventUICenter.shared.onClassroomUIEvents(this._handleStreamWindowChange);
  }
  //observables
  // @observable isRecording = false;

  // 老师流是否在大窗中展示
  @observable teacherStreamWindow = false;

  // 是否显示share弹层
  @observable shareVisible = false;

  //computed
  /**
   * 准备好挂载到 DOM
   * @returns
   */
  @computed
  get readyToMount() {
    return this.classroomStore.connectionStore.engine !== undefined;
  }

  @computed
  get recordStatus() {
    if (
      this.classroomStore.roomStore.recordStatus === RecordStatus.started &&
      this.classroomStore.roomStore.recordReady
    ) {
      return RecordStatus.started;
    } else if (
      this.classroomStore.roomStore.recordStatus === RecordStatus.starting ||
      (this.classroomStore.roomStore.recordStatus === RecordStatus.started &&
        !this.classroomStore.roomStore.recordReady)
    ) {
      return RecordStatus.starting;
    } else {
      return RecordStatus.stopped;
    }
  }
  @computed
  get isRecording() {
    return this.recordStatus === RecordStatus.started;
  }
  @computed
  get isRecordStarting() {
    return this.recordStatus === RecordStatus.starting;
  }
  @computed
  get isRecordStoped() {
    return this.recordStatus === RecordStatus.stopped;
  }

  /**
   * 本地摄像头设备是否关闭
   * @returns
   */
  @computed get localCameraOff() {
    return (
      this.classroomStore.mediaStore.localCameraTrackState !== AgoraRteMediaSourceState.started
    );
  }

  /**
   * 本地麦克风设备是否关闭
   */
  @computed
  get localMicOff() {
    return this.classroomStore.mediaStore.localMicTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 当前 camera 的状态根据讲台的隐藏展示 + camera 的状态来更新状态
   * stage --> 讲台
   * camera --> camera 状态
   *
   * stage === true 那么控制摄像头开关
   * stage === flase 控制老师窗口的展示和关闭
   */
  @computed
  get localNavCameraOff() {
    if (
      (typeof this.classroomStore.roomStore.flexProps.stage !== 'undefined' &&
        this.classroomStore.roomStore.flexProps.stage) ||
      typeof this.classroomStore.roomStore.flexProps.stage === 'undefined'
    ) {
      return this.localCameraOff;
    }
    if (
      typeof this.classroomStore.roomStore.flexProps.stage !== 'undefined' &&
      !this.classroomStore.roomStore.flexProps.stage
    ) {
      return !this.teacherStreamWindow;
    }
    return this.localCameraOff;
  }

  /**
   * 顶部导航栏按钮列表
   * @returns
   */
  @computed
  get actions(): EduNavAction<EduNavRecordActionPayload | undefined>[] {
    const { isRecording, isRecordStarting, recordStatus } = this;
    const recordingTitle = isRecording
      ? transI18n('toast.stop_recording.title')
      : transI18n('toast.start_recording.title');
    const recordingBody = isRecording
      ? transI18n('toast.stop_recording.body')
      : transI18n('toast.start_recording.body');

    const exitAction: EduNavAction<EduNavRecordActionPayload | undefined> = {
      id: 'Exit',
      title: transI18n('biz-header.exit'),
      iconType: SvgIconEnum.EXIT,
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
    };

    const shareAction: EduNavAction<EduNavRecordActionPayload | undefined> = {
      id: 'Share',
      title: transI18n('fcr_copy_title'),
      iconType: SvgIconEnum.LINK,
      onClick: async () => {
        runInAction(() => {
          this.shareVisible = !this.shareVisible;
        });
      },
    };

    // 合流转推场景&&学生角色
    const isMixStreamCDNModelStudent =
      EduClassroomConfig.shared.sessionInfo.role !== EduRoleTypeEnum.teacher &&
      EduClassroomConfig.shared.sessionInfo.roomServiceType === EduRoomServiceTypeEnum.MixStreamCDN;

    // 伪直播
    const isHostingScene =
      EduClassroomConfig.shared.sessionInfo.roomServiceType === EduRoomServiceTypeEnum.HostingScene;

    if (isMixStreamCDNModelStudent || isHostingScene) {
      return [exitAction];
    }

    const teacherActions: EduNavAction<EduNavRecordActionPayload>[] = [
      {
        id: 'Record',
        title: recordingTitle,
        iconType: SvgIconEnum.RECORDING,
        payload: {
          text: isRecordStarting
            ? transI18n('biz-header.record_starting')
            : isRecording
            ? transI18n('biz-header.recording')
            : '',
          recordStatus: recordStatus,
        },
        onClick: async () => {
          this.shareUIStore.addConfirmDialog(recordingTitle, recordingBody, {
            onOK: () => {
              if (isRecording) {
                this.classroomStore.recordingStore.stopRecording().catch((e: AGError) => {
                  this.shareUIStore.addGenericErrorDialog(e);
                });
              } else if (this.isRecordStoped) {
                this.classroomStore.recordingStore
                  .startRecording(this.recordArgs)
                  .catch((e: AGError) => {
                    this.shareUIStore.addGenericErrorDialog(e);
                  });
              }
            },
          });
        },
      },
    ];

    const teacherMediaActions: EduNavAction[] = [
      {
        id: 'Camera',
        title: this.localNavCameraOff ? transI18n('Open Camera') : transI18n('Close Camera'),
        iconType: this.localNavCameraOff ? SvgIconEnum.CAMERA_DISABLED : SvgIconEnum.CAMERA_ENABLED, // 根据讲台的隐藏和设备的开发控制 icon
        onClick: () => {
          try {
            this._toggleNavCamera();
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
      {
        id: 'Mic',
        title: this.localMicOff ? transI18n('Open Microphone') : transI18n('Close Microphone'),
        iconType: this.localMicOff ? SvgIconEnum.MICROPHONE_OFF : SvgIconEnum.MICROPHONE_ON,
        onClick: async () => {
          try {
            this._toggleLocalAudio();
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
    ];

    const studentActions: EduNavAction[] = [
      {
        id: 'AskForHelp',
        title: 'AskForHelp',
        iconType: SvgIconEnum.ASK_FOR_HELP,
        iconColor: this.teacherInCurrentRoom ? '#D2D2E2' : undefined,
        onClick: () => {
          const { updateGroupUsers, currentSubRoom } = this.classroomStore.groupStore;
          const teachers = this.classroomStore.userStore.mainRoomDataStore.teacherList;
          const assistants = this.classroomStore.userStore.mainRoomDataStore.assistantList;

          if (!teachers.size && !assistants.size) {
            this.shareUIStore.addConfirmDialog(
              transI18n('fcr_group_help_title'),
              transI18n('breakout_room.confirm_ask_for_help_absent_content'),
            );
            return;
          }
          if (this.teacherGroupUuid === currentSubRoom) {
            this.shareUIStore.addToast(transI18n('fcr_group_teacher_exist_hint'), 'warning');
            return;
          }

          const teacherUuid = teachers.keys().next().value;
          const assistantUuids = Array.from(assistants.keys());

          this.shareUIStore.addConfirmDialog(
            transI18n('fcr_group_help_title'),
            transI18n('fcr_group_help_content'),
            {
              onOK: () => {
                updateGroupUsers(
                  [
                    {
                      groupUuid: currentSubRoom as string,
                      addUsers: [teacherUuid].concat(assistantUuids),
                    },
                  ],
                  true,
                ).catch((e) => {
                  if (AGError.isOf(e, AGServiceErrorCode.SERV_USER_BEING_INVITED)) {
                    this.shareUIStore.addConfirmDialog(
                      transI18n('fcr_group_help_title'),
                      transI18n('fcr_group_teacher_is_helping_others_msg'),
                      {
                        actions: ['ok'],
                      },
                    );
                  } else {
                    this.shareUIStore.addGenericErrorDialog(e as AGError);
                  }
                });
              },
              actions: ['ok', 'cancel'],
              btnText: {
                ok: transI18n('fcr_group_invite'),
                cancel: transI18n('breakout_room.confirm_ask_for_help_btn_cancel'),
              },
            },
          );
        },
      },
    ];

    const studentMediaActions: EduNavAction<EduNavRecordActionPayload | undefined>[] = [
      {
        id: 'Camera',
        title: this.localCameraOff ? transI18n('Open Camera') : transI18n('Close Camera'),
        iconType: this.localCameraOff ? SvgIconEnum.CAMERA_DISABLED : SvgIconEnum.CAMERA_ENABLED,
        onClick: () => {
          try {
            this._toggleLocalVideo();
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
      {
        id: 'Mic',
        title: this.localMicOff ? transI18n('Open Microphone') : transI18n('Close Microphone'),
        iconType: this.localMicOff ? SvgIconEnum.MICROPHONE_OFF : SvgIconEnum.MICROPHONE_ON,
        onClick: async () => {
          try {
            this._toggleLocalAudio();
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
    ];

    const commonActions: EduNavAction<EduNavRecordActionPayload | undefined>[] = [
      {
        id: 'Settings',
        title: transI18n('biz-header.setting'),
        iconType: SvgIconEnum.SET,
        onClick: () => {
          this.shareUIStore.addDialog(DialogCategory.DeviceSetting);
        },
      },
      exitAction,
    ];

    if (AgoraEduSDK.shareUrl) {
      commonActions.splice(1, 0, shareAction);
    }

    const isInSubRoom = this.classroomStore.groupStore.currentSubRoom;

    let actions: EduNavAction<EduNavRecordActionPayload | undefined>[] = [];
    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
      if (!isInSubRoom) {
        actions = actions.concat(teacherActions);
      }
      actions = actions.concat(teacherMediaActions);
    }

    if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student) {
      actions = studentMediaActions.concat(actions);
      if (isInSubRoom) {
        actions = actions.concat(studentActions);
      }
      if (isRecording)
        actions.unshift({
          id: 'Record',
          title: recordingTitle,
          iconType: SvgIconEnum.RECORDING,
          payload: {
            text: transI18n('biz-header.recording'),
            recordStatus: recordStatus,
          },
        });
    }

    actions = actions.concat(commonActions);
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
  get networkQualityIcon(): { icon: SvgIconEnum; color: string } {
    switch (this.networkQuality) {
      case AGNetworkQuality.good:
      case AGNetworkQuality.great:
        return { icon: SvgIconEnum.NORMAL_SIGNAL, color: NetworkStateColors.normal };
      case AGNetworkQuality.poor:
      case AGNetworkQuality.bad:
        return { icon: SvgIconEnum.BAD_SIGNAL, color: NetworkStateColors.bad };
      case AGNetworkQuality.down:
        return { icon: SvgIconEnum.BAD_SIGNAL, color: NetworkStateColors.down };
    }
    return { icon: SvgIconEnum.UNKNOWN_SIGNAL, color: NetworkStateColors.unknown };
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
   * 当前屏幕分享人名称
   */
  @computed
  get currScreenShareTitle() {
    const currSharedUser = this.classroomStore.remoteControlStore.currSharedUser;
    if (currSharedUser)
      return `${transI18n('fcr_share_sharing', {
        reason: currSharedUser.userName,
      })}`;
  }
  /**
   * 所在房间名称
   */
  @computed
  get currentSubRoomName() {
    let groupName = null;
    const { currentSubRoom, groupDetails } = this.classroomStore.groupStore;
    if (currentSubRoom) {
      const group = groupDetails.get(currentSubRoom);

      groupName = group?.groupName;
    }
    return groupName;
  }

  get recordArgs() {
    const { recordUrl, recordRetryTimeout } = EduClassroomConfig.shared;

    const args = {
      webRecordConfig: {
        rootUrl: `${recordUrl}?language=${AgoraEduSDK.language}`,
        videoBitrate: 3000,
      },
      mode: RecordMode.Web,
      retryTimeout: recordRetryTimeout,
    };

    return args;
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

  @action
  closeShare() {
    this.shareVisible = false;
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

  /**
   * 切换本地摄像头设备开关状态
   */
  @bound
  private _toggleLocalVideo() {
    if (this.localCameraOff) {
      this.classroomStore.mediaStore.enableLocalVideo(true);
    } else {
      this.classroomStore.mediaStore.enableLocalVideo(false);
    }
  }

  /**
   * 切换本地麦克风设备开关状态
   */
  @bound
  private _toggleLocalAudio() {
    if (this.localMicOff) {
      this.classroomStore.mediaStore.enableLocalAudio(true);
    } else {
      this.classroomStore.mediaStore.enableLocalAudio(false);
    }
  }

  /**
   * 打开关闭老师的 streamWindow
   */
  _toggleStreamWindow() {
    EduEventUICenter.shared.emitClassroomUIEvents(
      AgoraEduClassroomUIEvent.toggleTeacherStreamWindow,
      this.localNavCameraOff,
    );
  }

  /**
   * stage === true 那么控制摄像头开关
   * stage === flase 控制老师窗口的展示和关闭
   */
  @bound
  private _toggleNavCamera() {
    if (
      (typeof this.classroomStore.roomStore.flexProps.stage !== 'undefined' &&
        this.classroomStore.roomStore.flexProps.stage) ||
      typeof this.classroomStore.roomStore.flexProps.stage === 'undefined'
    ) {
      this._toggleLocalVideo();
      return;
    }
    if (
      typeof this.classroomStore.roomStore.flexProps.stage !== 'undefined' &&
      !this.classroomStore.roomStore.flexProps.stage
    ) {
      // 🖊️ streamwindowMap 中是否有 teacher stream uuid
      this._toggleStreamWindow();
      return;
    }
    console.warn('[nav camera] not more action to trigger ');
  }

  @action.bound
  private _handleStreamWindowChange(type: AgoraEduClassroomUIEvent, streamUserUuids: string[]) {
    if (type === AgoraEduClassroomUIEvent.streamWindowsChange) {
      const isContainTeacher = streamUserUuids.find(
        (userUuid) => userUuid === EduClassroomConfig.shared.sessionInfo.userUuid,
      );
      this.teacherStreamWindow = !!isContainTeacher;
    }
  }

  private _leaveSubRoom() {
    const currentRoomUuid = this.classroomStore.groupStore.currentSubRoom;
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    if (currentRoomUuid) {
      this.classroomStore.groupStore.removeGroupUsers(currentRoomUuid, [userUuid]);
    }
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
    EduEventUICenter.shared.offClassroomUIEvents(this._handleStreamWindowChange);
  }
}
