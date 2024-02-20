import {
  Log,
  AgoraStream,
  AgoraRteVideoSourceType,
  AGRtcConnectionType,
  AgoraRteMediaPublishState,
  AgoraRteAudioSourceType,
} from 'agora-rte-sdk';
import { SceneSubscription } from './abstract';

@Log.attach({ proxyMethods: false })
export class MainRoomSubscription extends SceneSubscription {
  protected handleLocalStreamAdded(streams: AgoraStream[]) {
    const scene = this.scene;
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleLocalStreamAdded [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((stream) => {
      this.muteLocalStream(scene, stream);
    });
  }

  protected handleLocalStreamUpdated(streams: AgoraStream[]) {
    const scene = this.scene;
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleLocalStreamChanged [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((stream) => {
      this.muteLocalStream(scene, stream);
    });
  }

  protected handleLocalStreamRemoved(streams: AgoraStream[]) {
    const scene = this.scene;
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleLocalStreamRemoved [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((stream) => {
      const connType = this.getStreamConnType(stream);
      // close local devices if local no longer publishes
      switch (stream.videoSourceType) {
        case AgoraRteVideoSourceType.Camera:
          this.logger.info(
            `muteLocalVideo, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${
              stream.fromUser.userName
            }], mute=[${true}]`,
          );
          this._rtcChannel.muteLocalVideoStream(true, connType);
          this._mediaControl.createCameraVideoTrack().stop();
          break;
        case AgoraRteVideoSourceType.ScreenShare:
          this.logger.info(
            `muteLocalScreen, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${
              stream.fromUser.userName
            }], mute=[${true}]`,
          );
          this._rtcChannel.muteLocalScreenStream(true, connType);
          this._mediaControl.createScreenShareTrack().stop();
          break;
      }

      if (stream.audioSourceType === AgoraRteAudioSourceType.Mic) {
        this.logger.info(
          `muteLocalAudio, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${
            stream.fromUser.userName
          }], mute=[${true}]`,
        );
        scene.rtcChannel.muteLocalAudioStream(true, connType);
        if (connType === AGRtcConnectionType.main) {
          this._mediaControl.createMicrophoneAudioTrack().stop();
        }
      } else if (stream.audioSourceType === AgoraRteAudioSourceType.None) {
        // no action needed
      }
      this.removeRegistry(stream.streamUuid);
    });
  }

  protected handleRemoteStreamAdded(streams: AgoraStream[]) {
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleRemoteStreamsAdded [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    // remote stream added, try subscribing
    this.muteRemoteStreams(this.scene, streams);
  }

  protected handleRemoteStreamUpdated(streams: AgoraStream[]) {
    if (streams.length === 0) {
      return;
    }

    if (!this.active) {
      return;
    }

    this.logger.info(`_handleRemoteStreamsChanged [${streams.join(',')}]`);

    // remote stream added, try subscribing
    this.muteRemoteStreams(this.scene, streams);
  }

  protected handleRemoteStreamRemoved(streams: AgoraStream[]) {
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleRemoteStreamsRemoved [${streams.join(',')}]`);

    // remote stream removed, try mute
    streams.forEach((stream) => {
      this.muteRemoteStream(this.scene, stream, { muteVideo: true, muteAudio: true });
      this.removeRegistry(stream.streamUuid);
    });
  }

  get active() {
    if (!this._active) {
      this.logger.info(`Scene with id: ${this.scene.sceneId} is inactive, do not operate stream`);
    }
    return this._active;
  }

  setActive(active: boolean): void {
    this._active = active;
    if (active) {
      this.subscribe();
    } else {
      this.unsubscribeAll();
    }
  }

  protected unsubscribeAll() {
    const scene = this.scene;
    scene.dataStore.streams.forEach((stream) => {
      this.logger.info(
        `muteRemoteVideo, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${
          stream.fromUser.userName
        }], mute=[${true}]`,
      );
      scene.rtcChannel.muteRemoteVideoStream(stream.streamUuid, true);
      this.putRegistry(stream.streamUuid, { muteVideo: true });

      this.logger.info(
        `muteRemoteAudio, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${
          stream.fromUser.userName
        }], mute=[${true}]`,
      );
      scene.rtcChannel.muteRemoteAudioStream(stream.streamUuid, true);
      this.putRegistry(stream.streamUuid, { muteAudio: true });
    });
  }

  protected subscribe() {
    const scene = this.scene;
    scene.dataStore.streams.forEach((stream) => {
      if (stream.videoState === AgoraRteMediaPublishState.Published) {
        this.logger.info(
          `muteRemoteVideo, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${
            stream.fromUser.userName
          }], mute=[${false}]`,
        );
        scene.rtcChannel.muteRemoteVideoStream(stream.streamUuid, false);
        this.putRegistry(stream.streamUuid, { muteVideo: false });
      }

      if (stream.audioState === AgoraRteMediaPublishState.Published) {
        this.logger.info(
          `muteRemoteAudio, stream=[${stream.streamUuid}], user=[${stream.fromUser.userUuid},${
            stream.fromUser.userName
          }], mute=[${false}]`,
        );
        scene.rtcChannel.muteRemoteAudioStream(stream.streamUuid, false);
        this.putRegistry(stream.streamUuid, { muteAudio: false });
      }
    });
  }
}
