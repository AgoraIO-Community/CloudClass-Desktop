import { IAgoraRTCRemoteUser, LocalAudioTrackStats, UID, IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack, ILocalAudioTrack, IAgoraRTC, ILocalTrack } from 'agora-rtc-sdk-ng';
import { EventEmitter } from "events";
import { EduLogger } from '../../logger';
import { IWebRTCWrapper, WebRtcWrapperInitOption, CameraOption, MicrophoneOption, PrepareScreenShareParams, StartScreenShareParams } from '../interfaces';
import { GenericErrorWrapper } from '../../utils/generic-error';
import { convertUid, paramsConfig } from '../utils';
import { AgoraWebStreamCoordinator } from './coordinator';

type MediaSendPacketStats = Pick<LocalAudioTrackStats, 'sendPackets' | 'sendPacketsLost'>;

export type AgoraWebVolumeResult = {
  level: number,
  uid: UID
}

export type FireTrackEndedAction = {
  resource: 'audio' | 'video',
  tag: string,
  trackId: string
}

type AgoraWebSDK = IAgoraRTC & {
  setParameter: (key: 'AUDIO_SOURCE_AVG_VOLUME_DURATION' | 'AUDIO_VOLUME_INDICATION_INTERVAL', value: number) => void
};

function getEncoderConfig(option?: CameraOption) {
  return {
    frameRate: option?.encoderConfig?.frameRate ?? 15,
    width: option?.encoderConfig?.width ?? 320,
    height: option?.encoderConfig?.height ?? 240,
  }
}

export class AgoraWebRtcWrapper extends EventEmitter implements IWebRTCWrapper {

  _client?: IAgoraRTCClient;

  _subClient: Record<string, IAgoraRTCClient>;

  _screenClient?: IAgoraRTCClient;

  agoraWebSdk!: AgoraWebSDK;

  deviceList: any[] = []

  localUid?: any;

  clientConfig?: any;

  joined: boolean
  // cameraTrack?: ICameraVideoTrack
  // microphoneTrack?: IMicrophoneAudioTrack

  cameraTestTrack?: ICameraVideoTrack
  // microphoneTestTrack?: IMicrophoneAudioTrack

  localScreenUid?: any;
  screenVideoTrack?: ILocalVideoTrack
  screenAudioTrack?: ILocalAudioTrack

  publishedTrackIds: any[] = []

  appId: string
  intervalMap: Record<string, any> = {}

  subscribeAudioList: any[] = []
  subscribeVideoList: any[] = []
  unsubscribeAudioList: any[] = []
  unsubscribeVideoList: any[] = []

  private videoMuted: boolean = false
  private audioMuted: boolean = false

  public publishedAudio: boolean = false
  public publishedVideo: boolean = false
  public streamCoordinator?: AgoraWebStreamCoordinator;
  private hasCamera?: boolean
  private hasMicrophone?: boolean

  _localAudioStats: {
    audioLossRate: number
  };
  _localVideoStats: {
    videoLossRate: number
  };

  videoDeviceConfig: Map<'cameraTestRenderer' | 'cameraRenderer', any> = new Map()
  audioDeviceConfig: Map<'microphoneTestTrack' | 'microphoneTrack', any> = new Map()
  audioTrackPublished: Map<string, boolean> = new Map()
  videoTrackPublished: Map<string, boolean> = new Map()

  get microphoneTrack(): IMicrophoneAudioTrack {
    return this.audioTrackMap.get('microphoneTrack')!
  }

  get cameraTrack(): ICameraVideoTrack {
    return this.videoTrackMap.get('cameraRenderer')!
  }

  constructor(options: WebRtcWrapperInitOption) {
    super();
    this.videoDeviceConfig.set('cameraTestRenderer', undefined)
    this.videoDeviceConfig.set('cameraRenderer', undefined)
    this.audioDeviceConfig.set('microphoneTestTrack', undefined)
    this.audioDeviceConfig.set('microphoneTrack', undefined)

    this.videoTrackPublished.set('cameraTestRenderer', false)
    this.videoTrackPublished.set('cameraRenderer', false)
    this.audioTrackPublished.set('microphoneTestTrack', false)
    this.audioTrackPublished.set('microphoneTrack', false)
    this.agoraWebSdk = options.agoraWebSdk as AgoraWebSDK
    this.agoraWebSdk.setArea([options.area as any])
    // this.agoraWebSdk.setArea(options.area)
    this.agoraWebSdk.setParameter("AUDIO_SOURCE_AVG_VOLUME_DURATION", 300)
    this.agoraWebSdk.setParameter("AUDIO_VOLUME_INDICATION_INTERVAL", 300)
    this.clientConfig = options.webConfig
    this.appId = options.appId
    this.joined = false;
    this.publishedAudio = false;
    this.publishedVideo = false;
    this.hasCamera = undefined;
    this.hasMicrophone = undefined;
    this._subClient = {}
    this._localAudioStats = {
      audioLossRate: 0
    }
    this._localVideoStats = {
      videoLossRate: 0
    }
    this.streamCoordinator = new AgoraWebStreamCoordinator()
  }

