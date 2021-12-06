import { AgoraRteSynchronizer } from '../core/processor/channel-msg/synchronizer';
import {
  AgoraChatMessage,
  AgoraRteOperator,
  AgoraRteSyncSnapshotData,
  AgoraStream,
  AgoraUser,
} from '../core/processor/channel-msg/struct';
import { AgoraRtmConnectionState, AGRtmManager } from '../core/rtm';
import { AgoraRteLocalUser } from '../user';
import {
  AgoraRteChannelMessageHandle,
  AgoraRteEventType,
} from '../core/processor/channel-msg/handler';
import { Logger } from '../core/logger';
import { jsonstring } from '../core/utils/utils';
import { RtmChannel } from 'agora-rtm-sdk';
import { EventEmitter } from 'events';
import { AGRtcManager } from '../core/rtc';
import { AGRtcChannel, AGRtcConnectionType } from '../core/rtc/channel';
import {
  AgoraRteAudioSourceType,
  AgoraRteMediaPublishState,
  AgoraRteVideoSourceType,
} from '../core/media/track';
import { AgoraRteSyncDataStore } from '../core/processor/channel-msg/data';
import { AGRteErrorCode, RteErrorCenter } from '../core/utils/error';
import { NetworkStats, RtcState } from '../core/rtc/type';
import to from 'await-to-js';
import { Injectable } from '../core/decorator/type';
import { AgoraRteEngine } from '../core/engine';
import { AgoraRteEngineConfig } from '../configs';
import { Log } from '../core/decorator/log';
import { AgoraRteConnectionState, ClientRole } from '../type';
export interface AgoraRteSceneJoinOptions {
  userName: string;
  userRole: string;
  streamId: string;
}

export interface AgoraRteSceneJoinRTCOptions {
  connectionType: AGRtcConnectionType;
  streamUuid: string;
  token: string;
}

export interface SceneObjects {
  rtc: AGRtcManager;
  rtcChannel: AGRtcChannel;
  rtm: AGRtmManager;
  rtmChannel: RtmChannel;
  rtmChannelObserver: EventEmitter;
}

@Log.attach({ proxyMethods: false })
export class AgoraRteScene extends EventEmitter {
  protected logger!: Injectable.Logger;
  readonly sceneId: string;
  private _localUser?: AgoraRteLocalUser;
  private _sceneState: AgoraRteConnectionState = AgoraRteConnectionState.Idle;
  private _initialSync: boolean = false;
  get localUser() {
    return this._localUser;
  }

  readonly dataStore: AgoraRteSyncDataStore;
  private _rtmManager: AGRtmManager;
  private _rtcManager: AGRtcManager;
  private _rtmChannel: RtmChannel;
  private _rtcChannel: AGRtcChannel;

  private _rtmChannelObserver: EventEmitter;
  private _synchronizer?: AgoraRteSynchronizer;

  constructor(sceneId: string, options: SceneObjects) {
    super();
    this.sceneId = sceneId;
    this._rtmManager = options.rtm;
    this._rtcManager = options.rtc;
    this._rtmChannel = options.rtmChannel;
    this._rtmChannelObserver = options.rtmChannelObserver;
    this._rtcChannel = options.rtcChannel;
    this.dataStore = new AgoraRteSyncDataStore();

    //add one-time event listeners to avoid repeat event registeration
    let channel = this._rtcChannel;
    let rtmManager = this._rtmManager;
    channel.onNetworkStats((stats: NetworkStats) => {
      this.emit(AgoraRteEventType.NetworkStats, stats);
    });

    channel.onAudioVolumeIndication((volumes: Map<string, number>) => {
      this.emit(AgoraRteEventType.AudioVolumes, volumes);
    });

    channel.onConnectionStageChanged((state: RtcState, connectionType: AGRtcConnectionType) => {
      this.emit(AgoraRteEventType.RtcConnectionStateChanged, state, connectionType);
    });

    rtmManager.on(AgoraRteEventType.RtmConnectionStateChanged, (state: { reason: string }) => {
      this._recalculateRteState(state.reason);
    });
  }

