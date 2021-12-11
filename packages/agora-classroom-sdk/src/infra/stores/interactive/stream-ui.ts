import {
  EduClassroomConfig,
  EduRoleTypeEnum,
  EduStreamTool,
  EduStreamToolCategory,
  EduStreamUI,
  StreamIconColor,
  StreamUIStore,
  transI18n,
} from 'agora-edu-core';
import { AGError, AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { computed } from 'mobx';
import { computedFn } from 'mobx-utils';

export class InteractiveRoomStreamUIStore extends StreamUIStore {
  // 1 teacher + 6 students
  private _carouselShowCount = 7;

  private _gapInPx = 8;

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

    for (let student of acceptedList) {
      let streamUuids =
        this.classroomStore.streamStore.streamByUserUuid.get(student.userUuid) || new Set();

      for (let streamUuid of streamUuids) {
        let stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
        if (stream) {
          let uiStream = new EduStreamUI(stream);

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

      if (stream.role === EduRoleTypeEnum.teacher) {
        tools.push(this.localPodiumTool());
      }
    }

    return tools;
  });

  get gap() {
    return this._gapInPx;
  }
}