  clearAllInterval() {
    for (let key of Object.keys(this.intervalMap)) {
      this.closeInterval(key)
    }
  }

  releaseAllClient() {
    EduLogger.info("call web media service releaseAllClient")
    if (this.client) {
      this.client.removeAllListeners()
      EduLogger.info("call web media service main client removeAllListeners")
      this._client = undefined
    }

    if (this.screenClient) {
      this.screenClient.removeAllListeners()
      EduLogger.info("call web media service screenClient client removeAllListeners")
      this._screenClient = undefined
    }

    if (this._subClient) {
      for (let key of Object.keys(this._subClient)) {
        if (this._subClient[key]) {
          this._subClient[key].removeAllListeners()
          this.screenClient.removeAllListeners()
          EduLogger.info(`call web media service screenClient sub client ${key} removeAllListeners`)
          delete this._subClient[key]
        }
      }
      this._subClient = {}
    }
  }

  reset() {
    this.stats = {
      localAudioStats: {
        sendPackets: 0,
        sendPacketsLost: 0,
      },
      localVideoStats: {
        sendPackets: 0,
        sendPacketsLost: 0,
      }
    }
    this.publishedVideo = false
    this.publishedAudio = false
    this.hasCamera = undefined
    this.hasMicrophone = undefined
    this.localUid = undefined
    this.releaseAllClient()
    this.clearAllInterval()
    // this.cameraTrack && this.closeMediaTrack(this.cameraTrack)
    // this.microphoneTrack && this.closeMediaTrack(this.microphoneTrack)
    // this.cameraTestTrack && this.closeTestTrack(this.cameraTestTrack)
    // this.microphoneTestTrack && this.closeTestTrack(this.microphoneTestTrack)
    this.screenVideoTrack && this.closeScreenTrack(this.screenVideoTrack)
    this.screenAudioTrack && this.closeScreenTrack(this.screenAudioTrack)
    this.videoDeviceConfig.set('cameraTestRenderer', undefined)
    this.videoDeviceConfig.set('cameraRenderer', undefined)
    this.audioDeviceConfig.set('microphoneTestTrack', undefined)
    this.audioDeviceConfig.set('microphoneTrack', undefined)

    this.videoTrackPublished.set('cameraTestRenderer', false)
    this.videoTrackPublished.set('cameraRenderer', false)
    this.audioTrackPublished.set('microphoneTestTrack', false)
    this.audioTrackPublished.set('microphoneTrack', false)
    this.muteLocalAudio(true)
    this.muteLocalVideo(true)
    this.enableLocalAudio(false)
    this.enableLocalVideo(false)
    this.videoTrackMap.clear()
    this.joined = false
    this.publishedTrackIds = []
    this.deviceList = []
    this.subscribeVideoList = []
    this.subscribeAudioList = []
    this.unsubscribeAudioList = []
    this.unsubscribeVideoList = []
    this.videoMuted = false
    this.audioMuted = false
    this.channelName = ''
    this.streamCoordinator = undefined
  }

  get client(): IAgoraRTCClient {
    return this._client as IAgoraRTCClient
  }

  get screenClient(): IAgoraRTCClient {
    return this._screenClient as IAgoraRTCClient
  }

  private fire(...eventArgs: any[]) {
    const [eventName, ...args] = eventArgs
    // EduLogger.info(eventName, ...args)
    this.emit(eventName, ...args)
  }

