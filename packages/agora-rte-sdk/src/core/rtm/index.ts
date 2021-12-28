import { EventEmitter } from 'events';
import AgoraRTM, {
  RtmStatusCode,
  RtmChannel,
  RtmClient,
  RtmMessage,
  RtmTextMessage,
} from 'agora-rtm-sdk';
import { Logger } from '../logger';
import { AgoraRegion, AgoraRteEngineConfig, AgoraRteLogLevel } from '../../configs';
import { ReportService } from '../services/report';
import { AGRteErrorCode, RteErrorCenter } from '../utils/error';
import { AgoraRteEventType } from '../processor/channel-msg/handler';
// import { rteReportService } from '../services/report-service';

//@ts-ignore
// TODO
// AgoraRTM.setParameter({
//   RECONNECTING_AP_INTERVAL: 2000,
//   RECONNECTING_AP_NUM: 1,
//   DISABLE_MESSAGE_COMPRESSION: true,
// });

export enum AgoraRtmConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ABORTED = 'ABORTED',
}

interface AGRtmManagerInitConfig {
  uploadLog?: boolean;
}

const isTextMessage = (message: any): message is RtmTextMessage => {
  return message.text !== undefined;
};

export class AGRtmManager extends EventEmitter {
  public connectionState: AgoraRtmConnectionState = AgoraRtmConnectionState.DISCONNECTED;

  public prevConnectionState: AgoraRtmConnectionState = AgoraRtmConnectionState.DISCONNECTED;

  public channels: Record<string, any> = {};

  private _client?: ReturnType<typeof AgoraRTM.createInstance>;

  constructor() {
    super();
    this.connectionState = AgoraRtmConnectionState.DISCONNECTED;
    this.prevConnectionState = AgoraRtmConnectionState.DISCONNECTED;
    this.channels = {};
    this._client = undefined;
  }

  get client(): ReturnType<typeof AgoraRTM.createInstance> {
    return this._client as any;
  }

  get sessionId(): string {
    return (this.client as any).context.sid;
  }

  get logFilter() {
    let logFilter = AgoraRTM.LOG_FILTER_INFO;
    const logLevel = AgoraRteEngineConfig.logLevel;
    switch (logLevel) {
      case AgoraRteLogLevel.WARN:
        logFilter = AgoraRTM.LOG_FILTER_WARNING;
        break;
      case AgoraRteLogLevel.OFF:
        logFilter = AgoraRTM.LOG_FILTER_OFF;
        break;
      case AgoraRteLogLevel.ERROR:
        logFilter = AgoraRTM.LOG_FILTER_ERROR;
        break;
    }
    return logFilter;
  }

  private get _region(): RtmStatusCode.AreaCode {
    let region: AgoraRegion = AgoraRteEngineConfig.shared.region;
    switch (region) {
      case AgoraRegion.CN:
        return 'GLOBAL' as RtmStatusCode.AreaCode;
      case AgoraRegion.AP:
        return 'ASIA' as RtmStatusCode.AreaCode;
      case AgoraRegion.EU:
        return 'EUROPE' as RtmStatusCode.AreaCode;
      case AgoraRegion.NA:
        return 'NORTH_AMERICA' as RtmStatusCode.AreaCode;
    }
  }

  async login(token: string, uid: string, configs: AGRtmManagerInitConfig) {
    let client;
    try {
      AgoraRTM.setArea({ areaCodes: [this._region] });
      client = AgoraRTM.createInstance(AgoraRteEngineConfig.shared.appId, {
        enableLogUpload: configs.uploadLog,
        logFilter: this.logFilter,
      });
      Logger.info('[rtm] wrapper init');
      client.on(
        'ConnectionStateChanged',
        (newState: RtmStatusCode.ConnectionState, reason: RtmStatusCode.ConnectionChangeReason) => {
          Logger.info('[rtm] [Wrapper] ConnectionStateChanged', newState, reason);
          this.prevConnectionState = this.connectionState;
          this.connectionState = newState as unknown as AgoraRtmConnectionState;
          this.emit(AgoraRteEventType.RtmConnectionStateChanged, { newState, reason });
        },
      );
      client.on('MessageFromPeer', (message: RtmMessage, peerId: string, props: any) => {
        if (isTextMessage(message)) {
          Logger.debug(`[rtm] [Wrapper] MessageFromPeer ${message.text}`);
          this.emit('MessageFromPeer', { message: message.text, peerId, props });
        }
      });
      await client.login({ uid, token });
      this._client = client;
    } catch (e) {
      //cleanup
      this._destroyRtm(client);
      RteErrorCenter.shared.handleThrowableError(AGRteErrorCode.RTM_ERR_LOGIN_FAIL, e as Error);
    }
  }

