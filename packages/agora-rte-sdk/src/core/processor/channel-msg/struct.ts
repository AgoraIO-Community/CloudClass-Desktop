import Immutable from 'immutable';
import { Logger } from '../../logger';
import {
  AgoraRteAudioSourceType,
  AgoraRteMediaPublishState,
  AgoraRteVideoSourceType,
} from '../../media/track';
import { AGRteErrorCode, RteErrorCenter } from '../../utils/error';

export type AgoraFromUser = {
  userUuid: string;
  userName: string;
  role: string;
};

export class AgoraRteSyncSnapshotData {
  static fromData(data: any): AgoraRteSyncSnapshotData {
    const snapshot = new AgoraRteSyncSnapshotData(data);
    return snapshot;
  }

  sequence: number;
  users: Map<string, AgoraUser> = new Map<string, AgoraUser>();
  streams: Map<string, AgoraStream> = new Map<string, AgoraStream>();
  roomProperties = Immutable.Map();
  room: AgoraRoom;

  constructor(data: any) {
    const { seq, users, roomProperties, roomInfo } = data;
    this.sequence = seq;
    users.forEach((u: any) => {
      const user = AgoraUser.fromData(u);
      const { streams = [] } = u;
      streams.forEach((s: any) => {
        this.streams.set(
          s.streamUuid,
          AgoraStream.fromData({
            ...s,
            fromUser: {
              userName: user.userName,
              role: user.userRole,
              userUuid: user.userUuid,
            },
          }),
        );
      });
      this.users.set(u.userUuid, user);
    });
    this.roomProperties = Immutable.Map(roomProperties);
    this.room = AgoraRoom.fromData(roomInfo);
  }
}

export interface AgoraRteOperator {
  userUuid: string;
  userName: string;
  role: string;
}

export interface AgoraRteMessageHandleTask {
  sequence: {
    cmd: number;
    operator: AgoraRteOperator;
    sequence: number;
    data: any;
  };
}

export interface AgoraRtePeerMessageHandleTask {
  cmd: number;
  data: any;
}

export interface IAgoraUserData {
  userName: string;
  role: string;
  userUuid: string;
  userProperties: any;
}

export class AgoraUser {
  static fromData(data: any) {
    return new AgoraUser(data);
  }
  userUuid: string;
  userName: string;
  userRole: string;
  userProperties: Immutable.Map<any, any>;

  constructor(data: IAgoraUserData) {
    this.userName = data.userName;
    this.userRole = data.role;
    this.userUuid = data.userUuid;
    this.userProperties = Immutable.Map(data.userProperties);
  }

  toString() {
    return this.userUuid;
  }
}

export interface IAgoraStreamData {
  streamUuid: string;
  streamName: string;
  fromUser: AgoraFromUser;
  videoSourceType: AgoraRteVideoSourceType;
  audioSourceType: AgoraRteAudioSourceType;
  videoState: AgoraRteMediaPublishState;
  audioState: AgoraRteMediaPublishState;
}

export class AgoraStream {
  static fromData(data: IAgoraStreamData) {
    return new AgoraStream(data);
  }

  streamUuid: string;
  streamName: string;
  fromUser: AgoraFromUser;
  videoSourceType: AgoraRteVideoSourceType;
  audioSourceType: AgoraRteAudioSourceType;
  videoState: AgoraRteMediaPublishState;
  audioState: AgoraRteMediaPublishState;

  previous?: AgoraStream;

  constructor(data: IAgoraStreamData) {
    this.streamUuid = data.streamUuid;
    this.streamName = data.streamName;
    this.fromUser = data.fromUser;
    this.videoSourceType = data.videoSourceType;
    this.audioSourceType = data.audioSourceType;
    this.videoState = data.videoState;
    this.audioState = data.audioState;

    if (!this.fromUser) {
      Logger.error(`[stream-data-struct] stream must has owner info`);
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_INVALID_DATA_STRUCT,
        new Error(`invalid stream data`),
      );
    }
  }

  toString() {
    return this.streamUuid;
  }
}

export interface IAgoraRoomData {
  roomName: string;
  roomUuid: string;
  roomScenario: string;
}
export class AgoraRoom {
  static fromData(data: any) {
    return new AgoraRoom(data);
  }

  roomName: string;
  roomUuid: string;
  roomScenario: string;

  constructor(data: IAgoraRoomData) {
    this.roomName = data.roomName;
    this.roomUuid = data.roomUuid;
    this.roomScenario = data.roomScenario;
  }
}

export interface IAgoraChatMessage {
  fromUser: AgoraFromUser;
  message: string;
  type: number;
  sendTime: number;
  sensitiveWords: string[];
  messageId?: string;
  peerMessageId?: string;
}
export class AgoraChatMessage {
  static fromData(data: IAgoraChatMessage) {
    return new AgoraChatMessage(data);
  }

  fromUser: AgoraFromUser;
  message: string;
  type: number;
  sendTime: number;
  sensitiveWords: string[];
  messageId?: string;

  constructor(data: IAgoraChatMessage) {
    this.fromUser = data.fromUser;
    this.message = data.message;
    this.type = data.type;
    this.sendTime = data.sendTime;
    this.sensitiveWords = data.sensitiveWords;
    this.messageId = data.messageId || data.peerMessageId;
  }

  toString() {
    return `${this.fromUser.userName}: ${this.message}`;
  }
}