  // TODO: not in used, need to refactor
  init() {
    this._client = this.agoraWebSdk.createClient(this.clientConfig)
    this.streamCoordinator?.updateRtcClient(this._client)
    this.client.on('user-joined', (user) => {
      // this.fire('user-joined', user)
    })
    this.client.on('user-left', (user) => {
      // this.fire('user-left', user)
    })
    this.streamCoordinator?.on('user-published', async (user, mediaType) => {
      EduLogger.info("user-published", user)
      this.fire('user-published', {
        user,
        mediaType,
        channel: this.channelName
      })
    })
    this.client.on('user-published', async (user, mediaType) => {
      EduLogger.info("user-published ", user, mediaType)
      if (user.uid !== this.localScreenUid) {
        // if (mediaType === 'audio') {
        //   if (!this.audioMuted) {
        //     EduLogger.info("subscribeAudio, user", user)
        //     await this.client.subscribe(user, 'audio')
        //     if (user.audioTrack) {
        //       !user.audioTrack.isPlaying && user.audioTrack.play()
        //     }
        //   }
        // }

        // if (mediaType === 'video') {
        //   if (!this.videoMuted) {
        //     EduLogger.info("subscribeVideo, user", user)
        //     await this.client.subscribe(user, 'video')
        //     this.fire('user-published', {
        //       user,
        //       mediaType,
        //       channel: this.channelName
        //     })
        //   }
        // }
        this.streamCoordinator?.addRtcStream(user, mediaType)
      }
    })
    this.streamCoordinator?.on('user-unpublished', async (user, mediaType) => {
      this.fire('user-unpublished', {
        user,
        mediaType,
        channel: this.channelName,
      })
    })
    this.client.on('user-unpublished', (user, mediaType) => {
      if (user.uid === this.localScreenUid) return
      // this.fire('user-unpublished', {
      //   user,
      //   mediaType,
      //   channel: this.channelName,
      // })
      this.streamCoordinator?.removeRtcStream(user, mediaType)
    })
    // this.client.on('user-info-updated', (uid, msg) => {
    //   this.fire('user-info-updated', {
    //     uid, msg
    //   })
    // })
    this.client.on('token-privilege-did-expire', () => {
      this.fire('token-privilege-did-expire')
    })
    this.client.on('token-privilege-will-expire', () => {
      this.fire('token-privilege-will-expire')
    })
    this.client.on('connection-state-change', (curState, revState) => {
      this.fire('connection-state-change', {
        curState,
        revState
      })
    })
    this.client.on('exception', (err: any) => {
      this.fire('exception', {
        err
      })
    })
    this.client.on('stream-fallback', (uid, isFallbackOrRecover) => {
      this.fire('stream-fallback', {
        uid, isFallbackOrRecover
      })
    })
    this.client.on('network-quality', (evt: any) => {
      const audioStats = this.client.getRemoteAudioStats()
      const videoStats = this.client.getRemoteVideoStats()
      const localVideoStats = this.client.getLocalVideoStats()
      this.fire('localVideoStats', {
        stats: {
          encoderOutputFrameRate: localVideoStats.captureFrameRate,
        }
      })
      for (let uid of Object.keys(videoStats)) {
        const videoState = videoStats[`${uid}`]
        if (videoState) {
          this.fire('remoteVideoStats', {
            user: {
              uid: convertUid(uid)
            },
            stats: {
              uid: convertUid(uid),
              decoderOutputFrameRate: isNaN(videoState.renderFrameRate!) ? NaN : videoState.renderFrameRate,
            }
          })
        }
      }
      this.fire('network-quality', {
        downlinkNetworkQuality: evt.downlinkNetworkQuality,
        uplinkNetworkQuality: evt.uplinkNetworkQuality,
        localPacketLoss: {
          audioStats: this._localAudioStats,
          videoStats: this._localVideoStats
        },
        remotePacketLoss: {
          audioStats,
          videoStats
        }
      })
    })
    return
  }

  release() {
    this.reset()
  }

  private stats: {
    localAudioStats: {
      sendPackets: number;
      sendPacketsLost: number;
    },
    localVideoStats: {
      sendPackets: number;
      sendPacketsLost: number;
    }
  } = {
      localAudioStats: {
        sendPackets: 0,
        sendPacketsLost: 0,
      },
      localVideoStats: {
        sendPackets: 0,
        sendPacketsLost: 0,
      }
    }

  private channelName: string = ''

  async join(option: any): Promise<any> {
    const client = this.registerClientByChannelName(option.channel)
    EduLogger.debug(`web#join ${JSON.stringify(option)}`)
    this.localUid = await client.join(this.appId, option.channel, option.token, option.uid);
    this.joined = true
    this.channelName = option.channel
    this._client = client;
    return this.localUid;
  }

