import { EduClassroomConfig, EduRoleTypeEnum, EduRoomServiceTypeEnum } from 'agora-edu-core';
import { Log } from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { StreamUIStore } from '../common/stream';
import { EduStreamUI } from '../common/stream/struct';
import { EduStreamTool, EduStreamToolCategory } from '../common/stream/tool';

@Log.attach({ proxyMethods: false })
export class LectureRoomStreamUIStore extends StreamUIStore {
  private _teacherWidthRatio = 0.217;
  //5 students
  private _carouselShowCount = 5;

  private _gapInPx = 4;

  @observable
  carouselPosition = 0;

  @action.bound
  carouselNext() {
    if (super.studentStreams.size > this._carouselShowCount + this.carouselPosition) {
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

  @computed get localStreamTools(): EduStreamTool[] {
    const { sessionInfo } = EduClassroomConfig.shared;
    const tools: EduStreamTool[] = [];
    // tools = tools.concat([this.localCameraTool(), this.localMicTool()]);

    if (
      sessionInfo.role === EduRoleTypeEnum.teacher &&
      sessionInfo.roomServiceType !== EduRoomServiceTypeEnum.MixStreamCDN
    ) {
      tools.push(this.localPodiumTool());
    }

    return tools;
  }

  @computed
  get carouselStreams() {
    const list = Array.from(this.studentStreams);
    return list.slice(this.carouselPosition, this.carouselPosition + this._carouselShowCount);
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
        tools = tools.concat([this.remoteWhiteboardTool(stream), this.remotePodiumTool(stream)]);
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

  get teacherVideoStreamSize() {
    const width = this.shareUIStore.classroomViewportSize.width * this._teacherWidthRatio;

    const height = (9 / 16) * width;

    return { width, height };
  }

  get studentVideoStreamSize() {
    const restWidth =
      this.shareUIStore.classroomViewportSize.width - this.teacherVideoStreamSize.width - 2;

    const width = restWidth / this._carouselShowCount - this._gapInPx;

    const height = (10 / 16) * width;
    return { width, height };
  }

  get gap() {
    return this._gapInPx;
  }

  get scrollable() {
    return super.studentStreams.size > this._carouselShowCount;
  }

  get layerItems() {
    return ['reward', 'grant'];
  }

  get toolbarPlacement(): 'bottom' | 'left' {
    return 'left';
  }

  get toolbarOffset(): number[] {
    return [10, 0];
  }

  get fullScreenToolbarOffset(): number[] {
    return [0, -58];
  }

  onInstall(): void {
    super.onInstall();
    this._disposers.push(
      reaction(
        () => this.studentStreams,
        () => {
          if (
            this.studentStreams.size - this.carouselPosition < this._carouselShowCount &&
            this.carouselPosition > 0
          ) {
            this.carouselPrev();
          }
        },
      ),
    );

    this.classroomStore.mediaStore.setMirror(true);
  }
}
