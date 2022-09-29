import { EduStream } from 'agora-edu-core';
import {
  AgoraFromUser,
  AgoraRteEventType,
  AgoraRteMediaSourceState,
  AgoraRteVideoSourceType,
  AgoraUser,
  AGRtcState,
  Log,
} from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { StreamUIStore } from '../common/stream';
import { EduStreamUI } from '../common/stream/struct';

export type StreamCellUI = {
  canPlay: boolean;
  stream: EduStreamUI;
};

@Log.attach({ proxyMethods: false })
export class StudyRoomStreamUIStore extends StreamUIStore {
  @observable
  orderedUserList: string[] = [];

  @observable
  pageIndex = 0;

  @computed
  get showPager() {
    return this.totalPage > 1;
  }

  @computed
  get pageSize() {
    return this.shareUIStore.viewMode === 'divided' ? 20 : 8;
  }

  @computed
  get totalPage() {
    let totalUser = this.userList.length;
    if (this.shareUIStore.viewMode === 'surrounded') {
      totalUser -= 1;
    }

    const p = Math.floor(totalUser / this.pageSize);
    return totalUser % this.pageSize > 0 ? p + 1 : p;
  }

  @computed
  get userList() {
    return this.orderedUserList.filter((userUuid) => !this.shareUIStore.blackList.has(userUuid));
  }

  @computed
  get pinnedStream() {
    const userUuid = this.shareUIStore.pinnedUser || this.localUserUuid;
    if (userUuid) {
      const [stream] = this._getUserStreams([userUuid]);
      return stream;
    }
  }