  registerClientByChannelName(channelName: string) {
    const client = this.agoraWebSdk.createClient(this.clientConfig);
    this.streamCoordinator?.updateRtcClient(client)
    //@ts-ignore
    this.agoraWebSdk.setParameter(paramsConfig)
    this.streamCoordinator?.on('user-published', async (user, mediaType) => {
      EduLogger.info("user-published", user)
      this.fire('user-published', {
        user,
        mediaType,
        channel: this.channelName
      })
    })
    client.on('user-published', async (user, mediaType) => {
      EduLogger.info("user-published ", user, mediaType)
      if (user.uid !== this.localScreenUid) {
        if (mediaType === 'audio') {
          // await client.subscribe(user, 'audio')
          // if (user.audioTrack) {
          //   !user.audioTrack.isPlaying && user.audioTrack.play()
          // }

        }

        if (mediaType === 'video') {
          // await client.subscribe(user, 'video')
          // this.fire('user-published', {
          //   user,
          //   mediaType,
          //   channel: channelName
          // })
        }
        this.streamCoordinator?.addRtcStream(user, mediaType)
      }
    })
    this.streamCoordinator?.on('user-unpublished', async (user, mediaType) => {
      this.fire('user-unpublished', {
        user,
        mediaType,
        channel: this.channelName,
      })
    })
    client.on('user-unpublished', (user, mediaType) => {
      if (user.uid === this.localScreenUid) return
      this.streamCoordinator?.removeRtcStream(user, mediaType)
      // this.fire('user-unpublished', {
      //   user,
      //   mediaType,
      //   channel: channelName
      // })
    })
    client.on('token-privilege-did-expire', () => {
      // this.fire('token-privilege-did-expire')
    })
    client.on('token-privilege-will-expire', () => {
      // this.fire('token-privilege-will-expire')
    })
    client.on('connection-state-change', (curState, revState) => {
      this.fire('connection-state-change', {
        curState,
        revState,
        channel: channelName
      })
    })
    client.on('exception', (err: any) => {
      this.fire('exception', {
        err,
        channel: channelName
      })
    })
    client.on('stream-fallback', (uid, isFallbackOrRecover) => {
      this.fire('stream-fallback', {
        uid,
        isFallbackOrRecover,
        channel: channelName
      })
    })
    client.on('network-quality', (evt: any) => {
      const audioStats = this.client.getRemoteAudioStats()
      const videoStats = this.client.getRemoteVideoStats()

      const prevStats = this.stats

      const prevAudioStats: MediaSendPacketStats = {
        sendPackets: prevStats.localAudioStats.sendPackets,
        sendPacketsLost: prevStats.localAudioStats.sendPacketsLost,
      }

      const prevVideoStats: MediaSendPacketStats = {
        sendPackets: prevStats.localVideoStats.sendPackets,
        sendPacketsLost: prevStats.localVideoStats.sendPacketsLost,
      }

      const localAudioStats = this.client.getLocalAudioStats()
      const localVideoStats = this.client.getLocalVideoStats()

      const take = (stats: MediaSendPacketStats) => {
        return {
          sendPacketsLost: !isNaN(stats.sendPacketsLost) ? stats.sendPacketsLost : 0,
          sendPackets: !isNaN(stats.sendPackets) ? stats.sendPackets : 0,
        }
      }

      const calcLostRate = (oldStats: MediaSendPacketStats, newStats: MediaSendPacketStats, type: string) => {

        if (oldStats.sendPacketsLost <= newStats.sendPacketsLost
          && oldStats.sendPackets <= newStats.sendPackets) {
          const deltaSendPacketsLost = newStats.sendPacketsLost - oldStats.sendPacketsLost
          const deltaSendPackets = newStats.sendPackets - oldStats.sendPackets
          const res = (deltaSendPacketsLost / (deltaSendPacketsLost + deltaSendPackets)) * 100

          if (type === 'video') {
            this.stats.localVideoStats = {
              sendPacketsLost: newStats.sendPacketsLost,
              sendPackets: newStats.sendPackets,
            }
          } else {
            this.stats.localAudioStats = {
              sendPacketsLost: newStats.sendPacketsLost,
              sendPackets: newStats.sendPackets,
            }
          }

          if (isNaN(res)) {
            return 0
          }
          return +res.toFixed(2)
        } else {
          // reset prevStats when current stats is smaller than prev stats
          this.stats.localVideoStats = {
            sendPacketsLost: 0,
            sendPackets: 0,
          }
          this.stats.localAudioStats = {
            sendPacketsLost: 0,
            sendPackets: 0,
          }
          return 0
        }
      }

      const deltaAudioLostRate = calcLostRate(take(prevAudioStats), take(localAudioStats), 'audio')
      const deltaVideoLostRate = calcLostRate(take(prevVideoStats), take(localVideoStats), 'video')

      // this.stats = {
      //   localAudioStats: {
      //     sendPackets: localAudioStats.sendPackets,
      //     sendPacketsLost: localAudioStats.sendPacketsLost,
      //   },
      //   localVideoStats: {
      //     sendPackets: localVideoStats.sendPackets,
      //     sendPacketsLost: localVideoStats.sendPacketsLost,
      //   }
      // }
      // const audioLossRate = localAudioStats.sendPacketsLost / (localAudioStats.sendPacketsLost + localAudioStats.sendPackets)
      // const videoLossRate = localVideoStats.sendPacketsLost / (localVideoStats.sendPacketsLost + localVideoStats.sendPackets)
      // this._localVideoStats = {
      //   // TODO: handle NaN
      //   videoLossRate: isNaN(videoLossRate) ? 0 : videoLossRate
      // }
      this.fire('localVideoStats', {
        stats: {
          encoderOutputFrameRate: localVideoStats.captureFrameRate,
        }
      })
      for (let uid of Object.keys(videoStats)) {
        const videoState = videoStats[`${uid}`]
        if (videoState) {
          this.fire('remoteVideoStats', {
            user: {
              uid: convertUid(uid)
            },
            stats: {
              uid: convertUid(uid),
              decoderOutputFrameRate: isNaN(videoState.renderFrameRate!) ? NaN : videoState.renderFrameRate,
            }
          })
        }
      }
      const stats = client.getRTCStats()
      this.fire('network-quality', {
        downlinkNetworkQuality: evt.downlinkNetworkQuality,
        uplinkNetworkQuality: evt.uplinkNetworkQuality,
        channel: channelName,
        rtt: stats.RTT,
        localPacketLoss: {
          audioStats: {
            audioLossRate: deltaAudioLostRate,
          },
          videoStats: {
            videoLossRate: deltaVideoLostRate,
          }
        },
        remotePacketLoss: {
          audioStats,
          videoStats
        }
      })
    })
    client.on('volume-indicator', (result: AgoraWebVolumeResult[]) => {
      let totalVolume = 0
      const speakers = result.map((result: AgoraWebVolumeResult) => {
        totalVolume += result.level
        return {
          uid: result.uid,
          volume: result.level,
        }
      })
      const speakerNumber = speakers.length

      this.fire('volume-indication', {
        channel: channelName,
        speakers,
        speakerNumber,
        totalVolume
      })
    })
    client.enableAudioVolumeIndicator()
    return client
  }

