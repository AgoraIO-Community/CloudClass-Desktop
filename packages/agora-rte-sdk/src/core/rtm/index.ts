import { EduTextMessage, EduCustomMessage, EduStream, EduUser, EduStreamData, EduUserData } from './../../interfaces/index';
import { EventEmitter } from 'events';
import AgoraRTM from 'agora-rtm-sdk'
import { RtmLogLevel } from './constants';
import { get } from 'lodash';
import { EduLogger } from '../logger';
import { GenericErrorWrapper } from '../utils/generic-error';
import { reportService } from '../services/report-service';

//@ts-ignore
AgoraRTM.setParameter({ 
  RECONNECTING_AP_INTERVAL: 2000,
  RECONNECTING_AP_NUM: 1,
  DISABLE_MESSAGE_COMPRESSION: true
})

// const logFilter = ENABLE_LOG ? AgoraRTM.LOG_FILTER_DEBUG : AgoraRTM.LOG_FILTER_OFF;
const logFilter = AgoraRTM.LOG_FILTER_OFF

export enum StepPhase {
  isFinished = 1
}

interface RTMWrapperInitConfig {
  logLevel: typeof RtmLogLevel[0]
  uploadLog: boolean
  appId: string
  channelName: string
  uid: string
  token: string
}

export class RTMWrapper extends EventEmitter {

  public localUid?: string

  public logged?: boolean

  public connectionState: string = "DISCONNECTED";

  public prevConnectionState: string = '';

  public channels: Record<string, any> = {}

  public _client?: ReturnType<typeof AgoraRTM.createInstance>

  public _streamList: EduStream[] = []
  public _userList: EduUser[] = []

  constructor(
    public readonly agoraRtm: typeof AgoraRTM) {
    super()
    this.localUid = undefined
    this.logged = false
    this.connectionState = "DISCONNECTED"
    this.prevConnectionState = ""
    this.channels = {}
    this._client = undefined
    this._streamList = []
    this._userList = []
  }

  get client(): ReturnType<typeof AgoraRTM.createInstance> {
    return this._client as any;
  }

  private releaseChannels() {
    for (let key of Object.keys(this.channels)) {
      if (this.channels[key]) {
        this.release(this.channels[key])
      }
      this.channels[key] = undefined
    }
  }

  private releaseClient() {
    this._client && this.release(this._client)
  }

  reset () {
    this.localUid = undefined
    this.logged = false
    this.connectionState = "DISCONNECTED"
    this.prevConnectionState = ""
    this.releaseClient()
    this.releaseChannels()
    this.channels = {}
    if (this.client) {
      this.client.removeAllListeners()
      EduLogger.info('[rtmWrapper] removeAllListeners')
    }
    this._client = undefined
    this.removeAllListeners()
    EduLogger.info('[rtmWrapper] self removeAllListeners')
    this._streamList = []
    this._userList = []
  }

  addStream(stream: EduStream) {
    this._streamList.push(stream)
  }

  updateStream(stream: EduStream) {
    const streamIndex = this._streamList.findIndex((t: EduStream) => t.streamUuid === stream.streamUuid)
    const targetStream = this._streamList[streamIndex]
    if (targetStream && targetStream) {
      this._streamList[streamIndex]
    }
  }

  resetDataList () {
    this._streamList = []
    this._userList = []
  }

  release(eventClient: any) {
    eventClient.removeAllListeners()
    EduLogger.info('[rtmWrapper]  eventClient removeAllListeners ')
  }

  async login(config: any) {
    const client = this.agoraRtm.createInstance(config.appId, { enableLogUpload: config.uploadLog, logFilter: logFilter})
    client.on('ConnectionStateChanged', (newState: string, reason: string) => {
      this.prevConnectionState = this.connectionState
      this.connectionState = newState
      this.emit("ConnectionStateChanged", {newState, reason});
    });
    client.on("MessageFromPeer", (message: any, peerId: string, props: any) => {
      this.emit("MessageFromPeer", {message, peerId, props});
    });
    await client.login({
      uid: config.userUuid,
      token: config.rtmToken
    })
    this._client = client
  }

