import {
  AgoraMediaControl,
  AgoraRteAudioSourceType,
  AgoraRteEventType,
  AgoraRteMediaPublishState,
  AgoraRteOperator,
  AgoraRteScene,
  AgoraRteVideoSourceType,
  AgoraStream,
  AgoraUser,
  AGRtcConnectionType,
  Injectable,
  Log,
} from 'agora-rte-sdk';
import { AGRtcChannel } from 'agora-rte-sdk/lib/core/rtc/channel';

export abstract class SceneSubscription {
  protected logger!: Injectable.Logger;

  protected _active = false;
  protected _isCdnMode = false;

  protected _rtcChannel: AGRtcChannel;
  protected _mediaControl: AgoraMediaControl;

  get active() {
    return this._active;
  }

  get isCDNMode() {
    return this._isCdnMode;
  }

  constructor(protected _scene: AgoraRteScene) {
    const scene = _scene;
    this._rtcChannel = _scene.rtcChannel;
    this._mediaControl = _scene.engine.getAgoraMediaControl();
    this._active = true;

    scene.on(AgoraRteEventType.UserAdded, (users: AgoraUser[]) => {
      this.logger.info(`user-added [${users.join(',')}]`);
    });

    scene.on(AgoraRteEventType.UserUpdated, (user: AgoraUser) => {
      this.logger.info(`user-updated ${user}`);
    });

    scene.on(AgoraRteEventType.UserRemoved, (users: AgoraUser[], type?: number) => {
      this.logger.info(`user-removed [${users.join(',')}]`);
      this._handleUserRemoved(users, scene, type);
    });

    scene.on(
      AgoraRteEventType.LocalStreamAdded,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-added [${streams.join(',')}]`);
        this.handleLocalStreamAdded(streams);
      },
    );

    scene.on(
      AgoraRteEventType.LocalStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-upsert [${streams.join(',')}]`);
        this.handleLocalStreamUpdated(streams);
      },
    );

    scene.on(
      AgoraRteEventType.LocalStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-removed [${streams.join(',')}]`);
        this.handleLocalStreamRemoved(streams);
      },
    );

    scene.on(
      AgoraRteEventType.RemoteStreamAdded,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-added [${streams.join(',')}]`);
        this.handleRemoteStreamAdded(streams);
      },
    );

    scene.on(
      AgoraRteEventType.RemoteStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-upsert [${streams.join(',')}]`);
        this.handleRemoteStreamUpdated(streams);
      },
    );

    scene.on(
      AgoraRteEventType.RemoteStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-removed [${streams.join(',')}]`);
        this.handleRemoteStreamRemoved(streams);
      },
    );
  }

  abstract handleLocalStreamAdded(streams: AgoraStream[]): void;
  abstract handleLocalStreamUpdated(streams: AgoraStream[]): void;
  abstract handleLocalStreamRemoved(streams: AgoraStream[]): void;
  abstract handleRemoteStreamAdded(streams: AgoraStream[]): void;
  abstract handleRemoteStreamUpdated(streams: AgoraStream[]): void;
  abstract handleRemoteStreamRemoved(streams: AgoraStream[]): void;

  private _handleUserRemoved(users: AgoraUser[], scene: AgoraRteScene, type?: number) {
    let removedLocalStreams: AgoraStream[] = [];
    let removedRemoteStreams: AgoraStream[] = [];

    users.forEach((u) => {
      if (scene.localUser?.userUuid === u.userUuid) {
        // local user added
        const streams = scene.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          removedLocalStreams = removedLocalStreams.concat(streams);
        }
      } else {
        // remote user added
        const streams = scene.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          removedRemoteStreams = removedRemoteStreams.concat(streams);
        }
      }
    });

    this.handleLocalStreamRemoved(removedLocalStreams);
    this.handleRemoteStreamRemoved(removedRemoteStreams);
  }

  setActive(active: boolean) {
    this._active = active;
  }

  setCDNMode(cdnMode: boolean) {
    this._isCdnMode = cdnMode;
  }
}

