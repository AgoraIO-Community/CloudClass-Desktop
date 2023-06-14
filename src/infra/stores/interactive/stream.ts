import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@classroom/infra/utils/event-center';
import {
  AGEduErrorCode,
  EduClassroomConfig,
  EduErrorCenter,
  EduRoleTypeEnum,
} from 'agora-edu-core';
import { AGError, AgoraRteVideoSourceType, Log } from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { transI18n } from 'agora-common-libs';
import { SvgIconEnum } from '@classroom/ui-kit';
import { InteractionStateColors } from '@classroom/ui-kit/utilities/state-color';
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

    if (!this.getters.isInSubRoom) {
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
          this._setRenderAt(uiStream);
          streams.push(uiStream);
        }
      }
    }
    return streams;
  }

  @computed
  get teacherCameraStream(): EduStreamUI | undefined {
    let stream = undefined;
    const { teacherCameraStream } = this.getters;

    if (teacherCameraStream) {
      stream = new EduStreamUI(teacherCameraStream);
      this._setRenderAt(stream);
    }

    if (!this.getters.isInSubRoom) {
      if (stream) {
        const { groupUuidByUserUuid } = this.classroomStore.groupStore;

        const teacherUuid = stream.fromUser.userUuid;

        if (groupUuidByUserUuid.has(teacherUuid)) return undefined;
      }
    }

    return stream;
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
        interactable: !!this.getters.windowStreamUserUuids.length,
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
    if (super.studentCameraStreams.length > this.carouselStudentShowCount + this.carouselPosition) {
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
    return super.studentCameraStreams.length > this.carouselStudentShowCount;
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
  }

  onDestroy(): void {
    super.onDestroy();
  }
}
