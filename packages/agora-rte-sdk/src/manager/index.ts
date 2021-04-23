import AgoraRTC from 'agora-rtc-sdk-ng';
import AgoraRTM from 'agora-rtm-sdk';
import { EduPeerMessageCmdType, EduTextMessage, EduCustomMessage } from '../interfaces';
import { MessageSerializer } from './../core/rtm/message-serializer';
import { EduLogger } from './../core/logger';
import { EventEmitter } from 'events';
import { RTMWrapper } from './../core/rtm/index';
import { MediaService } from '../core/media-service';
import { EduClassroomManager } from '../room/edu-classroom-manager';
import { AgoraEduApi } from '../core/services/edu-api';
import { EduConfiguration } from '../interfaces';
import { EduClassroomDataController } from '../room/edu-classroom-data-controller';
import { GenericErrorWrapper } from '../core/utils/generic-error';
import {v4 as uuidv4} from 'uuid';
import { reportService } from '../core/services/report-service';
import { AgoraWebStreamCoordinator } from '../core/media-service/web/coordinator';
import { get } from 'lodash';
import { AgoraWebRtcWrapper } from '../core/media-service/web';

export type ClassroomInitParams = {
  roomUuid: string
  roomName: string
}

export type ClassRoomAuthorization = string

const internalEduManagerConfig: {
  appId: string,
  sdkDomain: string
} = {
  appId: "",
  sdkDomain: ""
}
export class EduManager extends EventEmitter {
  // recommend use enable true
  private static enable: boolean = true

  public static _debug: boolean = false

  private apiService!: AgoraEduApi;

  public _rtmWrapper?: RTMWrapper;

  public readonly config: EduConfiguration;

  private _classroomMap: Record<string, EduClassroomManager> = {}

  public _ended: boolean = false;

  public _dataBuffer: Record<string, EduClassroomDataController> = {}

  public readonly _mediaService: MediaService;
  private _sessionId: string = uuidv4();

  constructor(
    config: EduConfiguration
  ) {
    super()
    this.config = config
    const buildOption: any = {
      platform: this.config.platform,
      cefClient: this.config.cefClient,
      agoraSdk: AgoraRTC,
      codec: this.config.codec ? this.config.codec : 'vp8',
      appId: this.config.appId
    }
    if (buildOption.platform === 'electron') {
      buildOption.electronLogPath = {
        logPath: this.config.logDirectoryPath ? `${this.config.logDirectoryPath}/agorasdk.log` : (window.logPath || ""),
        videoSourceLogPath: this.config.logDirectoryPath ? `${this.config.logDirectoryPath}/videosource.log` : (window.videoSourceLogPath || ""),
      }
      buildOption.agoraSdk = this.config.agoraRtc
    }
    this._mediaService = new MediaService(buildOption)
    if (EduManager._debug) {
      console.log("EduManager this.config ", JSON.stringify(this.config))
    }
    this.apiService = new AgoraEduApi(
      {
        appId: this.config.appId,
        rtmToken: this.config.rtmToken,
        rtmUid: this.config.rtmUid,
        sdkDomain: `${this.config.sdkDomain}`
      }
    )
    Object.assign(
      internalEduManagerConfig,
      {
        appId: this.config.appId,
        sdkDomain: this.config.sdkDomain
      }
    )
    reportService.updateRtmConfig({
      rtmToken: this.config.rtmToken,
      rtmUid: this.config.rtmUid,
    })
    reportService.setAppId(this.config.appId)
  }

  updateRtmConfig(info: {
    rtmUid: string
    rtmToken: string
  }) {
    console.log('updateRtmConfig: ', JSON.stringify(info))
    this.config.rtmUid = info.rtmUid
    this.config.rtmToken = info.rtmToken
    this.apiService.updateRtmConfig({
      rtmUid: this.config.rtmUid,
      rtmToken: this.config.rtmToken
    })
  }

  private get rtmWrapper(): RTMWrapper {
    return this._rtmWrapper as RTMWrapper;
  }

  get mediaService(): MediaService {
    return this._mediaService;
  }

  get sessionId(): string {
    return this._sessionId
  }

  static init(config: EduConfiguration): EduManager {
    return new EduManager(config);
  }

  static enableDebugLog(enable: boolean) {
    this.enable = enable
    if (this.enable) {
      EduLogger.init(internalEduManagerConfig.appId)
    }
  }

  static isElectron: boolean = false

  static useElectron() {
    this.isElectron = true
  }
  
  static async uploadLog(roomUuid: string): Promise<any> {
    return await EduLogger.enableUpload(roomUuid, this.isElectron)
  }

  private async prepareLogin(userUuid: string) {
    let res = await this.apiService.login(userUuid)
    return res
  }

  private fire(evtName: string, ...args: any[]) {
    this.emit(evtName, ...args)
  }

  private _rtmConnectionState = 'DISCONNECTED'

