import { EduClassroomConfig, EduRoomTypeEnum } from "agora-edu-core";
import { AgoraRteMediaSourceState, AgoraRteScene, AgoraRteVideoSourceType, AgoraStream, AGRtcConnectionType, Log } from "agora-rte-sdk";
import { SceneSubscription } from "./abstract";
import { MainRoomSubscription } from "./main-room";

@Log.attach({ proxyMethods: false })
export class StudyRoomSubscription extends SceneSubscription {
  private _streamUuids: string[] = [];
  handleLocalStreamAdded(streams: AgoraStream[]): void {
    this.handleLocalStreamUpdated(streams);
  }
  handleLocalStreamUpdated(streams: AgoraStream[]): void {
    streams.forEach((stream) => {
      const type =
        stream.streamName === 'secondary' ||
        stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;
      if (stream.videoSourceType === AgoraRteVideoSourceType.Camera) {
        if (stream.videoSourceState === AgoraRteMediaSourceState.started) {
          this._scene.rtcChannel.muteLocalVideoStream(false, type);
        }
        if (stream.videoSourceState === AgoraRteMediaSourceState.stopped) {
          this._scene.rtcChannel.muteLocalVideoStream(true, type);
        }
      } else if (stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
        if (stream.videoSourceState === AgoraRteMediaSourceState.started) {
          this._scene.rtcChannel.muteLocalScreenStream(false, type);
        }
        if (stream.videoSourceState === AgoraRteMediaSourceState.stopped) {
          this._scene.rtcChannel.muteLocalScreenStream(true, type);
        }
      }
    });
    streams.forEach((stream) => {
      if (!this._streamUuids.includes(stream.streamUuid)) {
        this._streamUuids.push(stream.streamUuid);
      }
    });
  }
  handleLocalStreamRemoved(streams: AgoraStream[]): void {
    this._streamUuids = this._streamUuids.filter(
      (uuid) => !streams.some(({ streamUuid }) => streamUuid === uuid),
    );
  }
  handleRemoteStreamAdded(streams: AgoraStream[]): void {
    this.handleRemoteStreamUpdated(streams);
  }
  handleRemoteStreamUpdated(streams: AgoraStream[]): void {
    // streams.forEach((stream) => {
    //   // the stream not in _streamUuids means it's a new stream
    //   if (!this._streamUuids.includes(stream.streamUuid)) {
    //     // mute the stream by default when a new stream comming
    //     this._scene.rtcChannel.muteRemoteVideoStream(stream.streamUuid, true);
    //   }
    // });
    // streams.forEach((stream) => {
    //   if (!this._streamUuids.includes(stream.streamUuid)) {
    //     this._streamUuids.push(stream.streamUuid);
    //   }
    // });
  }
  handleRemoteStreamRemoved(streams: AgoraStream[]): void {
    this._streamUuids = this._streamUuids.filter(
      (uuid) => !streams.some(({ streamUuid }) => streamUuid === uuid),
    );
  }
}

export class SubscriptionFactory {
  static createSubscription(scene: AgoraRteScene) {
    if (EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomStudy) {
      return new StudyRoomSubscription(scene);
    }
    return new MainRoomSubscription(scene);
  }
}