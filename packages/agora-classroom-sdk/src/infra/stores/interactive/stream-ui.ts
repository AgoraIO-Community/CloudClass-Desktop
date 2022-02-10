import {
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduStreamTool,
  EduStreamToolCategory,
  EduStreamUI,
  StreamUIStore,
} from 'agora-edu-core';
import { Log } from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { computedFn } from 'mobx-utils';

@Log.attach({ proxyMethods: false })
export class InteractiveRoomStreamUIStore extends StreamUIStore {
  // 1 teacher + 6 students
  private _carouselShowCount = 7;

  private _gapInPx = 8;

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

    const streams = [];

    const carouselStudentList = acceptedList.slice(
      this.carouselPosition,
      this.carouselPosition + this.carouselStudentShowCount,
    );

    for (const student of carouselStudentList) {
      const streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(student.userUuid) || new Set();

      for (const streamUuid of streamUuids) {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          const uiStream = new EduStreamUI(stream);

          streams.push(uiStream);
        }
      }
    }

    return streams;
  }

  @computed get localStreamTools(): EduStreamTool[] {
    const { sessionInfo } = EduClassroomConfig.shared;
    let tools: EduStreamTool[] = [];
    tools = tools.concat([this.localCameraTool(), this.localMicTool()]);

    if (sessionInfo.role === EduRoleTypeEnum.teacher) {
      tools.push(this.localPodiumTool());
    }

    return tools;
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

  onInstall(): void {
    super.onInstall();

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
    );

    this.classroomStore.mediaStore.setMirror(
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher,
    );
  }
}
