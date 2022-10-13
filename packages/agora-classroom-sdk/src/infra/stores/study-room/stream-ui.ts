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

  onInstall() {
    super.onInstall();

    // let subStreams: EduStream[] = [];
    // this._disposers.push(
    //   reaction(
    //     () => ({
    //       viewMode: this.getters.viewMode,
    //       streams: this.participant8Streams,
    //     }),
    //     async ({ streams }) => {
    //       if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
    //         return;
    //       }
    //       if (this.getters.viewMode === 'surrounded') {
    //         this.logger.info('mass unsub', subStreams);
    //         const mute: EduStream[] = [];
    //         const unmute: EduStream[] = [];

    //         streams.forEach(({ stream }) => {
    //           // 如果上次订阅存在
    //           const some = subStreams.some(({ streamUuid }) => {
    //             // return streamUuid === stream.stream.streamUuid;
    //             return false;
    //           });
    //           if (!some) {
    //             unmute.push(stream.stream);
    //           }
    //         });
    //         subStreams.forEach((s) => {
    //           const { streamUuid } = s;
    //           // 如果本次订阅不存在
    //           const some = streams.some(({ stream }) => {
    //             // return streamUuid === stream.stream.streamUuid;
    //             return false;
    //           });
    //           if (!some && this.pinnedStream?.stream.stream.streamUuid !== s.streamUuid) {
    //             mute.push(s);
    //           }
    //         });

    //         await this.classroomStore.streamStore.muteRemoteVideoStreamMass(mute, true);
    //         const sub = unmute.filter((s) => s.fromUser.userUuid !== this.getters.localUserUuid);
    //         if (this.pinnedStream) {
    //           const hasPinned = sub.some(
    //             ({ streamUuid }) => streamUuid === this.pinnedStream?.stream.stream.streamUuid,
    //           );
    //           if (!hasPinned) {
    //             sub.push(this.pinnedStream.stream.stream);
    //           }
    //         }
    //         subStreams = sub;
    //         this.logger.info('mass sub', sub);
    //         await this.classroomStore.streamStore.muteRemoteVideoStreamMass(sub, false);
    //       }
    //     },
    //   ),
    // );

    // this._disposers.push(
    //   reaction(
    //     () => ({
    //       viewMode: this.getters.viewMode,
    //       streams: this.participant20Streams,
    //     }),
    //     async ({ streams }) => {
    //       if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
    //         return;
    //       }
    //       if (this.getters.viewMode === 'divided') {
    //         const mute: EduStream[] = [];
    //         const unmute: EduStream[] = [];

    //         streams.forEach(({ stream }) => {
    //           // 如果上次订阅存在
    //           const some = subStreams.some(({ streamUuid }) => {
    //             // return streamUuid === stream.stream.streamUuid;
    //             return false;
    //           });
    //           if (!some) {
    //             unmute.push(stream.stream);
    //           }
    //         });
    //         subStreams.forEach((s) => {
    //           const { streamUuid } = s;
    //           // 如果本次订阅不存在
    //           const some = streams.some(({ stream }) => {
    //             // return streamUuid === stream.stream.streamUuid;
    //             return false;
    //           });
    //           if (!some && this.pinnedStream?.stream.stream.streamUuid !== s.streamUuid) {
    //             mute.push(s);
    //           }
    //         });

    //         await this.classroomStore.streamStore.muteRemoteVideoStreamMass(mute, true);
    //         const sub = unmute.filter((s) => s.fromUser.userUuid !== this.getters.localUserUuid);
    //         if (this.pinnedStream) {
    //           const hasPinned = sub.some(
    //             ({ streamUuid }) => streamUuid === this.pinnedStream?.stream.stream.streamUuid,
    //           );
    //           if (!hasPinned) {
    //             sub.push(this.pinnedStream.stream.stream);
    //           }
    //         }
    //         subStreams = sub;
    //         await this.classroomStore.streamStore.muteRemoteVideoStreamMass(sub, false);
    //       }
    //     },
    //   ),
    // );

    // let pinned: EduStream | undefined = undefined;
    // this._disposers.push(
    //   reaction(
    //     () => this.pinnedStream,
    //     async () => {
    //       if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
    //         return;
    //       }
    //       const sr: EduStream[] = [];
    //       if (pinned) {
    //         sr.push(pinned);
    //       }
    //       if (this.pinnedStream) {
    //         const s = this.pinnedStream.stream.stream;
    //         sr.push(s);
    //         pinned = s;
    //       }
    //       await new Promise((r) => setTimeout(r, 0));
    //       await this.classroomStore.streamStore.muteRemoteVideoStreamMass(sr, false);
    //     },
    //   ),
    // );
  }
}
