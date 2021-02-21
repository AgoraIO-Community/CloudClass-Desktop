export interface RoomResponseData {
  roomName: string
  roomUuid: string
  roleConfig: any
}

export enum EduRoomType {
  SceneType1v1 = 0,
  SceneTypeSmallClass = 1,
  SceneTypeBigClass = 2,
  SceneTypeBreakoutClass = 3,
  SceneTypeMiddleClass = 4
}

export enum EnumBoardState {
  follow = 1,
  unfollow = 0,
  grantPermission = 1,
  revokePermission = 0
}

export interface BoardUserAttrs {
  userUuid: string
  userName: string
  role: string
  grantPermission: number
}

export interface BoardInfoResponse {
  info: {
    boardId: string
    boardToken: string
  }
  state: {
    follow: number
    grantUsers: BoardUserAttrs[]
  }
}

export enum EnumChatState {
  unmute = 0,
  mute = 1,
}

export interface EntryRoomParams {
  userName: string
  userUuid: string
  role: number
}

export enum EnumVideoState {
  unmute = 0,
  mute = 1,
  disable = 2,
}

export enum EnumAudioState {
  unmute = 0,
  mute = 1,
  disable = 2,
}

export interface EntryRequestParams {
  userUuid: string
  roomUuid: string
  userName: string
  role: string
  streamUuid: string
  // autoPublish: boolean
  token: string
}

export enum EnumOnlineState {
  offline = 0,
  online = 1,
}

export interface AgoraEduUser {
  userName: string
  userUuid: string
  role: string
  muteChat: number
  state: EnumOnlineState
  updateTime?: number
}

export interface AgoraEduStream {
  streamUuid: string
  streamName: string
  videoSourceType: EduVideoSourceType
  audioSourceType: EduAudioSourceType
  videoState: EnumVideoState
  audioState: EnumAudioState
  updateTime?: number
  state: EnumOnlineState
}

export interface EduJoinRoomParams {
  userUuid: string
  roomUuid: string
  userName: string
  userRole: string
  streamUuid: string
  // autoPublish: boolean
}

export interface SyncRoomRequestParams {
  roomUuid: string
  userUuid: string

}

export interface UserStreamResponseData {
  count: number
  total: number
  nextId: string
  list: any[]
  ts: number
  // localUser: AgoraEduUser
  // localStreams: AgoraEduStream[]
  // users: AgoraEduUser[]
  // streams: AgoraEduStream[]
}

export interface UserStreamList {
  users: any[]
  streams: any[]
}

export interface JoinRoomResponseData {
  room: {
    name: string
    uuid: string
    muteChat: {
      audience: EnumChatState
      broadcaster: EnumChatState
      host: EnumChatState
    }
    muteVideo: {
      audience: EnumVideoState
      host: EnumVideoState
    }
    muteAudio: {
      audience: EnumAudioState
      host: EnumAudioState
    }
    startTime: number
    state: number
    properties: any
  }
  user: {
    uuid: string
    name: string
    role: string
    streamUuid: string
    userToken: string
    rtmToken: string
    rtcToken: string
    muteChat: EnumChatState
    streams: any[]
    properties: any
  }
}

export interface EduClassroomInitOption {
  channelName: string
  uid: string
  token: string
}