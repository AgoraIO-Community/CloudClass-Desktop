import {
  AGError,
  AgoraRteMediaSourceState,
  AgoraRteMediaPublishState,
  AgoraRteVideoSourceType,
  AGRenderMode,
  bound,
} from 'agora-rte-sdk';
import { action, computed, IReactionDisposer, Lambda, observable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { EduUIStoreBase } from '../base';
import { transI18n } from '../i18n';
import { CameraPlaceholderType } from '../type';
import { EduStreamUI, StreamBounds } from './struct';
import { EduStreamTool, EduStreamToolCategory } from './tool';
import { v4 as uuidv4 } from 'uuid';
import {
  AGEduErrorCode,
  AGServiceErrorCode,
  EduClassroomConfig,
  EduErrorCenter,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  EduStream,
} from 'agora-edu-core';
import { interactionThrottleHandler } from '@/infra/utils/interaction';
import { TooltipPlacement } from '~ui-kit';

export enum StreamIconColor {
  active = '#357bf6',
  deactive = '#bdbdca',
  activeWarn = '#f04c36',
}

export class StreamUIStore extends EduUIStoreBase {
  protected _disposers: (IReactionDisposer | Lambda)[] = [];

  /**
   * 视频窗位置信息
   */
  /** @en
   * video stream bounds
   */
  @observable
  streamsBounds: Map<string, StreamBounds> = new Map();

  onInstall() {
    this._disposers.push(
      computed(() => this.classroomStore.userStore.rewards).observe(({ newValue, oldValue }) => {
        const anims: { id: string; userUuid: string }[] = [];
        for (const [userUuid] of newValue) {
          let previousReward = 0;
          if (oldValue) {
            previousReward = oldValue.get(userUuid) || 0;
          }
          const reward = newValue.get(userUuid) || 0;
          const onPodium = this.classroomStore.roomStore.acceptedList.some(
            ({ userUuid: thisUuid }) => thisUuid === userUuid,
          );
          const haveAnimation =
            EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.Room1v1Class ||
            onPodium;
          // Add an animation to the award animation queue only if the student is on podium
          if (reward > previousReward && haveAnimation) {
            anims.push({ id: uuidv4(), userUuid: userUuid });
          }
        }
        if (anims.length > 0) {
          runInAction(() => {
            this.awardAnims = this.awardAnims.concat(anims);
          });
        }
      }),
    );
  }

  /**
   * 奖励信息
   */
  @observable awardAnims: { id: string; userUuid: string }[] = [];

  /**
   * 老师流信息列表
   * @returns
   */
  @computed get teacherStreams(): Set<EduStreamUI> {
    const streamSet = new Set<EduStreamUI>();
    const teacherList = this.classroomStore.userStore.teacherList;
    for (const teacher of teacherList.values()) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(teacher.userUuid) || new Set();
      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          const uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return streamSet;
  }

  /**
   * 助教流信息列表
   * @returns
   */
  @computed get assistantStreams(): Set<EduStreamUI> {
    const streamSet = new Set<EduStreamUI>();
    const assistantList = this.classroomStore.userStore.assistantList;
    for (const assistant of assistantList.values()) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(assistant.userUuid) || new Set();
      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          const uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return streamSet;
  }

  /**
   * 老师流信息（教室内只有一个老师时使用，如果有一个以上老师请使用 teacherStreams）
   * @returns
   */
  @computed get teacherCameraStream(): EduStreamUI | undefined {
    const streamSet = new Set<EduStreamUI>();
    const streams = this.teacherStreams;
    for (const stream of streams) {
      if (stream.stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        streamSet.add(stream);
      }
    }

    if (streamSet.size > 1) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UNEXPECTED_TEACHER_STREAM_LENGTH,
        new Error(`unexpected stream size ${streams.size}`),
      );
    }
    return Array.from(streamSet)[0];
  }

  @computed get screenShareStream() {
    const streamUuid = this.classroomStore.roomStore.screenShareStreamUuid as string;
    const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
    return stream;
  }

  /**
   * 老师屏幕共享流信息
   * @returns
   */
  @computed get teacherScreenShareStream() {
    const streamUuid = this.classroomStore.roomStore.screenShareStreamUuid;
    const streamSet = new Set<EduStreamUI>();

    if (streamUuid) {
      const streams = this.teacherStreams;
      for (const stream of streams) {
        if (
          stream.stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare &&
          stream.stream.streamUuid === streamUuid
        ) {
          streamSet.add(stream);
        }
      }
    }

    return Array.from(streamSet)[0];
  }

  /**
   * 学生流信息（教室内只有一个学生时使用，如果有一个以上老师请使用 studentStreams）
   * @returns
   */
  @computed get studentCameraStream(): EduStreamUI | undefined {
    const streamSet = new Set<EduStreamUI>();
    const streams = this.studentStreams;
    for (const stream of streams) {
      if (stream.stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        streamSet.add(stream);
      }
    }

    if (streamSet.size > 1) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UNEXPECTED_STUDENT_STREAM_LENGTH,
        new Error(`unexpected stream size ${streamSet.size}`),
      );
    }
    return Array.from(streamSet)[0];
  }

  /**
   * 学生流信息列表
   * @returns
   */
  @computed get studentStreams(): Set<EduStreamUI> {
    const streamSet = new Set<EduStreamUI>();
    const studentList = this.classroomStore.userStore.studentList;
    for (const student of studentList.values()) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(student.userUuid) || new Set();
      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          const uiStream = new EduStreamUI(stream);
          streamSet.add(uiStream);
        }
      }
    }
    return streamSet;
  }

  /**
   * 获取远端流音量
   * @returns
   */
  remoteStreamVolume = computedFn((stream: EduStreamUI) => {
    const volume = this.classroomStore.streamStore.streamVolumes.get(stream.stream.streamUuid) || 0;
    return volume * 100;
  });

  /**
   * 本地音量
   * @returns
   */
  @computed get localVolume(): number {
    return this.classroomStore.mediaStore.localMicAudioVolume * 100;
  }

  /**
   * 本地摄像头设备状态
   * @returns
   */
  @computed get localCameraTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localCameraTrackState;
  }

  /**
   * 本地麦克风设备状态
   * @returns
   */
  @computed get localMicTrackState(): AgoraRteMediaSourceState {
    return this.classroomStore.mediaStore.localMicTrackState;
  }

  /**
   * 本地屏幕共享状态
   * @returns
   */
  @computed get localScreenShareOff() {
    return (
      (EduClassroomConfig.shared.sessionInfo.role !== EduRoleTypeEnum.student &&
        this.classroomStore.mediaStore.localScreenShareTrackState !==
          AgoraRteMediaSourceState.started) ||
      (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student &&
        !this.classroomStore.remoteControlStore.isControlled)
    );
  }

  /**
   * 本地摄像头设备是否关闭
   * @returns
   */
  @computed get localCameraOff() {
    return this.localCameraTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 本地麦克风设备是否关闭
   * @returns
   */
  @computed get localMicOff() {
    return this.localMicTrackState !== AgoraRteMediaSourceState.started;
  }

  /**
   * 镜像是否开启
   * @returns
   */
  @computed get isMirror() {
    return this.classroomStore.mediaStore.isMirror;
  }

  /**
   * 白板授权用户列表
   * @returns
   */
  @computed get whiteboardGrantUsers() {
    return this.classroomStore.boardStore.grantUsers;
  }

  /**
   * 视频窗口显示的挂件信息
   * reward: 奖励信息
   * grant: 授权状态
   * @returns
   */
  get layerItems() {
    return ['reward', 'grant'];
  }

  /**
   * 远端流是否正在举手
   * @returns
   */
  isWaveArm = computedFn((stream: EduStreamUI): boolean => {
    return this.classroomStore.roomStore.waveArmList.some(
      (it) => it.userUuid === stream.fromUser.userUuid,
    );
  });

  /**
   * 远端流奖励信息
   * @returns
   */
  awards = computedFn((stream: EduStreamUI): number => {
    const reward = this.classroomStore.userStore.rewards.get(stream.fromUser.userUuid);
    return reward || 0;
  });

  /**
   * 远端流奖励动画列表
   * @returns
   */
  streamAwardAnims = computedFn((stream: EduStreamUI): { id: string; userUuid: string }[] => {
    return this.awardAnims.filter((anim) => anim.userUuid === stream.fromUser.userUuid);
  });

  /**
   * 本地视频窗摄像头
   * @returns
   */
  localCameraTool = computedFn((): EduStreamTool => {
    return new EduStreamTool(
      EduStreamToolCategory.camera,
      this.localCameraOff ? 'stream-camera-disabled' : 'stream-camera-enabled',
      this.localCameraOff ? transI18n('Open Camera') : transI18n('Close Camera'),
      {
        //i can always control myself
        interactable: true,
        hoverIconType: 'stream-camera-disabled',
        onClick: async () => {
          try {
            this.toggleLocalVideo();
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
    );
  });

  /**
   * 本地视频窗麦克风
   * @returns
   */
  localMicTool = computedFn((): EduStreamTool => {
    return new EduStreamTool(
      EduStreamToolCategory.microphone,
      this.localMicOff ? 'stream-mic-disabled' : 'stream-mic-enabled',
      this.localMicOff ? transI18n('Open Microphone') : transI18n('Close Microphone'),
      {
        //host can control, or i can control myself
        interactable: true,
        hoverIconType: 'stream-mic-disabled',
        onClick: async () => {
          try {
            this.toggleLocalAudio();
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
    );
  });

  /**
   * 本地视频窗上下台
   * @returns
   */
  localPodiumTool = computedFn((): EduStreamTool => {
    const { acceptedList } = this.classroomStore.roomStore;
    return new EduStreamTool(
      EduStreamToolCategory.podium_all,
      'not-on-podium',
      transI18n('Clear Podiums'),
      {
        interactable: !!this.studentStreams.size,
        hoverIconType: 'on-podium',
        onClick: async () => {
          try {
            await this.classroomStore.handUpStore.offPodiumAll();
          } catch (e) {
            if (
              !AGError.isOf(
                e as Error,
                AGServiceErrorCode.SERV_PROCESS_CONFLICT,
                AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
              )
            ) {
              this.shareUIStore.addGenericErrorDialog(e as AGError);
            }
          }
        },
      },
    );
  });

  /**
   * 远端视频窗摄像头
   * @returns
   */
  remoteCameraTool = computedFn((stream: EduStreamUI): EduStreamTool => {
    const videoMuted = stream.stream.videoState === AgoraRteMediaPublishState.Unpublished;
    const videoSourceStopped = stream.stream.videoSourceState === AgoraRteMediaSourceState.stopped;
    return new EduStreamTool(
      EduStreamToolCategory.camera,
      videoSourceStopped
        ? 'stream-camera-inactive'
        : videoMuted
        ? 'stream-camera-disabled'
        : 'stream-camera-enabled',
      videoSourceStopped
        ? transI18n('Camera Not Available')
        : videoMuted
        ? transI18n('Open Camera')
        : transI18n('Close Camera'),
      {
        //can interact when source is not stopped
        interactable: !videoSourceStopped,
        style: {},
        hoverIconType: 'stream-camera-disabled',
        onClick: () => {
          this.classroomStore.streamStore
            .updateRemotePublishState(stream.fromUser.userUuid, stream.stream.streamUuid, {
              videoState: videoMuted
                ? AgoraRteMediaPublishState.Published
                : AgoraRteMediaPublishState.Unpublished,
            })
            .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
        },
      },
    );
  });

  /**
   * 远端视频窗麦克风
   * @returns
   */
  remoteMicTool = computedFn((stream: EduStreamUI): EduStreamTool => {
    const audioMuted = stream.stream.audioState === AgoraRteMediaPublishState.Unpublished;
    const audioSourceStopped = stream.stream.audioSourceState === AgoraRteMediaSourceState.stopped;
    return new EduStreamTool(
      EduStreamToolCategory.microphone,
      audioSourceStopped
        ? 'stream-mic-inactive'
        : audioMuted
        ? 'stream-mic-disabled'
        : 'stream-mic-enabled',
      audioSourceStopped
        ? transI18n('Microphone Not Available')
        : audioMuted
        ? transI18n('Open Microphone')
        : transI18n('Close Microphone'),
      {
        //can interact when source is not stopped
        interactable: !audioSourceStopped,
        hoverIconType: 'stream-mic-disabled',
        style: {},
        onClick: async () => {
          this.classroomStore.streamStore
            .updateRemotePublishState(stream.fromUser.userUuid, stream.stream.streamUuid, {
              audioState: audioMuted
                ? AgoraRteMediaPublishState.Published
                : AgoraRteMediaPublishState.Unpublished,
            })
            .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
        },
      },
    );
  });

  /**
   * 远端视频窗上下台
   * @returns
   */
  remotePodiumTool = computedFn((stream: EduStreamUI): EduStreamTool => {
    return new EduStreamTool(
      EduStreamToolCategory.podium,
      'not-on-podium',
      transI18n('Clear Podium'),
      {
        interactable: true,
        style: {},
        hoverIconType: 'on-podium',
        onClick: async () => {
          try {
            await this.classroomStore.handUpStore.offPodium(stream.fromUser.userUuid);
          } catch (e) {
            if (
              !AGError.isOf(
                e as Error,
                AGServiceErrorCode.SERV_PROCESS_CONFLICT,
                AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
              )
            ) {
              this.shareUIStore.addGenericErrorDialog(e as AGError);
            }
          }
        },
      },
    );
  });

  /**
   * 远端视频窗白板授权
   * @returns
   */
  remoteWhiteboardTool = computedFn((stream: EduStreamUI): EduStreamTool => {
    const whiteboardAuthorized = this.whiteboardGrantUsers.has(stream.fromUser.userUuid);
    const whiteboardReady = this.classroomStore.boardStore.ready;
    return new EduStreamTool(
      EduStreamToolCategory.whiteboard,
      whiteboardReady
        ? whiteboardAuthorized
          ? 'board-granted'
          : 'board-not-granted'
        : 'board-grant-disabled',
      whiteboardReady
        ? whiteboardAuthorized
          ? transI18n('Close Whiteboard')
          : transI18n('Open Whiteboard')
        : transI18n('Whiteboard Not Available'),
      {
        interactable: whiteboardReady,
        style: {},
        hoverIconType: 'board-granted',
        onClick: () => {
          try {
            whiteboardAuthorized
              ? this.classroomStore.boardStore.revokePermission(stream.fromUser.userUuid)
              : this.classroomStore.boardStore.grantPermission(stream.fromUser.userUuid);
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
    );
  });

  /**
   * 远端视频窗奖励
   * @returns
   */
  remoteRewardTool = computedFn((stream: EduStreamUI): EduStreamTool => {
    return new EduStreamTool(EduStreamToolCategory.star, 'reward', transI18n('Star'), {
      interactable: true,
      style: {},
      hoverIconType: 'reward-hover',
      onClick: interactionThrottleHandler(
        () => {
          this.classroomStore.roomStore
            .sendRewards([{ userUuid: stream.fromUser.userUuid, changeReward: 1 }])
            .catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
        },
        (message) => this.shareUIStore.addToast(message, 'warning'),
      ),
    });
  });

  /**
   * 本地视频窗工具列表
   * @returns
   */
  @computed get localStreamTools(): EduStreamTool[] {
    const tools: EduStreamTool[] = [];
    // tools = tools.concat([this.localCameraTool(), this.localMicTool()]);

    return tools;
  }

  /**
   * 远端视频窗工具列表
   * @returns
   */
  remoteStreamTools = computedFn((stream: EduStreamUI): EduStreamTool[] => {
    const iAmHost =
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher ||
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.assistant;
    let tools: EduStreamTool[] = [];
    if (iAmHost) {
      tools = tools.concat([this.remoteCameraTool(stream), this.remoteMicTool(stream)]);
      if (stream.role === EduRoleTypeEnum.student) {
        tools = tools.concat([this.remoteWhiteboardTool(stream), this.remoteRewardTool(stream)]);
      }
    }
    return tools;
  });

  /**
   * 本地音频图标
   * @returns
   */
  @computed get localMicIconType() {
    return this.localMicOff ? 'microphone-off' : 'microphone-on';
  }

  /**
   * 本地视频占位符
   * @returns
   */
  cameraPlaceholder = computedFn(
    (stream: EduStreamUI, canSetupVideo: boolean): CameraPlaceholderType => {
      if (!canSetupVideo) return CameraPlaceholderType.nosetup;
      const isLocal =
        stream.stream.streamUuid === this.classroomStore.streamStore.localCameraStreamUuid;

      const videoSourceState = isLocal
        ? this.classroomStore.mediaStore.localCameraTrackState
        : stream.stream.videoSourceState;

      let placeholder = CameraPlaceholderType.none;

      const deviceDisabled = videoSourceState === AgoraRteMediaSourceState.stopped;

      if (deviceDisabled) {
        return CameraPlaceholderType.disabled;
      }

      if (
        stream.stream.videoState === AgoraRteMediaPublishState.Published &&
        videoSourceState === AgoraRteMediaSourceState.started
      ) {
        placeholder = CameraPlaceholderType.none;
      } else {
        placeholder = CameraPlaceholderType.muted;
      }
      return placeholder;
    },
  );

  /**
   * 视频窗工具栏定位
   * @returns
   */
  @computed get toolbarPlacement(): 'left' | 'bottom' {
    return 'bottom';
  }

  /**
   * 大窗视频窗工具栏定位
   * @returns
   */
  @computed get fullScreenToolbarPlacement(): 'left' | 'bottom' {
    return 'bottom';
  }
  /**
   * 大窗视频窗工具tooltip定位
   * @returns
   */
  @computed get fullScreenToolTipPlacement(): TooltipPlacement {
    return 'top';
  }
  /**
   * 移除奖励动画
   * @param id
   */
  @action.bound removeAward(id: string) {
    this.awardAnims = this.awardAnims.filter((anim) => anim.id !== id);
  }

  /**
   * 切换本地摄像头设备开关状态
   */
  @bound
  toggleLocalVideo() {
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
  toggleLocalAudio() {
    if (this.localMicOff) {
      this.classroomStore.mediaStore.enableLocalAudio(true);
    } else {
      this.classroomStore.mediaStore.enableLocalAudio(false);
    }
  }

  /**
   * 渲染本地 Stream 视频到 DOM
   * @param stream
   * @param dom
   * @param mirror
   * @returns
   */
  @bound
  setupLocalVideo(stream: EduStream, dom: HTMLElement, mirror?: boolean) {
    return this.classroomStore.streamStore.setupLocalVideo(stream, dom, mirror);
  }

  /**
   * 渲染远端 Stream 视频到 DOM
   * @param stream
   * @param dom
   * @param mirror
   * @param renderMode
   * @returns
   */
  @bound
  setupRemoteVideo(
    stream: EduStream,
    dom: HTMLElement,
    mirror: boolean,
    renderMode?: AGRenderMode,
  ) {
    return this.classroomStore.streamStore.setupRemoteVideo(stream, dom, mirror, renderMode);
  }

  /**
   * 渲染本地屏幕共享到 DOM
   * @param dom
   */
  @bound
  setupLocalScreenShare(dom: HTMLElement) {
    this.classroomStore.mediaStore.setupLocalScreenShare(dom);
  }

  /**
   * 停止屏幕视频采集
   * @returns
   */
  @bound
  stopScreenShareCapture() {
    if (this.classroomStore.remoteControlStore.isRemoteControlling) {
      if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher) {
        this.classroomStore.remoteControlStore.unauthorizeStudentToControl();
        this.classroomStore.mediaStore.stopScreenShareCapture();
      } else {
        this.classroomStore.remoteControlStore.quitControlRequest();
      }
    } else {
      return this.classroomStore.mediaStore.stopScreenShareCapture();
    }
  }

  @action.bound
  setStreamBoundsByStreamUuid(streamUuid: string, bounds: StreamBounds) {
    this.streamsBounds.set(streamUuid, bounds);
  }

  @action.bound
  removeStreamBoundsByStreamUuid(streamUuid: string) {
    this.streamsBounds.delete(streamUuid);
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
