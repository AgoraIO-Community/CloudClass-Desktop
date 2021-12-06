import {
  AgoraChatMessage,
  AgoraRteMessageHandleTask,
  AgoraRtePeerMessageHandleTask,
  AgoraRteSyncSnapshotData,
  AgoraStream,
  AgoraUser,
} from './struct';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { AgoraRteSyncDataStore } from './data';
import { AGEventEmitter } from '../../utils/events';
import { Log } from '../../decorator/log';
import { Injectable } from '../../decorator/type';

export enum AgoraRteChannelMessageCmd {
  Chat = 3,
  RoomProperty = 4,
  RoomProperties = 5,
  UserInOut = 20,
  UserInfo = 21,
  UserProperty = 22,
  UserProperties = 23,
  StreamInOut = 40,
  StreamsInOut = 41,
  MessageExtension = 99,
}

export enum AgoraRtePeerMessageCmd {
  PeerChat = 1,
}

export enum AgoraRteEventType {
  SnapshotUpdated = 'snapshot-updated',
  ChatReceived = 'chat-received',
  UserAdded = 'user-added',
  UserUpdated = 'user-updated',
  UserRemoved = 'user-removed',
  RoomPropertyUpdated = 'room-property-updated',
  UserPropertyUpdated = 'user-property-updated',
  LocalStreamAdded = 'local-stream-added',
  LocalStreamUpdate = 'local-stream-update',
  LocalStreamRemove = 'local-stream-removed',
  RemoteStreamAdded = 'remote-stream-added',
  RemoteStreamUpdate = 'remote-stream-update',
  RemoteStreamRemove = 'remote-stream-removed',
  ChatUserMessage = 'user-chat-message',
  ChatRoomMessage = 'room-chat-message',
  NetworkStats = 'network-stats',
  LocalAudioVolume = 'local-audio-volume',
  AudioVolumes = 'audio-volumes',
  LocalVideoCameraListChanged = 'local-video-camera-list-changed',
  LocalAudioRecordingListChanged = 'local-audio-recording-list-changed',
  LocalAudioPlaybackListChanged = 'local-audio-playback-list-changed',
  LocalVideoTrackStateChanged = 'local-video-track-state-changed',
  LocalAudioTrackStateChanged = 'local-audio-track-state-changed',
  RtcConnectionStateChanged = 'rtc-connection-state-changed',
  RtmConnectionStateChanged = 'rtm-connection-state-changed',
  RteConnectionStateChanged = 'rte-connection-state-changed',
}

export interface AgoraRteChannelMessageHandle {
  on(evt: AgoraRteEventType, ...args: any[]): this;
  off(evt: AgoraRteEventType, ...args: any[]): this;
}

@Log.attach({ proxyMethods: false })
export class AgoraRteChannelMessageHandle extends AGEventEmitter {
  protected logger!: Injectable.Logger;
  private _dataStore: AgoraRteSyncDataStore;

  sceneId: string;
  userUuid: string;
  streamUuid: string;

  constructor(
    dataStore: AgoraRteSyncDataStore,
    {
      sceneId,
      userUuid,
      streamUuid,
    }: {
      sceneId: string;
      userUuid: string;
      streamUuid: string;
    },
  ) {
    super();
    this.sceneId = sceneId;
    this.userUuid = userUuid;
    this.streamUuid = streamUuid;
    this._dataStore = dataStore;
  }

  handleSnapshot(snapshot: AgoraRteSyncSnapshotData) {
    // users
    this._dataStore.setUsers(snapshot.users);
    this._dataStore.setStreams(snapshot.streams);
    this._dataStore.setRoomProperties(snapshot.roomProperties);
    this._dataStore.setRoomInfo(snapshot.room);
    this.emit(AgoraRteEventType.SnapshotUpdated, snapshot);
  }

