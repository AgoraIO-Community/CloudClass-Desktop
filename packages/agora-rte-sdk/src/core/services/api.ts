import { ApiBase } from './base';
import { ReportService } from './report';
import { AgoraRteEngineConfig } from '../..';
import {
  AgoraRteAudioSourceType,
  AgoraRteMediaPublishState,
  AgoraRteMediaTrack,
  AgoraRteVideoSourceType,
} from '../media/track';
import get from 'lodash/get';

export interface EntryRequestParams {
  userUuid: string;
  roomUuid: string;
  userName: string;
  role: string;
  streamUuid: string;
  // autoPublish: boolean
}

export class AgoraRteService extends ApiBase {
  constructor() {
    super();
  }

  // temp debug use. this should be put in edu context instead of rte
  async checkIn(
    roomUuid: string,
    userUuid: string,
    roomName: string,
    userName: string,
    userRole: number,
  ): Promise<any> {
    let { data } = await this.fetch({
      path: `/v2/rooms/${roomUuid}/users/${userUuid}`,
      pathPrefix: `/edu/apps/${AgoraRteEngineConfig.shared.appId}`,
      method: 'PUT',
      data: {
        boardRegion: 'cn-hz',
        duration: 18000,
        role: userRole,
        roomName,
        roomType: 4,
        userName,
        userProperties: {},
      },
    });
    return data;
  }

  async entryRoom(params: EntryRequestParams): Promise<any> {
    // REPORT
    ReportService.shared.startTick('joinRoom', 'http', 'entry');
    const data = {
      userName: params.userName,
      role: params.role,
      streamUuid: params.streamUuid,
      // autoPublish: +params.autoPublish
    };

    let resp = await this.fetch({
      path: `/v1/rooms/${params.roomUuid}/users/${params.userUuid}/entry`,
      method: 'POST',
      data: data,
    });
    const statusCode = resp['__status'];
    const { code } = resp;
    ReportService.shared.reportHttp(
      'joinRoom',
      'http',
      'entry',
      statusCode,
      statusCode === 200,
      code,
    );

    return resp.data;
  }

  async syncSnapShot(roomUuid: string): Promise<any> {
    let res = await this.fetch({
      path: `/v1/rooms/${roomUuid}/snapshot`,
      method: 'GET',
    });
    const data = res.data;
    const seq = data.sequence ?? 0;
    const roomInfo = get(data, 'snapshot.room.roomInfo', null);
    const roomProperties = get(data, 'snapshot.room.roomProperties', null);
    const roomState = get(data, 'snapshot.room.roomState');
    const users = get(data, 'snapshot.users', []);
    return {
      seq,
      roomInfo,
      roomState,
      roomProperties,
      users,
    };
  }

  async syncSequence(roomUuid: string, seqId: number, count: number): Promise<any> {
    let res = await this.fetch({
      path: `/v1/rooms/${roomUuid}/sequences?nextId=${seqId}&count=${count}`,
      method: 'GET',
    });
    return res.data;
  }

  async updateRoomProperties({
    roomUuid,
    properties,
    cause,
  }: {
    roomUuid: string;
    properties: object;
    cause?: object;
  }) {
    const data: any = { properties };
    if (cause) {
      data.cause = cause;
    }

    let res = await this.fetch({
      path: `/v1/rooms/${roomUuid}/properties`,
      method: 'PUT',
      data: data,
    });
    return res.data;
  }

  async deleteRoomProperties({
    roomUuid,
    properties,
    cause,
  }: {
    roomUuid: string;
    properties: string[];
    cause?: object;
  }) {
    const data: any = { properties };
    if (cause) {
      data.cause = cause;
    }

    let res = await this.fetch({
      path: `/v1/rooms/${roomUuid}/properties`,
      method: 'DELETE',
      data: data,
    });
    return res.data;
  }

  async updateUserProperties({
    roomUuid,
    userUuid,
    properties,
    cause = undefined,
  }: {
    roomUuid: string;
    userUuid: string;
    properties: object;
    cause?: string;
  }) {
    const data = {
      properties,
      cause,
    };

    let res = await this.fetch({
      path: `/v1/rooms/${roomUuid}/users/${userUuid}/properties`,
      method: 'PUT',
      data: data,
    });
    return res.data;
  }

  async deleteUserProperties({
    roomUuid,
    userUuid,
    properties,
    cause = undefined,
  }: {
    roomUuid: string;
    userUuid: string;
    properties: string[];
    cause?: any;
  }) {
    const data: any = { properties };
    if (cause) {
      data.cause = cause;
    }

    let res = await this.fetch({
      path: `/v1/rooms/${roomUuid}/users/${userUuid}/properties`,
      method: 'DELETE',
      data: data,
    });
    return res.data;
  }

  async upsertStream(
    roomUuid: string,
    userUuid: string,
    streamUuid: string,
    {
      publishVideo,
      publishAudio,
    }: {
      publishVideo?: AgoraRteMediaPublishState;
      publishAudio?: AgoraRteMediaPublishState;
    },
  ) {
    return await this.fetch({
      path: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        videoState: publishVideo,
        audioState: publishAudio,
      },
    });
  }

  async deleteStream(roomUuid: string, userUuid: string, streamUuid: string) {
    return await this.fetch({
      path: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'DELETE',
    });
  }

  async sendRoomChatMessage(message: string, roomUuid: string) {
    let res = await this.fetch({
      path: `/v1/rooms/${roomUuid}/chat/channel`,
      method: 'POST',
      data: {
        message: message,
        type: 1,
      },
    });
    return res.data;
  }
}
