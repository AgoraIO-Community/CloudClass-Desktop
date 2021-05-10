import { get } from "lodash"
import { EduCustomMessage, EduStreamData, EduTextMessage, EduUserData } from "../../interfaces"
import { EduLogger } from "../logger"
import { GenericErrorWrapper } from "../utils/generic-error"
import { EduStreamRawData, RawUserData, UsersStreamData } from "./constants"

export class MessageSerializer {

  static readMessage(message: string) {
    try {
      return JSON.parse(message)
    } catch (err) {
      EduLogger.warn(`${GenericErrorWrapper(err)}`)
      return null
    }
  }

  static getStreamsFromUserList(data: any) {
    EduLogger.info('getStreamsFromUserList#data', data)
    const streamList: EduStreamData[] = []
    return streamList
  }

  static getOperator(data: any) {
    return {
      userUuid: get(data, 'operator.userUuid'),
      userName: get(data, 'operator.userName'),
      role: get(data, 'operator.role'),
    }
  }

  static getFromUser(data: any) {
    return {
      userUuid: get(data, 'fromUser.userUuid') as string,
      userName: get(data, 'fromUser.userName') as string,
      role: get(data, 'fromUser.role') as any,
    }
  }

  static getEduCustomMessage(data: any): EduCustomMessage {
    return {
      fromUser: this.getFromUser(data),
      message: get(data, 'message'),
      timestamp: get(data, 'ts'),
    }
  }

  static getEduTextMessage(data: any): EduTextMessage {
    return {
      fromUser: this.getFromUser(data),
      type: get(data, 'type'),
      message: get(data, 'message'),
      messageId: get(data, 'messageId'),
      sensitiveWords: get(data, 'sensitiveWords', []),
      timestamp: get(data, 'ts') || get(data, 'sendTime'),
    }
  }

  static getEduPeerTextMessage(data: any): EduTextMessage {
    return {
      fromUser: this.getFromUser(data),
      type: get(data, 'type'),
      message: get(data, 'message'),
      messageId: get(data, 'peerMessageId'),
      sensitiveWords: get(data, 'sensitiveWords', []),
      timestamp: get(data, 'ts') || get(data, 'sendTime'),
    }
  }

  static getRoomInfo(data: any): any {
    return {
      roomInfo: get(data, 'roomInfo'),
      roomState: get(data, 'roomState')
    }
  }

  static getUserStream(data: any): any {
    return {
      step: get(data, 'step'),
      count: get(data, 'count'),
      total: get(data, 'total'),
      nextId: get(data, 'nextId'),
      nextTs: get(data, 'nextTs'),
      isFinished: get(data, 'isFinished'),
      list: get(data, 'list'),
    }
  }

  static roomStatus(data: any) {
    return {
      courseState: data.state,
      startTime: data.startTime,
      isStudentChatAllowed: this.isStudentChatAllowed(data),
      onlineUsersCount: this.onlineUsersCount(data)
    }
  }

  static onlineUsersCount(data: any) {
    return get(data.users, 'length', 0)
  }

  static isStudentChatAllowed(data: any) {
    const audience = get(data, 'muteChat.audience')
    const broadcaster = get(data, 'muteChat.broadcaster')
    if (audience || broadcaster) {
      return false
    }
    return true
  }

  static extractStreamsFromUser(_data: unknown) {
    const data = _data as EduStreamRawData<RawUserData>
    return data?.streams ?? []
  }