  async joinSubChannel(option: any): Promise<any> {
    const subChannel = this._subClient[option.channel]
    if (!subChannel) {
      let childChannel = this.registerClientByChannelName(option.channel)
      await childChannel.join(this.appId, option.channel, option.token, option.uid)
      this._subClient[option.channel] = childChannel
      return childChannel
    }
  }

  private releaseChannel(key: string) {
    const client = this._subClient[key]
    client.removeAllListeners()
    delete this._subClient[key]
  }

  async leaveSubChannel(channelName: string): Promise<any> {
    const subChannel = this._subClient[channelName]
    if (subChannel) {
      await subChannel.leave()
      this.releaseChannel(channelName)
    }
  }

  async leave(): Promise<any> {
    await this.stopScreenShare()
    await this.client.leave()
    this.joined = false
    this._localAudioStats = {
      audioLossRate: 0
    }
    this._localVideoStats = {
      videoLossRate: 0
    }
  }

  async muteAllVideo(val: boolean): Promise<any> {
    const asyncList = [
      this.muteLocalVideo(val)
    ].concat(
      this.subscribeVideoList.map((uid: any) => this.muteRemoteVideo(uid, val))
    )
    try {
      await Promise.all(asyncList)
      this.videoMuted = val
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async muteAllAudio(val: boolean): Promise<any> {
    const asyncList = [
      this.muteLocalAudio(val)
    ].concat(
      this.subscribeAudioList.map((uid: any) => this.muteRemoteAudio(uid, val))
    )
    try {
      await Promise.all(asyncList)
      this.audioMuted = val
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  updateVideoList(targetUid: any, type: string) {
    if (type === 'subscribe') {
      const subVideoIdx = this.subscribeVideoList.findIndex((uid: any) => uid === targetUid)
      const subVideoExist = subVideoIdx === -1
      if (subVideoExist) {
        this.subscribeVideoList.push(targetUid)
      }
      const unsubVideoIdx = this.unsubscribeVideoList.findIndex((uid: any) => uid === targetUid)
      const unsubVideoExist = unsubVideoIdx !== -1
      if (unsubVideoExist) {
        this.unsubscribeVideoList.splice(unsubVideoIdx, 1)
      }
    }

    if (type === 'unsubscribe') {
      const subVideoIdx = this.subscribeVideoList.findIndex((uid: any) => uid === targetUid)
      const subVideoExist = subVideoIdx !== -1
      if (subVideoExist) {
        this.subscribeVideoList.splice(subVideoIdx, 1)
      }
      const unsubVideoIdx = this.unsubscribeVideoList.findIndex((uid: any) => uid === targetUid)
      const unsubVideoExist = unsubVideoIdx === -1
      if (unsubVideoExist) {
        this.unsubscribeVideoList.push(targetUid)
      }
    }
  }

  updateAudioList(targetUid: any, type: string) {
    if (type === 'subscribe') {
      const subAudioIdx = this.subscribeAudioList.findIndex((uid: any) => uid === targetUid)
      const subAudioExist = subAudioIdx === -1
      if (subAudioExist) {
        this.subscribeAudioList.push(targetUid)
      }
      const unsubAudioIdx = this.unsubscribeAudioList.findIndex((uid: any) => uid === targetUid)
      const unsubVideoExist = unsubAudioIdx !== -1
      if (unsubVideoExist) {
        this.unsubscribeAudioList.splice(unsubAudioIdx, 1)
      }
    }

    if (type === 'unsubscribe') {
      const subAudioIdx = this.subscribeAudioList.findIndex((uid: any) => uid === targetUid)
      const subAudioExist = subAudioIdx !== -1
      if (subAudioExist) {
        this.subscribeAudioList.splice(subAudioIdx, 1)
      }
      const unsubAudioIdx = this.unsubscribeAudioList.findIndex((uid: any) => uid === targetUid)
      const unsubVideoExist = unsubAudioIdx === -1
      if (unsubVideoExist) {
        this.unsubscribeAudioList.push(unsubAudioIdx)
      }
    }
  }

  async subscribeAudio(user: any): Promise<any> {
    await this.client.subscribe(user, 'audio');
    this.updateAudioList(user.uid, 'subscribe')
    // this.fire('user-published', {user})
  }

  private async unsubscribeAudio(user: any): Promise<any> {
    await this.client.unsubscribe(user, 'audio');
    this.updateAudioList(user.uid, 'unsubscribe')
    // this.fire('user-unpublished', {user})
  }

  private async subscribeVideo(user: any): Promise<any> {
    EduLogger.info("subscribe user", user)
    await this.client.subscribe(user, 'video')
    // this.fire('user-published', {user})
  }

  private async unsubscribeVideo(user: any): Promise<any> {
    await this.client.unsubscribe(user, 'video')
    // this.fire('user-unpublished', {user})
  }

  async muteRemoteVideo(uid: any, val: boolean): Promise<any> {
    const targetUser = this.client.remoteUsers.find(user => user.uid === +uid)
    if (!targetUser) return
    if (val) {
      await this.unsubscribeVideo(targetUser)
    } else {
      EduLogger.info("call subscribeVideo")
    }
  }

  async muteRemoteAudio(uid: any, val: boolean): Promise<any> {
    const targetUser = this.client.remoteUsers.find(user => user.uid === +uid)
    if (!targetUser) return
    if (val) {
      await this.unsubscribeAudio(targetUser)
    } else {
      EduLogger.info("call subscribeAudio")
      // await this.subscribeAudio(targetUser)
    }
  }

  async changeResolution(config: any): Promise<any> {
    await this.cameraTrack?.setEncoderConfiguration(config)
  }

  closeInterval(type: string) {
    if (this.intervalMap[type]) {
      clearInterval(this.intervalMap[type])
      this.intervalMap[type] = undefined
    }
  }

  addInterval(call: CallableFunction, type: string, args: any, delay: number) {
    if (this.intervalMap[type]) {
      this.closeInterval(type)
    }
    this.intervalMap[type] = setInterval(call, delay, args)
  }

  enableAudioVolumeIndicator() {
    this.client.enableAudioVolumeIndicator()
    EduLogger.info(" enableAudioVolumeIndicator ")
  }

  private closeScreenTrack(track: ILocalTrack) {
    if (track) {
      track.stop()
      track.close()
      const index = this.publishedTrackIds.indexOf(track.getTrackId)
      if (index !== -1) {
        this.publishedTrackIds.splice(index, 1)
      }
    }
    if (track.trackMediaType === 'video') {
      this.screenVideoTrack = undefined
    }
    if (track.trackMediaType === 'audio') {
      this.screenAudioTrack = undefined
    }
  }

  async prepareScreenShare(options: PrepareScreenShareParams): Promise<any> {
    try {
      const screenClient = this.agoraWebSdk.createClient(this.clientConfig)

      const tracks = await this.agoraWebSdk.createScreenVideoTrack({
        encoderConfig: options.encoderConfig,
      }, options.shareAudio)

      switch (options.shareAudio) {
        case 'enable': {
          const screenTracks: [ILocalVideoTrack, ILocalAudioTrack] = tracks as [ILocalVideoTrack, ILocalAudioTrack]
          this.screenVideoTrack = screenTracks[0]
          this.screenAudioTrack = screenTracks[1]
          break;
        }
        case 'auto': {
          if (tracks.hasOwnProperty('trackMediaType')) {
            this.screenVideoTrack = tracks as ILocalVideoTrack
          } else {
            const screenTracks: [ILocalVideoTrack, ILocalAudioTrack] = tracks as [ILocalVideoTrack, ILocalAudioTrack]
            this.screenVideoTrack = screenTracks[0]
            this.screenAudioTrack = screenTracks[1]
          }
          break;
        }
        default: {
          this.screenVideoTrack = tracks as ILocalVideoTrack
          break;
        }
      }

      (this.screenVideoTrack as ILocalTrack).on('track-ended', () => {
        this.screenAudioTrack && this.closeScreenTrack(this.screenAudioTrack)
        this.screenVideoTrack && this.closeScreenTrack(this.screenVideoTrack)
        this.fire('track-ended', { resource: 'screen', screen: true })
      })

      this._screenClient = screenClient
      return
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async startScreenShare(option: StartScreenShareParams): Promise<any> {
    if (!this.screenClient) return
    const params = option.params
    this.localScreenUid = await this.screenClient.join(this.appId, params.channel, params.token, params.uid)
    if (this.screenAudioTrack) {
      const trackId = this.screenAudioTrack.getTrackId()
      if (this.publishedTrackIds.indexOf(trackId) < 0) {
        await this.screenClient.publish([this.screenAudioTrack])
        this.publishedTrackIds.push(trackId)
      }
    }

    if (this.screenVideoTrack) {
      const trackId = this.screenVideoTrack.getTrackId()
      if (this.publishedTrackIds.indexOf(trackId) < 0) {
        await this.screenClient.publish([this.screenVideoTrack])
        this.publishedTrackIds.push(trackId)
      }
    }
  }

  async stopScreenShare(): Promise<any> {
    if (!this.screenClient) return
    if (this.screenAudioTrack) {
      this.closeScreenTrack(this.screenAudioTrack)
    }
    if (this.screenVideoTrack) {
      this.closeScreenTrack(this.screenVideoTrack)
    }
    await this.screenClient.leave()
    this.screenClient.removeAllListeners()
    this._screenClient = undefined
    this.localScreenUid = undefined
  }

  async getDevices() {
    const list = await this.agoraWebSdk.getDevices()
    this.deviceList = list
    return list
  }

  async getMicrophones() {
    const list = await this.agoraWebSdk.getMicrophones();
    this.deviceList = list
    return list;
  }

  async getCameras() {
    const list = await this.agoraWebSdk.getCameras();
    this.deviceList = list
    return list;
  }

  changePlaybackVolume(volume: number) {
    this.client?.localTracks?.forEach((t: ILocalTrack) => {
      t.trackMediaType === 'audio' && (t as ILocalAudioTrack).setVolume(volume)
    })
    this.client?.remoteUsers?.forEach((user: IAgoraRTCRemoteUser) => {
      user.audioTrack?.setVolume(volume)
    })
  }

  private fireTrackEnd({ resource, tag, trackId }: FireTrackEndedAction) {
    // 加入房间的时候重置丢包率
    if (this.joined) {
      if (resource === 'audio') {
        this.stats.localAudioStats.sendPackets = 0
        this.stats.localAudioStats.sendPacketsLost = 0
      }

      if (resource === 'video') {
        this.stats.localVideoStats.sendPackets = 0
        this.stats.localVideoStats.sendPacketsLost = 0
      }
    }

    if (resource === 'video') {
      this.videoTrackPublished.set(`${tag}`, false)
    }

    if (resource === 'audio') {
      this.audioTrackPublished.set(`${tag}`, false)
      this.closeInterval('test-volume')
    }

    console.log('fireTrackEnd web: ', resource, tag, trackId)

    this.fire('track-ended', { resource, tag, trackId, operation: 'pulled' })
  }

  videoTrackMap: Map<string, ICameraVideoTrack | undefined> = new Map()
  audioTrackMap: Map<string, IMicrophoneAudioTrack | undefined> = new Map()

  async acquireCameraTrack(type: 'cameraTestRenderer' | 'cameraRenderer') {
    const track = this.videoTrackMap.get(type)
    if (!track) {
      const videoTrack = await this.agoraWebSdk.createCameraVideoTrack({
        cameraId: this.videoDeviceConfig.get(type),
        encoderConfig: getEncoderConfig(),
      })
      const trackId = videoTrack.getTrackId()
      this.videoTrackMap.set(type, videoTrack)
      videoTrack.on('track-ended', () => {
        this.fireTrackEnd({ resource: 'video', tag: type, trackId })
        if (videoTrack) {
          videoTrack.isPlaying && videoTrack.stop()
          videoTrack.close()
        }
        this.videoTrackMap.set(type, undefined)
      })
    }
  }

  async removeCameraTrack(type: 'cameraTestRenderer' | 'cameraRenderer') {
    const track = this.videoTrackMap.get(type)
    if (track) {
      track.isPlaying && track.stop()
      track.close()
      this.videoTrackMap.set(type, undefined)
    }
  }

  async acquireMicrophoneTrack(type: 'microphoneTestTrack' | 'microphoneTrack') {
    const track = this.audioTrackMap.get(type)
    if (!track) {
      const microphoneId = this.audioDeviceConfig.get(type)
      let audioTrack: any;
      if (microphoneId) {
        audioTrack = await this.agoraWebSdk.createMicrophoneAudioTrack({
          microphoneId: this.audioDeviceConfig.get(type),
        })
      } else {
        audioTrack = await this.agoraWebSdk.createMicrophoneAudioTrack({
          microphoneId: this.audioDeviceConfig.get(type),
        })
      }

      if (audioTrack) {
        this.audioTrackMap.set(type, audioTrack)
        audioTrack.stop()
        this.addInterval((track: ILocalAudioTrack) => {
          if (track) {
            const totalVolume = track.getVolumeLevel()
            this.fire('local-audio-volume', {totalVolume})
          }
        }, 'test-volume', this.microphoneTrack, 300)
        const trackId = audioTrack.getTrackId()
        audioTrack.on('track-ended', () => {
          this.fireTrackEnd({ resource: 'audio', tag: type, trackId })
          if (audioTrack) {
            audioTrack.close()
          }
          this.audioTrackMap.set(type, undefined)
        })
      }
    }
  }

  async removeMicrophoneTrack(type: 'microphoneTestTrack' | 'microphoneTrack') {
    const track = this.audioTrackMap.get(type)
    if (track) {
      this.closeInterval('test-volume')
      track.close()
      this.audioTrackMap.set(type, undefined)
    }
  }

  /**
  * 开启视频采集
  * @param v 
  */
  async enableLocalVideo(v: boolean) {
    if (v) {
      try {
        await this.acquireCameraTrack('cameraRenderer')
      } catch (err) {
        // this.fire('localVideoStateChanged', { state: 3, error: 0 })
        throw err
      }
    } else {
      try {
        await this.removeCameraTrack('cameraRenderer')
      } catch (err) {
        // this.fire('localVideoStateChanged', { state: 3, error: 0 })
        throw err
      }
    }
  }

  disableLocalVideo() {
    try {
      this.removeCameraTrack('cameraRenderer')
    } catch (err) {
      this.fire('localVideoStateChanged', { state: 3, error: 0 })
    }
  }

  disableLocalAudio() {
    try {
      this.removeMicrophoneTrack('microphoneTrack')
    } catch (err) {
      this.fire('localAudioStateChanged', { state: 3, error: 0 })
    }
  }

  /**
   * 开启音频采集
   * @param v 
   */
  async enableLocalAudio(v: boolean) {
    if (v) {
      try {
        await this.acquireMicrophoneTrack('microphoneTrack')
      } catch (err) {
        throw err
        // this.fire('localAudioStateChanged', { state: 3, error: 0 })
      }
    } else {
      try {
        await this.removeMicrophoneTrack('microphoneTrack')
      } catch (err) {
        throw err
        // this.fire('localAudioStateChanged', { state: 3, error: 0 })
      }
    }
  }

  /**
   * 关闭音频发流
   * @param v 
   * @returns 
   */
  async muteLocalAudio(v: boolean, deviceId?: string) {
    if (!this.client) return
    const track = this.audioTrackMap.get('microphoneTrack')
    console.log('[RTE] microphoneTrack ', track, v, deviceId)
    if (!track) {
      if (!v) {
        this.audioDeviceConfig.set('microphoneTrack', deviceId)
        await this.acquireMicrophoneTrack('microphoneTrack')
        const _audioTrack = this.audioTrackMap.get('microphoneTrack') as ILocalTrack
        const oldAudioTracks = this.client.localTracks.filter((e: ILocalTrack) => e.trackMediaType === 'audio')
        await this.client.unpublish(oldAudioTracks)
        await this.client.publish([_audioTrack])
        this.audioTrackPublished.set('microphoneTrack', true)
      }
      return
    }

    const published = this.audioTrackPublished.get('microphoneTrack')
    if (published) {
      await track.setEnabled(!v)
      if (deviceId) {
        await this.setMicrophoneDevice(deviceId)
      }
    } else {
      const oldAudioTracks = this.client.localTracks.filter((e: ILocalTrack) => e.trackMediaType === 'audio')
      await this.client.unpublish(oldAudioTracks)
      await this.client.publish([track])
      this.audioTrackPublished.set('microphoneTrack', true)
      await track.setEnabled(!v)
    }
  }

  /**
   * 关闭视频发流
   * @param v 
   * @returns 
   */
  async muteLocalVideo(v: boolean, deviceId?: string) {
    if (!this.client) return
    const track = this.videoTrackMap.get('cameraRenderer')
    console.log('[RTE] muteLocalVideo ', track, v, deviceId)
    if (!track) {
      if (!v) {
        this.videoDeviceConfig.set('cameraRenderer', deviceId)
        await this.acquireCameraTrack('cameraRenderer')
        const _videoTrack = this.videoTrackMap.get('cameraRenderer') as ILocalTrack
        const oldVideoTracks = this.client.localTracks.filter((e: ILocalTrack) => e.trackMediaType === 'video')
        await this.client.unpublish(oldVideoTracks)
        await this.client.publish([_videoTrack])
        this.videoTrackPublished.set('cameraRenderer', true)
      }
      return
    }
    
    const published = this.videoTrackPublished.get('cameraRenderer')
    if (published) {
      await track.setEnabled(!v)
      if (deviceId) {
        await this.setCameraDevice(deviceId)
      }
    } else {
      const oldVideoTracks = this.client.localTracks.filter((e: ILocalTrack) => e.trackMediaType === 'video')
      await this.client.unpublish(oldVideoTracks)
      await this.client.publish([track])
      this.videoTrackPublished.set('cameraRenderer', true)
      await track.setEnabled(!v)
    }
  }

  /**
   * 设置摄像头设备
   * @param deviceId 
   * @returns 
   */
   async setCameraDevice(deviceId: string) {
    const track = this.videoTrackMap.get('cameraRenderer')
    if (!track) {
      this.videoDeviceConfig.set('cameraRenderer', deviceId)
      return
    }
    await track.setDevice(deviceId)
    this.videoDeviceConfig.set('cameraRenderer', deviceId)
  }

  /**
   * 设置麦克风设备
   * @param deviceId 
   * @returns 
   */
  async setMicrophoneDevice(deviceId: string) {
    const track = this.audioTrackMap.get('microphoneTrack')
    if (!track) {
      this.audioDeviceConfig.set('microphoneTrack', deviceId)
      return
    }
    await track.setDevice(deviceId)
    // await this.agoraWebSdk.checkAudioTrackIsActive(track)
    this.audioDeviceConfig.set('microphoneTrack', deviceId)
  }
}