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
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleLocalStreamAdded [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((stream) => {
      const type =
        stream.streamName === 'secondary' ||
        stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      this.muteLocalVideoStream(scene, {
        mute: stream.videoState !== AgoraRteMediaPublishState.Published,
        connectionType: type,
        sourceType: stream.videoSourceType,
      });

      if (stream.videoSourceType !== AgoraRteVideoSourceType.ScreenShare) {
        switch (stream.audioState) {
          case AgoraRteMediaPublishState.Published:
            scene.rtcChannel.muteLocalAudioStream(false);
            break;
          case AgoraRteMediaPublishState.Unpublished:
            scene.rtcChannel.muteLocalAudioStream(true);
            break;
        }
      }
    });
  }

  protected handleLocalStreamUpdated(streams: AgoraStream[]) {
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleLocalStreamChanged [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((stream) => {
      const type =
        stream.streamName === 'secondary' ||
        stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      this.muteLocalVideoStream(scene, {
        mute: stream.videoState !== AgoraRteMediaPublishState.Published,
        connectionType: type,
        sourceType: stream.videoSourceType,
      });

      switch (stream.audioState) {
        case AgoraRteMediaPublishState.Published:
          scene.rtcChannel.muteLocalAudioStream(false);
          break;
        case AgoraRteMediaPublishState.Unpublished:
          scene.rtcChannel.muteLocalAudioStream(true);
          break;
      }
    });
  }

  protected handleLocalStreamRemoved(streams: AgoraStream[]) {
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleLocalStreamRemoved [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((stream) => {
      const type =
        stream.streamName === 'secondary' ||
        stream.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      this.muteLocalVideoStream(scene, {
        mute: true,
        connectionType: type,
        sourceType: stream.videoSourceType,
      });

      switch (stream.videoSourceType) {
        case AgoraRteVideoSourceType.Camera:
          this._mediaControl.createCameraVideoTrack().stop();
          break;
        case AgoraRteVideoSourceType.ScreenShare:
          this._mediaControl.createScreenShareTrack().stop();
          break;
      }

      if (stream.audioSourceType === AgoraRteAudioSourceType.Mic) {
        scene.rtcChannel.muteLocalAudioStream(true, type);
        type === AGRtcConnectionType.main && this._mediaControl.createMicrophoneAudioTrack().stop();
      } else if (stream.audioSourceType === AgoraRteAudioSourceType.None) {
        // no action needed
      }
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
    this.muteRemoteStreams(this._scene, streams, (_, stream, status) => {
      const dontSubStream = stream.playUrl && this.isCDNMode;
      if (dontSubStream) {
        return { video: true, audio: true };
      }
      return status;
    });
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
    this.muteRemoteStreams(this._scene, streams, (_, stream, status) => {
      const dontSubStream = stream.playUrl && this.isCDNMode;
      if (dontSubStream) {
        return { video: true, audio: true };
      }
      return status;
    });
  }

  protected handleRemoteStreamRemoved(streams: AgoraStream[]) {
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleRemoteStreamsRemoved [${streams.join(',')}]`);

    // remote stream removed, try mute
    streams.forEach((stream) => {
      this.muteRemoteStream(this._scene, stream, { video: true, audio: true });
    });
  }

  get active() {
    if (!this._active) {
      this.logger.info(`Scene with id: ${this._scene.sceneId} is inactive, do not operate stream`);
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
    const scene = this._scene;
    scene.dataStore.streams.forEach((stream) => {
      if (stream.videoState) {
        scene.rtcChannel.muteRemoteVideoStream(stream.streamUuid, true);
      }

      if (stream.audioState) {
        scene.rtcChannel.muteRemoteAudioStream(stream.streamUuid, true);
      }
    });
  }

  protected subscribe() {
    const scene = this._scene;
    scene.dataStore.streams.forEach((stream) => {
      if (stream.videoState === AgoraRteMediaPublishState.Published) {
        scene.rtcChannel.muteRemoteVideoStream(stream.streamUuid, false);
      }

      if (stream.audioState === AgoraRteMediaPublishState.Published) {
        scene.rtcChannel.muteRemoteAudioStream(stream.streamUuid, false);
      }
    });
  }
}
