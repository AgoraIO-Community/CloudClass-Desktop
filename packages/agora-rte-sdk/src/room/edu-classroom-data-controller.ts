import { diff } from 'deep-diff';
import { cloneDeep, get, isEmpty, merge, pick, set, setWith } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { EduLogger } from '../core/logger';
import { AgoraWebStreamCoordinator } from '../core/media-service/web/coordinator';
import {
  EduAudioSourceType,
  EduChannelMessageCmdType, EduClassroomAttrs,
  EduRoomAttrs,
  EduStream, EduStreamData,
  EduTextMessage, EduUserAttrs, EduUserData,
  EduVideoSourceType
} from '../interfaces';
import { EduClassroomManager } from '../room/edu-classroom-manager';
import { MessageSerializer } from './../core/rtm/message-serializer';
import { CauseType } from './../core/services/edu-api';
import { isPatchProperty, noBlankChars } from './../utils/syntax';
import { EduClassroomManagerEventHandlers, LocalStreamType, SingleParameter } from './types';
import { OperatorUser, defaultOperatorUser, defaultCause} from './types';

const transformDotStrToObject = (pathStr: string, value: any) => pathStr
    .split(".")
    .reverse()
    .reduce((acc: any, path: any, index: number) => ({
        [path]: index === 0 ? value : acc
    }), {})

enum DataEnumType {
  users = 1,
  streams = 2,
  classRoom = 3,
  chat = 4
}

export type SeqData = {
  seqId: number
  data: any
  cmd: number
}

export type SeqRawData = Pick<SeqData, 'data' | 'cmd'>

type SeqDataMap = Record<string, SeqRawData>

export class EduClassroomDataController {

  private _roomAttrs?: EduRoomAttrs = undefined
  private _localUser?: EduUserData = undefined;
  private _streamList: EduStreamData[] = [];
  private _userList: EduUserData[] = [];

  private _localUserUuid: string = ''
  public streamCoordinator?: AgoraWebStreamCoordinator

  setLocalUserUuid(v: string) {
    this._localUserUuid = v
  }

  get localUserUuid(): string {
    return this._localUserUuid as string
  }

  private _userToken?: string = undefined

  get userToken(): string {
    return this._userToken as string;
  }

  public setUserToken(t: string) { 
    this._userToken = t
  }

  get roomAttrs(): EduRoomAttrs {
    return this._roomAttrs as EduRoomAttrs
  }

  get roomUuid(): string {
    return this._roomInfo?.roomUuid
  }

  private roomManager: EduClassroomManager

  private _id: string

  private _curSeqId: number | null;

  private _bufferMap: SeqDataMap

  public setCurrentSeqId(v: number) {
    this._curSeqId = v
    this._latestSeqId = Math.max(this._latestSeqId, this._curSeqId)
    EduLogger.info("[seqId] setCurrentSeqId, curSeqId: ", this._curSeqId, " latestSeqId: ", this._latestSeqId)
    this.roomManager.emit('seqIdChanged', {
      curSeqId: this._curSeqId,
      latestSeqId: this._latestSeqId
    })
  }

  public get curSeqId(): number {
    return this._curSeqId as number;
  }

  private _latestSeqId = 0

  public get missingSeqId(): boolean {
    if (this._curSeqId !== this._latestSeqId && this._latestSeqId !== 0) {
      return true
    }
    return false
  }
  public syncSequenceTimes: number = 0

  // public async sendSyncData(full: boolean) {
  //   if (!full && this.syncSequenceTimes > 0) {
  //     await this.syncFromCurrentSequenceId()
  //   } else {
  //     await this.syncFullSequence()
  //   }
  // }

  fire<EventName extends keyof EduClassroomManagerEventHandlers>(
    eventName: EventName,
    parameter: SingleParameter<EduClassroomManagerEventHandlers[EventName]>
  ): void {
    if (eventName === 'local-user-removed') {
      console.log(" fire # local-user-removed ", JSON.stringify(parameter))
    }
    this.roomManager.emit(eventName, parameter)
  }

  public syncingData: boolean = false

  public async syncData(full: boolean, delay: number) {
    if (this.syncingData) {
      EduLogger.warn('already syncing data')
      return
    }

    this.syncingData = true

    if (!full) {
      await this.syncFromCurrentSequenceId()
      this.syncingData = false
    } else {
      await this.syncFullSequence()
      this.syncingData = false
    }
    this.asyncBatchUpdateData(delay)
  }

  private syncTimer: any = null

  public asyncBatchUpdateData(delay: number) {
    if (this.syncTimer === null) {
      this.syncTimer = setTimeout(() => {
        this.BatchUpdateData()
        clearTimeout(this.syncTimer)
        this.syncTimer = null
      }, delay)
    }
  }

