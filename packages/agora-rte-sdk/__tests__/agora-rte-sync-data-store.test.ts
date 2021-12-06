import { AgoraRteSyncDataStore } from '../src/core/processor/channel-msg/data';
import { AgoraStream, AgoraUser } from '../src/core/processor/channel-msg/struct';
import { FactoryStream, FactoryUser } from './factories';

jest.mock('../src/core/logger/index', () => {
  return {};
});

describe('AgoraRteSyncDataStore', () => {
  test('#users should immutable', () => {
    const store = new AgoraRteSyncDataStore();
    const user = FactoryUser(
      {
        userName: 'userName',
        role: 'userName',
        userUuid: 'userName',
        userProperties: {
          device: {
            camera: 0,
            mic: 1,
          },
        },
      },
      1,
    )[0];
    store.users.set('1', user);
    expect(store.users.size).toBe(0);
  });

  test('#roomProperties should immutable', () => {
    const store = new AgoraRteSyncDataStore();
    // 1. update roomProperties
    store.setRoomProperties({
      demo: '1212',
      properties: {
        name: '11',
      },
    });
    // 2. update roomProperties by immutable.js

    expect(JSON.stringify(store.roomProperties.toJSON())).toEqual(
      '{"demo":"1212","properties":{"name":"11"}}',
    );
  });

  test('#streams should immutable', () => {
    const store = new AgoraRteSyncDataStore();
    const stream = FactoryStream(
      {
        streamUuid: '11',
        streamName: '12',
        videoSourceType: 1,
        audioSourceType: 1,
        videoState: 1,
        audioState: 1,
        fromUser: FactoryUser(
          {
            userName: 'userName',
            role: 'userName',
            userUuid: 'userName',
            userProperties: {
              device: {
                camera: 0,
                mic: 1,
              },
            },
          },
          1,
        )[0],
      },
      1,
    )[0];
    let streamMap = new Map<string, AgoraStream>();
    streamMap.set('1', stream);
    store.setStreams(streamMap);
    expect(store.streams.size).toEqual(1);
  });
});
