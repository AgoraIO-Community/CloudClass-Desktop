import {
  StreamUIStore,
  EduStreamTool,
  EduClassroomConfig,
  EduStreamToolCategory,
  EduRoleTypeEnum,
  EduStreamUI,
  iterateSet,
  StreamIconColor,
} from 'agora-edu-core';
import { AGError, AgoraRteMediaPublishState, AgoraRteMediaSourceState, Log } from 'agora-rte-sdk';
import { computed, observable, action } from 'mobx';
import { computedFn } from 'mobx-utils';
import { transI18n } from '~ui-kit';

@Log.attach({ proxyMethods: false })
export class LectureRoomStreamUIStore extends StreamUIStore {
  private _teacherWidthRatio = 0.217;
  //5 students
  private _carouselShowCount = 5;

  private _gapInPx = 8;

  @observable
  carouselPosition: number = 0;

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
      tools = tools.concat([this.localCameraTool(), this.localMicTool()]);

      if (stream.role === EduRoleTypeEnum.student) {
        tools = tools.concat([this.remotePodiumTool(stream)]);
      }
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

  // get videoStreamSize() {
  //   const width =
  //     this.shareUIStore.classroomViewportSize.width / this._carouselShowCount - this._gapInPx;

  //   const height = (10 / 16) * width;

  //   return { width, height };
  // }

  get carouselStreams() {
    const { list } = iterateSet(super.studentStreams, {
      onMap: (stream) => stream,
    });

    return list.slice(this.carouselPosition, this.carouselPosition + this._carouselShowCount);
  }

  get gap() {
    return this._gapInPx;
  }

  get canNav() {
    return super.studentStreams.size > this._carouselShowCount;
  }
}