  handleMessage(task: AgoraRteMessageHandleTask) {
    switch (task.sequence.cmd) {
      case AgoraRteChannelMessageCmd.Chat:
        this._handleChat(task);
        break;
      case AgoraRteChannelMessageCmd.RoomProperty:
        // room property change struct aligns with properties so use the same handling func
        this._handleRoomProperties(task);
        break;
      case AgoraRteChannelMessageCmd.RoomProperties:
        this._handleRoomProperties(task);
        break;
      case AgoraRteChannelMessageCmd.UserInOut:
        this._handleUserInOut(task);
        break;
      case AgoraRteChannelMessageCmd.UserInfo:
        this._handleUserInfo(task);
        break;
      case AgoraRteChannelMessageCmd.UserProperty:
        this._handleUserProperty(task);
        break;
      case AgoraRteChannelMessageCmd.UserProperties:
        this._handleUserProperties(task);
        break;
      case AgoraRteChannelMessageCmd.StreamInOut:
        this._handleStreamInOut(task);
        break;
      case AgoraRteChannelMessageCmd.StreamsInOut:
        this._handleStreamsInOut(task);
        break;
      case AgoraRteChannelMessageCmd.MessageExtension:
        this._handleMessageExtension(task);
        break;
    }
  }

  handlePeerMessage(task: AgoraRtePeerMessageHandleTask) {
    switch (task.cmd) {
      case AgoraRtePeerMessageCmd.PeerChat:
        this._handlePeerChat(task);
        break;
    }
  }

  private _handlePeerChat(task: AgoraRtePeerMessageHandleTask) {
    const data = task.data;
    const message = AgoraChatMessage.fromData(data);
    this._dataStore.addMessage(message);

    this.emit(AgoraRteEventType.ChatUserMessage, message);
  }

  private _handleChat(task: AgoraRteMessageHandleTask) {
    const data = task.sequence.data;
    const message = AgoraChatMessage.fromData(data);
    this._dataStore.addMessage(message);

    this.emit(AgoraRteEventType.ChatReceived, message);
  }

  private _mergeProperties(properties: any, changedProperties: any) {
    for (let key of Object.keys(changedProperties)) {
      let originalPaths = key.split('.');
      if (originalPaths.length === 0) {
        this.logger.error(`invalid key when batch set room properties ${key}`);
        continue;
      }

      const paths = originalPaths.filter((path: string) => path);
      let cursor = properties;
      for (let path of paths) {
        cursor[path] = cursor[path] || {};
        cursor = cursor[path];
      }

      let parent =
        paths.length === 1
          ? properties
          : get(
              properties,
              //@ts-ignore
              [...paths].splice(0, paths.length - 1).join('.'),
              {},
            );

      const changedValue = cloneDeep(changedProperties[key]);

      // update leaf node
      if (changedValue === 'deleted') {
        delete parent[[...paths].pop()!];
      } else {
        parent[[...paths].pop()!] = changedValue;
      }
    }
    return properties;
  }

  private _handleRoomProperties(task: AgoraRteMessageHandleTask) {
    const data = task.sequence.data;
    const { changeProperties, cause, operator } = data;

    this._dataStore.setRoomProperties(
      this._mergeProperties(this._dataStore.roomProperties.toJS(), changeProperties),
    );

    let changedKeys = Array.from(
      new Set(Object.keys(changeProperties).map((k) => k.split('.')[0])),
    );

    this.emit(
      AgoraRteEventType.RoomPropertyUpdated,
      changedKeys,
      this._dataStore.roomProperties,
      operator,
      cause,
    );
  }

  private _handleUserInOut(task: AgoraRteMessageHandleTask) {
    const data = task.sequence.data;
    const { offlineUsers, onlineUsers } = data;

    const offlineUsersData = offlineUsers.map((u: any) => {
      const user = AgoraUser.fromData(u);
      this._dataStore.deleteStream(u.streamUuid);
      this._dataStore.deleteUser(u.userUuid);
      return user;
    });
    const onlineUsersData = onlineUsers.map((u: any) => {
      const user = AgoraUser.fromData(u);
      this._dataStore.setUser(user.userUuid, user);
      const { streams = [] } = u;
      streams.forEach((streamData: any) => {
        const stream = AgoraStream.fromData({
          ...streamData,
          fromUser: {
            userUuid: user.userUuid,
            role: user.userRole,
            userName: user.userName,
          },
        });
        this._dataStore.setStream(stream.streamUuid, stream);
      });
      return user;
    });

    if (onlineUsersData.length > 0) {
      this.emit(AgoraRteEventType.UserAdded, onlineUsersData);
    }
    if (offlineUsersData.length > 0) {
      // type is guaranteed the same value in a batch, so just pick the first one
      const type = offlineUsers.length ? offlineUsers[0].type : undefined;
      this.emit(AgoraRteEventType.UserRemoved, offlineUsersData, type);
    }
  }

