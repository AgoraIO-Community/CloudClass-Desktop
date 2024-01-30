import { AgoraEduSDK } from '@classroom/infra/api';
import { number2Percent, setUrlParameters } from '@classroom/infra/utils';
import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@classroom/infra/utils/event-center';
import {
  AGServiceErrorCode,
  ClassroomState,
  ClassState,
  DEVICE_DISABLE,
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduUserStruct,
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
import { SvgIconEnum } from '@classroom/ui-kit';
import { transI18n } from 'agora-common-libs';
import { NetworkStateColors } from '@classroom/ui-kit/utilities/state-color';
import { EduUIStoreBase } from '../base';
import { DialogCategory } from '../share';

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
  }

  // 是否显示share弹层
  @observable shareVisible = false;

  //computed
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
   * 是否选择摄像头设备
   * @returns
   */
  @computed
  get localCameraOff() {
    const { cameraDeviceId } = this.classroomStore.mediaStore;

    return typeof cameraDeviceId === 'undefined' || cameraDeviceId == DEVICE_DISABLE;
  }

  /**
   * 是否选择麦克风设备
   */
  @computed
  get localMicOff() {
    const { recordingDeviceId } = this.classroomStore.mediaStore;
    return typeof recordingDeviceId === 'undefined' || recordingDeviceId === DEVICE_DISABLE;
  }

  @computed
  get hasStreamWindow() {
    return this.getters.windowStreamUserUuids.includes(
      EduClassroomConfig.shared.sessionInfo.userUuid,
    );
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
      EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class ||
      EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass
    ) {
      return this.localCameraOff;
    } else {
      if (this.getters.stageVisible) {
        return this.localCameraOff;
      } else {
        return !this.hasStreamWindow;
      }
    }
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
        this.shareUIStore.addDialog(DialogCategory.Quit, {
          onOk: (back: boolean) => {
            if (back) {
              this._leaveSubRoom();
            } else {
              this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
            }
          },
          showOption: this.getters.isInSubRoom,
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
        title: transI18n('fcr_group_help_title'),
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

    const isInSubRoom = this.getters.isInSubRoom;

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
      return `-- : --`;
    }

    switch (this.classState) {
      case ClassState.beforeClass:
        return `${transI18n('nav.to_start_in')}${this.formatCountDown(duration)}`;
      case ClassState.ongoing:
        return `${transI18n('nav.started_elapse')}${this.formatCountDown(duration)}`;
      case ClassState.afterClass:
        return `${transI18n('nav.ended_elapse')}${this.formatCountDown(duration)}`;
      default:
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
        return 'excellent';
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
        return { icon: SvgIconEnum.NORMAL_SIGNAL, color: NetworkStateColors.normal };
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
        return transI18n('nav.signal_excellent');
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
      return Math.min(downlinkNetworkQuality, uplinkNetworkQuality) as AGNetworkQuality;
    }

    return downlinkNetworkQuality;
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
    const { teacherList } = this.classroomStore.userStore;
    const { isScreenSharing } = this.classroomStore.roomStore;
    if (isScreenSharing && teacherList.size) {
      const user = teacherList.values().next().value as EduUserStruct;

      return `${transI18n('fcr_share_sharing', {
        reason: user.userName,
      })}`;
    }
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
        rootUrl: setUrlParameters(recordUrl, {
          language: AgoraEduSDK.language,
        }),
        videoBitrate: 3000,
      },
      mode: RecordMode.Web,
      retryTimeout: recordRetryTimeout,
    };

    return args;
  }
  /**
   * 倒计时格式化
   * @param ms
   * @param mode
   * @returns
   */
  private formatCountDown(ms: number): string {
    const duration = dayjs.duration(ms);

    if (duration.days() > 0) {
      const mmss = duration.format('mm : ss');
      const h = Math.floor(duration.asHours());
      return `${h} : ${mmss}`;
    }

    const seconds = Math.floor(ms / 1000);
    if (seconds < 60 * 60) {
      return duration.format('mm : ss');
    }

    return duration.format('HH : mm : ss');
  }

  @action.bound
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
  private _toggleLocalVideo() {
    if (!this.localCameraOff) {
      this.classroomStore.mediaStore.enableLocalVideo(false);
    } else {
      this.classroomStore.mediaStore.enableLocalVideo(true);
    }
  }

  /**
   * 切换本地麦克风设备开关状态
   */
  private _toggleLocalAudio() {
    if (!this.localMicOff) {
      this.classroomStore.mediaStore.enableLocalAudio(false);
    } else {
      this.classroomStore.mediaStore.enableLocalAudio(true);
    }
  }

  /**
   * 打开关闭老师的 streamWindow
   */
  private _toggleStreamWindow() {
    EduEventUICenter.shared.emitClassroomUIEvents(
      AgoraEduClassroomUIEvent.toggleTeacherStreamWindow,
      this.localNavCameraOff,
    );
  }

  /**
   * stage === true 那么控制摄像头开关
   * stage === flase 控制老师窗口的展示和关闭
   */
  private _toggleNavCamera() {
    if (
      EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class ||
      EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomBigClass
    ) {
      this._toggleLocalVideo();
    } else {
      if (this.getters.stageVisible) {
        this._toggleLocalVideo();
      } else {
        this._toggleStreamWindow();
      }
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
  }
}