  public BatchUpdateData() {
    const bufferMap = this._bufferMap
    const taskBuffer = []
    for (let seqId of Object.keys(bufferMap)) {
      const buffer = bufferMap[`${seqId}`]
      if (buffer) {
        if (this._curSeqId) {
          if (+seqId <= +this._curSeqId) {
            // if it's initState, it's meaningful to do a full overwrite
            let {cmd} = buffer
            if(cmd === EduChannelMessageCmdType.initState) {
              taskBuffer.push({
                seqId: +seqId,
                ...buffer
              })
              this.setCurrentSeqId(+seqId)
              // this._curSeqId = +seqId
              delete this._bufferMap[`${seqId}`]
              EduLogger.info("[seqId] snapshot overwrite", seqId, this._curSeqId)
            } else {
              // if not initState cmd, ignore
              delete this._bufferMap[`${seqId}`]
              continue;
            }
          } else {
            if (+seqId === this._curSeqId+1) {
              taskBuffer.push({
                seqId: +seqId,
                ...buffer
              })
              this.setCurrentSeqId(+seqId)
              // this._curSeqId = +seqId
              delete this._bufferMap[`${seqId}`]
            } else {
              if (+seqId === +this._curSeqId) break;
              EduLogger.info("[seqId] greaterThanSeqId, is consequence")
              EduLogger.warn('is consequence', this._curSeqId)
              const onSuccess = () => {
                EduLogger.warn('[seqId] syncData success', this._curSeqId, this._latestSeqId)
              }
              const onFailure = () => {
                EduLogger.warn('[seqId] syncData missingSeqId failure', this._curSeqId, this._latestSeqId)
              }
              this.syncData(false, 300)
                .then(onSuccess)
                .catch(onFailure)
              break;
            }
          }
        } else {
          taskBuffer.push({
            seqId: +seqId,
            ...buffer
          })
          this.setCurrentSeqId(+seqId)
          delete this._bufferMap[`${seqId}`]
        }
      } else {
        EduLogger.info(`[${this._id} [seqId] gaping !!!`)
        break;
      }
    }
    EduLogger.info(`[${this._id}] [seqId] fetch bufferMap `, bufferMap, ' taskBuffer ', taskBuffer)
    for (let it of taskBuffer) {

      const {cmd, data, seqId} = it as any

      EduLogger.info("[seqId] data ", it)

      switch(cmd) {
        // init full user
        case EduChannelMessageCmdType.initState: {
          this.setRoomInfo(data.roomInfo)
          this.setRoomStatus(MessageSerializer.roomStatus(data.roomState), {})
          this.setRoomProperties(data.roomProperties)
          this.setRawUsers(data.users)
          EduLogger.info(`[initState] [${this._id}] [${seqId}] set latest currentId, seqId: `)
          break;
        }
        // classroom-property-updated
        // course state
        // classroom-property-updated
        // room media state
        case EduChannelMessageCmdType.courseState: {
          this.setRoomStatus({
            courseState: data.state,
            startTime: data.startTime,
          }, data.cause)
          EduLogger.info(`[courseState] [${this._id}] [${seqId}]#setRoomStatus: `, data)
          break;
        }

        case EduChannelMessageCmdType.roomMediaState: {
          EduLogger.info(`[roomMediaState] [${this._id}] before [${seqId}]#setRoomStatus: `, data)
          this.setRoomStatus({
            isStudentChatAllowed: MessageSerializer.isStudentChatAllowed(data),
          }, data.cause)
          EduLogger.info(`[roomMediaState] [${this._id}] after [${seqId}]#setRoomStatus: `, data)
          break;
        }
        // room user list changed
        // user-joined
        // user-removed
        case EduChannelMessageCmdType.userListChanged: {
          const {
            onlineUsers,
            offlineUsers,
            onlineStreams,
            offlineStreams,
          } = MessageSerializer.getUsersStreams(data)

          const cause = data?.cause ?? {}

          const operator = data?.operator ?? {}
          
          EduLogger.info(`[userListChanged] [${this._id}] before [${seqId}]#updateUsersStreams:  rawData `, data)
          EduLogger.info(`[userListChanged] [${this._id}] before [${seqId}]#updateUsersStreams:  serializedData`,
            'onlineUsers ', onlineUsers,
            'offlineUsers ', offlineUsers,
            'onlineStreams ', onlineStreams,
            'offlineStreams ', offlineStreams)
          this.updateUserList(onlineUsers, offlineUsers, operator, cause, seqId)
          this.updateStreamList(onlineStreams, offlineStreams, operator, cause, seqId)

          EduLogger.info(`[userListChanged] [${this._id}] after [${seqId}]#updateUsersStreams: userList, `, this._userList, ' streamList ', this._streamList)
          break;
        }
        // users-updated
        case EduChannelMessageCmdType.userStateUpdated: {
          EduLogger.info(`[userStateUpdated] [${this._id}] before [${seqId}]#updateUserState: `, JSON.stringify(data))
          const user = MessageSerializer.getChangedUser(data)
          this.updateUserState(user)

          EduLogger.info(`[userStateUpdated] [${this._id}] after [${seqId}]#updateUserState: `, data)
          EduLogger.info(`[userStateUpdated] [${this._id}] after [${seqId}]#updateUserState: `, user)
          break;
        }
        // userListBatchUpdated
        case EduChannelMessageCmdType.userListBatchUpdated: {
          EduLogger.info(`[userListBatchUpdated] [${this._id}] before [${seqId}]#userListBatchUpdated: `, JSON.stringify(data))

          const cmd = data?.cause?.cmd ?? -1

          const fromUser = data?.fromUser

          const userOperator = data?.operator

          const cause = data?.cause ?? undefined

          const operations: Record<string, CallableFunction> = {
            4: (data: any) => {
              const changeProperties = data.changeProperties
              return {
                ...changeProperties
              }
            },
            // muted chat
            6: (data: any) => {
              const changeProperties = data.changeProperties
              const isMuteChat = changeProperties.hasOwnProperty('mute.muteChat')
              if (isMuteChat) {
                return {
                  muteChat: changeProperties['mute.muteChat'],
                }
              }
            }
          }

          const operator = operations[cmd]
          if (operator) {
            const res = operator(data)
            // mute chat 
            if (res.hasOwnProperty('muteChat')) {
              this.updateUserChatMute(
                {
                  muteChat: res.muteChat,
                  userUuid: fromUser.userUuid
                },
                userOperator,
                cause
                )
            }
            if (res.hasOwnProperty('device.camera') || res.hasOwnProperty('device.mic')) {
              const [path] = Object.keys(res)
              const value = res[path]
              this.updateUserDevice(
                {
                  path,
                  value,
                  userUuid: fromUser.userUuid
                },
                userOperator,
                cause
              )
            }
          } else {
            const user = MessageSerializer.getChangedUser(data)
            EduLogger.info(`[userListBatchUpdated] [${this._id}] after serialized [getChangedUser] `, JSON.stringify(user))
            this.updateUserState(user)
            EduLogger.info(`[userListBatchUpdated] [${this._id}] after serialized [getChangedUser] `, JSON.stringify(user))
          }
          break;
        }

        case EduChannelMessageCmdType.streamListChanged: {
          const action = MessageSerializer.getAction(data)
          const streams = MessageSerializer.getStreams(data)
          const operatorUser = MessageSerializer.getOperator(data)
          const cause = data?.cause ?? {}

          const onlineStreams = streams.filter((it: EduStreamData) => it.state !== 0)
          const offlineStreams = streams.filter((it: EduStreamData) => it.state === 0)
          EduLogger.info(`[streamListChanged] [${this._id}] before [${seqId}]#updateStreamList: data`, data)
          EduLogger.info(`[streamListChanged] [${this._id}] before [${seqId}]#updateStreamList: onlineStreams `, onlineStreams,  ' offlineStreams ', offlineStreams, ' operatorUser ', operatorUser)
          this.updateStreamList(onlineStreams, offlineStreams, operatorUser, cause, seqId)
          EduLogger.info(`[streamListChanged] [${this._id}] after [${seqId}]#updateUsersStreams: userList, `, this._userList , ` streamList `, this._streamList)
          break;
        }

        case EduChannelMessageCmdType.streamListBatchUpdated: {
          console.log("data", data)
          const action = MessageSerializer.getAction(data)
          const streams = MessageSerializer.getStreamList(data)
          console.log("data: streams", streams)
          const operatorUser = MessageSerializer.getOperator(data)
          const cause = data?.cause ?? {}

          const onlineStreams = streams.filter((it: EduStreamData) => it.state !== 0)
          const offlineStreams = streams.filter((it: EduStreamData) => it.state === 0)
          EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: data`, data)
          EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: onlineStreams`, onlineStreams,  ' offlineStreams', onlineStreams, ' operatorUser', operatorUser)
          this.updateStreamList(onlineStreams, offlineStreams, operatorUser, cause, seqId)
          EduLogger.info(`[${this._id}] after [${seqId}]#updateUsersStreams: userList, streamList,`, this._userList, this._streamList)
          break;
        }

        case EduChannelMessageCmdType.roomPropertiesStateChanged: {
          this.setRoomProperties(data.changeProperties, data.cause, data.operator)
          break;
        }

        case EduChannelMessageCmdType.roomPropertiesBatchUpdated: {
          // this.updateBatchRoomProperties(data.changeProperties, data.cause)
          this.setRoomBatchProperties(data.changeProperties, data.cause, data.operator)
          break;
        }

        // room chat message
        case EduChannelMessageCmdType.roomChatState: {
          const textMessage: EduTextMessage = MessageSerializer.getEduTextMessage(data)
          const operator: OperatorUser = data?.operator ?? {}
          // if (this.userIds.includes(textMessage.fromUser.userUuid)) {
            if (!this.isLocalUser(textMessage.fromUser.userUuid)) {
              EduLogger.info(`EDU-STATE [${this._id}], ${JSON.stringify(textMessage)}`)
              this.fire('room-chat-message', {
                textMessage,
                operator
              })
            }
          // }
          break;
        }

        // custom message
        case EduChannelMessageCmdType.customMessage: {
          const textMessage: EduTextMessage = MessageSerializer.getEduTextMessage(data)
          const operator: OperatorUser = data?.operator ?? {}
          // if (this.userIds.includes(textMessage.fromUser.userUuid)) {
            this.fire('room-message', {
              textMessage,
              operator
            })
          // }
          break;
        }
      }
    }

  }

  public async syncFullSequence() {
    let times = 3
    do {
      try {
        const roomUuid = this.roomManager.roomUuid
        const res = await this.roomManager.apiService.syncSnapShot(roomUuid)
        const {seq, roomInfo, roomState, roomProperties, users} = res
        this.appendBuffer({
          cmd: EduChannelMessageCmdType.initState,
          seqId: seq,
          data: {
            roomInfo,
            roomState,
            roomProperties,
            users
          }
        })
        EduLogger.info(`[${this._id}] [seqId] : ${seq} syncFullSequences data succeed`)
        return
      } catch (err) {
        EduLogger.warn('syncFullSequences ', err.message, err)
        --times
      }
    } while(times > 0)

    if (this.retryTimer) {
      return
    } else {
      this.retryTimer = setTimeout(() => {
        const onSuccess = () => {
          EduLogger.info(`[${this._id}] [seqId] retryTimer success`)
          if (this.retryTimer) {
            clearTimeout(this.retryTimer)
            this.retryTimer = null
          }
        }
        const onFailure = () => {
          EduLogger.info(`[${this._id}] [seqId] retryTimer failure`)
          if (this.retryTimer) {
            clearTimeout(this.retryTimer)
            this.retryTimer = null
          }
        }
        this.syncFullSequence()
          .then(onSuccess)
          .catch(onFailure)
      }, 2000)
    }
  }

  private async syncSequence(roomUuid: string, curSeqId: number, count?: number): Promise<any> {
    let results: any = []

    EduLogger.info(`[EDU-STATE] [syncSequence] [${this._id}], start: [${curSeqId}] acquire, roomUuid: ${roomUuid}, nextId: ${curSeqId}, count: ${count} `)

    let lastId = 0

    do {
      const {nextId, list} = await this.roomManager.apiService.syncSequence(roomUuid, curSeqId, count)
      EduLogger.info(`[EDU-STATE] [syncSequence] [${this._id}], cur_nextId: [${curSeqId}], nex_nextId: [${nextId}]  acquire, roomUuid: ${roomUuid}, nextId: ${curSeqId}, count: ${count} `, JSON.stringify(results))
      results = results.concat(list)
      lastId = list.slice(-1)
      curSeqId = nextId
    } while (!!curSeqId)

    return {
      list: results
    }
  }

  public async syncFromCurrentSequenceId() {
    let times = 3
    do {
      try {
        const roomUuid = this.roomManager.roomUuid
        const curSeqId = this.curSeqId
        const count = Math.abs(this.curSeqId - this._latestSeqId)
        if (count > 1000) {
          throw ''
        }
        // EDU-STATE-NOTE: ignore count
        let res = await this.syncSequence(roomUuid, curSeqId)
        const {list} = res
        for (let item of list) {
          this.appendBuffer({
            seqId: item.sequence,
            ...item
          })
        }
        return EduLogger.warn(`[EDU-STATE] [${this._id}] [seqId] res syncSequence done`)
      } catch (err) {
        --times
      }
    } while (times > 0)
    await this.syncFullSequence()
  }

  setLatestSeqId(v: number) {
    this._latestSeqId = v
    EduLogger.info("[seqId] setLatestSeqId ", this._latestSeqId)
  }

  public appendBuffer(buffer: SeqData) {
    this._bufferMap[buffer.seqId] = {
      cmd: buffer.cmd,
      data: buffer.data
    }
    EduLogger.info('Raw ChannelMessage, buffer ### ', JSON.stringify(this._bufferMap[buffer.seqId]))
    if (!buffer.hasOwnProperty('seqId')) {
      EduLogger.error("buffer", buffer)
      throw 'seqId not exists'
    }

    this._minSeqId = Math.min(buffer.seqId, this._minSeqId)
    this.setLatestSeqId(Math.max(buffer.seqId, this._latestSeqId))
    this.roomManager.emit('seqIdChanged', {
      curSeqId: this._curSeqId,
      latestSeqId: this._latestSeqId
    })
  }

  private _minSeqId: number = 0

  private retryTimer: any = null

  constructor(context: EduClassroomManager) {
    this.roomManager = context
    this._curSeqId = null
    this._minSeqId = 0
    this._latestSeqId = 0
    this._bufferMap = {}
    this.retryTimer = null
    this._id = `roomUuid:${this.roomManager.roomUuid}#ins:${uuidv4()}`
    EduLogger.info(`EDU-STATE EduDataController: [${this._id}]`)
  }

  public upsertLocalUser(user: EduUserAttrs, streamMap?: Record<string, any>) {
    if (this.localUser) {
      this.localUser.updateUser(user)
      this.fire('local-user-updated', {
        user: this._localUser!,
        operator: defaultOperatorUser,
        cause: {}
      })
      EduLogger.info(`EDU-STATE EduDataController: [${this._id}] upsert local user ${user.userUuid}`, this.localUser,  `id: ${this._id}`)
    } else {
      this.localUser = new EduUserData(user)
      if (this.localUser.state) {
        this.fire('local-user-added', {
          user: this._localUser!,
          operator: defaultOperatorUser,
          cause: {}
        })
        EduLogger.info(`EDU-STATE EduDataController: [${this._id}] added local user ${user.userUuid}`, this.localUser)
      }
    }
    if (streamMap) {
      this.localUser.updateStreamsMap(streamMap)
      // this.fire('local-user-updated', {
      //   user: this._localUser
      // })
      EduLogger.info(`EDU-STATE EduDataController: [${this._id}] update streams local user ${user.userUuid}`, this.localUser)
    }
    EduLogger.info("invoke upsertLocalUser ", user, streamMap, this)
  }

  private _cachedLocalStreams: Record<string, any> = {}

  public get streamMap(): Record<string, any> {
    return this.localUser?.streams ?? {}
  }

  public get streamIds(): any[] {
    return Object.keys(this._cachedLocalStreams).reduce((ids: any, key: string) => {
      const streamUuid = this._cachedLocalStreams[key].stream.streamUuid
      ids.push(streamUuid)
      return ids
    }, [])
  }

  //@ts-ignore
  public get streamList(): EduStreamData[] {
    return this._streamList
  }

  public get userList(): EduUserData[] {
    return this._userList;
  }

  public get userIds(): string[] {
    return this._userList.map((user: EduUserData) => user.user.userUuid)
  }

  public set localUser(v: EduUserData) {
    this._localUser = v
    EduLogger.info(`EDU-STATE EduDataController: [${this._id}]  access localUser: `, v, ` _localUser: `, JSON.stringify(this._localUser))
  }

  public get localUser(): EduUserData {
    return this._localUser as EduUserData
  }

  public get localStreamData(): EduStreamData {
    return this._cachedLocalStreams['main'] as EduStreamData
  }

  public get localScreenShareStream(): EduStreamData {
    return this._cachedLocalStreams['screen'] as EduStreamData
  }

  public isLocalStreams(stream: EduStream) {
    return this.localUserUuid === stream.userInfo.userUuid
  }

  public isLocalUser(userUuid: string) {
    return this.localUserUuid === userUuid
  }

  addStreams(rawStreams: EduStreamData[], operator: OperatorUser, cause: CauseType, seqId?: number) {
    const cachedUserIds: string[] = this._userList.map((it: EduUserData) => it.user.userUuid).concat([this.localUserUuid])
    const streams = rawStreams.filter((it: EduStreamData) => cachedUserIds.includes(it.stream.userInfo.userUuid))
    EduLogger.info(`[${this._id}] before [${seqId}]#addStreams: `, ' user List ', this._userList, ' stream List ', this._streamList, ' streams ', streams)
    for (let newItem of streams) {
      const newStream = newItem.stream
      const targetIdx = this._streamList.findIndex((it: EduStreamData) => it.stream.streamUuid === newStream.streamUuid)
      const targetStream = this._streamList[targetIdx]
      if (targetStream) {
        EduLogger.info(`EDU-STATE addStreams: [${this._id}] before [${seqId}]#addStreams: `, this._userList, this._streamList, ' targetStream ', targetStream, ' newItem ', newItem)
        if (this.streamIsOffline(newItem)) {
          // 删除stream
          EduLogger.info(`EDU-STATE addStreams: [${this._id}] streamIsOffline: `, newItem, targetStream)
          this._streamList = this._streamList.filter((it) => it.stream.streamUuid !== newItem.stream.streamUuid)
          // update local
          if (this.isLocalStreams(targetStream.stream)) {
            EduLogger.info(`EDU-STATE addStreams: [${this._id}] before [${seqId}]#addStreams: `, this._userList, this._streamList, ' targetStream ', targetStream, ' newItem ', newItem)
            this.removeLocalStream(targetStream.stream.streamUuid, operator, cause, `addStreams[${seqId}]`)
          } else {
            // sync remote user
            // if (!this.roomManager.syncingData) {
            this.fire('remote-stream-removed', {stream: newItem.stream, operator, cause})
            // }
          }
        } else {
          // 更新stream
          EduLogger.info(`EDU-STATE EduDataController: [${this._id}] update stream addStreams`, newItem)
          this._streamList[targetIdx] = newItem;
          if (this.isLocalStreams(targetStream.stream)) {
            if (this.isScreenShare(targetStream.stream.streamUuid)) {
              this.upsertLocalStream('screen', newItem, operator, cause, seqId)
            }
            if (this.isMainStream(targetStream.stream.streamUuid)) {
              this.upsertLocalStream('main', newItem, operator, cause, seqId)
            }
          } else {
            this.fire('remote-stream-updated', {stream: newItem.stream, operator, cause})
          }
        }
      }
      if (!targetStream) {
        // 新增stream
        EduLogger.info(`EDU-STATE EduDataController: [${this._id}] add stream addStreams`, newItem)
        this._streamList.push(newItem)
        if (this.isLocalStreams(newItem.stream)) {
          if (this.isScreenShare(newItem.stream.streamUuid)) {
            this.upsertLocalStream('screen', newItem, operator, cause, seqId)
          }
          if (this.isMainStream(newItem.stream.streamUuid)) {
            this.upsertLocalStream('main', newItem, operator, cause, seqId)
          }
        } else {
          this.fire('remote-stream-added', {stream: newItem.stream, operator, cause})
        }
      }
    }
  }

  private isMainStream(streamUuid: string): boolean {
    const mainStream = this._cachedLocalStreams['main']
    if (mainStream && mainStream.stream.streamUuid === streamUuid) {
      return true
    }
    return false
  }

  private isScreenShare(streamUuid: string): boolean {
    const screenStream = this._cachedLocalStreams['screen']
    if (screenStream && screenStream.stream.streamUuid === streamUuid) {
      return true
    }
    return false
  }

  removeTargetStream(targetStream: EduStreamData) {
    this._streamList = this._streamList.filter((it) => it.stream.streamUuid !== targetStream.stream.streamUuid)
  }

  removeLocalStream(streamUuid: string, operator: OperatorUser, cause: CauseType, seqId?: any): void {
    EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeLocalStream remove after, streamUuid `, streamUuid)
    let type = 'main'
    if (this.isMainStream(streamUuid)) {
      type = 'main'
    }
    if (this.isScreenShare(streamUuid)) {
      type = 'screen'
    }

    switch(type) {
      case 'main': {
        const mainStream = this._cachedLocalStreams['main']
        if (mainStream) {
          EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeLocalStream, streamList: `, JSON.stringify(this._streamList), 'userList: ', JSON.stringify(this._userList), ' cachedLocalStreams ', JSON.stringify(this._cachedLocalStreams))
          mainStream.modifyStream({
            streamUuid: streamUuid,
            hasAudio: false,
            hasVideo: false,
            videoSourceType: EduVideoSourceType.camera,
            audioSourceType: EduAudioSourceType.mic,
            state: 0,
            token: '',
            userInfo: {
              userUuid: this.localUser.user.userUuid,
              userName: this.localUser.user.userName,
              role: this.localUser.user.role,
            }
          })
          this.removeTargetStream(mainStream)
          EduLogger.info(`${Date.now()} local-stream-removed local-stream`, mainStream, this._userList)
          // TODO: removed
          // this.fire('local-stream-updated', {
          //   action: 'removed',
          //   stream: mainStream.stream,
          //   type: 'main',
          //   seqId
          // })
          this.fire('local-stream-removed', {
            stream: mainStream.stream,
            type: 'main',
            operator,
            cause,
            seqId
          })
        }
        break;
      }
      case 'screen': {
        const screenStream = this._cachedLocalStreams['screen'] as EduStreamData
        if (screenStream) {
          screenStream.modifyStream({
            streamUuid: streamUuid,
            hasAudio: false,
            hasVideo: false,
            videoSourceType: EduVideoSourceType.screen,
            audioSourceType: EduAudioSourceType.mic,
            state: 0,
            token: '',
            userInfo: {
              userUuid: this.localUser.user.userUuid,
              userName: this.localUser.user.userName,
              role: this.localUser.user.role,
            }
          })
          this.removeTargetStream(screenStream)
          EduLogger.info(`${Date.now()} local-stream-removed screen`, screenStream, this._userList)
          // TODO: removed
          // this.fire('local-stream-updated', {
          //   action: 'removed',
          //   stream: screenStream.stream,
          //   type: 'screen',
          //   seqId
          // })
          this.fire('local-stream-removed', {
            stream: screenStream.stream,
            type: 'screen',
            operator,
            cause,
            seqId
          })
        }
        break;
      }
    }
  }

  removeStreams(streams: EduStreamData[], operator: OperatorUser, cause: CauseType, seqId?: number) {   
    EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeStreams in target: `,  ' streams ', streams, ' _userList ', this._userList, ' _streamList ', this._streamList) 
    for (let newItem of streams) {
      const newStream = newItem.stream
      const targetIdx = this._streamList.findIndex((it: EduStreamData) => it.stream.streamUuid === newStream.streamUuid)
      const targetStream = this._streamList[targetIdx]
      EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeStreams in target: `,  ' streams ', streams, ' _userList ', this._userList, ' _streamList ', this._streamList) 
      if (targetStream) {
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeStreams in condition, streamUuid`, targetStream.stream.streamUuid, " newItem", JSON.stringify(newItem), ' streams', JSON.stringify(streams))
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeStreams`, newItem)
        this._streamList = this._streamList.filter((it) => it.stream.streamUuid !== newItem.stream.streamUuid)
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeStreams remove after, streamUuid`, targetStream, " newItem", JSON.stringify(newItem), ' streams', JSON.stringify(streams), this.isLocalStreams(targetStream.stream))
        if (this.isLocalStreams(targetStream.stream)) {
          EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeLocalStream, streamUuid`, targetStream, " newItem", JSON.stringify(newItem), ' streams', JSON.stringify(streams), this.isLocalStreams(targetStream.stream))
          this.removeLocalStream(targetStream.stream.streamUuid, operator, cause, `removeStreams[${seqId}]`)
        } else {
          this.fire('remote-stream-removed', {
            stream: newItem.stream,
            operator: operator,
            cause
          })
        }
      }
    }
  }

  userIsOffline(user: EduUserData) {
    return user.state === 0
  }

  streamIsOffline(stream: EduStreamData) {
    return stream.state === 0
  }

  addUserList(list: EduUserData[], operator: OperatorUser, cause: CauseType, seqId?: number) {
    for (let newTargetItem of list) {
      const idx = this._userList.findIndex((it: EduUserData) => it.user.userUuid === newTargetItem.user.userUuid)
      const target = this._userList[idx]
      // update user in list
      if (target) {
        if (this.userIsOffline(newTargetItem)) {
          EduLogger.info("[EDU-STATE] remove user in addUserList before", JSON.stringify(list))
          this._userList = this._userList.filter((it) => it.user.userUuid === newTargetItem.user.userUuid)
          this.removeStreams(this._streamList.filter((it: EduStreamData) => it.stream.userInfo.userUuid === newTargetItem.user.userUuid), operator, cause, seqId)
          EduLogger.info("[EDU-STATE] remove user in addUserList after ", JSON.stringify(newTargetItem))
          this.setRoomStatus({
            onlineUsersCount: MessageSerializer.onlineUsersCount({
              users: this._userList
            })
          })

          if (this.isLocalUser(target.user.userUuid)) {
            this.localUser.updateState(0)
            this.fire('local-user-removed', {user: newTargetItem, type: newTargetItem.type, operator, cause})
          } else {
            this.fire('remote-user-removed', {user: newTargetItem, operator, cause})
          }
        } else {
          this._userList[idx] = newTargetItem
          EduLogger.info("[EDU-STATE] update user in addUserList before", JSON.stringify(newTargetItem))

          this.setRoomStatus({
            onlineUsersCount: MessageSerializer.onlineUsersCount({
              users: this._userList
            })
          })

          if (this.isLocalUser(target.user.userUuid)) {
            this.localUser.updateUser({
              ...this.localUser.user,
              ...newTargetItem.user,
              updateTime: newTargetItem.ts,
              rtmToken: newTargetItem.hasOwnProperty('rtmToken') ? newTargetItem.rtmToken : this.localUser.rtmToken
            })
            this.fire('local-user-updated', {user: newTargetItem, operator, cause})
          } else {
            this.fire('remote-user-updated', {user: newTargetItem, operator, cause})
          }
        }
      }
      // add user to list
      if (!target) {
        EduLogger.info("[EDU-STATE] add user in addUserList before", JSON.stringify(newTargetItem))
        this._userList.push(newTargetItem)

        this.setRoomStatus({
          onlineUsersCount: MessageSerializer.onlineUsersCount({
            users: this._userList
          })
        })
        if (this.isLocalUser(newTargetItem.user.userUuid)) {
          this.localUser.updateUser({
            ...this.localUser.user,
            ...newTargetItem.user,
            updateTime: newTargetItem.ts,
            rtmToken: newTargetItem.hasOwnProperty('rtmToken') ? newTargetItem.rtmToken : this.localUser.rtmToken
          })
          this.fire('local-user-updated', {user: newTargetItem, operator, cause})
        } else {
          this.fire('remote-user-added', {user: newTargetItem, operator, cause})
        }
      }
    }
  }

  removeUserList(list: EduUserData[], operator: OperatorUser, cause: CauseType, seqId?: number) {
    EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeUserList: `, JSON.stringify(list), 'userList: ', this._userList, ', streamList: ', this._streamList)
    for (let targetItem of list) {
      const idx = this._userList.findIndex((it: EduUserData) => it.user.userUuid === targetItem.user.userUuid)
      const target = this._userList[idx]
      // remove user in list
      if (target) {
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] `, target)
        this._userList = this._userList.filter((it) => it.user.userUuid !== targetItem.user.userUuid)

        this.setRoomStatus({
          onlineUsersCount: MessageSerializer.onlineUsersCount({
            users: this._userList
          })
        })
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeUserList in target: `, ' isLocalUser', this.isLocalUser(targetItem.user.userUuid), ' list: ', JSON.stringify(list))
        this.removeStreams(this._streamList.filter((it: EduStreamData) => it.stream.userInfo.userUuid === targetItem.user.userUuid), operator, cause, seqId)
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] after removeUserList in target: `, '  targetItem ', targetItem, ' userList ', this._userList)
        if (this.isLocalUser(targetItem.user.userUuid)) {
          this.localUser.updateState(0)
          this.fire('local-user-removed', {user: targetItem, type: targetItem.type, operator, cause})
        } else {
          // if (!this.roomManager.syncingData) {
            this.fire('remote-user-removed', {user: targetItem, operator, cause})
          // }
        }
      }
    }
  }

  updateUserState(data: EduUserData) {
    if (this.isLocalUser(data.user.userUuid)) {
      this.localUser.updateUser(data)
    } else {
      const findUser = this._userList.find((it: any) => it.user.userUuid === data.user.userUuid)
      if (findUser) {
        findUser.updateUser(data)
      }
    }
  }

    // TODO: workaround
  updateUserDevice(data: any, operator: any, cause: any) {
    if (this.isLocalUser(data.userUuid)) {
      this.localUser.updateUserDevice(data.path, data.value)
      const findUser = this._userList.find((it: any) => it.user.userUuid === data.userUuid)
      if (findUser) {
        findUser.updateUserDevice(data.path, data.value)
      }
      this.fire('local-user-updated', {
        user: this.localUserData,
        //@ts-ignore
        muteChat: data.muteChat,
        operator: operator,
        cause: cause
      })
    } else {
      const findUser = this._userList.find((it: any) => it.user.userUuid === data.userUuid)
      if (findUser) {
        findUser.updateUserDevice(data.path, data.value)
        this.fire('remote-user-updated', {
          user: findUser,
          //@ts-ignore
          muteChat: data.muteChat,
          operator,
          cause})
      }
    }
    }

  // TODO: workaround
  updateUserChatMute(data: any, operator: any, cause: any) {
    if (this.isLocalUser(data.userUuid)) {
      this.localUser.updateUserChatMute(data.muteChat)
      const findUser = this._userList.find((it: any) => it.user.userUuid === data.userUuid)
      if (findUser) {
        findUser.updateUserChatMute(data.muteChat)
      }
      this.fire('local-user-updated', {
        user: this.localUserData,
        //@ts-ignore
        muteChat: data.muteChat,
        operator: operator,
        cause: cause
      })
    } else {
      const findUser = this._userList.find((it: any) => it.user.userUuid === data.userUuid)
      if (findUser) {
        findUser.updateUserChatMute(data.muteChat)
        this.fire('remote-user-updated', {
          user: findUser,
          //@ts-ignore
          muteChat: data.muteChat,
          operator,
          cause})
      }
    }
  }

  updateUserList(onlineUsers: EduUserData[], offlineUsers: EduUserData[], operatorUser: OperatorUser, cause: CauseType, seqId?: number) {
    EduLogger.info(`[${this._id}] before [${seqId}]#updateUserList: `, this._userList, this._streamList)
    this.addUserList(onlineUsers, operatorUser, cause, seqId)
    this.removeUserList(offlineUsers, operatorUser, cause, seqId)
    EduLogger.info(`[${this._id}] after [${seqId}]#updateUserList: `, this._userList, this._streamList)
  }

  updateStreamList(onlineStreams: EduStreamData[], offlineUsers: EduStreamData[], operatorUser: OperatorUser, cause: CauseType, seqId?: number) {
    EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: `, this._userList, this._streamList)
    this.addStreams(onlineStreams, operatorUser, cause, seqId)
    this.removeStreams(offlineUsers, operatorUser, cause, seqId)
    if(this.streamCoordinator) {
      this.streamCoordinator.addEduStreams(onlineStreams)
      this.streamCoordinator.removeEduStreams(offlineUsers)
    }
    EduLogger.info(`[${this._id}] after [${seqId}]#updateStreamList: `, this._userList, this._streamList)
  }

  upsertTargetStream(targetStream: EduStreamData) {
    const targetIndex = this._streamList
    .findIndex((it: EduStreamData) => 
      it.stream.streamUuid === targetStream.stream.streamUuid)
    if (targetIndex !== -1) {
      this._streamList[targetIndex] = targetStream
    } else {

      this._streamList.push(targetStream)

      this.setRoomStatus({
        onlineUsersCount: MessageSerializer.onlineUsersCount({
          users: this._userList
        })
      })
    }
  }

  upsertLocalStream(type: 'main' | 'screen', data: EduStreamData, operator: OperatorUser, cause: CauseType, seqId?: any) {
    EduLogger.info(`[EDU-STATE] upsertLocalStream: [${seqId}] type: ${type}, data: ${JSON.stringify(data)}, operator: ${JSON.stringify(operator)}`)
    if (type === 'main') {
      const mainStream = this._cachedLocalStreams['main'] as EduStreamData
      EduLogger.info("mainStream  ", mainStream)
      if (mainStream) {
        mainStream.update(data)
        this.upsertTargetStream(mainStream)
        this.fire('local-stream-updated', {
          data: this._cachedLocalStreams['main'],
          type: 'main',
          operator,
          cause,
          seqId
        })
      } else {
        const streamData = new EduStreamData({
          state: data.state,
          streamUuid: data.stream.streamUuid,
          streamName: data.stream.streamName,
          videoSourceType: data.stream.videoSourceType,
          audioSourceType: data.stream.audioSourceType,
          hasVideo: data.stream.hasVideo,
          hasAudio: data.stream.hasAudio,
          userInfo: {
            userUuid: this.localUser.user.userUuid,
            userName: this.localUser.user.userName,
            role: this.localUser.user.role,
          },
          updateTime: data.ts,
          token: data.token
        })
        this._cachedLocalStreams['main'] = streamData
        this.upsertTargetStream(this._cachedLocalStreams['main'])
        this.fire('local-stream-updated', {
          data: this._cachedLocalStreams['main'],
          type: 'main',
          operator,
          cause,
        })
      }
    }
    
    if (type === 'screen') {
      const screenStream = this._cachedLocalStreams['screen'] as EduStreamData
      if (screenStream) {
        screenStream.update(data)
        this.upsertTargetStream(screenStream)
        this.fire('local-stream-updated', {
          data: this._cachedLocalStreams[type],
          type: 'screen',
          operator,
          cause
        })
      } else {
        const newStream = new EduStreamData({
          state: data.state,
          streamUuid: data.stream.streamUuid,
          streamName: data.stream.streamName,
          videoSourceType: EduVideoSourceType.screen,
          audioSourceType: EduAudioSourceType.mic,
          hasVideo: data.stream.hasVideo,
          hasAudio: data.stream.hasAudio,
          userInfo: {
            userUuid: this.localUser.user.userUuid,
            userName: this.localUser.user.userName,
            role: this.localUser.user.role,
          },
          token: data.token
        })
        this._cachedLocalStreams['screen'] = newStream
        const screenStream = this._cachedLocalStreams['screen'] as EduStreamData
        this.upsertTargetStream(screenStream)
        this.fire('local-stream-updated', {
          data: this._cachedLocalStreams[type],
          type: 'screen',
          operator,
          cause
        })
      }
    }
  }

  updateClassroomAttrs(params: any) {
    // const prevTime = get(this._roomAttrs, 'time', 0)
    // if (prevTime <= params.time) {
    this._roomAttrs = {
      ...this._roomAttrs,
      ...params
    }
    // }
  }

  updateClassroom(params: Partial<EduClassroomAttrs>) {
    // const prevTime = this.roomPrevTime
    // const curTime = get(params, 'time', 0) as number
    // if (prevTime <= curTime) {
      // this._classroom = {
      //   ...this._classroom,
      //   ...params,
      // }
      // EduLogger.info('updateClassroom', this._classroom, params)
    // }
  }

  get classroom() {
    return {
      roomInfo: this._roomInfo,
      roomStatus: this._roomStatus,
      roomProperties: this._roomProperties
    }
  }

  getClassroom() {
    return this.classroom
  }

  reset() {
    this._localUserUuid = ''
    this.localUser = undefined as any
    this._streamList = []
    this._userList = []
    this._cachedLocalStreams = {}
    // this._classroom = {} as EduClassroomAttrs
    this._roomAttrs = {}

    EduLogger.info(`reset data controller ${this._id}`)

    this._roomInfo = {}
    this._roomStatus = {}
    this._roomProperties = {}
    this._roomStatus = {}
    this._localUserData = undefined
    this._minSeqId = 0
    this._latestSeqId = 0
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer)
    }
    this.retryTimer = null
  }

  private _roomInfo: any = {}

  get roomInfo() {
    return this._roomInfo
  }

  private _roomProperties: any = {}

  get roomProperties() {
    return this._roomProperties
  }

  private _users: EduUserData[] = []

  get users() {
    return this._users
  }

  private _streams: EduStreamData[] = []

  get streams() {
    return this._streams
  }

  private _roomStatus: any = {}

  get roomState() {
    return this._roomStatus;
  }

  setRoomInfo(state: any) {
    const prevState = this._roomInfo

    const curState = {
      ...prevState,
      ...state
    }

    EduLogger.info("roomInfo ", curState)
    
    this._roomInfo = curState
    // if (diff(prevState, curState)) {
    this.fire('classroom-property-updated', {
      classroom: this.classroom,
      operator: {} as OperatorUser,
      cause: {}
    })
    // }
  }

  setRoomStatus(state: any, cause?: CauseType) {
    const prevState = this._roomStatus

    const curState = {
      ...prevState,
      ...state
    }
    
    this._roomStatus = curState
    EduLogger.info("### setRoomStatus ", state)
    if (diff(prevState, curState)) {
      this.fire('classroom-property-updated', {
        classroom: this.classroom,
        operator: {} as OperatorUser,
        cause: cause ?? {}
      })
    }
  }

  setRoomProperties(roomProperties: any, operator?: OperatorUser, cause?: CauseType) {
    const prevState = this._roomProperties

    const curState = {
      ...prevState,
      ...roomProperties
    }
    
    this._roomProperties = curState
    EduLogger.info("### setRoomProperties ", curState)
    // if (diff(prevState, curState)) {
    this.fire('classroom-property-updated', {
      classroom: this.classroom,
      operator: operator ?? {userUuid: '', userName: '', role: ''},
      cause: cause ?? {}
    })
    // }
  }

  updateBatchRoomProperties(roomProperties: any, cause: CauseType) {
    const prevState = this._roomProperties

    const keys = Object.keys(roomProperties) 

    const invalidKeys = keys.filter((key: string) => noBlankChars(key) ? false : true)

    if (invalidKeys.length) {
      EduLogger.error(`updateBatchRoomProperties#[reached invalid chars]: ${JSON.stringify(roomProperties)}`)
      return
    }

    const curState: Object = {
      ...prevState,
    }

    const patchProperties = keys.filter((item) => isPatchProperty(item))

    const normalKeys = keys.filter((item) => !isPatchProperty(item))

    // update patch key properties
    patchProperties.forEach((patchKeyPath) => {
      set(curState, patchKeyPath, roomProperties[patchKeyPath])
    })

    const normalProperties = pick(roomProperties, normalKeys)

    if (!isEmpty(normalProperties)) {
      Object.assign(curState, {
        ...normalProperties
      })
    }

    this._roomProperties = curState
    EduLogger.info("### setRoomProperties ", curState)
    // if (diff(prevState, curState)) {
    this.fire('classroom-property-updated', {
      classroom: this.classroom,
      operator: {} as OperatorUser,
      cause
    })
    // }
  }

  setRoomBatchProperties(newProperties: any, operator?: OperatorUser, cause?: CauseType) {
    const mergeRoomProperties = (properties: any, changedProperties: any) => {
      for (let key of Object.keys(changedProperties)) {
        // TODO: refactor use memory pool
        // setWith(properties, key, changedProperties[key])
        // const newObject = transformDotStrToObject(key, changedProperties[key]) as any
        // const value = changedProperties[key]
        // merge(properties, newObject)
        // if (Array.isArray(value)) {
        //   assign(properties, newObject)
        // }
        // console.log('#### roomProperties key path: ', key, ' valuepath', changedProperties[key], ' newProperties ', newProperties , ' newObject ', newObject, ' properties ,', properties)
        let originalPaths = key.split('.')

        if(originalPaths.length === 0) {
          console.error(`[rte] invalid key when batch set room properties ${key}`)
          return properties
        }




        const paths = originalPaths.filter((path: string) => path)
        let cursor = properties
        // initialize structs
        // for(let path of paths) {
        //   cursor[path] = cursor[path] || {}
        //   cursor = cursor[path]
        // }
        let lastPath = ''
        for (let path of paths) {
          cursor[path] = cursor[path] || {}
          cursor = cursor[path]
          lastPath = path
        }
        // try {
        //   for (let i = 0; i < paths.length; i++) {
        //     const curPath = paths[i]
        //     // pathResult += curPath
        //     console.log('[SDK] curPath ', curPath)
        //     const newPathValue = get(changedProperties, pathResult, {})
        //     cursor[curPath] = cursor[curPath] || cloneDeep(newPathValue)
        //     cursor = cursor[curPath]
        //   }
        // } catch (e) {
        //   console.log(e);
        // }

        let anchor = get(properties, paths.join('.'))
        let parent = get(properties, [...paths].splice(0, paths.length - 1).join('.'), {})

        const isObject = (val:any) => (typeof val === 'object' && val !== null)
        const changedValue = changedProperties[key]

        if (changedValue && Array.isArray(changedValue)) {
          let arrayPropCurosr: any = properties
          for (let path of paths) {
            if (path === lastPath) {
              arrayPropCurosr[path] = changedValue
            } else {
              arrayPropCurosr = arrayPropCurosr[path]
            }
          }
          console.log('#### roomProperties setWith.forEach, setRoomBatchProperties')
          console.log('### properties ', properties)
          console.log(" #### newProperties", JSON.stringify(newProperties))
          console.log(" #### changeProperties", JSON.stringify(changedProperties))
          return properties
        }

        if(!isObject(anchor)) {
          // if anchor is not an object, overwrite anyway
          parent[[...paths].pop()!] = changedValue
        } else {
          // anchor is an object
          if(!isObject(changedValue)) {
            // if changed value is not an object, overwrite as well
            parent[[...paths].pop()!] = changedValue
          } else {
              merge(anchor, changedValue)
          }
        }
      }
      console.log('#### roomProperties setWith.forEach, setRoomBatchProperties')
      console.log('### properties ', properties)
      console.log(" #### newProperties", JSON.stringify(newProperties))
      console.log(" #### changeProperties", JSON.stringify(changedProperties))
      return properties
    }

    const prevState = cloneDeep(this._roomProperties)
    const curState = mergeRoomProperties(prevState, newProperties)

    this._roomProperties = curState
    EduLogger.info(">>> setRoomBatchProperties ", curState)
    this.fire('classroom-property-updated', {
      classroom: this.classroom,
      operator: operator ?? defaultOperatorUser,
      cause: cause ?? defaultCause
    })
  }

  private _localUserData?: EduUserData

  get localUserData(): EduUserData {
    return this._localUserData as EduUserData;
  }

  setLocalData(roomData: any) {
    this.setLocalUserUuid(roomData.user.uuid)
    this.setUserToken(roomData.user.userToken)

    const mainStreamUuid = get(roomData, 'user.streamUuid')
    const mainRtcToken = get(roomData, 'user.rtcToken')
    const rawLocalStreams = get(roomData, 'user.streams', [])
    const rtcStreamInfo: Record<string, any> = {
      'main': {
        streamUuid: mainStreamUuid,
        rtcToken: mainRtcToken,
      },
      'screen': {
        streamUuid: '',
        rtcToken: '',
      }
    }
    if (roomData) {
      rawLocalStreams.reduce((acc: any, item: any) => {
        if (rtcStreamInfo.main.streamUuid === item.streamUuid) return acc
        if (item.videoSourceType === EduVideoSourceType.screen) {
          acc['screen'] = {
            streamUuid: item.streamUuid,
            rtcToken: item.rtcToken
          }
        }
        return acc;
      }, rtcStreamInfo)
    }
    this.upsertLocalUser({
      userUuid: roomData.user.uuid,
      userName: roomData.user.name,
      role: roomData.user.role as any,
      // isChatAllowed: !!roomData.user.muteChat,
      // muteChat: !!roomData.user.muteChat,
      userProperties: roomData.user.properties,
      rtmToken: roomData.user.rtmToken,
    }, rtcStreamInfo)
    
    for (let key of Object.keys(rtcStreamInfo)) {
      if (rtcStreamInfo[key]) {
        const {streamUuid, rtcToken} = rtcStreamInfo[key]
        const curStreamData = rawLocalStreams.find((it: any) => it.streamUuid === streamUuid)
        let hasVideo = curStreamData ? curStreamData.videoState : true
        let hasAudio = curStreamData ? curStreamData.audioState : true

        let state = curStreamData ? curStreamData.state : 0

        const tmpStreamData = new EduStreamData({
          streamUuid: streamUuid,
          streamName: '',
          videoSourceType: 0,
          audioSourceType: 0,
          hasVideo: hasVideo,
          hasAudio: hasAudio,
          userInfo: {
            userUuid: this.localUser.user.userUuid,
            userName: this.localUser.user.userName,
            role: this.localUser.user.role
          },
          state: state
        })
        this.upsertLocalStream(key as LocalStreamType, tmpStreamData, {} as OperatorUser, {})
      }
    }
  }

  setLocalUser(user: EduUserData) {
    const prevState = this.localUserData
    if (diff(prevState, user)) {
      if (!prevState) {
        this._localUserData = user
      } else {
        prevState.updateUser(user)
      }
      this.fire('local-user-updated', {
        user: this.localUserData,
        operator: defaultOperatorUser,
        cause: defaultCause
      })
    }
  }

  setRawUsers(rawUsers: any[]) {
    const localUuid = this.localUserUuid
    const rawEduUserData = EduUserData
      .fromArray(
        rawUsers.map((user: any) => user)
      )

    const localUserSnapShot = rawEduUserData.find((user: EduUserData) => user.user.userUuid === localUuid) ?? {}
    const users = 
      rawEduUserData
      .concat(new EduUserData({
        state: 1,
        updateTime: 0,
        userUuid: localUuid,
        // muteChat: get(this.localUser, 'muteChat'),
        userName: get(this.localUser, 'user.userName'),
        role: get(this.localUser, 'user.role'),
        userProperties: get(localUserSnapShot, 'user.userProperties', {}),
        // isChatAllowed: false,
        streamUuid: '0',
      }))
    const streams = EduStreamData.fromArray(rawUsers
      .filter((u: any) => u.streams)
      .reduce((acc: any, u: any) => {
        let streams = u.streams.map((stream: any) => (
          {
            ...stream,
            userInfo: {
              userUuid: u.userUuid,
              userName: u.userName,
              role: u.role
            }
          }
        ))
        return acc.concat(streams)
      }, []))
    EduLogger.info("users: ", JSON.stringify(users), " streams: ", JSON.stringify(streams), JSON.stringify(rawUsers))
    if (localUuid) {
      const localUser = users.find((it: EduUserData) => it.user.userUuid === localUuid)
      if (localUser) {
        this.upsertLocalUser({
          userUuid: localUser.user.userUuid,
          userName: localUser.user.userName,
          role: localUser.user.role as any,
          // muteChat: localUser.user.muteChat,
          // isChatAllowed: !!localUser.user.isChatAllowed,
          userProperties: localUser.user.userProperties,
        })
      }
      const onlineUsers = users.filter((it: EduUserData) => it.state !== 0)
      const offlineUsers = users.filter((it: EduUserData) => it.state === 0)
      this.updateUserList(onlineUsers, offlineUsers, defaultOperatorUser, defaultCause)
      const onlineStreams = streams.filter((it: EduStreamData) => it.state !== 0)
      const offlineStreams = streams.filter((it: EduStreamData) => it.state === 0)
      this.updateStreamList(onlineStreams, offlineStreams, defaultOperatorUser, defaultCause)
    }
  }
}