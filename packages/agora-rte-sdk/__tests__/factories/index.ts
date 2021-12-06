import { AgoraUser, AgoraRoom, AgoraStream } from './../../src/core/processor/channel-msg/struct';
const snapshotJSON = require('../fixtures/snapshot.json');

function buildParams<T extends Object>(attributes: any, key: number): T {
  const keys = Reflect.ownKeys(attributes);
  let newObj: any = {};
  for (let propertyKey of keys) {
    if (attributes.hasOwnProperty(propertyKey)) {
      if (typeof attributes[propertyKey] === 'object') {
        newObj[propertyKey] = {
          ...attributes[propertyKey],
        };
      } else {
        newObj[propertyKey] = `${attributes[propertyKey]}-${key}`;
      }
    }
  }
  return newObj;
}

type FactoryRelations = Record<string, any>;

function factory<T>(ctor: any, params: T, size: number, relations: FactoryRelations = {}) {
  return Array({ length: size }).map((_, idx: number) => {
    return new ctor({
      ...buildParams(params, idx),
      // ...buildParams(relations, idx),
    });
  });
}

export function FactoryUser(params: ConstructorParameters<typeof AgoraUser>[0], size: number = 1) {
  return factory(AgoraUser, params, size);
}

export function FactoryRoom(params: ConstructorParameters<typeof AgoraRoom>[0], size: number = 1) {
  return factory(AgoraRoom, params, size);
}

export function FactoryStream(
  params: ConstructorParameters<typeof AgoraStream>[0],
  size: number = 1,
) {
  return factory(AgoraStream, params, size);
}

interface StreamInfo {
  streamUuid: string;
  streamName: string;
  videoSourceType: number;
  audioSourceType: number;
  videoState: number;
  audioState: number;
  updateTime: Date;
  state: number;
}

interface RoomInfo {
  roomName: string;
  roomUuid: string;
  scenario: string;
}

interface RoomState {
  state: number;
  checkState: boolean;
  startTime: Date;
  endTime: Date;
  muteChat: {};
  muteVideo: {};
  muteAudio: {};
  createTime: Date;
}

interface UserStreamInfo {
  userName: string;
  userUuid: string;
  role: string;
  muteChat: number;
  userProperties: {
    device: {
      camera: number;
      mic: number;
    };
  };
  updateTime: Date;
  streamUuid: string;
  state: number;
  streams: StreamInfo[];
}

interface RoomProperties {
  reward: {
    config: {
      roomLimit: number;
    };
    room: number;
  };

  schedule: {
    closeDelay: number;
    duration: number;
    startTime: Date;
    state: number;
    endTime: Date;
  };

  processes: {
    handsUp: {
      maxAccept: number;
      maxWait: number;
      progress: any[];
      accepted: any[];
      type: number;
      enableApply: number;
      forceApply: number;
      enabled: number;
      timeout: number;
    };
  };

  record: {
    state: number;
  };
  state: number;
  board: {
    info: {
      boardAppId: string;
      boardId: string;
      boardToken: string;
      boardRegion: string;
    };
  };
  screen: {
    state: number;
  };
  carousel: {
    state: number;
    count: number;
  };
  im: {
    huanxin: {
      enabled: number;
      appKey: string;
      orgName: string;
      appName: string;
      chatRoomId: string;
    };
  };
  roomType: number;
  users: UserStreamInfo[];
}

class ClassRoomSnapShot {
  private readonly _data: any = getSnapShot()['data'];

  constructor() {}

  get sequence(): number {
    return this._data['sequence'];
  }

  get snapshot() {
    return this._data['snapshot'];
  }

  get roomInfo(): RoomInfo {
    return this.snapshot['room']['roomInfo'];
  }

  get roomState(): RoomState {
    return this.snapshot['room']['roomState'];
  }

  get roomProperties(): RoomProperties {
    return this.snapshot['room']['roomProperties'];
  }

  get users(): UserStreamInfo[] {
    return this.snapshot['users'];
  }
}

export function getSnapShot() {
  try {
    let res = snapshotJSON;
    return res;
  } catch (err) {
    console.error(err);
  }
}

export const snapshot = new ClassRoomSnapShot();
