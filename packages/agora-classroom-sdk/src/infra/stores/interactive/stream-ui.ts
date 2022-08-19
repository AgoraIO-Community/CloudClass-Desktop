import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@/infra/utils/event-center';
import {
  AGEduErrorCode,
  EduClassroomConfig,
  EduErrorCenter,
  EduRoleTypeEnum,
} from 'agora-edu-core';
import { AGError, AgoraRteVideoSourceType, Log } from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { SvgIconEnum, transI18n } from '~ui-kit';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';
import { StreamUIStore } from '../common/stream';
import { EduStreamUI } from '../common/stream/struct';
import { EduStreamTool, EduStreamToolCategory } from '../common/stream/tool';
@Log.attach({ proxyMethods: false })
export class InteractiveRoomStreamUIStore extends StreamUIStore {
  // 1 teacher + 6 students
  private _carouselShowCount = 7;

  private _gapInPx = 4;

  @observable
  carouselPosition = 0;

  get videoStreamSize() {
    const width =
      this.shareUIStore.classroomViewportSize.width / this._carouselShowCount - this._gapInPx;

    const height = (9 / 16) * width;

    return { width, height };
  }

  @computed
  get carouselStreams(): EduStreamUI[] {
    const { acceptedList } = this.classroomStore.roomStore;
    const { groupUuidByUserUuid } = this.classroomStore.groupStore;

    const streams = [];

    let carouselStudentList = acceptedList.slice(
      this.carouselPosition,
      this.carouselPosition + this.carouselStudentShowCount,
    );
    const isInSubRoom = this.classroomStore.groupStore.currentSubRoom;

    if (!isInSubRoom) {
      carouselStudentList = carouselStudentList.filter(
        ({ userUuid }) => !groupUuidByUserUuid.has(userUuid),
      );
    }

    for (const student of carouselStudentList) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(student.userUuid) || new Set();
      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);

