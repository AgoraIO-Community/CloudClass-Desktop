import { AREA_CODE } from './../media-service/interfaces/index';
import { ApiBase, ApiBaseInitializerParams } from "./base";
import { get } from "lodash";
import { EduUser, StreamType, DeleteStreamType, AgoraFetchParams, ClassroomStateParams, UserQueryParams, StreamQueryParams, EduStreamParams, EduStream, ChannelMessageParams, PeerMessageParams, EduUserData, EduStreamData, EduCourseState } from "../../interfaces";
import { EduLogger } from '../logger';
import { HttpClient } from '../utils/http-client';
import { EntryRequestParams, UserStreamResponseData, UserStreamList, EduJoinRoomParams, JoinRoomResponseData } from "./interface";
import { rteReportService } from "./report-service";

export type CauseType = Record<string, any>

export type BatchStreamAttribute = {
  streamUuid: string
  userUuid: string
}

export type EduStreamAttribute = {
  streamUuid: string
  userUuid: string
  videoSourceType: number
  audioSourceType: number
  hasVideo: number
  hasAudio: number
}

export type BatchAttributes = {
  properties: Record<any, any>
  cause?: CauseType
}
export interface ILocalUserInfo {
  userUuid: string
  userToken: string
  rtmToken: string
  rtcToken: string
}

type PeerChatMessageParams = {
  message: string
  remoteUser: EduUser
  roomUuid: string
}

type RoomChatMessageParams = {
  message: string
  roomUuid: string
}

type CreateBizStreamParams = {
  roomUuid: string,
  userUuid: string,
  streamName: string,
  streamUuid: string,
  audioState: number,
  videoState: number,
  videoSourceType: number,
  audioSourceType: number
}

type UpdateBizStreamParams = {
  roomUuid: string,
  userUuid: string,
  streamName: string,
  streamUuid: string,
  audioState: number,
  videoState: number,
  videoSourceType: number,
  audioSourceType: number,
  generateToken: boolean
}

type DeleteBizStreamParams = {
  roomUuid: string,
  userUuid: string,
  streamUuid: string,
}

type RemoteMediaParams = {
  roomUuid: string
  userUuid: string
  streamUuid: string
  // audioState: number
  // videoState: number
}

type UpsertStreamsParams = {
  roomUuid: string
  streams: Array<StreamType>
}

type DeleteStreamsParams = {
  roomUuid: string
  streams: Array<DeleteStreamType>
}

export class AgoraEduApi extends ApiBase {
  roomUuid: string = '';
  appId!: string;
  authorization!: string;
  // _userToken: string = '';

  nextId?: string;

  localInfo?: ILocalUserInfo;

  latestTime: number = 0;

