import { EduClassroomConfig } from 'agora-edu-core';
import { AgoraRteMediaSourceState, AgoraRteVideoSourceType, Log } from 'agora-rte-sdk';
import { computed, IReactionDisposer, Lambda } from 'mobx';
import { computedFn } from 'mobx-utils';
import { StreamUIStore } from '../common/stream';
import { EduStreamUI } from '../common/stream/struct';
import { StudyRoomGetters } from './getters';

export type StreamCellUI = {
  canPlay: boolean;
  stream: EduStreamUI;
};

@Log.attach({ proxyMethods: false })
export class StudyRoomStreamUIStore extends StreamUIStore {
  protected _disposers: (IReactionDisposer | Lambda)[] = [];

  get getters(): StudyRoomGetters {
    return super.getters as StudyRoomGetters;
  }

  @computed
  get localScreenStream() {
    const { localUser } = this.classroomStore.userStore;

    if (localUser) {
      const { localShareStreamUuid } = this.classroomStore.streamStore;

      if (localShareStreamUuid) {
        const localScreenStream =
          this.classroomStore.streamStore.streamByStreamUuid.get(localShareStreamUuid);

        if (localScreenStream) {
          return localScreenStream;
        }
      }
    }
  }

  @computed
  get localCameraStream() {
    const { localUser } = this.classroomStore.userStore;

    if (localUser) {
      const { localCameraStreamUuid } = this.classroomStore.streamStore;
      if (localCameraStreamUuid) {
        const localCameraStream =
          this.classroomStore.streamStore.streamByStreamUuid.get(localCameraStreamUuid);
        if (localCameraStream) {
          return localCameraStream;
        }
      }
    }
  }

  getPinnedStream = computedFn((pinnedUser: string) => {
    const userUuid = pinnedUser || EduClassroomConfig.shared.sessionInfo.userUuid;
    if (userUuid) {
      const [stream] = this._getUserStreams([userUuid]);
      return stream;
    }
  });

  getParticipantStreams = computedFn((userUuids: string[]) => {
    const streams = this._getUserStreams(userUuids);

    return streams;
  });

  private _getUserStreams(userUuids: string[]) {
    let list: StreamCellUI[] = [];

    userUuids.forEach((userUuid) => {
      const streamUuids = this.classroomStore.streamStore.streamByUserUuid.get(userUuid);
      streamUuids?.forEach((uuid) => {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(uuid);
        if (stream?.videoSourceType === AgoraRteVideoSourceType.Camera) {
          const deviceStarted = stream.videoSourceState === AgoraRteMediaSourceState.started;
          list = list.filter(
            ({ stream: { fromUser } }) => fromUser.userUuid !== stream.fromUser.userUuid,
          );
          list.push({
            stream: new EduStreamUI(stream),
            canPlay: deviceStarted,
          });
        } else if (stream?.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
          const deviceStarted = stream.videoSourceState === AgoraRteMediaSourceState.started;
          list = list.filter(
            ({ stream: { fromUser } }) => fromUser.userUuid !== stream.fromUser.userUuid,
          );
          list.push({
            stream: new EduStreamUI(stream),
            canPlay: deviceStarted,
          });
        }
      });
    });

    return list;
  }
}