  async joinScene(options: AgoraRteSceneJoinOptions) {
    if (this._sceneState !== AgoraRteConnectionState.Idle) {
      Logger.warn(`scene not idle`);
      return;
    }

    try {
      // 1. entry
      this._setRteConnectionState(AgoraRteConnectionState.Connecting);
      const { user, room } = await AgoraRteEngine.engine.getApiService().entryRoom({
        userUuid: AgoraRteEngineConfig.shared.userId,
        roomUuid: this.sceneId,
        userName: options.userName,
        streamUuid: options.streamId,
        role: options.userRole,
      });

      Object.assign(AgoraRteEngineConfig.shared.service.headers, { token: user.userToken });

      // 2. rtm join
      await this._rtmManager.join(this._rtmChannel, this._rtmChannelObserver, this.sceneId);

      // 3. initialize object models
      const { streamUuid, userName, userRole, rtcToken, streams = [] } = user;
      this._localUser = new AgoraRteLocalUser(this, {
        userUuid: AgoraRteEngineConfig.shared.userId,
        userName,
        userRole,
        streamUuid,
        sceneId: this.sceneId,
        rtcToken,
        rtc: this._rtcManager,
      });

      // if local user has 2 streams, update sub stream info to local user
      if (streams.length === 2) {
        let stream = streams.find((stream: { streamUuid: string; rtcToken: string }) => {
          return stream.streamUuid !== streamUuid;
        });
        this._localUser.subStream = stream;
      }

      this._synchronizer = new AgoraRteSynchronizer(this.dataStore, {
        sceneId: this.sceneId,
        userUuid: AgoraRteEngineConfig.shared.userId,
        streamUuid,
        channelObserver: this._rtmChannelObserver,
        rtm: this._rtmManager,
      });
      this._addEventListeners(this._synchronizer.handle);

      // 4. sync/get snapshot
      const snapshotData = await AgoraRteEngine.engine.getApiService().syncSnapShot(this.sceneId);
      this._synchronizer.syncSnapshot(AgoraRteSyncSnapshotData.fromData(snapshotData));
    } catch (e) {
      // cleanup
      this._cleanup();
      return RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_JOIN_SCENE_FAILED,
        e as Error,
      );
    }
  }

  async leaveScene() {
    let [err] = await to(this._rtmManager.leave(this.sceneId));
    err &&
      RteErrorCenter.shared.handleNonThrowableError(AGRteErrorCode.RTE_ERR_LEAVE_SCENE_FAIL, err);
    this._cleanup();
  }

  async joinRTC(options?: AgoraRteSceneJoinRTCOptions) {
    if (!this._initialSync || !this.localUser) {
      return RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_SCENE_NOT_READY,
        new Error(`try to join rtc before scene is ready`),
      );
    }

    if (options) {
      return await this._rtcChannel.join(options.token, options.streamUuid, options.connectionType);
    } else {
      return await this._rtcChannel.join(this.localUser.rtcToken, this.localUser?.streamUuid);
    }
  }

  async leaveRTC(connectionType?: AGRtcConnectionType) {
    let [err] = await to(this._rtcChannel.leave(connectionType));
    err &&
      RteErrorCenter.shared.handleNonThrowableError(AGRteErrorCode.RTC_ERR_LEAVE_CHANNEL_FAIL, err);
  }

  private _cleanup() {
    this._localUser = undefined;
    this._synchronizer = undefined;
    this._initialSync = false;
  }

  private _setRteConnectionState(state: AgoraRteConnectionState, reason?: string) {
    let oldState = this._sceneState;
    this._sceneState = state;
    if (this._sceneState !== oldState) {
      this.emit(AgoraRteEventType.RteConnectionStateChanged, state, reason);
    }
  }

  private _setInitialSnapshotSync(done: boolean) {
    this._initialSync = done;
    this._recalculateRteState();
  }

  private _recalculateRteState(reason?: string) {
    let rtmState = this._rtmManager.connectionState,
      initialSync = this._initialSync;
    if (rtmState === AgoraRtmConnectionState.DISCONNECTED) {
      return this._setRteConnectionState(AgoraRteConnectionState.Idle);
    } else if (rtmState === AgoraRtmConnectionState.CONNECTING) {
      return this._setRteConnectionState(AgoraRteConnectionState.Connecting);
    } else if (rtmState === AgoraRtmConnectionState.CONNECTED) {
      if (initialSync) {
        //if snapshot also ready, treat as ready
        return this._setRteConnectionState(AgoraRteConnectionState.Connected);
      } else {
        //otherwise treat as connecting
        return this._setRteConnectionState(AgoraRteConnectionState.Connecting);
      }
    } else if (rtmState === AgoraRtmConnectionState.RECONNECTING) {
      if (initialSync) {
        //if snapshot also ready, treat as RECONNECTING
        return this._setRteConnectionState(AgoraRteConnectionState.Reconnecting);
      } else {
        //otherwise treat as connecting
        return this._setRteConnectionState(AgoraRteConnectionState.Connecting);
      }
    } else if (rtmState === AgoraRtmConnectionState.ABORTED) {
      return this._setRteConnectionState(AgoraRteConnectionState.Error, reason);
    }
    Logger.warn(`unhandled rte connection state: rtm: ${rtmState}, snapshot: ${initialSync}`);
  }

  private _addEventListeners(handler: AgoraRteChannelMessageHandle) {
    handler.on(AgoraRteEventType.SnapshotUpdated, () => {
      this.logger.info(`snapshot updated`);
      this._setInitialSnapshotSync(true);

      let localStreams = this._localStreams;
      if (localStreams.length === 0) {
        // if no stream, reset media state
        this._rtcManager.enableLocalVideo(false);
        this._rtcManager.enableLocalAudio(false);
      }

      const users = Array.from(this.dataStore.users.values());
      if (users.length > 0) {
        this._handleUserAdded(users);
      }

      this._handleRoomPropertyChange(
        Array.from(this.dataStore.roomProperties.keys()),
        this.dataStore.roomProperties,
        {},
        {},
      );
    });

    handler.on(AgoraRteEventType.ChatReceived, (message: AgoraChatMessage) => {
      this.emit(AgoraRteEventType.ChatReceived, message);
    });

    handler.on(AgoraRteEventType.UserAdded, (users: AgoraUser[]) => {
      this.logger.info(`user-added [${users.join(',')}]`);
      this._handleUserAdded(users);
    });

    handler.on(AgoraRteEventType.UserUpdated, (user: AgoraUser) => {
      this.logger.info(`user-updated ${user}`);
    });

    handler.on(AgoraRteEventType.UserRemoved, (users: AgoraUser[], type?: number) => {
      this.logger.info(`user-removed [${users.join(',')}]`);
      this._handleUserRemoved(users, type);
    });

    handler.on(
      AgoraRteEventType.RoomPropertyUpdated,
      (
        changedKeys: string[],
        roomProperties: Immutable.Map<string, unknown>,
        operator: any,
        cause: any,
      ) => {
        this.logger.debug(
          `room-property-updated ${jsonstring(roomProperties)} ${jsonstring(operator)} ${jsonstring(
            cause,
          )}`,
        );
        this._handleRoomPropertyChange(changedKeys, roomProperties, operator, cause);
      },
    );

    handler.on(
      AgoraRteEventType.UserPropertyUpdated,
      (userUuid: string, userProperties: any, operator: any, cause: any) => {
        this.logger.debug(
          `user-property-updated ${userUuid} ${jsonstring(userProperties)} ${jsonstring(
            operator,
          )} ${jsonstring(cause)}`,
        );
        this.emit(AgoraRteEventType.UserPropertyUpdated, userUuid, userProperties, operator, cause);
      },
    );

    handler.on(
      AgoraRteEventType.LocalStreamAdded,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-added [${streams.join(',')}]`);
        this._handleLocalStreamAdded(streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.LocalStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-upsert [${streams.join(',')}]`);
        this._handleLocalStreamChanged(streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.LocalStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-removed [${streams.join(',')}]`);
        this._handleLocalStreamRemoved(streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.RemoteStreamAdded,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-added [${streams.join(',')}]`);
        this._handleRemoteStreamsAdded(streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.RemoteStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-upsert [${streams.join(',')}]`);
        this._handleRemoteStreamsChanged(streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.RemoteStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-removed [${streams.join(',')}]`);
        this._handleRemoteStreamsRemoved(streams, operator);
      },
    );

    handler.on(AgoraRteEventType.ChatUserMessage, (message: AgoraChatMessage) => {
      this.emit(AgoraRteEventType.ChatUserMessage, message);
    });
  }

  private _handleLocalStreamAdded(streams: AgoraStream[], operator?: AgoraRteOperator) {
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleLocalStreamAdded [${streams.join(',')}]`);

    streams.forEach((s) => {
      //TODO
      const type =
        s.streamName === 'secondary' || s.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published:
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? this._rtcChannel.muteLocalVideoStream(false, type)
            : this._rtcChannel.muteLocalScreenStream(false, type);
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().start()
            : AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack().start();
          break;
        case AgoraRteMediaPublishState.Unpublished:
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? this._rtcChannel.muteLocalVideoStream(true, type)
            : this._rtcChannel.muteLocalScreenStream(true, type);
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().stop()
            : AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack().stop();
          break;
      }

      if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
        // AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().start();
      } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
        // AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack().start();
      } else if (s.videoSourceType === AgoraRteVideoSourceType.None) {
        // do nothing when added
      }

      switch (s.audioState) {
        case AgoraRteMediaPublishState.Published:
          this._rtcChannel.muteLocalAudioStream(false);
          type === AGRtcConnectionType.main &&
            AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().start();
          break;
        case AgoraRteMediaPublishState.Unpublished:
          this._rtcChannel.muteLocalAudioStream(true);
          type === AGRtcConnectionType.main &&
            AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().stop();
          break;
      }

      if (s.audioSourceType === AgoraRteAudioSourceType.Mic) {
        // AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().start();
      } else if (s.audioSourceType === AgoraRteAudioSourceType.None) {
        // do nothing when newly added
      }
    });

    this.emit(AgoraRteEventType.LocalStreamAdded, streams, operator);
  }

  private _handleLocalStreamChanged(streams: AgoraStream[], operator?: AgoraRteOperator) {
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleLocalStreamChanged [${streams.join(',')}]`);
    streams.forEach((s) => {
      const type =
        s.streamName === 'secondary' || s.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published:
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? this._rtcChannel.muteLocalVideoStream(false, type)
            : this._rtcChannel.muteLocalScreenStream(false, type);
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().start()
            : AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack().start();
          break;
        case AgoraRteMediaPublishState.Unpublished:
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? this._rtcChannel.muteLocalVideoStream(true, type)
            : this._rtcChannel.muteLocalScreenStream(true, type);
          s.videoSourceType === AgoraRteVideoSourceType.Camera
            ? AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().stop()
            : AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack().stop();
          break;
      }

      // this should not happen as videoSourceType is not expected to change
      // if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
      // } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
      //   // not supported yet
      // } else if (s.videoSourceType === AgoraRteVideoSourceType.None) {
      //   if (s.previous) {
      //     if (s.previous.videoSourceType === AgoraRteVideoSourceType.Camera) {
      //       AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().stop();
      //     }
      //   }
      //   // screenshare also needs to be stopped
      // }

      switch (s.audioState) {
        case AgoraRteMediaPublishState.Published:
          this._rtcChannel.muteLocalAudioStream(false, type);
          type === AGRtcConnectionType.main &&
            AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().start();
          break;
        case AgoraRteMediaPublishState.Unpublished:
          this._rtcChannel.muteLocalAudioStream(true, type);
          type === AGRtcConnectionType.main &&
            AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().stop();
          break;
      }

      // if (s.audioSourceType === AgoraRteAudioSourceType.Mic) {
      //   AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().start();
      // } else if (s.audioSourceType === AgoraRteAudioSourceType.None) {
      //   if (s.previous) {
      //     if (s.previous.audioSourceType === AgoraRteAudioSourceType.Mic) {
      //       AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().stop();
      //     }
      //   }
      // }
    });

    this.emit(AgoraRteEventType.LocalStreamUpdate, streams, operator);
  }

  private _handleLocalStreamRemoved(streams: AgoraStream[], operator?: AgoraRteOperator) {
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleLocalStreamRemoved [${streams.join(',')}]`);
    streams.forEach((s) => {
      const type =
        s.streamName === 'secondary' || s.videoSourceType === AgoraRteVideoSourceType.ScreenShare
          ? AGRtcConnectionType.sub
          : AGRtcConnectionType.main;

      if (s.videoSourceType === AgoraRteVideoSourceType.Camera) {
        this._rtcChannel.muteLocalVideoStream(true, type);
        AgoraRteEngine.engine.getAgoraMediaControl().createCameraVideoTrack().stop();
      } else if (s.videoSourceType === AgoraRteVideoSourceType.ScreenShare) {
        this._rtcChannel.muteLocalScreenStream(true, type);
        AgoraRteEngine.engine.getAgoraMediaControl().createScreenShareTrack().stop();
      } else if (s.videoSourceType === AgoraRteVideoSourceType.None) {
        // no action needed
      }

      if (s.audioSourceType === AgoraRteAudioSourceType.Mic) {
        this._rtcChannel.muteLocalAudioStream(true, type);
        type === AGRtcConnectionType.main &&
          AgoraRteEngine.engine.getAgoraMediaControl().createMicrophoneAudioTrack().stop();
      } else if (s.audioSourceType === AgoraRteAudioSourceType.None) {
        // no action needed
      }
    });

    this.emit(AgoraRteEventType.LocalStreamRemove, streams, operator);
  }

  private _handleRemoteStreamsAdded(streams: AgoraStream[], operator?: AgoraRteOperator) {
    if (streams.length === 0) {
      return;
    }

    this.logger.info(`_handleRemoteStreamsAdded [${streams.join(',')}]`);
    // remote stream added, try subscribing
    streams.forEach((s) => {
      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published:
          this._rtcChannel.muteRemoteVideoStream(s.streamUuid, false);
          break;
        case AgoraRteMediaPublishState.Unpublished:
          this._rtcChannel.muteRemoteVideoStream(s.streamUuid, true);
          break;
      }

      switch (s.audioState) {
        case AgoraRteMediaPublishState.Published:
          this._rtcChannel.muteRemoteAudioStream(s.streamUuid, false);
          break;
        case AgoraRteMediaPublishState.Unpublished:
          this._rtcChannel.muteRemoteAudioStream(s.streamUuid, true);
          break;
      }
    });

    this.emit(AgoraRteEventType.RemoteStreamAdded, streams, operator);
  }

  private _handleRemoteStreamsChanged(streams: AgoraStream[], operator?: AgoraRteOperator) {
    this.logger.info(`_handleRemoteStreamsChanged [${streams.join(',')}]`);
    // remote stream added, try subscribing
    streams.forEach((s) => {
      switch (s.videoState) {
        case AgoraRteMediaPublishState.Published:
          this._rtcChannel.muteRemoteVideoStream(s.streamUuid, false);
          break;
        case AgoraRteMediaPublishState.Unpublished:
          this._rtcChannel.muteRemoteVideoStream(s.streamUuid, true);
          break;
      }

      switch (s.audioState) {
        case AgoraRteMediaPublishState.Published:
          this._rtcChannel.muteRemoteAudioStream(s.streamUuid, false);
          break;
        case AgoraRteMediaPublishState.Unpublished:
          this._rtcChannel.muteRemoteAudioStream(s.streamUuid, true);
          break;
      }
    });

    this.emit(AgoraRteEventType.RemoteStreamUpdate, streams, operator);
  }

  private _handleRemoteStreamsRemoved(streams: AgoraStream[], operator?: AgoraRteOperator) {
    if (streams.length === 0) {
      return;
    }
    this.logger.info(`_handleRemoteStreamsRemoved [${streams.join(',')}]`);
    // remote stream added, try subscribing
    streams.forEach((s) => {
      this._rtcChannel.muteRemoteVideoStream(s.streamUuid, true);
      this._rtcChannel.muteRemoteAudioStream(s.streamUuid, true);
    });
    this.emit(AgoraRteEventType.RemoteStreamRemove, streams, operator);
  }

  private _handleUserAdded(users: AgoraUser[]) {
    let addedLocalStreams: AgoraStream[] = [];
    let addedRemoteStreams: AgoraStream[] = [];
    users.forEach((u) => {
      if (this.localUser?.userUuid === u.userUuid) {
        // local user added
        const streams = this.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          addedLocalStreams = addedLocalStreams.concat(streams);
        }
      } else {
        // remote user added
        const streams = this.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          addedRemoteStreams = addedRemoteStreams.concat(streams);
        }
      }
    });

    this._handleLocalStreamAdded(addedLocalStreams);
    this._handleRemoteStreamsAdded(addedRemoteStreams);

    this.emit(AgoraRteEventType.UserAdded, users);
  }

  private _handleUserRemoved(users: AgoraUser[], type?: number) {
    let removedLocalStreams: AgoraStream[] = [];
    let removedRemoteStreams: AgoraStream[] = [];
    users.forEach((u) => {
      if (this.localUser?.userUuid === u.userUuid) {
        // local user added
        const streams = this.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          removedLocalStreams = removedLocalStreams.concat(streams);
        }
      } else {
        // remote user added
        const streams = this.dataStore.findUserStreams(u.userUuid);
        if (streams) {
          removedRemoteStreams = removedRemoteStreams.concat(streams);
        }
      }
    });

    this._handleLocalStreamRemoved(removedLocalStreams);
    this._handleRemoteStreamsRemoved(removedRemoteStreams);

    this.emit(AgoraRteEventType.UserRemoved, users, type);
  }

  private _handleRoomPropertyChange(
    changedProperties: string[],
    roomProperties: Immutable.Map<string, unknown>,
    operator: any,
    cause: any,
  ) {
    this.emit(
      AgoraRteEventType.RoomPropertyUpdated,
      changedProperties,
      roomProperties.toObject(),
      operator,
      cause,
    );
  }

  private get _localStreams(): AgoraStream[] {
    if (!this._localUser) {
      return [];
    }
    return this.dataStore.findUserStreams(this._localUser.userUuid);
  }
}