  public createObserverChannel(channelName: string): [RtmChannel, EventEmitter] {
    const client = this.client;
    return [client.createChannel(channelName), new EventEmitter()];
  }

  public async join(channel: RtmChannel, bus: EventEmitter, channelName: string) {
    try {
      // REPORT
      ReportService.shared.startTick('joinRoom', 'rtm', 'joinChannel');
      if (this.channels[channelName] === channel) {
        // channel exists, skip join
        return Logger.warn(
          `[rtm] skip channel ${channelName} join as the channel is already joined`,
        );
      }

      channel.on('ChannelMessage', (message: any, memberId: string, messagePros: any) => {
        bus.emit('ChannelMessage', {
          channelName,
          message,
          memberId,
          messagePros,
        });
      });
      channel.on('MemberJoined', (memberId: string) => {
        bus.emit('MemberJoined', {
          channelName,
          memberId,
        });
      });
      channel.on('MemberLeft', (memberId: string) => {
        bus.emit('MemberLeft', {
          channelName,
          memberId,
        });
      });
      channel.on('MemberCountUpdated', (memberCount: number) => {
        bus.emit('MemberCountUpdated', {
          channelName,
          memberCount: memberCount,
        });
      });

      await channel.join();
      this.channels[channelName] = channel;
      ReportService.shared.reportElapse('joinRoom', 'rtm', {
        api: 'joinChannel',
        result: true,
      });
    } catch (err) {
      ReportService.shared.reportElapse('joinRoom', 'rtm', {
        api: 'joinChannel',
        result: false,
        //TODO
        errCode: `${(err as Error).message}`,
      });
      RteErrorCenter.shared.handleThrowableError(AGRteErrorCode.RTM_ERR_JOIN_FAILED, err as Error);
    }
  }

  public async leave(channelName: string) {
    try {
      const channel = this.channels[channelName];
      if (channel) {
        await channel.leave();
        channel.removeAllListeners();
        delete this.channels[channelName];
      }
    } catch (err) {
      // don't throw errors for leave failure
      RteErrorCenter.shared.handleNonThrowableError(
        AGRteErrorCode.RTM_ERR_LEAVE_FAILED,
        err as Error,
      );
    }
  }

  private releaseChannels() {
    for (let key of Object.keys(this.channels)) {
      if (this.channels[key]) {
        this.release(this.channels[key]);
      }
      this.channels[key] = undefined;
    }
  }

  private releaseClient() {
    this._client && this.release(this._client);
  }

  release(eventClient: any) {
    eventClient.removeAllListeners();
    Logger.info('[AGRtmManager]  eventClient removeAllListeners ');
  }

  reset() {
    this.connectionState = AgoraRtmConnectionState.DISCONNECTED;
    this.prevConnectionState = AgoraRtmConnectionState.DISCONNECTED;
    this.releaseClient();
    this.releaseChannels();
    this.channels = {};
    if (this.client) {
      this.client.removeAllListeners();
      Logger.info('[AGRtmManager] removeAllListeners');
    }
    this._client = undefined;
    this.removeAllListeners();
    Logger.info('[AGRtmManager] self removeAllListeners');
  }

  private _destroyRtm(client?: RtmClient) {
    try {
      client?.logout();
    } catch (e) {
      // don't throw errors for destroy failure
      RteErrorCenter.shared.handleNonThrowableError(
        AGRteErrorCode.RTM_ERR_DESTROY_FAILED,
        e as Error,
      );
    }
  }

  public destroyRtm() {
    this._destroyRtm(this._client);
    this._client = undefined;
  }

  async sendChannelMessage(channelName: string, message: any, options: any) {
    const channel = this.channels[channelName];
    await channel.sendMessage(message, {
      enableHistoricalMessaging: options.enableHistoricalMessaging,
    });
  }

  async sendPeerMessage(peerId: string, message: any, options: any): Promise<boolean> {
    let result = await this.client.sendMessageToPeer(message, peerId, {
      enableHistoricalMessaging: options.enableHistoricalMessaging,
    });
    return result.hasPeerReceived;
  }
}