        if (stream && stream.videoSourceType !== AgoraRteVideoSourceType.ScreenShare) {
          const uiStream = new EduStreamUI(stream);

          streams.push(uiStream);
        }
      }
    }
    return streams;
  }

  @computed
  get teacherCameraStream(): EduStreamUI | undefined {
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

    const teacherCameraStream = Array.from(streamSet)[0];

    const isInSubRoom = this.classroomStore.groupStore.currentSubRoom;

    if (!isInSubRoom) {
      if (teacherCameraStream) {
        const { groupUuidByUserUuid } = this.classroomStore.groupStore;

        const teacherUuid = teacherCameraStream.fromUser.userUuid;

        if (groupUuidByUserUuid.has(teacherUuid)) return undefined;
      }
    }
    return teacherCameraStream;
  }

  @computed
  get assistantCameraStream(): EduStreamUI | undefined {
    const streamSet = new Set<EduStreamUI>();
    const streams = this.assistantStreams;
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

    const assistantCameraStream = Array.from(streamSet)[0];

    const isInSubRoom = this.classroomStore.groupStore.currentSubRoom;

    if (!isInSubRoom) {
      if (assistantCameraStream) {
        const { groupUuidByUserUuid } = this.classroomStore.groupStore;

        const assistantUuid = assistantCameraStream.fromUser.userUuid;

        if (groupUuidByUserUuid.has(assistantUuid)) return undefined;
      }
    }
    return assistantCameraStream;
  }

  /**
   * 所有人离开组件区域
   */
  localOffAllStreamWindow = computedFn((): EduStreamTool => {
    return new EduStreamTool(
      EduStreamToolCategory.stream_window_off,
      { icon: SvgIconEnum.STREAM_WINDOW_ON, color: InteractionStateColors.half },
      transI18n('Camera Pos Reset'),
      {
        //host can control
        interactable: !!this._streamWindowUserUuids.size,
        hoverIconType: { icon: SvgIconEnum.STREAM_WINDOW_ON, color: InteractionStateColors.allow },
        onClick: async () => {
          try {
            EduEventUICenter.shared.emitClassroomUIEvents(AgoraEduClassroomUIEvent.offStreamWindow); // stream window off event
          } catch (e) {
            this.shareUIStore.addGenericErrorDialog(e as AGError);
          }
        },
      },
    );
  });

  @computed get localStreamTools(): EduStreamTool[] {
    const { sessionInfo } = EduClassroomConfig.shared;
    const tools: EduStreamTool[] = [];
    // 摄像头和麦克风开关已移入 nav

    // if (sessionInfo.role !== EduRoleTypeEnum.teacher) {
    //   tools = tools.concat([this.localCameraTool(), this.localMicTool()]);
    // }

    if (sessionInfo.role === EduRoleTypeEnum.teacher) {
      tools.push(this.localPodiumTool());
    }
    // 如果当前为老师 并且 讲台存在的话显示移除图标
    if (sessionInfo.role === EduRoleTypeEnum.teacher && this.stageVisible) {
      tools.unshift(this.localOffAllStreamWindow());
    }

    return tools;
  }

  /**
   * 讲台区域开关
   */
  @computed
  get stageVisible() {
    return this.getters.stageVisible;
  }

  remoteStreamTools = computedFn((stream: EduStreamUI): EduStreamTool[] => {
    const { sessionInfo } = EduClassroomConfig.shared;
    const iAmHost =
      sessionInfo.role === EduRoleTypeEnum.teacher ||
      sessionInfo.role === EduRoleTypeEnum.assistant;
    let tools: EduStreamTool[] = [];

    if (iAmHost) {
      tools = tools.concat([this.remoteCameraTool(stream), this.remoteMicTool(stream)]);

      if (stream.role === EduRoleTypeEnum.student) {
        tools = tools.concat([
          this.remoteWhiteboardTool(stream),
          this.remoteRewardTool(stream),
          this.remotePodiumTool(stream),
        ]);
      }
    }

    const shouldNotHaveStreamTools =
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.assistant &&
      stream.role === EduRoleTypeEnum.teacher;

    if (shouldNotHaveStreamTools) {
      tools = tools.filter(({ category }) => {
        return ![EduStreamToolCategory.camera, EduStreamToolCategory.microphone].includes(category);
      });

      tools.push(this.localPodiumTool());
    }

    return tools;
  });

  get gap() {
    return this._gapInPx;
  }

  get carouselStudentShowCount() {
    return this._carouselShowCount - 1;
  }

  @action.bound
  carouselNext() {
    if (super.studentStreams.size > this.carouselStudentShowCount + this.carouselPosition) {
      this.carouselPosition += 1;
      this.logger.info('next', this.carouselPosition);
    }
  }

  @action.bound
  carouselPrev() {
    if (0 < this.carouselPosition) {
      this.carouselPosition -= 1;
      this.logger.info('prev', this.carouselPosition);
    }
  }

  get scrollable() {
    return super.studentStreams.size > this.carouselStudentShowCount;
  }

  @observable
  private _streamWindowUserUuids = new Set();

  @action.bound
  private _handleClassroomUIEvents(type: AgoraEduClassroomUIEvent, ...args: any[]) {
    switch (type) {
      case AgoraEduClassroomUIEvent.streamWindowsChange:
        this._streamWindowUserUuids = new Set(args[0]);
        break;
    }
  }

  get toolbarOffset(): number[] {
    return [0, -14];
  }

  get fullScreenToolbarOffset(): number[] {
    return [0, -58];
  }

  onInstall(): void {
    super.onInstall();
    this._disposers.push(
      reaction(
        () => this.classroomStore.roomStore.acceptedList,
        () => {
          const { acceptedList } = this.classroomStore.roomStore;

          if (
            acceptedList.length - this.carouselPosition < this.carouselStudentShowCount &&
            this.carouselPosition > 0
          ) {
            this.carouselPrev();
          }
        },
      ),
    );

    this.classroomStore.mediaStore.setMirror(true);

    EduEventUICenter.shared.onClassroomUIEvents(this._handleClassroomUIEvents);
  }

  onDestroy(): void {
    super.onDestroy();

    EduEventUICenter.shared.offClassroomUIEvents(this._handleClassroomUIEvents);
  }
}
