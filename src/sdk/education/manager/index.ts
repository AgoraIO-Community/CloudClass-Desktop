import { EduPeerMessageCmdType, EduTextMessage, EduCustomMessage } from './../interfaces/index.d';
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
import { AgoraEduSDK } from '@/edu-sdk';

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

  private apiService!: AgoraEduApi;

  public _rtmWrapper?: RTMWrapper;

  public readonly config: EduConfiguration;

  private _classroomMap: Record<string, EduClassroomManager> = {}

  public _ended: boolean = false;

  public _dataBuffer: Record<string, EduClassroomDataController> = {}

  public readonly _mediaService: MediaService;

  constructor(
    config: EduConfiguration
  ) {
    super()
    this.config = config
    const buildOption = {
      platform: this.config.platform,
      agoraSdk: this.config.agoraRtc,
      codec: this.config.codec ? this.config.codec : 'vp8',
      appId: this.config.appId
    } as any
    if (buildOption.platform === 'electron') {
      buildOption.electronLogPath = {
        logPath: window.logPath,
        videoSourceLogPath: window.videoSourceLogPath,
      }
    }
    this._mediaService = new MediaService(buildOption)
    if (AgoraEduSDK._debug) {
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
  }

  updateRtmConfig(info: {
    rtmUid: string
    rtmToken: string
  }) {
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

  async login(userUuid: string) {
    EduLogger.debug(`login userUuid: ${userUuid}`)
    try {
      let {userUuid: uuid, rtmToken} = await this.prepareLogin(userUuid)
      EduLogger.debug(`prepareLogin login userUuid: ${userUuid} success`)
      const rtmWrapper = new RTMWrapper(this.config.agoraRtm)
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
            EduLogger.info(`自定义聊天消息, PeerMessage.${EduPeerMessageCmdType.peer}: `, data, requestId)
            const textMessage: EduTextMessage = MessageSerializer.getEduTextMessage(data)
            this.emit('user-chat-message', {
              message: textMessage
            })
            break;
          }
          // peer private custom message
          case EduPeerMessageCmdType.customMessage: {
            EduLogger.info(`订阅自定义点对点消息，PeerMessage.${EduPeerMessageCmdType.customMessage}: `, data)
            const customMessage: EduCustomMessage = MessageSerializer.getEduCustomMessage(data)
            EduLogger.info(`自定义点对点消息, user-message`, customMessage)
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
      throw new GenericErrorWrapper(err)
    }
  }

  async logout() {
    if (this.rtmWrapper) {
      this._ended = true
      await this.rtmWrapper.destroyRtm()
      this.removeAllListeners()
      this._rtmWrapper = undefined
    }
  }

  createClassroom(params: ClassroomInitParams): EduClassroomManager {

    const roomUuid = params.roomUuid

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
    return this._classroomMap[params.roomUuid]
  }
}