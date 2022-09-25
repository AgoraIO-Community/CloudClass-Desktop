import {
  AgoraRteEventType,
  AgoraRteMediaSourceState,
  AgoraRteVideoSourceType,
  AgoraUser,
  Log,
} from 'agora-rte-sdk';
import { action, computed, observable, reaction } from 'mobx';
import { StreamUIStore } from '../common/stream';
import { EduStreamUI } from '../common/stream/struct';

@Log.attach({ proxyMethods: false })
export class StudyRoomStreamUIStore extends StreamUIStore {
  @observable
  orderedUserList: string[] = [];

  @computed
  get localStream() {
    const { localUser } = this.classroomStore.userStore;

    if (localUser) {
      const { localCameraStreamUuid, localShareStreamUuid } = this.classroomStore.streamStore;
      const localCameraStream = this.classroomStore.streamStore.streamByStreamUuid.get(
        localCameraStreamUuid!,
      );
      const localScreenStream = this.classroomStore.streamStore.streamByStreamUuid.get(
        localShareStreamUuid!,
      );
      if (localCameraStream) {
        return localCameraStream;
      }
      if (localScreenStream) {
        return localScreenStream;
      }
    }
  }

  @computed
  get participantStreams() {
    const list: EduStreamUI[] = [];
    const topMostList = this.orderedUserList.slice(0, 19);

    const { localUser } = this.classroomStore.userStore;

    const localUserUuid = localUser?.userUuid;

    if (localUserUuid) {
      topMostList.unshift(localUserUuid);
    }

    topMostList.forEach((userUuid) => {
      const streamUuids = this.classroomStore.streamStore.streamByUserUuid.get(userUuid);
      streamUuids?.forEach((uuid) => {
        const stream = this.classroomStore.streamStore.streamByStreamUuid.get(uuid);
        if (
          stream?.videoSourceType === AgoraRteVideoSourceType.Camera &&
          stream.videoSourceState === AgoraRteMediaSourceState.started
        ) {
          list.push(new EduStreamUI(stream));
        } else if (
          stream?.videoSourceType === AgoraRteVideoSourceType.ScreenShare &&
          stream.videoSourceState === AgoraRteMediaSourceState.started
        ) {
          list.push(new EduStreamUI(stream));
        }
      });
    });

    return list;
  }

  @action.bound
  private _handleUserAdded(users: AgoraUser[]) {
    const newUsers = users
      .filter(({ userUuid }) => userUuid !== this.classroomStore.userStore.localUser?.userUuid)
      .map(({ userUuid }) => userUuid);
    this.orderedUserList.push(...newUsers);
  }

  @action.bound
  private _handleUserRemoved(users: AgoraUser[]) {
    const uuids = users.map(({ userUuid }) => userUuid);
    this.orderedUserList = this.orderedUserList.filter((userUuid) => {
      return !uuids.includes(userUuid);
    });
  }

  onInstall(): void {
    super.onInstall();
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          scene.addListener(AgoraRteEventType.UserAdded, this._handleUserAdded);
          scene.addListener(AgoraRteEventType.UserRemoved, this._handleUserRemoved);
        }
      },
    );
  }
}