  private lastUserListTime: number = 0;
  private lastStreamListTime: number = 0;
  // private _prefix: string;

  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.appId = params.appId
    this.authorization = '',
    this.sdkDomain = params.sdkDomain
    this.nextId = undefined;
    this.latestTime = 0;
    this.lastUserListTime = 0;
    this.lastStreamListTime = 0;
    this.prefix = `${this.sdkDomain}/scene/apps/%app_id`.replace('%app_id', this.appId)
  }

  // constructor(
  //   public readonly appID: string,
  //   public readonly AUTHORIZATION: string,
  //   sdkDomain: string
  // ) {
  //   this.appId = appID;
  //   this.authorization = AUTHORIZATION;
  //   // this.setApiPrefix(this.appId);
  //   this.nextId = undefined;
  //   this.latestTime = 0;
  //   this.lastUserListTime = 0;
  //   this.lastStreamListTime = 0;
  //   this._prefix = `${sdkDomain}/scene/apps/%app_id`.replace('%app_id', this.appId)
  // }

  public updateLastTime(t: number) {
    this.latestTime = t
  }

  wait (time: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  async fetch (params: AgoraFetchParams) {
    const {
      method,
      token,
      data,
      full_url,
      url,
      type
    } = params
    const opts: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-agora-token': this.rtmToken,
        'x-agora-uid': this.rtmUid,
        // 'Authorization': `Basic ${this.AUTHORIZATION!.replace(/basic\s+|basic/i, '')}`
      }
    }

    if (this.localInfo?.userToken) {
      opts.headers['token'] = this.localInfo.userToken;
    }

    if (params.hasOwnProperty('token') && !token) {
      delete opts.headers['token']
    }
    
    if (data) {
      opts.body = JSON.stringify(data);
    }
  
    let resp: any;
    if (full_url) {
      resp = await HttpClient(`${full_url}`, opts);
    } else {
      const rawUrl = `${this.prefix}${url}`
      resp = await HttpClient(`${rawUrl}`, opts);
    }  
    
    // WARN: 需要约定状态码
    if (resp.code !== 0) {
      throw {message: resp.msg}
    }

    if (resp.data && resp.data.ts) {
      this.updateLastTime(resp.data.ts)
    }

    return resp
  }

  async getRoomConfig(roomId: string): Promise<any> {
    return await this.fetch({
      url: `/v1/rooms/${roomId}/config`,
      method: 'GET',
    })
  }

  async updateClassroomState(roomId: string, params: ClassroomStateParams) {
    return await this.fetch({
      url: `/v1/rooms/${roomId}/state`,
      method: 'PUT',
      data: params,
    })
  }

  // async getClassroomInfo(roomId: string) {
  //   return await this.fetch({
  //     url: `/v1/rooms/${roomId}/info`,
  //     method: 'GET',
  //   })
  // }

  async getUserList(roomUuid: string, params: UserQueryParams) {

    let qs = `/v1/rooms/${roomUuid}/users?count=${params.count}`

    if (params.nextId) {
      qs = `${qs}&nextId=${params.nextId}`
    }

    if (params.hasOwnProperty('includeOffline')) {
      qs = `${qs}&includeOffline=${params.includeOffline}`
    }

    if (params.hasOwnProperty('updateTimeOffset')) {
      qs = `${qs}&updateTimeOffset=${params.updateTimeOffset}`
    }

    let {data} = await this.fetch({
      url: qs,
      method: 'GET',
      data: params,
    })

    return data
  }

  async getStreamList(roomUuid: string, params: StreamQueryParams) {

    let qs = `/v1/rooms/${roomUuid}/users/streams?count=${params.count}`

    if (params.nextId) {
      qs = `${qs}&nextId=${params.nextId}`
    }

    if (params.hasOwnProperty('includeOffline')) {
      qs = `${qs}&includeOffline=${params.includeOffline}`
    }

    if (params.hasOwnProperty('updateTimeOffset')) {
      qs = `${qs}&updateTimeOffset=${params.updateTimeOffset}`
    }

    let {data} = await this.fetch({
      url: qs,
      method: 'GET',
      data: params,
    })
    return data
  }

  async createStream(roomId: string, params: EduStreamParams) {
    const {
      streamUuid,
      ...data
    } = params
    return await this.fetch({
      url: `/v1/rooms/${roomId}/streams/${streamUuid}`,
      method: 'POST',
      data: data
    })
  }

  async updatePublishStream(roomId: string, streamId: string, stream: EduStream) {
    return await this.fetch({
      url: `/v1/rooms/${roomId}/streams/${streamId}`,
      method: 'PUT',
      data: stream
    })
  }

  async removePublishStream(roomId: string, streamId: string, stream: EduStream) {
    return await this.fetch({
      url: `/v1/rooms/${roomId}/streams/${streamId}`,
      method: 'DELETE',
    })
  }

  async sendChannelMessage(data: ChannelMessageParams) {
    const {
      roomUuid,
      ...params
    } = data
    return await this.fetch({
      url: `/v1/rooms/${roomUuid}/message/broadcast`,
      method: 'POST',
      data: params
    })
  }

  async sendPeerMessage(data: PeerMessageParams) {
    const {
      roomUuid,
      ...params
    } = data

    return await this.fetch({
      url: `/v1/rooms/${roomUuid}/message/peer`,
      method: 'POST',
      data: params
    })
  }

  async exitRoom(roomId: string) {
    return await this.fetch({
      url: `/v1/rooms/${roomId}/exit`,
      method: 'POST',
    })
  }

  async entryRoom(params: EntryRequestParams): Promise<any> {
    // REPORT
    rteReportService.startTick('joinRoom', 'http', 'entry')
    const data = {
      userName: params.userName,
      role: params.role,
      streamUuid: params.streamUuid,
      // autoPublish: +params.autoPublish
    }

    let resp = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/users/${params.userUuid}/entry`,
      method: 'POST',
      data: data,
      token: params.token
    })
    const statusCode = resp['__status']
    const {code} = resp
    rteReportService.reportHttp('joinRoom', 'http', 'entry', statusCode, statusCode === 200, code)

    return resp.data
  }

  async fetchUsersStreams(nextId: string, count: number, updateTimeOffset: number = 0, includeOffline: number = 0): Promise<UserStreamResponseData> {

    let qs = `/v1/rooms/${this.roomUuid}/users/userStreams?count=${count}`

    if (updateTimeOffset) {
      qs = `${qs}&updateTimeOffset=${updateTimeOffset}`
    }

    if (includeOffline) {
      qs = `${qs}&includeOffline=${includeOffline}`
    }

    if (nextId) {
      qs = `${qs}&nextId=${nextId}`
    }

    const {data} = await this.fetch({
      url: qs,
      method: 'GET',
    })

    return {
      count: data.count,
      total: data.total,
      nextId: data.nextId,
      list: data.list,
      ts: data.ts,
    }
  }

  async fetchAllOfflineUsersStream (): Promise<UserStreamList> {
    let nextId = ''
    let streams: any[] = []
    let users: any[] = []
    let updateTime = 0
    do {
      let data = await this.fetchUsersStreams(nextId, 1000, this.latestTime, 1)
      nextId = data.nextId
      updateTime = data.ts
      const userList = data.list.reduce((acc: any[], userItem: any) => {
        const {streams, ...userAttrs} = userItem
        const targetIndex = acc.findIndex((it: any) => it.userUuid === userAttrs.userUuid)
        if (targetIndex !== -1) {
          // update stream lists
          acc[targetIndex] = userAttrs
        } else {
          // concat userAttrs
          acc = acc.concat([userAttrs])
        }
        // append to userList tail
        // acc = acc.concat([userAttrs])
        return acc
      }, users)


      const streamList = data.list.reduce((acc, item) => {
        const newStreams = item.streams
        const combineLatestStreamIndexList = newStreams.map((newStream: any, index: number) => {
          let oldStreamIndex = acc.findIndex((stream: any) => stream.streamUuid === newStream.streamUuid)
          return {
            oldStreamIndex: oldStreamIndex,
            newStreamIndex: index
          }
        })

        if (!combineLatestStreamIndexList.length) {
          EduLogger.warn("combineLatestStreamIndexList is empty", newStreams, combineLatestStreamIndexList)
        }
        for (let {oldStreamIndex, newStreamIndex} of combineLatestStreamIndexList) {
          if (oldStreamIndex !== -1) {
            acc[oldStreamIndex] = newStreams[newStreamIndex]
          } else {
            acc = acc.concat(item.streams)
          }
        }

        // append to streamList tail
        // acc = acc.concat(item.streams)
        return acc
      }, streams)
      users = users.concat(userList)
      streams = streams.concat(streamList)
    } while (nextId != null)
    if (updateTime) {
      this.latestTime = updateTime
    }
    return {
      users,
      streams
    }
  }

  async fetchAllOnlineUserStream (): Promise<UserStreamList> {
    let nextId = ''
    let streams: any[] = []
    let users: any[] = []
    do {
      let data = await this.fetchUsersStreams(nextId, 1000)
      EduLogger.info("fetchUsersStreams", data)
      nextId = data.nextId
      const userList = data.list.reduce((acc: any[], userItem: any) => {
        const {streams, ...userAttrs} = userItem
        const targetIndex = acc.findIndex((it: any) => it.userUuid === userAttrs.userUuid)
        if (targetIndex !== -1) {
          // update stream lists
          acc[targetIndex] = userAttrs
        } else {
          // concat userAttrs
          acc = acc.concat([userAttrs])
        }
        // append to userList tail
        // acc = acc.concat([userAttrs])
        return acc
      }, users)


      const streamList = data.list.reduce((acc, item) => {
        const newStreams = item.streams
        const combineLatestStreamIndexList = newStreams.map((newStream: any, index: number) => {
          let oldStreamIndex = acc.findIndex((stream: any) => stream.streamUuid === newStream.streamUuid)
          return {
            oldStreamIndex: oldStreamIndex,
            newStreamIndex: index
          }
        })

        if (!combineLatestStreamIndexList.length) {
          EduLogger.warn("combineLatestStreamIndexList is empty", newStreams, combineLatestStreamIndexList)
        }
        for (let {oldStreamIndex, newStreamIndex} of combineLatestStreamIndexList) {
          if (oldStreamIndex !== -1) {
            acc[oldStreamIndex] = newStreams[newStreamIndex]
          } else {
            acc = acc.concat(item.streams)
          }
        }

        // append to streamList tail
        // acc = acc.concat(item.streams)
        return acc
      }, streams)
      users = users.concat(userList)
      streams = streams.concat(streamList)
    } while (nextId != null)

    return {
      users: EduUserData.fromArray(users),
      streams: EduStreamData.fromArray(streams)
    }
  }

  async syncUserList(roomUuid: string): Promise<EduUserData[]> {
    let nextId = ''
    let list: EduUserData[] = []
    let lastTime = this.lastUserListTime
    let newLastTime = 0
    do {
      const res = await this.getUserList(roomUuid, {
        nextId: nextId ? nextId : undefined,
        updateTimeOffset: lastTime,
        includeOffline: 1,
        count: 1000,
      })
      newLastTime = res.ts
      nextId = res.nextId
      list = list.concat(EduUserData.fromArray(res.list))
    } while (nextId !== null)

    if (newLastTime) {
      this.lastUserListTime = newLastTime
    }
    return list
  }

  async syncStreamList(roomUuid: string): Promise<EduStreamData[]> {
    let nextId = ''
    let list: EduStreamData[] = []
    let lastTime = this.lastStreamListTime
    let newLastTime = 0
    do {
      const res = await this.getStreamList(roomUuid, {
        nextId: nextId ? nextId : undefined,
        updateTimeOffset: lastTime,
        includeOffline: 1,
        count: 1000,
      })
      newLastTime = res.ts
      nextId = res.nextId
      list = list.concat(EduStreamData.fromArray(res.list))
    } while (nextId !== null)

    if (newLastTime) {
      this.lastStreamListTime = newLastTime
    }
    return list
  }

  async subRoomData(params: any) {
    const {
      step,
      roomUuid,
      requestId,
      nextId,
      nextTs
    } = params
    try {
      let resp = await this.fetch({
        url: `/v1/rooms/${roomUuid}/sync`,
        method: 'POST',
        data: {
          step,
          requestId,
          nextId,
          nextTs
        }
      })
      EduLogger.info('subRoomData', resp)
      return resp.msg
    } catch (err) {
      throw err
    }
  }

  async joinRoom (params: EduJoinRoomParams): Promise<JoinRoomResponseData> {
    let entryRoomData = await this.entryRoom({
      userUuid: params.userUuid,
      roomUuid: params.roomUuid,
      userName: params.userName,
      role: params.userRole,
      streamUuid: params.streamUuid,
      // autoPublish: params.autoPublish,
      token: ''
    })

    this.roomUuid = params.roomUuid

    this.localInfo = {
      userToken: get(entryRoomData, 'user.userToken'),
      userUuid: get(entryRoomData, 'user.userUuid'),
      rtmToken: get(entryRoomData, 'user.rtmToken'),
      rtcToken: get(entryRoomData, 'user.rtcToken'),
    }

    const streams = get(entryRoomData, 'user.streams', [])

    return {
      room: {
        name: get(entryRoomData, 'room.roomInfo.roomName'),
        uuid: get(entryRoomData, 'room.roomInfo.roomUuid'),
        muteChat: {
          audience: get(entryRoomData, 'room.roomState.muteChat.audience'),
          broadcaster: get(entryRoomData, 'room.roomState.muteChat.broadcaster'),
          host: get(entryRoomData, 'room.roomState.muteChat.host'),
        },
        muteVideo: {
          audience: get(entryRoomData, 'room.roomState.muteVideo.audience'),
          host: get(entryRoomData, 'room.roomState.muteVideo.host'),
        },
        muteAudio: {
          audience: get(entryRoomData, 'room.roomState.muteAudio.audience'),
          host: get(entryRoomData, 'room.roomState.muteAudio.host'),
        },
        startTime: get(entryRoomData, 'room.roomState.startTime'),
        state: get(entryRoomData, 'room.roomState.state'),
        properties: get(entryRoomData, 'room.roomProperties'),
        createTime: get(entryRoomData, 'room.roomState.createTime')
      },
      user: {
        uuid: get(entryRoomData, 'user.userUuid'),
        name: get(entryRoomData, 'user.userName'),
        role: get(entryRoomData, 'user.role'),
        streamUuid: get(entryRoomData, 'user.streamUuid'),
        userToken: get(entryRoomData, 'user.userToken'),
        rtmToken: get(entryRoomData, 'user.rtmToken'),
        rtcToken: get(entryRoomData, 'user.rtcToken'),
        // muteChat: get(entryRoomData, 'user.muteChat'),
        streams,
        properties: get(entryRoomData, 'user.userProperties', {}),
      }
    }
  }

  async upsertBizStream(args: CreateBizStreamParams): Promise<any> {
    const {
      roomUuid,
      userUuid,
      streamName,
      streamUuid,
      videoSourceType,
      audioSourceType,
      videoState,
      audioState,
    } = args


    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        streamName,
        userUuid,
        videoSourceType,
        audioSourceType,
        videoState: +videoState,
        audioState: +audioState,
      }
    })

    const respData = res.data

    return {
      streamUuid: respData.streamUuid,
      rtcToken: respData.rtcToken,
      ts: res.ts
    }
  }

  async createBizStream(args: CreateBizStreamParams): Promise<any> {
    const {
      roomUuid,
      userUuid,
      streamName,
      streamUuid,
      videoSourceType,
      audioSourceType,
      videoState,
      audioState,
    } = args

    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'POST',
      data: {
        streamName,
        userUuid,
        videoSourceType,
        audioSourceType,
        videoState,
        audioState
      }
    })

    const respData = res.data

    return {
      streamUuid: respData.streamUuid,
      rtcToken: respData.rtcToken,
      ts: res.ts
    }
  }

  async updateBizStream(args: UpdateBizStreamParams): Promise<any> {
    const {
      roomUuid,
      userUuid,
      streamName,
      streamUuid,
      // videoSourceType,
      // audioSourceType,
      videoState,
      audioState,
      generateToken
    } = args

    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        streamName,
        // videoSourceType,
        // audioSourceType,
        videoState,
        audioState,
        generateToken
      }
    })

    const respData = res.data

    return {
      streamUuid: respData.streamUuid,
      rtcToken: respData.rtcToken,
      ts: res.ts
    }
  }

  async deleteBizStream(args: DeleteBizStreamParams): Promise<any> {
    const {
      roomUuid,
      userUuid,
      streamUuid,
    } = args

    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'DELETE',
    })

    return {
      ...res.data,
      ts: res.ts
    }
  }

  async sendRoomChatMessage(args: RoomChatMessageParams): Promise<any> {
    const {
      message,
      roomUuid,
    } = args
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/chat/channel`,
      method: 'POST',
      data: {
        message: message,
        type: 1,
      }
    })
    return res.data
  }

  async sendUserChatMessage(args: PeerChatMessageParams): Promise<any> {
    const {
      message,
      remoteUser,
      roomUuid,
    } = args
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${remoteUser.userUuid}/messages/peer`,
      method: 'POST',
      data: {
        message: message,
        type: 1,
      }
    })
    return res.data
  }

  async updateCourseState(params: {roomUuid: string, courseState: EduCourseState}) {
    let res = await this.fetch({
      url: `/v1/rooms/${params.roomUuid}/states/${params.courseState}`,
      method: 'PUT',
      data: {}
    })
    
    return res.data;
  }

  async updateRoomProperties({roomUuid, key, value, cause}: {roomUuid: string, key: string, value: string, cause?: string}) {
    const data: any = {value}
    if (cause) {
      data.cause = cause
    }

    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/properties/${key}`,
      method: 'PUT',
      data: data
    })
    return res.data;
  }

  async updateRoomBatchProperties({roomUuid, properties, cause}: {roomUuid: string, properties: object, cause?: string}) {
    const data: any = { properties }
    if (cause) {
      data.cause = cause
    }

    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/properties`,
      method: 'PUT',
      data: data
    })
    return res.data;
  }

  async allowStudentChatByRole(args: {enable: boolean, roomUuid: string, roles: string[]}) {
    const muteChat = {}
    args.roles.reduce((acc: any, key: string) => {
      acc[key] = +args.enable
      return acc
    }, muteChat)

    let res = await this.fetch({
      url: `/v1/rooms/${args.roomUuid}/roles/mute`,
      method: 'PUT',
      data: {
        muteChat
      }
    })
    return res.data
  }

  async stopShareScreen(roomUuid: string, streamUuid: string, userUuid: string) {
    await this.deleteBizStream({
      roomUuid: roomUuid,
      streamUuid: streamUuid,
      userUuid: userUuid
    })
  }

  async allowRemoteStudentChat({roomUuid, userUuid, muteChat}: any): Promise<any> {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}`,
      method: 'PUT',
      data: {
        muteChat
      }
    })
    return res.data;
  }

  async kickUser(args: {roomUuid: string, userUuid: string}) {
    let res = await this.fetch({
      url: `/v1/rooms/${args.roomUuid}/users/${args.userUuid}/exit`,
      method: 'POST',
    })
    return res.data;
  }

  async inviteUserPublishStream({roomUuid, userUuid, streamUuid}: RemoteMediaParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        videoState: 1,
        audioState: 1
      }
    })
    return res.data
  }

  async remoteStartStudentCamera({roomUuid, userUuid, streamUuid}: RemoteMediaParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        videoState: 1,
        generateToken: false
      }
    })
    return res.data
  }

  async remoteCloseStudentStream({roomUuid, userUuid, streamUuid}: RemoteMediaParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'DELETE',
      data: {}
    })
    return res.data
  }

  async remoteStopStudentCamera({roomUuid, userUuid, streamUuid}: RemoteMediaParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        videoState: 0,
        generateToken: false
      }
    })
    return res.data
  }

  async remoteStartStudentMicrophone({roomUuid, userUuid, streamUuid}: RemoteMediaParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        audioState: 1,
        generateToken: false
      }
    })
    return res.data
  }

  async remoteStopStudentMicrophone({roomUuid, userUuid, streamUuid}: RemoteMediaParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/streams/${streamUuid}`,
      method: 'PUT',
      data: {
        audioState: 0,
        generateToken: false
      }
    })
    return res.data
  }

  // 批量新增流 
  async batchUpsertStream({roomUuid, streams}: UpsertStreamsParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/streams`,
      method: 'PUT',
      data: {
        streams: streams
      }
    })
    return res.data
  }

  // 批量删除流
  async batchDeleteStream({roomUuid, streams}: DeleteStreamsParams) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/streams`,
      method: 'DELETE',
      data: {
        streams: streams
      }
    })
    return res.data
  }

  async login(userUuid: string): Promise<any> {
    let res = await this.fetch({
      url: `/v1/users/${userUuid}/login`,
      method: 'POST',
      data: {}
    })
    return res.data
  }

  async syncSnapShot(roomUuid: string): Promise<any> {
    EduLogger.info('[syncing] , userToken: ', this.localInfo?.userToken)
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/snapshot`,
      method: 'GET',
    })
    const data = res.data
    const roomInfo = get(data, 'snapshot.room.roomInfo', null)
    const roomProperties = get(data, 'snapshot.room.roomProperties', null)
    const roomState = get(data, 'snapshot.room.roomState', null)
    return {
      seq: get(data, 'sequence', 0),
      roomInfo,
      roomState,
      roomProperties,
      users: get(data, 'snapshot.users', [])
    }
  }

  // EDU-STATE-NOTE: ignore count
  async syncSequence(roomUuid: string, seqId: number, count?: number) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/sequences?nextId=${seqId}`,
      method: 'GET',
    })
    return res.data
  }

  // /**
  //  * 批量更新用户属性
  //  * @param roomUuid 房间id
  //  * @param userUuid 用户id
  //  * @param properties 属性
  //  */
  // async batchUpdateUserAttributes(roomUuid: string, userUuid: string, properties: BatchAttributes, cause?: CauseType) {
  //   let res = await this.fetch({
  //     url: `/v1/rooms/${roomUuid}/users/${userUuid}/properties`,
  //     method: 'PUT',
  //     data: {
  //       properties,
  //       cause
  //     }
  //   })
  //   return res.data;
  // }

  /**
   * 批量移除用户属性
   * @param roomUuid 房间id
   * @param userUuid 用户id
   */
  async batchRemoveUserAttributes(roomUuid: string, userUuid: string, cause?: CauseType) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/users/${userUuid}/properties`,
      method: 'DELETE',
      data: {
        cause
      }
    })
    return res.data;
  }


  /**
   * 批量更新房间属性
   * @param roomUuid roomUuid: string
   * @param properties properties: Object 
   */
  async batchUpdateRoomAttributes(roomUuid: string, properties: BatchAttributes, cause?: CauseType) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/properties`,
      method: 'PUT',
      data: {
        properties,
        cause
      }
    })
    console.log(`batchUpdateRoomAttributes: `, res.data)
    return res.data;
  }

  /**
   * 批量移除房间属性
   * @param roomUuid roomUuid: string
   */
  async batchRemoveRoomAttributes(roomUuid: string, cause?: CauseType) {
    let res = await this.fetch({
      url: `/v1/rooms/${roomUuid}/properties`,
      method: 'DELETE',
      data: {
        cause
      }
    })
    return res.data;
  }

  /**
   * 批量移除流属性
   * @param streamUuid 
   */
  async batchRemoveStreamAttributes(streams: BatchStreamAttribute[], cause?: CauseType) {
    let res = await this.fetch({
      url: `/v1/rooms/${this.roomUuid}/streams`,
      method: 'DELETE',
      data: {
        streams,
        cause
      }
    })
    return res.data;
  }

  /**
   * 批量更新流属性
   * @param streamUuid 
   * @param properties 
   */
  async batchUpdateStreamAttributes(streams: EduStreamAttribute[], cause?: CauseType) {
    let res = await this.fetch({
      url: `/v1/rooms/${this.roomUuid}/streams`,
      method: 'put',
      data: {
        streams,
        cause
      }
    })
    return res.data;
  }
}
