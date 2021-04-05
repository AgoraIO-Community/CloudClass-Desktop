import AgoraRTM from 'agora-rtm-sdk'

export const RtmLogLevel = [
  AgoraRTM.LOG_FILTER_OFF,
  AgoraRTM.LOG_FILTER_ERROR,
  AgoraRTM.LOG_FILTER_INFO,
  AgoraRTM.LOG_FILTER_WARNING,
  //@ts-ignore
  AgoraRTM.LOG_FILTER_DEBUG
]

export type InternalStreamData = {
  streamUuid: string,
  streamName: string,
  videoSourceType: number,
  audioSourceType: number,
  videoState: number,
  audioState: number,
  userUuid: string,
  userName: string,
  role: string
}

export type RawUserData = {
  userUuid: string,
  userName: string,
  role: string,
  muteChat: number,
  userProperties: object,
  streamUuid: string,
  updateTime: number,
  state: number,
  type: number
}
export type UsersStreamData = {
  onlineUsers: RawUserData[],
  offlineUsers: RawUserData[],
  streams: InternalStreamData[]
}