  static getUsersStreams(_data: unknown) {
    const data = _data as UsersStreamData
    EduLogger.info("[serializer] getUserStreams: ", data)
    let eduStreams: EduStreamData[] = [];
    const dataOnlineUsers = data?.onlineUsers ?? []
    const rawOnlineUsers = dataOnlineUsers
      .reduce((acc: unknown[], it: RawUserData) => {
        acc.push({
          userUuid: it.userUuid,
          userName: it.userName,
          role: it.role,
          // isChatAllowed: it.muteChat,
          // muteChat: it.muteChat,
          userProperties: it.userProperties,
          streamUuid: it.streamUuid,
          updateTime: it.updateTime,
          state: it.state,
          type: it.type,
        })

        const rawStreams = this.extractStreamsFromUser(it)

        EduLogger.info("[serializer] getUsersStreams, extractRawStreams: ", JSON.stringify(rawStreams))

        const tmpStreams = rawStreams.map((stream: any) => ({
          streamUuid: stream.streamUuid,
          streamName: stream.streamName,
          videoSourceType: stream.videoSourceType,
          audioSourceType: stream.audioSourceType,
          videoState: stream.videoState,
          audioState: stream.audioState,
          userInfo: {
            userUuid: it.userUuid,
            userName: it.userName,
            role: it.role,
          },
          state: stream.state,
        }))


        eduStreams = eduStreams.concat(EduStreamData.fromArray(tmpStreams))
        return acc
      }, [])

    const dataOfflineUsers = data?.offlineUsers ?? []
    const rawOfflineUsers = dataOfflineUsers
      .reduce((acc: unknown[], it: RawUserData) => {
        acc.push({
          userUuid: it.userUuid,
          userName: it.userName,
          role: it.role,
          // isChatAllowed: it.muteChat,
          // muteChat: it.muteChat,
          userProperties: it.userProperties,
          streamUuid: it.streamUuid,
          updateTime: it.updateTime,
          state: it.state,
          type: it.type,
        })

        const rawStreams = this.extractStreamsFromUser(it)

        EduLogger.info("[serializer] rawOfflineUsers getUsersStreams, extractRawStreams: ", JSON.stringify(rawStreams))

        const tmpStreams = rawStreams.map((stream: any) => ({
          streamUuid: stream.streamUuid,
          streamName: stream.streamName,
          videoSourceType: stream.videoSourceType,
          audioSourceType: stream.audioSourceType,
          videoState: stream.videoState,
          audioState: stream.audioState,
          userInfo: {
            userUuid: it.userUuid,
            userName: it.userName,
            role: it.role,
          },
          state: stream.state,
        }))
        eduStreams = eduStreams.concat(EduStreamData.fromArray(tmpStreams))
        return acc
      }, [])

    const onlineUsers = EduUserData.fromArray(rawOnlineUsers)
    const offlineUsers = EduUserData.fromArray(rawOfflineUsers)

    const onlineStreams = eduStreams.filter((it: EduStreamData) => it.state !== 0)
    const offlineStreams = eduStreams.filter((it: EduStreamData) => it.state === 0)

    EduLogger.info("[EduUsersStreams] onlineUsers: ", onlineUsers)
    EduLogger.info("[EduUsersStreams] offlineUsers: ", offlineUsers)

    EduLogger.info("[EduUsersStreams] onlineStreams: ", onlineStreams)
    EduLogger.info("[EduUsersStreams] offlineStreams: ", offlineStreams)

    return {
      onlineUsers: onlineUsers,
      onlineStreams: onlineStreams,
      offlineUsers: offlineUsers,
      offlineStreams: offlineStreams,
    }
  }

  static getUsers(data: any) {
    const onlineUsers = EduUserData
      .fromArray(
        get(data, 'onlineUsers', []).map((it: any) => ({
          userUuid: it.userUuid,
          userName: it.userName,
          role: it.role,
          // isChatAllowed: it.muteChat,
          // muteChat: it.muteChat,
          userProperties: it.userProperties,
          streamUuid: it.streamUuid,
          updateTime: it.updateTime,
          state: it.state,
        }))
      )
    const offlineUsers = EduUserData
      .fromArray(
        get(data, 'offlineUsers', []).map((it: any) => ({
          userUuid: it.userUuid,
          userName: it.userName,
          state: it.state,
          role: it.role,
          // isChatAllowed: it.muteChat,
          // muteChat: it.muteChat,
          userProperties: it.userProperties,
          streamUuid: it.streamUuid,
          updateTime: it.updateTime,
        }))
      )
    return {
      onlineUsers: onlineUsers,
      offlineUsers: offlineUsers,
    }
  }

  static getChangedUser(data: any): EduUserData {
    const attrs = {
      userUuid: get(data, 'userUuid'),
      userName: get(data, 'userName'),
      role: get(data, 'role'),
      updateTime: get(data, 'updateTime'),
      state: get(data, 'state', 1),
      // isChatAllowed: get(data, 'muteChat'),
      // muteChat: get(data, 'muteChat'),
      userProperties: get(data, 'userProperties'),
      streamUuid: get(data, 'streamUuid'),
    }
    return new EduUserData(attrs)
  }

  static getAction(data: any) {
    return get(data, 'action')
  }

  static getStreams(data: any): EduStreamData[] {
    const eduStream = new EduStreamData({
      streamUuid: get(data, 'streamUuid') as string,
      streamName: get(data, 'streamName') as string,
      videoSourceType: +get(data, 'videoSourceType', 0),
      audioSourceType: +get(data, 'audioSourceType', 0),
      hasVideo: !!get(data, 'videoState', 0),
      hasAudio: !!get(data, 'audioState', 0),
      updateTime: get(data, 'updateTime'),
      state: get(data, 'state'),
      userInfo: this.getFromUser(data)
    })
    return [eduStream]
  }

  static getStreamList(data: any): EduStreamData[] {
    const acc: EduStreamData[] = []
    return data.streams.reduce((acc: EduStreamData[], item: any) => {
      acc = acc.concat(new EduStreamData({
        streamUuid: get(item, 'streamUuid') as string,
        streamName: get(item, 'streamName') as string,
        videoSourceType: +get(item, 'videoSourceType', 0),
        audioSourceType: +get(item, 'audioSourceType', 0),
        hasVideo: !!get(item, 'videoState', 0),
        hasAudio: !!get(item, 'audioState', 0),
        updateTime: get(item, 'updateTime'),
        state: get(item, 'state'),
        userInfo: this.getFromUser(item)
      }))
      return acc
    }, acc)
  }

  static getFollowMode(data: any) {
    return +get(data, 'followMode') as number
  }

  static getBoardUsersState(data: any) {
    return data.reduce((acc: any, user: any) => {
      if (user.userUuid) {
        acc.push(user)
      }
      return acc
    }, [])
  }
}