@Log.attach({ proxyMethods: false })
export class MainRoomSubscription extends SceneSubscription {
  handleLocalStreamAdded(streams: AgoraStream[]) {
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleLocalStreamAdded [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((s) => {
      const type =
        s.streamName === 'secondary' || s.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published: {
          if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
            scene.rtcChannel.muteLocalVideoStream(false, type);
          } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
            scene.rtcChannel.muteLocalScreenStream(false, type);
          }
          break;
        }
        case AgoraRteMediaPublishState.Unpublished: {
          if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
            scene.rtcChannel.muteLocalVideoStream(true, type);
          } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
            scene.rtcChannel.muteLocalScreenStream(true, type);
          }
          break;
        }
      }
      if (s.videoSourceType !== AgoraRteVideoSourceType.ScreenShare) {
        switch (s.audioState) {
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

  handleLocalStreamUpdated(streams: AgoraStream[]) {
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleLocalStreamChanged [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((s) => {
      const type =
        s.streamName === 'secondary' || s.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published: {
          if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
            scene.rtcChannel.muteLocalVideoStream(false, type);
          } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
            scene.rtcChannel.muteLocalScreenStream(false, type);
          }
          break;
        }
        case AgoraRteMediaPublishState.Unpublished: {
          if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
            scene.rtcChannel.muteLocalVideoStream(true, type);
          } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
            scene.rtcChannel.muteLocalScreenStream(true, type);
          }
          break;
        }
      }

      switch (s.audioState) {
        case AgoraRteMediaPublishState.Published:
          scene.rtcChannel.muteLocalAudioStream(false);
          break;
        case AgoraRteMediaPublishState.Unpublished:
          scene.rtcChannel.muteLocalAudioStream(true);
          break;
      }
    });
  }

  handleLocalStreamRemoved(streams: AgoraStream[]) {
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleLocalStreamRemoved [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    streams.forEach((s) => {
      const type =
        s.streamName === 'secondary' || s.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
        scene.rtcChannel.muteLocalVideoStream(true, type);
        this._mediaControl.createCameraVideoTrack().stop();
      } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
        scene.rtcChannel.muteLocalScreenStream(true, type);
        this._mediaControl.createScreenShareTrack().stop();
      } else if (s.videoSourceType === AgoraRteVideoSourceType.None) {
        // no action needed
      }

      if (s.audioSourceType === AgoraRteAudioSourceType.Mic) {
        scene.rtcChannel.muteLocalAudioStream(true, type);
        type === AGRtcConnectionType.main && this._mediaControl.createMicrophoneAudioTrack().stop();
      } else if (s.audioSourceType === AgoraRteAudioSourceType.None) {
        // no action needed
      }
    });
  }

  handleRemoteStreamAdded(streams: AgoraStream[]) {
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleRemoteStreamsAdded [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    // remote stream added, try subscribing
    streams.forEach((s) => {
      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published:
          scene.rtcChannel.muteRemoteVideoStream(
            s.streamUuid,
            s.playUrl && this.isCDNMode ? true : false,
          );
          break;
        case AgoraRteMediaPublishState.Unpublished:
          scene.rtcChannel.muteRemoteVideoStream(s.streamUuid, true);
          break;
      }

      switch (s.audioState) {
        case AgoraRteMediaPublishState.Published:
          scene.rtcChannel.muteRemoteAudioStream(
            s.streamUuid,
            s.playUrl && this.isCDNMode ? true : false,
          );
          break;
        case AgoraRteMediaPublishState.Unpublished:
          scene.rtcChannel.muteRemoteAudioStream(s.streamUuid, true);
          break;
      }
    });
  }

  handleRemoteStreamUpdated(streams: AgoraStream[]) {
    const scene = this._scene;
    this.logger.info(`_handleRemoteStreamsChanged [${streams.join(',')}]`);

    if (!this.active) {
      return;
    }

    // remote stream added, try subscribing
    streams.forEach((s) => {
      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published:
          scene.rtcChannel.muteRemoteVideoStream(
            s.streamUuid,
            s.playUrl && this.isCDNMode ? true : false,
          );
          break;
        case AgoraRteMediaPublishState.Unpublished:
          scene.rtcChannel.muteRemoteVideoStream(s.streamUuid, true);
          break;
      }

      switch (s.audioState) {
        case AgoraRteMediaPublishState.Published:
          scene.rtcChannel.muteRemoteAudioStream(
            s.streamUuid,
            s.playUrl && this.isCDNMode ? true : false,
          );
          break;
        case AgoraRteMediaPublishState.Unpublished:
          scene.rtcChannel.muteRemoteAudioStream(s.streamUuid, true);
          break;
      }
    });
  }

  handleRemoteStreamRemoved(streams: AgoraStream[]) {
    const scene = this._scene;
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleRemoteStreamsRemoved [${streams.join(',')}]`);

    // remote stream added, try subscribing
    streams.forEach((s) => {
      scene.rtcChannel.muteRemoteVideoStream(s.streamUuid, true);
      scene.rtcChannel.muteRemoteAudioStream(s.streamUuid, true);
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

  unsubscribeAll() {
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

  subscribe() {
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

export class SubscriptionFactory {
  static createSubscription(scene: AgoraRteScene) {
    return new MainRoomSubscription(scene);
  }
}