  async init(
    config: RTMWrapperInitConfig,
  ) {
    const client = this.agoraRtm.createInstance(config.appId, { enableLogUpload: config.uploadLog, logFilter: logFilter})
    let channel = null;
    EduLogger.info('[rtm]  wrapper init')
    try {
      client.on('ConnectionStateChanged', (newState: string, reason: string) => {
        EduLogger.info("[rtm] [Wrapper] ConnectionStateChanged")
        this.prevConnectionState = this.connectionState
        this.connectionState = newState
        this.emit("ConnectionStateChanged", {newState, reason});
      });
      client.on("MessageFromPeer", (message: any, peerId: string, props: any) => {
        EduLogger.info("[rtm] [Wrapper] MessageFromPeer")
        this.emit("MessageFromPeer", {message, peerId, props});
      });
      await client.login({uid: config.uid, token: config.token})
      this._client = client
      this.channels[config.channelName] = channel
      this.logged = true
    } catch(err) {
      if (client) {
        await client.logout()
      }
      this.reset()
      throw GenericErrorWrapper(err)
    }
  }

  public createObserverChannel(config: any): any[] {
    const client = this.client
    return [client.createChannel(config.channelName), new EventEmitter()]
  }

  private _channels: Record<string, any> = {}

  public async join(channel: any, bus: any, config: any) {
    try {
      // REPORT
      reportService.startTick('joinRoom', 'rtm', 'joinChannel')
      await this._join(channel, bus, config)
      reportService.reportElapse('joinRoom', 'rtm', {api:'joinChannel', result: true})
    }catch(e) {
      reportService.reportElapse('joinRoom', 'rtm', {api:'joinChannel', result: false, errCode: `${e.code || e.message}`})
      throw e
    }
  }

  private async _join(channel: any, bus: any, config: any) {
    try {
      channel.on('ChannelMessage', (message: any, memberId: string, messagePros: any) => {
        EduLogger.info("[rtm] ChannelMessage", message)
        bus
        .emit('ChannelMessage', {
          channelName: config.channelName,
          message,
          memberId,
          messagePros,
        })
        // this.emit('ChannelMessage', {
        //   channelName: config.channelName,
        //   message,
        //   memberId,
        //   messagePros,
        // })
      })
      channel.on('MemberJoined', (memberId: string) => {
        bus
        .emit('MemberJoined', {
          channelName: config.channelName,
          memberId,
        })
      })
      channel.on('MemberLeft', (memberId: string) => {
        bus.emit('MemberLeft', {
          channelName: config.channelName,
          memberId,
        })
      })
      channel.on('MemberCountUpdated', (memberCount: number) => {
        bus.emit('MemberCountUpdated', {
          channelName: config.channelName,
          memberCount: memberCount
        })
      })
      await channel.join()
      this.channels[config.channelName] = channel
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  public async leave(config: any) {
    try {
      const channel = this.channels[config.channelName]
      if (channel) {
        await channel.leave()
        channel.removeAllListeners()
        delete this.channels[config.channelName]
      }
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  public async destroyRtm() {
    if (this.client) {
      await this.client.logout()
    }
    for (let channelName of Object.keys(this.channels)) {
      if (this.channels[channelName]) {
        this.channels[channelName].removeAllListeners()
        EduLogger.info('[rtmWrapper]  removeAllListeners ', channelName)
        this.channels[channelName] = undefined
      }
    }
    this.reset()
  }

  async sendChannelMessage(channelName: string, message: any, options: any) {
    const channel = this.channels[channelName]
    await channel.sendMessage(message, {enableHistoricalMessaging: options.enableHistoricalMessaging})
  }

  async sendPeerMessage(peerId: string, message: any, options: any): Promise<boolean> {
    let result = await this.client.sendMessageToPeer(message, peerId, {enableHistoricalMessaging: options.enableHistoricalMessaging})
    return result.hasPeerReceived
  }
}

export { RtmLogLevel } from './constants';