  @computed
  get connected() {
    return this.classroomStore.connectionStore.rtcState === AGRtcState.Connected;
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

  @computed
  get localUserUuid() {
    const { localUser } = this.classroomStore.userStore;
    return localUser?.userUuid;
  }

  @computed
  get participant20Streams() {
    const users = this._getCurrentPageUsers(20, true);

    return this._getUserStreams(users);
  }

  @computed
  get participant8Streams() {
    const users = this._getCurrentPageUsers(8, true);

    return this._getUserStreams(users);
  }

  private _getCurrentPageUsers(size: number, includePinned = false) {
    const topMostList = [];

    const startIndex = this.pageIndex * size;

    const filterFn = includePinned
      ? () => true
      : (userUuid: string) => userUuid !== this.pinnedStream?.stream.fromUser.userUuid;

    const userList = this.userList.filter(filterFn);

    const needFill = userList.length > size && startIndex + size > userList.length;

    let slice = [];

    if (needFill) {
      slice = userList.slice(userList.length - size, userList.length);
    } else {
      slice = userList.slice(startIndex, startIndex + size);
    }

    topMostList.push(...slice);

    return topMostList;
  }

  private _getUserStreams(topMostList: string[]) {
    let list: StreamCellUI[] = [];

    topMostList.forEach((userUuid) => {
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
            canPlay: !this.shareUIStore.blackList.has(stream.fromUser.userUuid) && deviceStarted,
          });
        } else if (stream?.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
          const deviceStarted = stream.videoSourceState === AgoraRteMediaSourceState.started;
          list = list.filter(
            ({ stream: { fromUser } }) => fromUser.userUuid !== stream.fromUser.userUuid,
          );
          list.push({
            stream: new EduStreamUI(stream),
            canPlay: !this.shareUIStore.blackList.has(stream.fromUser.userUuid) && deviceStarted,
          });
        }
      });
    });

    return list;
  }

  @action.bound
  private _handleUserAdded(users: AgoraUser[]) {
    users.forEach(({ userUuid }) => {
      if (this.orderedUserList.includes(userUuid)) {
        return;
      }
      if (userUuid === this.localUserUuid) {
        this.orderedUserList.unshift(userUuid);
      } else {
        this.orderedUserList.push(userUuid);
      }
    });
  }

  @action.bound
  private _handleUserRemoved(users: AgoraUser[]) {
    const uuids = users.map(({ userUuid }) => userUuid);

    this.orderedUserList = this.orderedUserList.filter((userUuid) => {
      return !uuids.includes(userUuid);
    });
  }

  @action.bound
  prevPage() {
    if (this.pageIndex === 0) {
      return;
    }
    this.pageIndex -= 1;
    this.logger.info('set page index to', this.pageIndex);
  }

  @action.bound
  nextPage() {
    if (this.pageIndex + 1 === this.totalPage) {
      return;
    }
    this.pageIndex += 1;
    this.logger.info('set page index to', this.pageIndex);
  }

  @action.bound
  toggleUserBlackList(user: AgoraFromUser) {
    this.shareUIStore.toggleUserBlackList(user);
  }

  @action.bound
  togglePinUser(user: AgoraFromUser) {
    this.shareUIStore.togglePinUser(user);
  }

  @action.bound
  toggleViewMode() {
    this.shareUIStore.toggleViewMode();
    this.pageIndex = 0;
  }

  onInstall(): void {
    super.onInstall();
    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.scene,
        (scene) => {
          if (scene) {
            scene.addListener(AgoraRteEventType.UserAdded, this._handleUserAdded);
            scene.addListener(AgoraRteEventType.UserRemoved, this._handleUserRemoved);
            this.classroomStore.streamStore.unpublishScreenShare();
          }
        },
      ),
    );

    this._disposers.push(
      reaction(
        () => this.totalPage,
        (totalPage) => {
          if (this.pageIndex + 1 > totalPage) {
            this.pageIndex = totalPage === 0 ? 0 : totalPage - 1;
          }
        },
      ),
    );
    let subStreams: EduStream[] = [];
    this._disposers.push(
      reaction(
        () => ({
          viewMode: this.shareUIStore.viewMode,
          streams: this.participant8Streams,
        }),
        async ({ streams }) => {
          if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
            return;
          }
          if (this.shareUIStore.viewMode === 'surrounded') {
            this.logger.info('mass unsub', subStreams);
            const mute: EduStream[] = [];
            const unmute: EduStream[] = [];

            streams.forEach(({ stream }) => {
              // 如果上次订阅存在
              const some = subStreams.some(({ streamUuid }) => {
                // return streamUuid === stream.stream.streamUuid;
                return false;
              });
              if (!some) {
                unmute.push(stream.stream);
              }
            });
            subStreams.forEach((s) => {
              const { streamUuid } = s;
              // 如果本次订阅不存在
              const some = streams.some(({ stream }) => {
                // return streamUuid === stream.stream.streamUuid;
                return false;
              });
              if (!some && this.pinnedStream?.stream.stream.streamUuid !== s.streamUuid) {
                mute.push(s);
              }
            });

            await this.classroomStore.streamStore.muteRemoteVideoStreamMass(mute, true);
            const sub = unmute.filter((s) => s.fromUser.userUuid !== this.localUserUuid);
            if (this.pinnedStream) {
              const hasPinned = sub.some(
                ({ streamUuid }) => streamUuid === this.pinnedStream?.stream.stream.streamUuid,
              );
              if (!hasPinned) {
                sub.push(this.pinnedStream.stream.stream);
              }
            }
            subStreams = sub;
            this.logger.info('mass sub', sub);
            await this.classroomStore.streamStore.muteRemoteVideoStreamMass(sub, false);
          }
        },
      ),
    );

    this._disposers.push(
      reaction(
        () => ({
          viewMode: this.shareUIStore.viewMode,
          streams: this.participant20Streams,
        }),
        async ({ streams }) => {
          if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
            return;
          }
          if (this.shareUIStore.viewMode === 'divided') {
            this.logger.info('mass unsub', subStreams);
            const mute: EduStream[] = [];
            const unmute: EduStream[] = [];

            streams.forEach(({ stream }) => {
              // 如果上次订阅存在
              const some = subStreams.some(({ streamUuid }) => {
                // return streamUuid === stream.stream.streamUuid;
                return false;
              });
              if (!some) {
                unmute.push(stream.stream);
              }
            });
            subStreams.forEach((s) => {
              const { streamUuid } = s;
              // 如果本次订阅不存在
              const some = streams.some(({ stream }) => {
                // return streamUuid === stream.stream.streamUuid;
                return false;
              });
              if (!some && this.pinnedStream?.stream.stream.streamUuid !== s.streamUuid) {
                mute.push(s);
              }
            });

            await this.classroomStore.streamStore.muteRemoteVideoStreamMass(mute, true);
            const sub = unmute.filter((s) => s.fromUser.userUuid !== this.localUserUuid);
            if (this.pinnedStream) {
              const hasPinned = sub.some(
                ({ streamUuid }) => streamUuid === this.pinnedStream?.stream.stream.streamUuid,
              );
              if (!hasPinned) {
                sub.push(this.pinnedStream.stream.stream);
              }
            }
            subStreams = sub;
            this.logger.info('mass sub', sub);
            await this.classroomStore.streamStore.muteRemoteVideoStreamMass(sub, false);
          }
        },
      ),
    );

    let pinned: EduStream | undefined = undefined;
    this._disposers.push(
      reaction(
        () => this.pinnedStream,
        async () => {
          if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
            return;
          }
          const sr: EduStream[] = [];
          if (pinned) {
            sr.push(pinned);
          }
          if (this.pinnedStream) {
            const s = this.pinnedStream.stream.stream;
            sr.push(s);
            pinned = s;
          }
          await new Promise((r) => setTimeout(r, 0));
          await this.classroomStore.streamStore.muteRemoteVideoStreamMass(sr, false);
        },
      ),
    );
  }
}
