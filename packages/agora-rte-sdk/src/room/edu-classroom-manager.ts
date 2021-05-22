import { EduClassroomDataController } from './edu-classroom-data-controller';
import { EduUserService } from '../user/edu-user-service';
import { reportService } from '../core/services/report-service'
import { EduLogger } from '../core/logger';
import { AgoraEduApi } from '../core/services/edu-api';
import { EventEmitter } from 'events';
import { EduManager } from "../manager";
import { OperatorUser, EduClassroomManagerEventHandlers, ListenerCallbackType } from './types';
import {
  EduStreamData,
  EduUserData,
  EduUser,
  EduStream,
  EduRoleType,
  EduClassroom
} from '../interfaces';
import { RTMWrapper } from '../core/rtm';
import { MessageSerializer } from '../core/rtm/message-serializer';
import { AgoraWebStreamCoordinator } from '../core/media-service/web/coordinator';
import { AgoraWebRtcWrapper } from '../core/media-service/web';

export type EduClassroomInitParams = {
  eduManager: EduManager
  roomUuid: string
  roomName: string
  apiService: AgoraEduApi
  // rtcProvider: any
}
export class EduClassroomManager {

  private _roomUuid: string

  private rawRoomUuid: string = ''
  private _roomName: string
  private eduManager: EduManager
  private _apiService?: AgoraEduApi
  private _userService?: EduUserService
  private _rtmObserver?: EventEmitter

  private bus: EventEmitter;
  // private _mediaService?: MediaService

  constructor(payload: EduClassroomInitParams) {
    this.eduManager = payload.eduManager
    this.rawRoomUuid = payload.roomUuid
    this._roomUuid = payload.roomUuid
    this._roomName = payload.roomName
    this._apiService = payload.apiService
    this._userService = undefined
    this._rtmObserver = undefined
    this.bus = new EventEmitter()
    // reportService.initReportParams()
    // this._mediaService = new MediaService(payload.rtcProvider)
  }

  on<EventName extends keyof EduClassroomManagerEventHandlers>(
    eventName: EventName,
    listener: (
      args: ListenerCallbackType<EduClassroomManagerEventHandlers[EventName]>
    ) => any
  ): void {
    this.bus.on(eventName, listener)
  }

  off<EventName extends keyof EduClassroomManagerEventHandlers>(
    eventName: EventName,
    listener: (
      args: ListenerCallbackType<EduClassroomManagerEventHandlers[EventName]>
    ) => any
  ): void {
    this.bus.off(eventName, listener)
  }

  removeAllEventListener(): void {
    this.bus.removeAllListeners()
  }

  emit(
    eventName: string,
    args: any
  ): void {
    this.bus.emit(eventName, args)
  }

  public get syncingData(): boolean {
    const states = ['DISCONNECTED', 'RECONNECTING']
    if (states.includes(this.eduManager.rtmConnectionState)) {
      return false
    } else {
      // this.data
    }
    return true
  }

  public get roomName(): string {
    return this._roomName as string
  }

  public get roomUuid(): string {
    return this._roomUuid as string
  }

  public get apiService(): AgoraEduApi {
    return this._apiService as AgoraEduApi
  }

  public get localUser(): EduUserData {
    return this.data.localUser
  }

  get userService(): EduUserService {
    return this._userService as EduUserService
  }

  get data(): EduClassroomDataController {
    return this.eduManager._dataBuffer[this.rawRoomUuid] as EduClassroomDataController
  }

  private async prepareRoomJoin(args: any) {
    EduLogger.info('[EDU-STATE] [ClassRoom Manager] [breakout] params ', args.userRole)
    let joinRoomData = await this.apiService.joinRoom({
      roomUuid: args.roomUuid,
      userRole: args.userRole,
      userName: args.userName,
      userUuid: args.userUuid,
      // autoPublish: args.autoPublish,
      streamUuid: args.streamUuid ? args.streamUuid : `0`
    })
    return joinRoomData

    // this.eduManager._dataBuffer[this.roomUuid] = this.data
  }

  private get rtmWrapper(): RTMWrapper {
    return this.eduManager._rtmWrapper as RTMWrapper;
  }

  async join(params: any) {
    try {
      // REPORT
      reportService.startTick('joinRoom', 'end')
      let data = await this._join(params)
      reportService.reportElapse('joinRoom', 'end', { result: true })
      return data;
    } catch (e) {
      reportService.reportElapse('joinRoom', 'end', { result: false, errCode: `${e.code || e.message}` })
      throw e
    }
  }

