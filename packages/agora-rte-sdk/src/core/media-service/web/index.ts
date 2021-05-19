import { IAgoraRTCRemoteUser, LocalAudioTrackStats, UID } from 'agora-rtc-sdk-ng';
import { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack, ILocalAudioTrack, IAgoraRTC, ILocalTrack } from 'agora-rtc-sdk-ng';
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
export class AgoraWebRtcWrapper extends EventEmitter implements IWebRTCWrapper {

  _client?: IAgoraRTCClient;

  _subClient: Record<string, IAgoraRTCClient>;

  _screenClient?: IAgoraRTCClient;

  agoraWebSdk!: AgoraWebSDK;

  deviceList: any[] = []

  localUid?: any;

  clientConfig?: any;

  joined: boolean
  cameraTrack?: ICameraVideoTrack
  microphoneTrack?: IMicrophoneAudioTrack

  cameraTestTrack?: ICameraVideoTrack
  microphoneTestTrack?: IMicrophoneAudioTrack

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

  constructor(options: WebRtcWrapperInitOption) {
    super();
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
    this.cameraTrack && this.closeMediaTrack(this.cameraTrack)
    this.microphoneTrack && this.closeMediaTrack(this.microphoneTrack)
    this.cameraTestTrack && this.closeTestTrack(this.cameraTestTrack)
    this.microphoneTestTrack && this.closeTestTrack(this.microphoneTestTrack)
    this.screenVideoTrack && this.closeScreenTrack(this.screenVideoTrack)
    this.screenAudioTrack && this.closeScreenTrack(this.screenAudioTrack)
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
  init () {
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
        remotePacketLoss:{
          audioStats,
          videoStats
        }
      })
    })
    return
  }

  release () {
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
        remotePacketLoss:{
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

  private closeMediaTrack(track: ILocalTrack) {
    if (track) {
      track.stop()
      track.close()
    }
    if (track.trackMediaType === 'video') {
      this.cameraTrack = undefined
    }
    if (track.trackMediaType === 'audio') {
      this.closeInterval('volume')
      this.microphoneTrack = undefined
    }
  }

  private closeTestTrack(track: ILocalTrack) {
    if (track) {
      track.stop()
      track.close()
    }
    if (track.trackMediaType === 'video') {
      this.cameraTestTrack = undefined
    }
    if (track.trackMediaType === 'audio') {
      this.closeInterval('test-volume')
      this.microphoneTestTrack = undefined
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
    } catch(err) {
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
    } catch(err) {
      throw GenericErrorWrapper(err)
    }
  }

  async muteLocalVideo(val: boolean): Promise<any> {
    if (this.cameraTrack) {
      await this.cameraTrack.setEnabled(val)
    }
  }
  
  async muteLocalAudio(val: boolean): Promise<any> {
    if (this.microphoneTrack) {
      await this.microphoneTrack.setEnabled(val)
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

  // async muteRemoteVideoByClient(client: IAgoraRTCClient, uid: any, val: boolean): Promise<any> {
  //   const targetUser = client.remoteUsers.find(user => user.uid === +uid)
  //   if (!targetUser) return
  //   if (val) {
  //     await client.unsubscribe(targetUser, 'video')
  //   } else {
  //     EduLogger.info("call subscribeVideo")
  //   }
  // }

  // async muteRemoteAudioByClient(client: IAgoraRTCClient, uid: any, val: boolean): Promise<any> {
  //   const targetUser = client.remoteUsers.find(user => user.uid === +uid)
  //   if (!targetUser) return
  //   if (val) {
  //     await client.unsubscribe(targetUser, 'audio')
  //     this.fire('user-unpublished')
  //   } else {
  //     EduLogger.info("call subscribeVideo")
  //   }
  // }

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

  async openCamera(option?: CameraOption): Promise<any> {
    EduLogger.info('[agora-web] invoke web#openCamera')
    try {
      await this.acquireCameraTrack('cameraRenderer', option)
    } catch(err) {
      this.fire('localVideoStateChanged', {state: 3, error: 0})
      throw err
    }
    if (this.hasCamera === undefined) {
      EduLogger.info(`[agora-web] prepare attempt open camera in web`)
      const cameraList = await this.getCameras()
      this.hasCamera = !!cameraList.length
      this.publishedVideo = this.hasCamera
      EduLogger.info(`[agora-web] prepare open camera success`)
    }
    if (this.joined && this.publishedVideo) {
      const cameraId = this.cameraTrack!.getTrackId()
      const videoTracks = this.client.localTracks.filter((e: ILocalTrack) => e.trackMediaType === 'video')
      await this.client.unpublish(videoTracks)
      await this.client.publish([this.cameraTrack!])
      EduLogger.info(`[agora-web] publish camera [${cameraId}] success`)
    }
  }

  async closeCamera() {
    EduLogger.info('[agora-web] invoke close#openCamera')
    if (this.cameraTrack) {
      try {
        await this.unpublishTrack(this.cameraTrack)
        if (this.cameraTrack) {
          const trackId = this.cameraTrack?.getTrackId()
          this.cameraTrack.isPlaying && this.cameraTrack.stop()
          this.cameraTrack.close()
          EduLogger.info(`[agora-web] close camera [${trackId}] success`)
          this.cameraTrack = undefined
          this.fire('track-ended', {resource: 'video', trackId: trackId, type: 'cameraRenderer', operation: 'close'})
        }
      } catch (err) {
        if (this.cameraTrack) {
          const trackId = this.cameraTrack?.getTrackId()
          this.cameraTrack.isPlaying && this.cameraTrack.stop()
          this.cameraTrack.close()
          EduLogger.info(`[agora-web] close camera [${trackId}] success`)
          this.cameraTrack = undefined
          this.fire('track-ended', {resource: 'video', trackId: trackId, type: 'cameraRenderer', operation: 'close'})
        }
        throw GenericErrorWrapper(err)
      }
    }
  }

  async changeCamera(deviceId: string): Promise<any> {
    EduLogger.info('[agora-web] invoke close#changeCamera')
    if (this.cameraTrack) {
      await this.cameraTrack.setDevice(deviceId)
      await this.agoraWebSdk.checkVideoTrackIsActive(this.cameraTrack as ILocalVideoTrack)
      EduLogger.info(`[agora-web] changeCamera by deviceId: ${deviceId} success`)
    } else {
      throw 'no camera track found'
    }
  }

  async openMicrophone(option?: MicrophoneOption): Promise<any> {
    if (this.microphoneTrack) throw 'microphone track already exists'
    EduLogger.info('[agora-web] invoke web#openMicrophone')
    await this.acquireMicrophoneTrack('microphoneTrack', option)
    if (this.microphoneTrack) {
      this.microphoneTrack!.stop()
      EduLogger.info(`[agora-web] create audio track stop playback [${this.microphoneTrack!.getTrackId()}] success`)
    }
    if (this.hasMicrophone === undefined) {
      EduLogger.info(`[agora-web] prepare attempt open microphone in web`)
      const microphoneList = await this.getMicrophones()
      this.hasMicrophone = !!microphoneList.length
      this.publishedAudio = this.hasMicrophone
      EduLogger.info(`[agora-web] prepare open microphone success`)
    }
    if (this.joined && this.publishedAudio) {
      const audioTracks = this.client.localTracks.filter((e: ILocalTrack) => e.trackMediaType === 'audio')
      await this.client.unpublish(audioTracks)
      await this.client.publish([this.microphoneTrack!])
      EduLogger.info(`[agora-web] publish audio track [${this.microphoneTrack!.getTrackId()}] success`)
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

  async closeMicrophone() {
    EduLogger.info('[agora-web] close microphone')
    if (this.microphoneTrack) {
      try {
        await this.unpublishTrack(this.microphoneTrack)
        if (this.microphoneTrack) {
          this.microphoneTrack.stop()
          this.microphoneTrack.close()
          EduLogger.info('[agora-web] close microphone success')
          this.microphoneTrack = undefined
        }
      } catch (err) {
        if (this.microphoneTrack) {
          this.microphoneTrack.stop()
          this.microphoneTrack.close()
          EduLogger.info('[agora-web] close microphone success')
          this.microphoneTrack = undefined
        }
        throw GenericErrorWrapper(err)
      }
    }
  }

  enableAudioVolumeIndicator() {
    this.client.enableAudioVolumeIndicator()
    EduLogger.info(" enableAudioVolumeIndicator ")
  }

  async changeMicrophone(deviceId: string): Promise<any> {
    if (this.microphoneTrack) {
      await this.microphoneTrack.setDevice(deviceId)
      await this.agoraWebSdk.checkAudioTrackIsActive(this.microphoneTrack as ILocalAudioTrack)
    } else {
      throw 'no microphone track found'
    }
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

      switch(options.shareAudio) {
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
        this.fire('track-ended', {resource: 'screen', screen: true})
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

  async publish(): Promise<any> {
    if (this.cameraTrack) {
      const trackId = this.cameraTrack.getTrackId()
      if (this.publishedTrackIds.indexOf(trackId) < 0) {
        await this.client.publish([this.cameraTrack])
        this.publishedVideo = true
        this.publishedTrackIds.push(trackId)
      }
    }
    if (this.microphoneTrack) {
      const trackId = this.microphoneTrack.getTrackId()
      if (this.publishedTrackIds.indexOf(trackId) < 0) {
        await this.client.publish([this.microphoneTrack])
        this.publishedAudio = true
        this.publishedTrackIds.push(trackId)
      }
    }
  }

  private async unpublishTrack(track: ILocalTrack) {
    const trackId = track.getTrackId()
    const idx = this.publishedTrackIds.indexOf(trackId)
    if (this.cameraTrack 
        && this.cameraTrack.getTrackId() === trackId) {
      await this.client.unpublish([this.cameraTrack])
      this.stats.localVideoStats.sendPackets = 0
      this.stats.localVideoStats.sendPacketsLost = 0
      EduLogger.info(`[agora-web] unpublish camera track [${trackId}] success`)
    }
    if (this.microphoneTrack 
      && this.microphoneTrack.getTrackId() === trackId) {
      await this.client.unpublish([this.microphoneTrack])
      this.stats.localAudioStats.sendPackets = 0
      this.stats.localAudioStats.sendPacketsLost = 0
      EduLogger.info(`[agora-web] unpublish microphone track [${trackId}] success`)
    }
    this.publishedTrackIds.splice(idx, 1)
  }

  async unpublish(): Promise<any> {
    if (this.cameraTrack) {
      const trackId = this.cameraTrack.getTrackId()
      const idx = this.publishedTrackIds.indexOf(trackId)
      if (idx !== -1) {
        await this.client.unpublish([this.cameraTrack])
        EduLogger.info('[agora-web] unpublish camera track success')
        this.publishedTrackIds.splice(idx, 1)
      }
    }
    if (this.microphoneTrack) {
      const trackId = this.microphoneTrack.getTrackId()
      const idx = this.publishedTrackIds.indexOf(trackId)
      if (idx !== -1) {
        await this.client.unpublish([this.microphoneTrack])
        EduLogger.info('[agora-web] unpublish microphone track success')
        this.publishedTrackIds.splice(idx, 1)
      }
    }
  }

  async getDevices() {
    const list = await this.agoraWebSdk.getDevices()
    this.deviceList = list
    return list
  }

  async getMicrophones () {
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

  private fireTrackEnd({resource, tag, trackId}: FireTrackEndedAction) {
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

    this.fire('track-ended', {resource, tag, trackId, operation: 'pulled'})
  }

  private async acquireCameraTrack(type: 'cameraTestRenderer' | 'cameraRenderer', option?: CameraOption) {
    if (type === 'cameraTestRenderer') {
      if (!option) {
        this.cameraTestTrack = await this.agoraWebSdk.createCameraVideoTrack({
          encoderConfig: {
            frameRate: 15
          }
        })
      } else {
        this.cameraTestTrack = await this.agoraWebSdk.createCameraVideoTrack({
          cameraId: option.deviceId,
          encoderConfig: {
            frameRate: option.encoderConfig.frameRate,
            width: option.encoderConfig.width,
            height: option.encoderConfig.height,
          }
        })
      }
      const trackId = this.cameraTestTrack.getTrackId()
      EduLogger.info("open test camera create track ", trackId, " option " , JSON.stringify(option))
      this.cameraTestTrack.on('track-ended', () => {
        EduLogger.info("test camera renderer track-ended ", trackId, " option " , JSON.stringify(option))
        this.cameraTestTrack && this.closeTestTrack(this.cameraTestTrack)
        this.fireTrackEnd({resource: 'video', tag: 'cameraTestRenderer', trackId})
      })
    }

    if (type === 'cameraRenderer') {
      if (!option) {
        this.cameraTrack = await this.agoraWebSdk.createCameraVideoTrack({
          encoderConfig: {
            frameRate: 15
          }
        })
      } else {
        this.cameraTrack = await this.agoraWebSdk.createCameraVideoTrack({
          cameraId: option.deviceId,
          encoderConfig: {
            frameRate: option.encoderConfig.frameRate,
            width: option.encoderConfig.width,
            height: option.encoderConfig.height,
          }
        })
      }
      const trackId = this.cameraTrack.getTrackId()
      EduLogger.info("open camera create track ", trackId, " option " , JSON.stringify(option))
      this.cameraTrack.on('track-ended', () => {
        EduLogger.info("camera renderer track-ended ", trackId, " option " , JSON.stringify(option))
        this.cameraTrack && this.closeMediaTrack(this.cameraTrack)
        this.fireTrackEnd({resource: 'video', tag: 'cameraRenderer', trackId})
      })
    }
  }

  private async acquireMicrophoneTrack(type: 'microphoneTestTrack' | 'microphoneTrack', option?: MicrophoneOption) {
    if (type === 'microphoneTestTrack') {
      if (!option) {
        this.microphoneTestTrack = await this.agoraWebSdk.createMicrophoneAudioTrack()
        const trackId = this.microphoneTestTrack.getTrackId()
        this.microphoneTestTrack.on('track-ended', () => {
          this.microphoneTestTrack && this.closeTestTrack(this.microphoneTestTrack)
          this.fireTrackEnd({resource: 'audio', tag: 'microphoneTestTrack', trackId})
        })
      } else {
        this.microphoneTestTrack = await this.agoraWebSdk.createMicrophoneAudioTrack({
          microphoneId: option.deviceId
        })
        const trackId = this.microphoneTestTrack.getTrackId()
        this.microphoneTestTrack.on('track-ended', () => {
          this.microphoneTestTrack && this.closeTestTrack(this.microphoneTestTrack)
          this.fireTrackEnd({resource: 'audio', tag: 'microphoneTestTrack', trackId})
        })
      }
    }

    if (type === 'microphoneTrack') {
      if (!option) {
        this.microphoneTrack = await this.agoraWebSdk.createMicrophoneAudioTrack()
        const trackId = this.microphoneTrack.getTrackId()
        EduLogger.info(`[agora-web] create audio track with  by default deviceId: [${trackId}] success`)
        this.microphoneTrack.on('track-ended', () => {
          this.microphoneTrack && this.closeMediaTrack(this.microphoneTrack)
          this.fireTrackEnd({resource: 'audio', tag: 'microphoneTrack', trackId})
        })
      } else {
        this.microphoneTrack = await this.agoraWebSdk.createMicrophoneAudioTrack({
          microphoneId: option.deviceId
        })
        const trackId = this.microphoneTrack.getTrackId()
        EduLogger.info(`[agora-web] create audio track with  by deviceId: ${option.deviceId} [${trackId}] success`)
        this.microphoneTrack.on('track-ended', () => {
          this.microphoneTrack && this.closeMediaTrack(this.microphoneTrack)
          this.fireTrackEnd({resource: 'audio', tag: 'microphoneTrack', trackId})
        })
      }
    }
  }

  async openTestCamera(option?: CameraOption): Promise<any> {
    EduLogger.info(" test camera", JSON.stringify(option))
    if (this.cameraTestTrack) throw 'camera test track already exists'
    await this.acquireCameraTrack('cameraTestRenderer', option)
  }
  
  closeTestCamera() {
    const trackId = this.cameraTestTrack?.getTrackId() ?? ''
    this.fire('track-ended', {resource: 'video', trackId, type: 'cameraTestRenderer', operation: 'close'})
    if (this.cameraTestTrack) {
      this.cameraTestTrack.isPlaying && this.cameraTestTrack.stop()
      this.cameraTestTrack.close()
    }
    this.cameraTestTrack = undefined
  }
  
  async changeTestCamera(deviceId: string): Promise<any> {
    if (this.cameraTestTrack) {
      EduLogger.info("change test camera try setDevice ", deviceId)
      await this.cameraTestTrack.setDevice(deviceId)
      EduLogger.info("change test camera setDevice success", deviceId)
      EduLogger.info("change test camera try checkVideoTrackIsActive", deviceId)
      await this.agoraWebSdk.checkVideoTrackIsActive(this.cameraTestTrack as ILocalVideoTrack)
      EduLogger.info("change test camera checkVideoTrackIsActive success", deviceId)
    } else {
      EduLogger.info("change test camera try open test camera ", deviceId)
      await this.openTestCamera({
        deviceId,
        encoderConfig: {
          width: 320,
          height: 240,
          frameRate: 15
        }
      })
    }
  }
  
  async openTestMicrophone(option?: MicrophoneOption): Promise<any> {
    if (this.microphoneTestTrack) throw 'microphone test track already exists'
    await this.acquireMicrophoneTrack('microphoneTestTrack', option)
    if (this.microphoneTestTrack) {
      this.addInterval((track: ILocalAudioTrack) => {
        if (track) {
          const totalVolume = track.getVolumeLevel()
          this.fire('local-audio-volume', {totalVolume})
        }
      }, 'test-volume', this.microphoneTestTrack, 300)
    }
  }
  
  async changeTestResolution(config: any): Promise<any> {
    await this.cameraTestTrack?.setEncoderConfiguration(config)
  }
  
  closeTestMicrophone() {
    const trackId = this.microphoneTestTrack?.getTrackId() ?? ''
    this.fire('track-ended', {resource: 'audio', trackId, type: 'microphoneTestTrack', operation: 'close'})
    if (this.microphoneTestTrack) {
      this.closeInterval('test-volume')
      this.microphoneTestTrack.isPlaying && this.microphoneTestTrack.stop()
      this.microphoneTestTrack.close()
    }
    this.microphoneTestTrack = undefined
  }
  
  async changeTestMicrophone(deviceId: string): Promise<any> {
    if (this.microphoneTestTrack) {
      await this.microphoneTestTrack.setDevice(deviceId)
      await this.agoraWebSdk.checkAudioTrackIsActive(this.microphoneTestTrack as ILocalAudioTrack)
    } else {
      await this.openTestMicrophone({
        deviceId
      })
      // throw 'no microphone test track found'
    }
  }
}