  get rtmConnectionState(): string {
    return this._rtmConnectionState
  }

  get streamCoordinator(): AgoraWebStreamCoordinator | undefined {
    let sdkWrapper = this.mediaService.sdkWrapper
    if(sdkWrapper instanceof AgoraWebRtcWrapper) {
      return (this.mediaService.sdkWrapper as AgoraWebRtcWrapper).streamCoordinator
    }
    return undefined
  }


  async login(userUuid: string) {
    try {
      // REPORT
      reportService.initReportUserParams({sid: this._sessionId, appId: this.config.appId, uid: userUuid})
      reportService.startTick('init', 'rtm', 'login')
      await this._login(userUuid)
      reportService.reportElapse('init', 'rtm', {api: 'login', result: true})
      reportService.startHB()
    }catch(e) {
      reportService.reportElapse('init', 'rtm', {api: 'login', result: false, errCode: `${e.message}`})
      throw e
    }
  }

  async _login(userUuid: string) {
    EduLogger.debug(`login userUuid: ${userUuid}`)
    try {
      let {userUuid: uuid, rtmToken} = await this.prepareLogin(userUuid)
      EduLogger.debug(`prepareLogin login userUuid: ${userUuid} success`)
      const rtmWrapper = new RTMWrapper(AgoraRTM)
      rtmWrapper.on('ConnectionStateChanged', async (evt: any) => {
        EduLogger.info("[rtm] ConnectionStateChanged", evt)
        if (rtmWrapper.prevConnectionState === 'RECONNECTING'
          && rtmWrapper.connectionState === 'CONNECTED') {
          for (let channel of Object.keys(this._dataBuffer)) {
            const classroom = this._dataBuffer[channel]
            if (classroom) {
              EduLogger.info("[syncing] classroom", channel)
              await classroom.syncData(true, 300)
            }
          }
        }
        reportService.updateConnectionState(rtmWrapper.connectionState)
        this.fire('ConnectionStateChanged', evt)
      })
      rtmWrapper.on('MessageFromPeer', (evt: any) => {
        EduLogger.info("[rtm] MessageFromPeer", evt)
        const res = MessageSerializer.readMessage(evt.message.text)
        if (res === null) {
          return EduLogger.warn('[room] edu-manager is invalid', res)
        }
        const { cmd, version, requestId, data } = res
        EduLogger.info('Raw MessageFromPeer peer cmd', cmd)
        if (version !== 1) {
          return EduLogger.warn('received old version', requestId, data, cmd)
        }
        switch(cmd) {
          case EduPeerMessageCmdType.peer: {
            EduLogger.info(`custom chat message, PeerMessage.${EduPeerMessageCmdType.peer}: `, data, requestId)
            const textMessage: EduTextMessage = MessageSerializer.getEduTextMessage(data)
            this.emit('user-chat-message', {
              message: textMessage
            })
            break;
          }
          // peer private custom message
          case EduPeerMessageCmdType.customMessage: {
            EduLogger.info(`subscribe custom，PeerMessage.${EduPeerMessageCmdType.customMessage}: `, data)
            const customMessage: EduCustomMessage = MessageSerializer.getEduCustomMessage(data)
            EduLogger.info(`custom peer message, user-message`, customMessage)
            this.emit('user-message', {
              message: customMessage
            })
            break;
          }
        }
        // this.fire('MessageFromPeer', evt)
      })
      EduLogger.debug(`rtm login userUuid: ${userUuid}, rtmToken: ${rtmToken} success`)
      await rtmWrapper.login({
        userUuid,
        rtmToken,
        appId: this.config.appId,
        uploadLog: true,
      })
      EduLogger.debug(`login userUuid: ${userUuid} success`)
      this._rtmWrapper = rtmWrapper
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async logout() {
    if (this.rtmWrapper) {
      this._ended = true
      await this.rtmWrapper.destroyRtm()
      this.removeAllListeners()
      this._rtmWrapper = undefined
      reportService.stopHB()
      reportService.resetParams()
      // refresh session id when logout to ensure next login get a new sid
      this._sessionId = uuidv4()
    }
  }

  createClassroom(params: ClassroomInitParams): EduClassroomManager {

    const roomUuid = params.roomUuid
    
    reportService.initReportRoomParams({rid: roomUuid})
    let classroomManager = new EduClassroomManager({
      roomUuid: roomUuid,
      roomName: params.roomName,
      eduManager: this,
      apiService: new AgoraEduApi(
        {
          appId: this.config.appId,
          rtmToken: this.config.rtmToken,
          rtmUid: this.config.rtmUid,
          sdkDomain: `${this.config.sdkDomain}`
        }
      ),
    })
    this._classroomMap[params.roomUuid] = classroomManager
    this._dataBuffer[params.roomUuid] = new EduClassroomDataController(this._classroomMap[params.roomUuid])
    classroomManager.syncStreamCoordinator()
    return this._classroomMap[params.roomUuid]
  }
}