  private async _join(params: any) {
    EduLogger.debug(`[EDU-STATE] [ClassRoom Manager] join classroom ${this.roomUuid}`)
    const roomParams = {
      ...params,
      roomUuid: this.roomUuid,
      roomName: this.roomName,
    }
    let joinRoomData = await this.prepareRoomJoin(roomParams)
    EduLogger.debug(`[EDU-STATE] [ClassRoom Manager] join classroom [prepareRoomJoin] ${this.roomUuid} success`)
    if (this.rtmWrapper) {
      const [channel, observer] = this.rtmWrapper.createObserverChannel({
        channelName: this.roomUuid,
      })
      const onChannelMessageHandler = (evt: any) => {
        EduLogger.debug("[EDU-STATE] [ClassRoom Manager] [rtm] ChannelMessage channelName", evt.channelName)
        if (evt.channelName !== this.roomUuid) {
          return
        }
        try {
          const res = MessageSerializer.readMessage(evt.message.text)
          if (res === null) {
            return EduLogger.warn('[room] ChannelMessage is invalid', res)
          }
          const { sequence, cmd, version, data } = res
          EduLogger.info(`[EDU-STATE] Raw ChannelMessage, res: `, JSON.stringify(res), ` data: ${JSON.stringify(data)}`)
          if (version !== 1) {
            return EduLogger.warn('using old version')
          }

          const obj = {
            seqId: sequence,
            cmd,
            data
          }

          EduLogger.debug("[EDU-STATE] [ClassRoom Manager] appendBuffer in Raw Message ", obj)

          this.data.appendBuffer({
            seqId: sequence,
            cmd,
            data
          })
          this.data.asyncBatchUpdateData(500)
        } catch (err) {
          EduLogger.error('[EDU-STATE] onChannelMessageHandler: === :begin')
          EduLogger.error('[EDU-STATE] onChannelMessageHandler, code: ', err.code, ' message: ', err.message)
          EduLogger.error(err)
          EduLogger.error('[EDU-STATE] onChannelMessageHandler: === :end')
        }
      }
      EduLogger.debug('[EDU-STATE] add ChannelMessage onChannelMessageHandler')
      observer.on('ChannelMessage', onChannelMessageHandler)
      this.data.setLocalData(joinRoomData)
      EduLogger.debug('[EDU-STATE] join')
      await this.rtmWrapper.join(
        channel, observer,
        {
          channelName: this.roomUuid,
        }
      )

      EduLogger.debug('[EDU-STATE] join success')

      this._rtmObserver = observer
      await this.data.syncFullSequence()
      this.data.BatchUpdateData()
      this._userService = new EduUserService(this)
      EduLogger.debug(`join classroom ${this.roomUuid} success`)
      return joinRoomData;
    }
  }

  async leave() {

    if (this._rtmObserver) {
      this._rtmObserver.removeAllListeners()
      this._rtmObserver = undefined
    }
    EduLogger.debug(`leave classroom ${this.roomUuid}`)
    if (this.eduManager._rtmWrapper) {
      EduLogger.debug(`leave this.rtmWrapper ${this.roomUuid}`)
      await this.eduManager._rtmWrapper.leave({
        channelName: this.roomUuid,
      })
      delete this.eduManager._dataBuffer[this.rawRoomUuid];
      EduLogger.debug(`leave classroom ${this.roomUuid} success`)
    }
    const lts = new Date().getTime()
    
  }

  get userToken() {
    return this.data.userToken
  }

  async joinRTC(params: any) {
    throw 'joinRTC not implement'
  }

  async leaveRTC() {
    throw 'leaveRTC not implement'
  }

  getLocalStreamData(): EduStreamData {
    return this.data.localStreamData
  }

  getLocalScreenData(): EduStreamData {
    return this.data.localScreenShareStream
  }

  getLocalUser(): EduUserData {
    return this.data.localUser
  }

  getFullUserList(): EduUser[] {
    return this.data.userList.map((t: EduUserData) => t.user);
  }

  getFullStreamList(): EduStream[] {
    return this.data.streamList.map((t: EduStreamData) => t.stream);
  }

  private get classroom(): EduClassroom {
    return {
      roomInfo: this.data.roomInfo,
      roomProperties: this.data.roomProperties,
      roomStatus: this.data.roomState,
    }
  }

  getClassroomInfo(): EduClassroom {
    return this.classroom;
  }

  getStudentCount(): number {
    return this.data.userList
      .filter((it: EduUserData) => it.user.role === EduRoleType.student).length
  }

  getTeacherCount(): number {
    return this.data.userList
      .filter((it: EduUserData) => it.user.role === EduRoleType.teacher).length
  }

  get studentList(): EduUser[] {
    return this.data.userList
      .filter((it: EduUserData) => it.user.role === EduRoleType.student)
      .map((it: EduUserData) => it.user)
  }

  get teacherList(): EduUser[] {
    return this.data.userList
      .filter((it: EduUserData) => it.user.role === EduRoleType.teacher)
      .map((it: EduUserData) => it.user)
  }

  getTeacherList(): EduUser[] {
    return this.teacherList;
  }

  getStudentList(): EduUser[] {
    return this.studentList;
  }

  syncStreamCoordinator() {
    if (this.data) {
      let sdkWrapper = this.eduManager.mediaService.sdkWrapper
      if (sdkWrapper instanceof AgoraWebRtcWrapper) {
        this.data.streamCoordinator = sdkWrapper.streamCoordinator
      }
    }
  }
}