  private _handleUserInfo(task: AgoraRteMessageHandleTask) {
    const data = task.sequence.data;
    const { userUuid, userName, role } = data;
    let user = this._dataStore.findUser(userUuid);

    if (!user) {
      return this.logger.warn(`user ${userUuid} not exists, update info failed`);
    }

    user.userName = userName;
    user.userRole = role;
    this.emit(AgoraRteEventType.UserUpdated, user);
  }

  private _handleUserProperty(task: AgoraRteMessageHandleTask) {
    throw 'not_implemented';
  }

  private _handleUserProperties(task: AgoraRteMessageHandleTask) {
    const data = task.sequence.data;
    const { changeProperties, cause, fromUser, operator } = data;
    const { userUuid } = fromUser;

    const user = this._dataStore.findUser(userUuid);
    if (!user) {
      return this.logger.warn(`user ${userUuid} not exists, update property failed`);
    }
    user.userProperties = this._mergeProperties(user.userProperties.toJS(), changeProperties);

    this.emit(
      AgoraRteEventType.UserPropertyUpdated,
      userUuid,
      user.userProperties,
      operator,
      cause,
    );
  }

  private _processStreamEvent(action: number, stream: AgoraStream): AgoraRteEventType {
    const isLocal = stream.fromUser.userUuid === this.userUuid;
    if (action === 3) {
      const original = this._dataStore.findStream(stream.streamUuid);
      this._dataStore.deleteStream(stream.streamUuid);
      stream.previous = original;
      return isLocal ? AgoraRteEventType.LocalStreamRemove : AgoraRteEventType.RemoteStreamRemove;
    } else if (action === 2) {
      const original = this._dataStore.findStream(stream.streamUuid);
      this._dataStore.setStream(stream.streamUuid, stream);
      stream.previous = original;
      return isLocal ? AgoraRteEventType.LocalStreamUpdate : AgoraRteEventType.RemoteStreamUpdate;
    } else {
      stream.previous = undefined;
      this._dataStore.setStream(stream.streamUuid, stream);
      return isLocal ? AgoraRteEventType.LocalStreamAdded : AgoraRteEventType.RemoteStreamAdded;
    }
  }

  private _handleStreamInOut(task: AgoraRteMessageHandleTask) {
    const data = task.sequence.data;
    const {
      action,
      fromUser,
      streamUuid,
      streamName,
      videoSourceType,
      audioSourceType,
      videoState,
      audioState,
      operator,
    } = data;

    const stream = AgoraStream.fromData({
      streamName,
      streamUuid,
      fromUser,
      videoSourceType,
      audioSourceType,
      videoState,
      audioState,
    });
    const eventType = this._processStreamEvent(action, stream);
    this.emit(eventType, [stream], operator);
  }

  private _handleStreamsInOut(task: AgoraRteMessageHandleTask) {
    const data = task.sequence.data;
    const { streams, operator, cause } = data;

    let eventMap: Map<AgoraRteEventType, AgoraStream[]> = new Map<
      AgoraRteEventType,
      AgoraStream[]
    >();
    streams.forEach((streamData: any) => {
      const { action } = streamData;
      const stream = AgoraStream.fromData(streamData);
      const eventType = this._processStreamEvent(action, stream);
      if (!eventMap.has(eventType)) {
        eventMap.set(eventType, [stream]);
      } else {
        eventMap.set(eventType, eventMap.get(eventType)!.concat([stream]));
      }
    });

    eventMap.forEach((value, key) => {
      this.emit(key, value, operator);
    });
  }

  private _handleMessageExtension(task: AgoraRteMessageHandleTask) {
    //TODO
  }
}
