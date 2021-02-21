import { isPatchProperty, noBlankChars, transformPatchPropertyKeys } from './../utils/syntax';
import { CauseType } from './../core/services/edu-api';
import { MessageSerializer } from './../core/rtm/message-serializer';
import uuidv4 from 'uuid/v4';
import {
  EduStreamData,
  EduUserData,
  EduClassroomAttrs,
  EduRoomAttrs,
  EduVideoSourceType,
  EduUserAttrs,
  EduAudioSourceType,
  EduUser,
  EduChannelMessageCmdType,
  EduClassroomStateType,
  EduTextMessage,
  EduStreamAction,
  EduCustomMessage,
  EduStream 
} from '../interfaces/index.d';
import { EduClassroomManager } from '../room/edu-classroom-manager';
import { EduLogger } from '../core/logger';
import { get, set, isEmpty, pick, cloneDeep } from 'lodash';
import { diff } from 'deep-diff';

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
          this.setRoomStatus(MessageSerializer.roomStatus(data.roomState))
          this.setRoomProperties(data.roomProperties)
          this.setRawUsers(data.users)
          EduLogger.info(`[${this._id}] [${seqId}] set latest currentId, seqId: `)
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
          EduLogger.info(`[${this._id}] [${seqId}]#setRoomStatus: `, data)
          break;
        }

        case EduChannelMessageCmdType.roomMediaState: {
          EduLogger.info(`[${this._id}] before [${seqId}]#setRoomStatus: `, data)
          this.setRoomStatus({
            isStudentChatAllowed: MessageSerializer.isStudentChatAllowed(data),
          }, data.cause)
          EduLogger.info(`[${this._id}] after [${seqId}]#setRoomStatus: `, data)
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

          EduLogger.info(`[${this._id}] before [${seqId}]#updateUsersStreams: `, data)
          EduLogger.info(`[${this._id}] before [${seqId}]#updateUsersStreams: `,             onlineUsers,
          offlineUsers,
          onlineStreams,
          offlineStreams,)
          this.updateUserList(onlineUsers, offlineUsers, seqId)
          this.updateStreamList(onlineStreams, offlineStreams, null, seqId)

          EduLogger.info(`[${this._id}] after [${seqId}]#updateUsersStreams: `, data)
          EduLogger.info(`[${this._id}] after [${seqId}]#updateUsersStreams: userList, streamList,`, this._userList, this._streamList)
          break;
        }
        // users-updated
        case EduChannelMessageCmdType.userStateUpdated: {
          EduLogger.info(`[${this._id}] before [${seqId}]#updateUserState: `, JSON.stringify(data))
          EduLogger.info(`[${this._id}] before [${seqId}]#updateUserState: `)
          const user = MessageSerializer.getChangedUser(data)
          this.updateUserState(user)

          EduLogger.info(`[${this._id}] after [${seqId}]#updateUserState: `, data)
          EduLogger.info(`[${this._id}] after [${seqId}]#updateUserState: `, user)
          break;
        }
        // TODO: 
        case EduChannelMessageCmdType.userListBatchUpdated: {
          EduLogger.info(`[${this._id}] before [${seqId}]#userListBatchUpdated: `, JSON.stringify(data))
          // const user = MessageSerializer.getChangedUser(data)
          // this.updateUserState(user)
          // EduLogger.info(`[${this._id}] after [${seqId}]#userListBatchUpdated: `, data)
          // EduLogger.info(`[${this._id}] after [${seqId}]#userListBatchUpdated: `, user)
          break;
        }

        // users-room-properties
        // case EduChannelMessageCmdType: {

        case EduChannelMessageCmdType.streamListChanged: {
          const action = MessageSerializer.getAction(data)
          const streams = MessageSerializer.getStreams(data)
          const operatorUser = MessageSerializer.getOperator(data)

          const onlineStreams = streams.filter((it: EduStreamData) => it.state !== 0)
          const offlineStreams = streams.filter((it: EduStreamData) => it.state === 0)
          EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: data`, data)
          EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: onlineStreams`, onlineStreams,  ' offlineStreams', onlineStreams, ' operatorUser', operatorUser)
          this.updateStreamList(onlineStreams, offlineStreams, operatorUser, seqId)
          EduLogger.info(`[${this._id}] after [${seqId}]#updateUsersStreams: userList, streamList,`, this._userList, this._streamList)
          break;
        }

        // TODO: 
        // case EduChannelMessageCmdType.streamListChanged: {
        //   const action = MessageSerializer.getAction(data)
        //   const streams = MessageSerializer.getStreams(data)
        //   const operatorUser = MessageSerializer.getOperator(data)

        //   const onlineStreams = streams.filter((it: EduStreamData) => it.state !== 0)
        //   const offlineStreams = streams.filter((it: EduStreamData) => it.state === 0)
        //   EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: data`, data)
        //   EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: onlineStreams`, onlineStreams,  ' offlineStreams', onlineStreams, ' operatorUser', operatorUser)
        //   this.updateStreamList(onlineStreams, offlineStreams, operatorUser, seqId)
        //   EduLogger.info(`[${this._id}] after [${seqId}]#updateUsersStreams: userList, streamList,`, this._userList, this._streamList)
        //   break;
        // }

        case EduChannelMessageCmdType.streamListBatchUpdated: {
          console.log("data", data)
          const action = MessageSerializer.getAction(data)
          const streams = MessageSerializer.getStreamList(data)
          console.log("data: streams", streams)
          const operatorUser = MessageSerializer.getOperator(data)

          const onlineStreams = streams.filter((it: EduStreamData) => it.state !== 0)
          const offlineStreams = streams.filter((it: EduStreamData) => it.state === 0)
          EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: data`, data)
          EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: onlineStreams`, onlineStreams,  ' offlineStreams', onlineStreams, ' operatorUser', operatorUser)
          this.updateStreamList(onlineStreams, offlineStreams, operatorUser, seqId)
          EduLogger.info(`[${this._id}] after [${seqId}]#updateUsersStreams: userList, streamList,`, this._userList, this._streamList)
          break;
        }

        case EduChannelMessageCmdType.roomPropertiesStateChanged: {
          this.setRoomProperties(data.changeProperties, data.cause)
          break;
        }

        case EduChannelMessageCmdType.roomPropertiesBatchUpdated: {
          // this.updateBatchRoomProperties(data.changeProperties, data.cause)
          this.setRoomBatchProperties(data.changeProperties, data.cause)
          break;
        }

        // room chat message
        case EduChannelMessageCmdType.roomChatState: {
          const textMessage: EduTextMessage = MessageSerializer.getEduTextMessage(data)
          if (this.userIds.includes(textMessage.fromUser.userUuid)) {
            if (!this.isLocalUser(textMessage.fromUser.userUuid)) {
              EduLogger.info(`EDU-STATE [${this._id}], ${JSON.stringify(textMessage)}`)
              this.fire('room-chat-message', {
                textMessage
              })
            }
          }
          break;
        }

        // custom message
        case EduChannelMessageCmdType.customMessage: {
          const textMessage: EduTextMessage = MessageSerializer.getEduTextMessage(data)
          if (this.userIds.includes(textMessage.fromUser.userUuid)) {
            this.fire('room-message', {
              textMessage
            })
          }
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
        user: this._localUser
      })
      EduLogger.info(`EDU-STATE EduDataController: [${this._id}] upsert local user ${user.userUuid}`, this.localUser,  `id: ${this._id}`)
    } else {
      this.localUser = new EduUserData(user)
      if (this.localUser.state) {
        this.fire('local-user-added', {
          user: this._localUser
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
    return get(this.localUser, 'streams', {})
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
    // return this.streamIds.includes(streamUuid)
  }

  public isLocalUser(userUuid: string) {
    return this.localUserUuid === userUuid
  }

  addStreams(rawStreams: EduStreamData[], seqId?: number) {
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
          this._streamList.splice(targetIdx, 1)
          // update local
          if (this.isLocalStreams(targetStream.stream)) {
            EduLogger.info(`EDU-STATE addStreams: [${this._id}] before [${seqId}]#addStreams: `, this._userList, this._streamList, ' targetStream ', targetStream, ' newItem ', newItem)
            this.removeLocalStream(targetStream.stream.streamUuid, `addStreams[${seqId}]`)
          } else {
            // sync remote user
            // if (!this.roomManager.syncingData) {
            this.fire('remote-stream-removed', {stream: newItem.stream})
            // }
          }
        } else {
          // 更新stream
          EduLogger.info(`EDU-STATE EduDataController: [${this._id}] update stream addStreams`, newItem)
          this._streamList[targetIdx] = newItem;
          if (this.isLocalStreams(targetStream.stream)) {
            if (this.isScreenShare(targetStream.stream.streamUuid)) {
              this.upsertLocalStream('screen', newItem, seqId)
            }
            if (this.isMainStream(targetStream.stream.streamUuid)) {
              this.upsertLocalStream('main', newItem, seqId)
            }
          } else {
            this.fire('remote-stream-updated', {stream: newItem.stream})
          }
        }
      }
      if (!targetStream) {
        // 新增stream
        EduLogger.info(`EDU-STATE EduDataController: [${this._id}] add stream addStreams`, newItem)
        this._streamList.push(newItem)
        if (this.isLocalStreams(newItem.stream)) {
          if (this.isScreenShare(newItem.stream.streamUuid)) {
            this.upsertLocalStream('screen', newItem, seqId)
          }
          if (this.isMainStream(newItem.stream.streamUuid)) {
            this.upsertLocalStream('main', newItem, seqId)
          }
        } else {
          this.fire('remote-stream-added', {stream: newItem.stream})
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
    const targetIndex = this._streamList
    .findIndex((it: EduStreamData) => 
      it.stream.streamUuid === targetStream.stream.streamUuid)
    if (targetIndex !== -1) {
      this._streamList.splice(targetIndex, 1)
    }
  }

  removeLocalStream(streamUuid: string, seqId?: any): void {
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
            type: 'screen'
          })
        }
        break;
      }
    }
  }

  removeStreams(streams: EduStreamData[], seqId?: number) {   
    EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeStreams in target: `,  ' streams ', streams, ' _userList ', this._userList, ' _streamList ', this._streamList) 
    for (let newItem of streams) {
      const newStream = newItem.stream
      const targetIdx = this._streamList.findIndex((it: EduStreamData) => it.stream.streamUuid === newStream.streamUuid)
      const targetStream = this._streamList[targetIdx]
      EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeStreams in target: `,  ' streams ', streams, ' _userList ', this._userList, ' _streamList ', this._streamList) 
      if (targetStream) {
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeStreams in condition, streamUuid`, targetStream.stream.streamUuid, " newItem", JSON.stringify(newItem), ' streams', JSON.stringify(streams))
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeStreams`, newItem)
        this._streamList.splice(targetIdx, 1)
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeStreams remove after, streamUuid`, targetStream, " newItem", JSON.stringify(newItem), ' streams', JSON.stringify(streams), this.isLocalStreams(targetStream.stream))
        if (this.isLocalStreams(targetStream.stream)) {
          EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeLocalStream, streamUuid`, targetStream, " newItem", JSON.stringify(newItem), ' streams', JSON.stringify(streams), this.isLocalStreams(targetStream.stream))
          this.removeLocalStream(targetStream.stream.streamUuid, `removeStreams[${seqId}]`)
        } else {
          this.fire('remote-stream-removed', {stream: newItem.stream})
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

  addUserList(list: EduUserData[], seqId?: number) {
    for (let newTargetItem of list) {
      const idx = this._userList.findIndex((it: EduUserData) => it.user.userUuid === newTargetItem.user.userUuid)
      const target = this._userList[idx]
      // update user in list
      if (target) {
        if (this.userIsOffline(newTargetItem)) {
          EduLogger.info("[EDU-STATE] remove user in addUserList before", JSON.stringify(list))
          this._userList.splice(idx, 1)
          this.removeStreams(this._streamList.filter((it: EduStreamData) => it.stream.userInfo.userUuid === newTargetItem.user.userUuid), seqId)
          EduLogger.info("[EDU-STATE] remove user in addUserList after ", JSON.stringify(newTargetItem))
          this.setRoomStatus({
            onlineUsersCount: MessageSerializer.onlineUsersCount({
              users: this._userList
            })
          })

          if (this.isLocalUser(target.user.userUuid)) {
            this.localUser.updateState(0)
            this.fire('local-user-removed', {user: newTargetItem.user, type: newTargetItem.type})
          } else {
            this.fire('remote-user-removed', {user: newTargetItem.user})
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
            this.fire('local-user-updated', {user: newTargetItem.user})
          } else {
            this.fire('remote-user-updated', {user: newTargetItem.user})
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
          this.fire('local-user-updated', {user: newTargetItem.user})
        } else {
          this.fire('remote-user-added', {user: newTargetItem.user})
        }
      }
    }
  }

  removeUserList(list: EduUserData[], seqId?: number) {
    EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] removeUserList: `, JSON.stringify(list), 'userList: ', this._userList, ', streamList: ', this._streamList)
    for (let targetItem of list) {
      const idx = this._userList.findIndex((it: EduUserData) => it.user.userUuid === targetItem.user.userUuid)
      const target = this._userList[idx]
      // remove user in list
      if (target) {
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] `, target)
        this._userList.splice(idx, 1)

        this.setRoomStatus({
          onlineUsersCount: MessageSerializer.onlineUsersCount({
            users: this._userList
          })
        })
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] before removeUserList in target: `, ' isLocalUser', this.isLocalUser(targetItem.user.userUuid), ' list: ', JSON.stringify(list))
        this.removeStreams(this._streamList.filter((it: EduStreamData) => it.stream.userInfo.userUuid === targetItem.user.userUuid), seqId)
        EduLogger.info(`[EDU-STATE] [${this._id}] seqId: [${seqId}] after removeUserList in target: `, '  targetItem ', targetItem, ' userList ', this._userList)
        if (this.isLocalUser(targetItem.user.userUuid)) {
          this.localUser.updateState(0)
          this.fire('local-user-removed', {user: targetItem.user, type: targetItem.type})
        } else {
          // if (!this.roomManager.syncingData) {
            this.fire('remote-user-removed', {user: targetItem.user})
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

  updateUserProperties(data: EduUserData) {
    if (this.isLocalUser(data.user.userUuid)) {
      this.localUser.updateUser(data)
    } else {
      const findUser = this._userList.find((it: any) => it.user.userUuid === data.user.userUuid)
      if (findUser) {
        findUser.updateUser(data)
      }
    }
  }

  updateUserList(onlineUsers: EduUserData[], offlineUsers: EduUserData[], seqId?: number) {
    EduLogger.info(`[${this._id}] before [${seqId}]#updateUserList: `, this._userList, this._streamList)
    this.addUserList(onlineUsers, seqId)
    this.removeUserList(offlineUsers, seqId)
    EduLogger.info(`[${this._id}] after [${seqId}]#updateUserList: `, this._userList, this._streamList)
  }

  updateStreamList(onlineStreams: EduStreamData[], offlineUsers: EduStreamData[], operatorUser: any, seqId?: number) {
    EduLogger.info(`[${this._id}] before [${seqId}]#updateStreamList: `, this._userList, this._streamList)
    this.addStreams(onlineStreams, seqId)
    this.removeStreams(offlineUsers, seqId)
    EduLogger.info(`[${this._id}] after [${seqId}]#updateStreamList: `, this._userList, this._streamList)
  }

  updateUser(newTarget: EduUserData, seqId?: number) {
    EduLogger.info(`EDU-STATE: [${this._id}] updateUser, ${[seqId]}`, this._userList)
    EduLogger.info(`EDU-STATE: [${this._id}] updateUser, ${[seqId]}`, newTarget)
    const idx = this._userList.findIndex((it: EduUserData) => it.user.userUuid === newTarget.user.userUuid)
    const targetItem = this._userList[idx]
    if (targetItem) {
      if (targetItem.state === 0) {
        this._userList.splice(idx, 1)
        EduLogger.info(`removeStreams, EDU-STATE: [${this._id}] updateUser, ${[seqId]}`, this._userList)
        EduLogger.info(`removeStreams, EDU-STATE: [${this._id}] updateUser, ${[seqId]}`, newTarget)
        EduLogger.info(`removeStreams, EDU-STATE: [${this._id}] updateUser, ${[seqId]}`, targetItem)
        this.removeStreams(this._streamList.filter((it: EduStreamData) => it.stream.userInfo.userUuid === targetItem.user.userUuid), seqId)

        this.setRoomStatus({
          onlineUsersCount: MessageSerializer.onlineUsersCount({
            users: this._userList
          })
        })

        if (this.isLocalUser(targetItem.user.userUuid)) {
          EduLogger.info(`isLocalUser, EDU-STATE: [${this._id}] updateUser, ${[seqId]}, local-user-remove`, targetItem)
          this.localUser.updateState(0)
          this.fire('local-user-removed', {
            user: targetItem.user,
            type: targetItem.type
          })
        } else {
          // if (!this.roomManager.syncingData) {
            this.fire("remote-user-removed", {
              user: targetItem.user
            })
          // }
        }
      } else {
        this._userList[idx] = newTarget

        this.setRoomStatus({
          onlineUsersCount: MessageSerializer.onlineUsersCount({
            users: this._userList
          })
        })

        if (this.isLocalUser(newTarget.user.userUuid)) {
          this.localUser.updateUser({
            ...this.localUser.user,
            ...newTarget.user,
            updateTime: newTarget.ts,
            rtmToken: newTarget.hasOwnProperty('rtmToken') ? newTarget.rtmToken : this.localUser.rtmToken
          })
          this.fire('local-user-updated', {
            user: newTarget.user
          })
        } else {
          // if (!this.roomManager.syncingData) {
          this.fire("remote-user-updated", {
            user: newTarget.user
          })
          // }
        }
      }
    } else {
      this._userList.push(newTarget)

      this.setRoomStatus({
        onlineUsersCount: MessageSerializer.onlineUsersCount({
          users: this._userList
        })
      })

      if (this.isLocalUser(newTarget.user.userUuid)) {
        this.fire('local-user-updated', {
          user: newTarget.user
        })
      } else {
        // if (!this.roomManager.syncingData) {
        this.fire("remote-user-added", {
          user: newTarget.user
        })
        // }
      }
    }
  }

  // private get roomPrevTime(): number {
  //   if (this._classroom.time) {
  //     return this._classroom.time
  //   }
  //   return 0
  // }

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

  upsertLocalStream(type: string, data: EduStreamData, seqId?: any) {
    EduLogger.info(`[EDU-STATE] upsertLocalStream: [${seqId}] type: ${type}, data: ${JSON.stringify(data)}`)
    if (type === 'main') {
      const mainStream = this._cachedLocalStreams['main'] as EduStreamData
      EduLogger.info("mainStream  ", mainStream)
      if (mainStream) {
        mainStream.update(data)
        this.upsertTargetStream(mainStream)
        this.fire('local-stream-updated', {
          data: this._cachedLocalStreams['main'],
          type: 'main',
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
          type: 'main'
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
          type: 'screen'
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
          type: 'screen'
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

  fire(evtName: string, ...args: any[]) {
    if (evtName === 'local-user-removed') {
      console.log(" fire # local-user-removed ", JSON.stringify([...args]))
    }
    this.roomManager.emit(evtName, ...args)
  }

  setRoomInfo(state: any) {
    const prevState = this._roomInfo

    const curState = {
      ...prevState,
      ...state
    }

    EduLogger.info("roomInfo ", curState)
    
    this._roomInfo = curState
    if (diff(prevState, curState)) {
      this.fire('classroom-property-updated', this.classroom)
    }
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
      this.fire('classroom-property-updated', this.classroom, cause)
    }
  }

  setRoomProperties(roomProperties: any, cause?: CauseType) {
    const prevState = this._roomProperties

    const curState = {
      ...prevState,
      ...roomProperties
    }
    
    this._roomProperties = curState
    EduLogger.info("### setRoomProperties ", curState)
    if (diff(prevState, curState)) {
      this.fire('classroom-property-updated', this.classroom, cause)
    }
  }

  updateBatchRoomProperties(roomProperties: any, cause?: CauseType) {
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
    this.fire('classroom-property-updated', this.classroom, cause)
  }

  setRoomBatchProperties(roomProperties: any, cause?: CauseType) {
    const mergeRoomProperties = (properties: any, changeProperties: any) => {
      let newProperties = cloneDeep(properties)
      for (let key in changeProperties) {
        set(newProperties, key, changeProperties[key])
      }
      return newProperties
    }

    const prevState = this._roomProperties
    const curState = mergeRoomProperties(prevState, roomProperties)

    this._roomProperties = curState
    EduLogger.info(">>> setRoomBatchProperties ", curState)
    if (diff(prevState, curState)) {
      this.fire('classroom-property-updated', this.classroom, cause)
    }
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
      isChatAllowed: !!roomData.user.muteChat,
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
        this.upsertLocalStream(key, tmpStreamData)
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
        user: this.localUserData
      })
    }
  }

  setRawUsers(rawUsers: any[]) {
    const localUuid = this.localUserUuid
    const users = EduUserData
      .fromArray(
        rawUsers.map((user: any) => user)
      )
      .concat(new EduUserData({
        state: 1,
        updateTime: 0,
        userUuid: localUuid,
        userName: get(this.localUser, 'user.userName'),
        role: get(this.localUser, 'user.role'),
        userProperties: {},
        isChatAllowed: false,
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
          isChatAllowed: !!localUser.user.isChatAllowed,
          userProperties: localUser.user.userProperties,
        })
      }
      const onlineUsers = users.filter((it: EduUserData) => it.state !== 0)
      const offlineUsers = users.filter((it: EduUserData) => it.state === 0)
      this.updateUserList(onlineUsers, offlineUsers)
      const onlineStreams = streams.filter((it: EduStreamData) => it.state !== 0)
      const offlineStreams = streams.filter((it: EduStreamData) => it.state === 0)
      this.updateStreamList(onlineStreams, offlineStreams, null as any)
    }
  }

  setRemoteOnlineUsers(users: EduUserData[]) {
    const prevState = this._users
    if (!prevState.length) {
      this._users = prevState.concat(users)
      if (this._users.length) {
        this.fire('remote-user-added', {
          users: this._users
        })
      }
      return
    }

    if (diff(prevState, users)) {
      const newState = prevState.reduce((acc: EduUserData[], it: any) => {
        const newUserValue = users.find((t: EduUserData) => t.user.userUuid === it.user.userUuid)
        if (newUserValue) {
          const user = {
            ...it,
            ...newUserValue
          }
          acc.push(user)
        } else {
          acc.push(it)
        }
        return acc
      }, [])
      this._users = newState
      if (this._users.length) {
        this.fire('remote-user-updated', {
          users: newState
        })
      }
    }
  }

  setRemoteOfflineUsers(ids: string[]) {
    if (ids.length) {
      const offlineUsers = this._users
      .filter((it: EduUserData) => 
        ids.includes(it.user.userUuid))
      this._users = this._users
        .filter((it: any) => !ids.includes(it.userUuid))

      const offlineStreams = this._streams
        .filter((it: EduStreamData) => ids.includes(it.stream.userInfo.userUuid))
      this._streams = this._streams
        .filter((it: EduStreamData) => !ids.includes(it.stream.userInfo.userUuid))
      if (offlineStreams) {
        this.fire('remote-stream-removed', {
          streams: offlineStreams
        })
      }
      this.fire('remote-user-removed', {
        users: offlineUsers
      })
    }
  }

  setRemoteUsers(newUsers: EduUserData[]) {
    const onlineUsers = newUsers.filter((it: any) => it.state !== 0)
    const offlineUserIds = newUsers
      .filter((it: any) => it.state === 0)
      .map((it: any) => it.user.userUuid)
    this.setRemoteOnlineUsers(onlineUsers)
    this.setRemoteOfflineUsers(offlineUserIds)
  }

  setRemoteOnlineStreams(streams: EduStreamData[]) {
    if (!streams.length) {
      return;
    }
    const prevState = this._streams
    if (!prevState.length) {
      this._streams = prevState.concat(streams)
      if (this._streams.length) {
        this.fire('remote-stream-added', {
          streams: this._streams
        })
      }
      return
    }

    if (diff(prevState, streams)) {
      const updatedStreams: EduStreamData[] = []
      const newState = prevState.reduce((acc: EduStreamData[], it: EduStreamData) => {
        const newStreamValue = streams.find((t: any) => t.stream.streamUuid === it.stream.streamUuid)
        if (newStreamValue) {
          // const stream = {
          //   ...it,
          //   ...newStreamValue
          // }
          it.update(newStreamValue as any)
          updatedStreams.push(it)
          acc.push(it)
        } else {
          acc.push(it)
        }
        return acc
      }, [])
      this._streams = newState
      EduLogger.info("setRemoteStreams 1301 ", this._streams, streams)
      if (this._streams.length) {
        this.fire('remote-stream-updated', {
          streams: updatedStreams
        })
      }
    }
  }

  setRemoteOfflineStreams(ids: string[]) {
    if (!ids.length) {
      return
    }
    const offlineStreams = this._streams
      .filter((it: EduStreamData) => 
        ids.includes(it.stream.streamUuid))

    if (offlineStreams.length) {
      this._streams = this._streams
        .filter((it: EduStreamData) => !ids.includes(it.stream.streamUuid))        
      this.fire('remote-stream-removed', {
        streams: offlineStreams
      })
    }
  }

  setRemoteStreams(newStreams: EduStreamData[]) {
    const onlineStreams = newStreams.filter((it: EduStreamData) => it.state !== 0)
    const offlineIds = newStreams.filter((it: EduStreamData) => it.state === 0).map((it: EduStreamData) => it.stream.streamUuid)
    this.setRemoteOnlineStreams(onlineStreams)
    this.setRemoteOfflineStreams(offlineIds)
  }
}