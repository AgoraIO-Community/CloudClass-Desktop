import { AgoraRteSynchronizer } from '../core/processor/channel-msg/synchronizer';
import {
  AgoraChatMessage,
  AgoraRteOperator,
  AgoraRteSyncSnapshotData,
  AgoraStream,
  AgoraUser,
  IAgoraStreamData,
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
import { AgoraRteSyncDataStore } from '../core/processor/channel-msg/data';
import { AGRteErrorCode, RteErrorCenter } from '../core/utils/error';
import { NetworkStats, RtcState } from '../core/rtc/type';
import to from 'await-to-js';
import { Injectable } from '../core/decorator/type';
import { AgoraRteEngine } from '../core/engine';
import { AgoraRteEngineConfig } from '../configs';
import { Log } from '../core/decorator/log';
import { AgoraRteConnectionState } from '../type';
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

  public createTs?: number;

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

  get rtcSid() {
    return this._rtcChannel.getRtcSid();
  }

  get rtmSid() {
    return this._rtmManager.sessionId;
  }

  get rtcChannel() {
    return this._rtcChannel;
  }

  async joinScene(options: AgoraRteSceneJoinOptions) {
    if (this._sceneState !== AgoraRteConnectionState.Idle) {
      Logger.warn(`scene not idle`);
      return;
    }

    try {
      // 1. entry
      this._setRteConnectionState(AgoraRteConnectionState.Connecting);
      const mediaControl = AgoraRteEngine.engine.getAgoraMediaControl();
      const { user, room } = await AgoraRteEngine.engine.getApiService().entryRoom({
        userUuid: AgoraRteEngineConfig.shared.userId,
        roomUuid: this.sceneId,
        userName: options.userName,
        streamUuid: options.streamId,
        role: options.userRole,
        stream: {
          videoSourceState: mediaControl.createCameraVideoTrack().state,
          audioSourceState: mediaControl.createMicrophoneAudioTrack().state,
        },
      });

      this.createTs = room.roomState.createTime;

      Object.assign(AgoraRteEngineConfig.shared.service.headers, { token: user.userToken });

      // 2. rtm join
      await this._rtmManager.join(this._rtmChannel, this._rtmChannelObserver, this.sceneId);

      // 3. initialize object models
      const {
        streamUuid,
        userName,
        userUuid,
        userRole,
        rtcToken,
        streams = [],
        userProperties,
      } = user;
      let agStreams = streams.map((s: IAgoraStreamData) => {
        return AgoraStream.fromData({
          streamUuid: s.streamUuid,
          streamName: s.streamName,
          fromUser: {
            userName,
            userUuid,
            role: userRole,
          },
          videoSourceState: s.videoSourceState,
          audioSourceState: s.audioSourceState,
          videoSourceType: s.videoSourceType,
          audioSourceType: s.audioSourceType,
          videoState: s.videoState,
          audioState: s.audioState,
        });
      });
      this.dataStore.setStreams(agStreams);
      this._localUser = new AgoraRteLocalUser(this, {
        userUuid: AgoraRteEngineConfig.shared.userId,
        userName,
        userRole,
        streamUuid,
        sceneId: this.sceneId,
        rtcToken,
        rtc: this._rtcManager,
        userProperties,
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
        new Error(
          `try to join rtc before scene is ready ${!!this._initialSync} ${!!this.localUser}`,
        ),
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
    this._localUser?.destroy();
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

    this.emit(AgoraRteEventType.LocalStreamAdded, addedLocalStreams);
    this.emit(AgoraRteEventType.RemoteStreamAdded, addedRemoteStreams);
    this.emit(AgoraRteEventType.UserAdded, users);
  }

  private _addEventListeners(handler: AgoraRteChannelMessageHandle) {
    handler.on(AgoraRteEventType.SnapshotUpdated, () => {
      this.logger.info(`snapshot updated`);
      this._setInitialSnapshotSync(true);

      if (!this.localUser) {
        return RteErrorCenter.shared.handleThrowableError(
          AGRteErrorCode.RTE_ERR_LOCAL_USER_NOT_EXIST,
          new Error('local user not exist'),
        );
      }

      //do not fire local user event from snapshot, as this has been done in entry api phase
      const users = Array.from(this.dataStore.users.values()).filter(
        (u) => u.userUuid !== this.localUser!.userUuid,
      );
      users.push(this.localUser.toData());
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
      this.emit(AgoraRteEventType.UserAdded, users);
    });

    handler.on(AgoraRteEventType.UserUpdated, (user: AgoraUser) => {
      this.logger.info(`user-updated ${user}`);
    });

    handler.on(AgoraRteEventType.UserRemoved, (users: AgoraUser[], type?: number) => {
      this.logger.info(`user-removed [${users.join(',')}]`);
      this.emit(AgoraRteEventType.UserRemoved, users, type);
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
        if (streams.length === 0) {
          return;
        }
        this.emit(AgoraRteEventType.LocalStreamAdded, streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.LocalStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-upsert [${streams.join(',')}]`);
        if (streams.length === 0) {
          return;
        }
        this.emit(AgoraRteEventType.LocalStreamUpdate, streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.LocalStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`local-stream-removed [${streams.join(',')}]`);
        if (streams.length === 0) {
          return;
        }
        this.emit(AgoraRteEventType.LocalStreamRemove, streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.RemoteStreamAdded,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-added [${streams.join(',')}]`);
        if (streams.length === 0) {
          return;
        }
        this.emit(AgoraRteEventType.RemoteStreamAdded, streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.RemoteStreamUpdate,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-upsert [${streams.join(',')}]`);
        if (streams.length === 0) {
          return;
        }
        this.emit(AgoraRteEventType.RemoteStreamUpdate, streams, operator);
      },
    );

    handler.on(
      AgoraRteEventType.RemoteStreamRemove,
      (streams: AgoraStream[], operator?: AgoraRteOperator) => {
        this.logger.info(`remote-stream-removed [${streams.join(',')}]`);
        if (streams.length === 0) {
          return;
        }
        this.emit(AgoraRteEventType.RemoteStreamRemove, streams, operator);
      },
    );

    handler.on(AgoraRteEventType.ChatUserMessage, (message: AgoraChatMessage) => {
      this.emit(AgoraRteEventType.ChatUserMessage, message);
    });
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
}
