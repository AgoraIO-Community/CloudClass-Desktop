import { EventEmitter } from 'events';
import { convertUid, paramsConfig, wait } from '../utils';
import { CameraOption, StartScreenShareParams, MicrophoneOption, ElectronWrapperInitOption, IElectronRTCWrapper, convertNativeAreaCode, PrepareScreenShareParams, ScreenShareType } from '../interfaces/index';
// @ts-ignore
import IAgoraRtcEngine from 'agora-electron-sdk';
import { EduLogger } from '../../logger';
import { GenericErrorWrapper } from '../../utils/generic-error';

export class CEFVideoEncoderConfiguration {
  /**
   * The video frame dimensions (px) used to specify the video quality and measured by the total number of pixels along a
   * frame's width and height: [VideoDimensions]{@link AgoraRtcEngine.VideoDimensions}. The default value is 640 x 360.
   */
  dimensions: CEFVideoDimensions;
  /**
   * The frame rate of the video: [FRAME_RATE]{@link AgoraRtcEngine.FRAME_RATE}. The default value is 15.
   *
   * Note that we do not recommend setting this to a value greater than 30.
   */
  frameRate: number;
  /**
   * The minimum frame rate of the video. The default value is -1.
   */
  minFrameRate: number;
  /**
   The video encoding bitrate (Kbps).

   Choose one of the following options:

   - [STANDARD_BITRATE]{@link AgoraRtcEngine.STANDARD_BITRATE}: (Recommended) The standard bitrate.
   - The `COMMUNICATION` profile: the encoding bitrate equals the base bitrate.
   - The `LIVE_BROADCASTING` profile: the encoding bitrate is twice the base bitrate.
   - [COMPATIBLE_BITRATE]{@link AgoraRtcEngine.COMPATIBLE_BITRATE}: The compatible bitrate: the bitrate stays the same regardless of the
   profile.

   The `COMMUNICATION` profile prioritizes smoothness, while the `LIVE_BROADCASTING` profile prioritizes video quality (requiring
   a higher bitrate). We recommend setting the bitrate mode as `STANDARD_BITRATE` to address this difference.

   The following table lists the recommended video encoder configurations, where the base bitrate applies to the `COMMUNICATION`
   profile. Set your bitrate based on this table. If you set a bitrate beyond the proper range, the SDK automatically sets it
   to within the range.

   @note In the following table, **Base Bitrate** applies to the `COMMUNICATION` profile, and **Live Bitrate** applies to the
   `LIVE_BROADCASTING` profile.

   | Resolution             | Frame Rate (fps) | Base Bitrate (Kbps)                    | Live Bitrate (Kbps)                    |
   |------------------------|------------------|----------------------------------------|----------------------------------------|
   | 160 * 120              | 15               | 65                                     | 130                                    |
   | 120 * 120              | 15               | 50                                     | 100                                    |
   | 320 * 180              | 15               | 140                                    | 280                                    |
   | 180 * 180              | 15               | 100                                    | 200                                    |
   | 240 * 180              | 15               | 120                                    | 240                                    |
   | 320 * 240              | 15               | 200                                    | 400                                    |
   | 240 * 240              | 15               | 140                                    | 280                                    |
   | 424 * 240              | 15               | 220                                    | 440                                    |
   | 640 * 360              | 15               | 400                                    | 800                                    |
   | 360 * 360              | 15               | 260                                    | 520                                    |
   | 640 * 360              | 30               | 600                                    | 1200                                   |
   | 360 * 360              | 30               | 400                                    | 800                                    |
   | 480 * 360              | 15               | 320                                    | 640                                    |
   | 480 * 360              | 30               | 490                                    | 980                                    |
   | 640 * 480              | 15               | 500                                    | 1000                                   |
   | 480 * 480              | 15               | 400                                    | 800                                    |
   | 640 * 480              | 30               | 750                                    | 1500                                   |
   | 480 * 480              | 30               | 600                                    | 1200                                   |
   | 848 * 480              | 15               | 610                                    | 1220                                   |
   | 848 * 480              | 30               | 930                                    | 1860                                   |
   | 640 * 480              | 10               | 400                                    | 800                                    |
   | 1280 * 720             | 15               | 1130                                   | 2260                                   |
   | 1280 * 720             | 30               | 1710                                   | 3420                                   |
   | 960 * 720              | 15               | 910                                    | 1820                                   |
   | 960 * 720              | 30               | 1380                                   | 2760                                   |
   | 1920 * 1080            | 15               | 2080                                   | 4160                                   |
   | 1920 * 1080            | 30               | 3150                                   | 6300                                   |
   | 1920 * 1080            | 60               | 4780                                   | 6500                                   |
   | 2560 * 1440            | 30               | 4850                                   | 6500                                   |
   | 2560 * 1440            | 60               | 6500                                   | 6500                                   |
   | 3840 * 2160            | 30               | 6500                                   | 6500                                   |
   | 3840 * 2160            | 60               | 6500                                   | 6500                                   |
   */
  bitrate: number;
  /**
   * The minimum encoding bitrate (Kbps).
   *
   * The SDK automatically adjusts the encoding bitrate to adapt to the network conditions. Using a value greater than the default
   * value forces the video encoder to output high-quality images but may cause more packet loss and hence sacrifice the smoothness
   * of the video transmission. That said, unless you have special requirements for image quality, Agora does not recommend
   * changing this value.
   *
   * @note This parameter applies only to the `LIVE_BROADCASTING` profile.
   */
  minBitrate: number;
  /**
   * The video orientation mode of the video: [ORIENTATION_MODE]{@link AgoraRtcEngine.ORIENTATION_MODE}.
   */
  orientationMode: number;
  /**
   * The video encoding degradation preference under limited bandwidth:
   * [DEGRADATION_PREFERENCE]{@link AgoraRtcEngine.DEGRADATION_PREFERENCE}.
   */
  degradationPreference: number;
  /**
   * Sets the mirror mode of the published local video stream. It only affects the video that the remote user sees. See
   * [VIDEO_MIRROR_MODE_TYPE]{@link AgoraRtcEngine.VIDEO_MIRROR_MODE_TYPE}.
   *
   * @note The SDK disables the mirror mode by default.
   */
  mirrorMode: number;

  constructor(
    dimensions: CEFVideoDimensions = new CEFVideoDimensions(),
    frameRate: any = 15,
    minFrameRate: number = -1,
    bitrate: number = 0,
    minBitrate: number = -1,
    orientationMode: number = 0,
    degradationPreference: number = 0,
    mirrorMode: number = 0
  ) {
    this.dimensions = dimensions;
    this.frameRate = frameRate;
    this.minFrameRate = minFrameRate;
    this.bitrate = bitrate;
    this.minBitrate = minBitrate;
    this.orientationMode = orientationMode;
    this.degradationPreference = degradationPreference;
    this.mirrorMode = mirrorMode;
  }
}

export class CEFVideoDimensions {
  /**
   * Width (pixels) of the video.
   */
  width: number;
  /**
   * Height (pixels) of the video.
   */
  height: number;

  constructor(width: number = 640, height: number = 480) {
    this.width = width;
    this.height = height;
  }
}

interface ScreenShareOption {
  profile: number,
  windowId: number,
  joinInfo?: string,
  appId: string,
  uid: number,
  channel: string,
  token: string,
  rect: {
    x: number,
    y: number,
    width: number,
    height: number,
  },
  param: {
    width: number,
    height: number,
    bitrate: number,
    frameRate: number
  }
}

interface IAgoraRtcChannel {
  id: string
  on(event: 'userJoined', listener: (uid: number) => void): void
  on(event: 'userOffline', listener: (uid: number) => void): void
  on(event: 'channelError', listener: (error: number, message: string) => void): void
  on(event: 'channelWarning', listener: (warn: number, message: string) => void): void
  on(event: 'joinChannelSuccess', listener: (...args: any[]) => void): void
  off(event: string, listener: Function): void
  removeAllListeners(): void
  joinChannel(...args: any[]): number
  leaveChannel(): number
  setClientRole(role: number): number
}

interface SubChannelClient {
  client: IAgoraRtcChannel
  handleUserOnline: Function
  handleUserOffline: Function
  handleJoinSuccess: Function
}

export function CustomBtoa(input: any) {
  let keyStr =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output +=
      keyStr.charAt(enc1) +
      keyStr.charAt(enc2) +
      keyStr.charAt(enc3) +
      keyStr.charAt(enc4);
  }
  return output;
}

export class AgoraElectronRTCWrapper extends EventEmitter implements IElectronRTCWrapper {
  client!: IAgoraRtcEngine;
  logPath: string;
  videoSourceLogPath: string;

  role: number
  joined: boolean

  videoMuted: boolean
  audioMuted: boolean

  localUid?: number
  channel?: number
  appId: string

  subscribedList: number[] = []

  superChannel: any
  userJoinedEvent: any
  userOfflineEvent: any

  cameraList: any[] = []
  microphoneList: any[] = []

  _subClient: Record<string, any>;
  _localAudioStats: {
    audioLossRate: number
  };
  _localVideoStats: {
    videoLossRate: number
  };
  _remoteVideoStats: Record<number, any>;
  _remoteAudioStats: Record<number, any>;
  _cefClient: any;

  get deviceList(): any[] {
    return this.cameraList.concat(this.microphoneList)
  }

  cpuUsage: number = 0
  gatewayRtt: number = 0
  lastMileDelay: number = 0

  constructor(options: ElectronWrapperInitOption) {
    super();
    this._cefClient = options.cefClient
    this.logPath = options.logPath
    this.videoSourceLogPath = options.videoSourceLogPath
    EduLogger.info(`[electron-log], logPath: ${this.logPath}, videoSourceLogPath: ${this.videoSourceLogPath}, appId: ${options.appId}`)
    this.role = 2
    this.joined = false
    this.videoMuted = false
    this.audioMuted = false
    this.localUid = 0
    this.channel = 0
    this.appId = options.appId
    this.subscribedList = []
    this._subClient = {}
    this._remoteVideoStats = {}
    this._remoteAudioStats = {}
    this._localVideoStats = {
      videoLossRate: 0
    }
    this._localAudioStats = {
      audioLossRate: 0
    }
    //@ts-ignore
    this.client = options.AgoraRtcEngine
    let ret = -1
    if (this._cefClient) {
      ret = this.client.initialize(this._cefClient)
    } else {
      //@ts-ignore
      ret = this.client.initialize(this.appId, convertNativeAreaCode(`${options.area}`))
    }
    if (ret < 0) {
      throw GenericErrorWrapper({
        message: `AgoraRtcEngine initialize with APPID: ${this.appId} failured`,
        code: ret
      })
    }

    if (this.logPath) {
      EduLogger.info(`[electron-log-path] set logPath: ${this.logPath}`)
      this.client.setLogFile(this.logPath)
    }
    
    console.log("set Parameters result: ", JSON.stringify(paramsConfig), this.client.setParameters(JSON.stringify(paramsConfig)))
    this.init()
    this.client.setChannelProfile(1)
    this.client.enableVideo()
    this.client.enableAudio()
    this.client.enableWebSdkInteroperability(true)
    this.client.enableAudioVolumeIndication(300, 3, true)
    // this.client.setVideoProfile(20)

    const resolutionConfig = options.resolution
    const config: any = {
      bitrate: 0,
      frameRate: resolutionConfig ? resolutionConfig?.frameRate : 15,
      width: resolutionConfig ? resolutionConfig?.width : 320,
      height: resolutionConfig ? resolutionConfig?.height : 240,
    }

    const videoEncoderConfiguration = Object.assign({
      width: config.width,
      height: config.height,
      frameRate: config.frameRate,
      minFrameRate: -1,
      minBitrate: config.bitrate,
    })
    if (this._cefClient) {
      //@ts-ignore
      this.client.setVideoEncoderConfiguration(new CEFVideoEncoderConfiguration(
        new CEFVideoDimensions(
          videoEncoderConfiguration.width,
          videoEncoderConfiguration.height,
        ),
        videoEncoderConfiguration.frameRate
        )
      )
    } else {
      this.client.setVideoEncoderConfiguration(videoEncoderConfiguration)
    }
    console.log("[electron] video encoder config ", JSON.stringify(config))
    this.client.setClientRole(2)
    //TODO: set cef client log path
    if (this._cefClient) {
      // window.getCachePath((path: string) => {
      //   const dstPath = path+'agorasdk.log'
      //   this.client.setLogFile(dstPath);
      //   EduLogger.info("set cef log path success, dest path: ", dstPath)
      // })
    }
  }
  muteRemoteVideoByClient(client: any, uid: string, val: boolean): Promise<any> {
    throw new Error('Method not implemented.');
  }
  muteRemoteAudioByClient(client: any, uid: string, val: boolean): Promise<any> {
    throw new Error('Method not implemented.');
  }

  public setAddonLogPath(payload: {logPath: string, videoSourceLogPath: string}) {
    this.logPath = payload.logPath
    this.videoSourceLogPath = payload.videoSourceLogPath
  }

  public enableLogPersist() {
    if (this.logPath) {
      EduLogger.info(`[electron-log-path] set logPath: ${this.logPath}`)
      this.client.setLogFile(this.logPath)
      window.setNodeAddonLogPath = this.logPath
    }
  }
  
  changePlaybackVolume(volume: number): void {
    let decibel = +((volume / 100) * 255).toFixed(0)
    let ret = this.client.setAudioPlaybackVolume(decibel)
    EduLogger.info("setAudioPlaybackVolume ret", ret)
  }

  async muteLocalVideo(val: boolean): Promise<any> {
    // let ret = this.client.muteLocalVideoStream(val)
    this.client.enableLocalVideo(!val)
    // EduLogger.info("muteLocalVideo ret", ret)
  }

  async muteLocalAudio(val: boolean): Promise<any> {
    let ret = this.client.muteLocalAudioStream(val)
    this.client.enableLocalAudio(!val)
    EduLogger.info("muteLocalAudio ret", ret)
  }
  
  async muteRemoteVideo(uid: any, val: boolean): Promise<any> {
    let ret = this.client.muteRemoteVideoStream(uid, val)
    EduLogger.info("muteRemoteVideoStream ret", ret)
  }

  async muteRemoteAudio(uid: any, val: boolean): Promise<any> {
    let ret = this.client.muteRemoteAudioStream(uid, val)
    EduLogger.info("muteRemoteAudioStream ret", ret)
  }

  releaseAllClient() {
    EduLogger.info("call electron media service releaseAllClient")
    if (this.client) {
      EduLogger.info("call electron media service main client removeAllListeners")
      this.client.removeAllListeners()
    }
    this.releaseSubChannels()
  }

  releaseSubChannels() {
    if (this._subClient) {
      for (let key of Object.keys(this._subClient)) {
        if (this._subClient[key]) {
          this._subClient[key].client.removeAllListeners()
          EduLogger.info(`call electron media service screenClient sub client ${key} removeAllListeners`)
          delete this._subClient[key]
        }
      }
      this._subClient = {}
    }
  }

  resetState() {
    this.role = 2
    this.joined = false
    this.videoMuted = false
    this.audioMuted = false
    this.localUid = undefined
    this.channel = undefined
    this.subscribedList = []
    this.cpuUsage = 0
    this.gatewayRtt = 0
    this.lastMileDelay = 0
    this.releaseSubChannels()
  }

  reset() {
    this.resetState()
    // this.releaseAllClient()
  }

  private fire(...eventArgs: any[]) {
    const [eventName, ...args] = eventArgs

    if (['user-unpublished', 'user-published'].includes(eventName)) {
      EduLogger.info(`[agora-apaas] ${eventName} ${JSON.stringify(args)}`)
    }
    this.emit(eventName, ...args)
  }

  init() {
    EduLogger.info("electron start event observer")
    this.client.on('error', (err: any) => {
      this.fire('exception', err)
    })
    this.client.on('groupAudioVolumeIndication', (speakers: any[], speakerNumber: number, totalVolume: number) => {
      this.fire('local-audio-volume', {
        totalVolume: +totalVolume
      })
      this.fire('volume-indication', {
        speakers, speakerNumber: +speakerNumber, totalVolume: +totalVolume
      })
    })
    this.client.on('AudioVolumeIndication', (speakers: any[], speakerNumber: number, totalVolume: number) => {
      // console.log("AudioVolumeIndication ", JSON.stringify({speakers, speakerNumber, totalVolume}))
      this.fire('local-audio-volume', {
        totalVolume: +totalVolume
      })
      this.fire('volume-indication', {
        speakers, speakerNumber: +speakerNumber, totalVolume: +totalVolume
      })
    })
    // this.client.on('audio-device-changed', (deviceId: string, deviceType: number, deviceState: number) => {
    //   this.fire('audio-device-changed', {
    //     deviceId,
    //     deviceState,
    //     deviceType
    //   })
    // })
    // this.client.on('video-device-changed', (deviceId: string, deviceType: number, deviceState: number) => {
    //   this.fire('video-device-changed', {
    //     deviceId,
    //     deviceState,
    //     deviceType
    //   })
    // })
    this.client.on('userjoined', (uid: number, elapsed: number) => {
      EduLogger.info("userjoined", uid)
      this.fire('user-published', {
        user: {
          uid: convertUid(uid),
        },
        channel: this.channel
      })
    })
    //or event removeStream
    this.client.on('removestream', (uid: number, elapsed: number) => {
      EduLogger.info("removestream", uid)
      this.fire('user-unpublished', {
        user: {
          uid: convertUid(uid),
        },
        channel: this.channel
      })
    })
    this.client.on('connectionStateChanged', (state: any, reason: any) => {
      this.fire('connection-state-change', {
        curState: state,
        reason
      })
    })
    this.client.on('networkquality', (...args: any[]) => {
      EduLogger.info("network-quality, uid: ", args[0], " downlinkNetworkQuality: ", args[1], " uplinkNetworkQuality ", args[2])
      this.fire('network-quality', {
        downlinkNetworkQuality: args[1],
        uplinkNetworkQuality: args[2],
        cpuUsage: this.cpuUsage,
        //TODO: delay case need use last mile, not rtt
        rtt: this.lastMileDelay,
        localPacketLoss: {
          audioStats: this._localAudioStats,
          videoStats: this._localVideoStats
        },
        remotePacketLoss:{
          audioStats: this._remoteAudioStats,
          videoStats: this._remoteVideoStats
        }
      })
    })
    this.client.on('remoteVideoStateChanged', (uid: number, state: number, reason: any) => {
      EduLogger.info('remoteVideoStateChanged ', reason, uid)
      if (reason === 5) {
        this.fire('user-unpublished', {
          user: {
            uid: +uid,
          },
          mediaType: 'video',
        })
      }

      if (reason === 6) {
        this.fire('user-published', {
          user: {
            uid: +uid,
          },
          mediaType: 'video',
        })
      }
    })
    this.client.on('remoteAudioStateChanged', (uid: number, state: number, reason: any) => {
      EduLogger.info('remoteAudioStateChanged ', reason, uid)

      // remote user disable audio
      if (reason === 5) {
        this.fire('user-unpublished', {
          user: {
            uid,
          },
          mediaType: 'audio',
        })
      }

      if (reason === 6) {
        EduLogger.info('user-published audio', uid)
        // this.fire('user-published', {
        //   user: {
        //     uid,
        //   },
        //   mediaType: 'audio',
        // })
      }
      // this.fire('user-info-updated', {
      //   uid,
      //   msg: reason,
      //   type: 'audio',
      //   state
      // })
    })
    this.client.on('joinedchannel', (channel: string, uid: number) => {
      EduLogger.info('joinedchannel', uid)
    })
    this.client.on('localVideoStateChanged', (state: number, error: number) => {
      this.fire('localVideoStateChanged', {
        // uid: convertUid(this.localUid),
        state,
        type: 'video',
        msg: error
      })
      this.fire('user-info-updated', {
        uid: convertUid(this.localUid),
        state,
        type: 'video',
        msg: error
      })
    })
    this.client.on('localAudioStateChanged', (state: number, error: number) => {
      this.fire('user-info-updated', {
        uid: convertUid(this.localUid),
        state,
        type: 'audio',
        msg: error
      })
    })
    this.client.on('tokenPrivilegeWillExpire', () => {
      this.fire('token-privilege-will-expire')
    })
    this.client.on('tokenPrivilegeDidExpire', () => {
      this.fire('token-privilege-did-expire')
    })
    this.client.on('localPublishFallbackToAudioOnly', (isFallbackOrRecover: any) => {
      this.fire('stream-fallback', {
        uid: convertUid(this.localUid),
        isFallbackOrRecover
      })
    })
    this.client.on('remoteSubscribeFallbackToAudioOnly', (uid: any, isFallbackOrRecover: boolean) => {
      this.fire('stream-fallback', {
        uid: convertUid(uid),
        isFallbackOrRecover
      })
    })
    this.client.on('rtcStats', (evt: any) => {
      this.cpuUsage = evt.cpuTotalUsage
      this.gatewayRtt = evt.gatewayRtt
      this.lastMileDelay = evt.lastmileDelay
      this.fire('rtcStats', evt)
    })
    this.client.on('localAudioStats', (evt: any) => {
      this._localAudioStats = {
        audioLossRate: evt.txPacketLossRate ?? 0,
      }
    })
    this.client.on('localVideoStats', (evt: any) => {
      this._localVideoStats = {
        videoLossRate: evt.txPacketLossRate ?? 0,
      }
    })
    this.client.on('remoteVideoStats', (evt: any) => {
      // record the data but do not fire it, these will be together fired by network quality callback
      const uid = convertUid(evt.uid)
      this._remoteVideoStats[uid] = {
        videoLossRate: evt.packetLossRate,
        videoReceiveDelay: evt.delay
      }

      this.fire('remoteVideoStats', {
        user: {
          uid: convertUid(uid),
        },
        stats: {
          uid: convertUid(uid),
          ...evt
        }
      })
    })
    this.client.on('remoteAudioStats', (evt: any) => {
      // record the data but do not fire it, these will be together fired by network quality callback
      const uid = convertUid(+evt.uid)
      this._remoteAudioStats[uid] = {
        audioLossRate: evt.audioLossRate,
        audioReceiveDelay: evt.networkTransportDelay
      }
    })

    // TODO: CEF event handlers
    this.client.on('UserJoined', (uid: number, elapsed: number) => {
      EduLogger.info('[agora-apaas] cef platform UserJoined ', uid, elapsed)
      this.fire('user-published', {
        user: {
          uid: convertUid(uid),
        },
        caller: {
          name: 'UserJoined',
          uid,
          elapsed
        }
      })
    })
    //or event removeStream
    this.client.on('UserOffline', (uid: number, elapsed: number) => {
      EduLogger.info('[agora-apaas] cef platform UserOffline ', uid, elapsed)
      this.fire('user-unpublished', {
        user: {
          uid: convertUid(uid),
        },
        caller: {
          name: 'UserOffline',
          uid,
          elapsed
        }
      })
    })
    this.client.on('ConnectionStateChanged', (state: any, reason: any) => {
      this.fire('connection-state-change', {
        curState: state,
        reason
      })
    })
    this.client.on('NetworkQuality', (...args: any[]) => {
      console.log("network-quality, uid: ", args[0], " downlinkNetworkQuality: ", args[1], " uplinkNetworkQuality ", args[2])
      EduLogger.info("network-quality, uid: ", args[0], " downlinkNetworkQuality: ", args[1], " uplinkNetworkQuality ", args[2])
      EduLogger.info( "remoteAudioStats: ", this._remoteAudioStats)
      EduLogger.info( "remoteVideoStats: ", this._remoteVideoStats)
      this.fire('network-quality', {
        downlinkNetworkQuality: args[1],
        uplinkNetworkQuality: args[2],
        cpuUsage: this.cpuUsage,
        localPacketLoss: {
          audioStats: this._localAudioStats,
          videoStats: this._localVideoStats
        },
        remotePacketLoss:{
          audioStats: this._remoteAudioStats,
          videoStats: this._remoteVideoStats
        }
      })
    })
    this.client.on('RemoteVideoStats', (evt: any) => {
      this._remoteVideoStats[evt.uid] = {
        videoLossRate: evt.packetLossRate,
        videoReceiveDelay: evt.delay
      }
      this.fire('remoteVideoStats', {
        user: {
          uid: convertUid(evt.uid),
        },
        stats: {
          ...evt,
          uid: convertUid(evt.uid)
        }
      })
    })
    this.client.on('LocalVideoStats', (evt: any[]) => {
      this.fire('localVideoStats', {
        stats: {
          ...evt
          // sentBitrate,
          // sentFrameRate,
          // encoderOutputFrameRate,
          // rendererOutputFrameRate,
          // targetBitrate,
          // targetFrameRate,
          // qualityAdaptIndication,
          // encodedBitrate,
          // encodedFrameWidth,
          // encodedFrameHeight,
          // encodedFrameCount,
          // codecType,
          // txPacketLossRate,
          // captureFrameRate,
          // captureBrightnessLevel
        }
      })
    })
    this.client.on('RemoteVideoStats', (uid: number, delay: number, width: number, height: number, receivedBitrate: number, decoderOutputFrameRate: number, rendererOutputFrameRate: number, packetLossRate: number, rxStreamType: number, frozenRate: number, totalActiveTime: number, publishDuration: number) => {
      this._remoteVideoStats[uid] = {
        videoLossRate: packetLossRate,
        videoReceiveDelay: delay
      }
      this.fire('remoteVideoStats', {
        user: {
          uid: convertUid(uid),
        },
        stats: {
          uid: convertUid(uid),
          delay,
          width,
          height,
          receivedBitrate,
          decoderOutputFrameRate,
          rendererOutputFrameRate,
          packetLossRate,
          rxStreamType,
          frozenRate, 
          totalActiveTime,
          publishDuration
        }
      })
    })
    this.client.on('RemoteVideoStateChanged', (uid: number, state: number, reason: any) => {
      EduLogger.info('[agora-apaas] cef platform remoteVideoStateChanged ', reason, uid)
      if ([5, 7, 8].includes(reason)) {
        this.fire('user-unpublished', {
          user: {
            uid: convertUid(uid),
          },
          mediaType: 'video',
          caller: {
            name: 'RemoteVideoStateChanged',
            uid, 
            state,
            reason
          }
        })
      }

      if ([6, 9].includes(reason)) {
        this.fire('user-published', {
          user: {
            uid: convertUid(uid),
          },
          mediaType: 'video',
          caller: {
            name: 'RemoteVideoStateChanged',
            uid, 
            state,
            reason
          }
        })
      }
    })
    this.client.on('RemoteAudioStateChanged', (uid: number, state: number, reason: any) => {
      console.log('remoteAudioStateChanged ', reason, uid)

      // remote user disable audio
      if (reason === 5) {
        // this.fire('user-unpublished', {
        //   user: {
        //     uid: convertUid(uid),
        //   },
        //   mediaType: 'audio',
        //   caller: {
        //     name: 'RemoteAudioStateChanged',
        //     reason,
        //     state,
        //   }
        // })
      }

      if (reason === 6) {
        // console.log('user-published audio', uid)
        // this.fire('user-published', {
        //   user: {
        //     uid,
        //   },
        //   mediaType: 'audio',
        // })
      }
      // this.fire('user-info-updated', {
      //   uid,
      //   msg: reason,
      //   type: 'audio',
      //   state
      // })
    })
    this.client.on('JoinChannelSuccess', (channel: string, uid: number) => {
      console.log('joinedchannel', uid)
    })
    this.client.on('LocalVideoStateChanged', (...args: any[]) => {
      console.log(" ## native ## localVideoStateChanged", JSON.stringify(args))
      this.fire('localVideoStateChanged', {
        // uid: convertUid(this.localUid),
        state: args[0],
        type: 'video',
        msg: args[1]
      })
      this.fire('user-info-updated', {
        uid: convertUid(this.localUid),
        state: args[0],
        type: 'video',
        msg: args[1]
      })
    })
    this.client.on('LocalAudioStateChanged', (state: number, error: number) => {
      this.fire('user-info-updated', {
        uid: convertUid(this.localUid),
        state,
        type: 'audio',
        msg: error
      })
    })
    this.client.on('TokenPrivilegeWillExpire', () => {
      this.fire('token-privilege-will-expire')
    })
    this.client.on('tokenPrivilegeDidExpire', () => {
      this.fire('token-privilege-did-expire')
    })
    this.client.on('LocalPublishFallbackToAudioOnly', (isFallbackOrRecover: any) => {
      this.fire('stream-fallback', {
        uid: convertUid(this.localUid),
        isFallbackOrRecover
      })
    })
    this.client.on('RemoteSubscribeFallbackToAudioOnly', (uid: any, isFallbackOrRecover: boolean) => {
      this.fire('stream-fallback', {
        uid: convertUid(uid),
        isFallbackOrRecover
      })
    })
    this.client.on('RtcStats', (evt: any) => {
      // only electron
      this.cpuUsage = evt.cpuAppUsage
      this.fire('rtcStats', evt)
    })
  }
  
  async joinSubChannel(option: any): Promise<any> {
    try {
      EduLogger.info(`ELECTRON ### ${JSON.stringify({...option})} subChannel: ${Object.keys(this._subClient)}`)
      const subChannel = this.client.createChannel(option.channel)!
      const handleUserOnline = (uid: number, elapsed: number) => {
        EduLogger.info('ELECTRON user-published channel ', uid, option.channel)
        this.fire('user-published', {
          user: {
            uid: convertUid(uid),
          },
          channel: option.channel
        })
      }
      const handleUserOffline = (uid: number, elapsed: number) => {
        EduLogger.info('ELECTRON user-unpublished channel ', uid, option.channel)
        this.fire('user-unpublished', {
          user: {
            uid: convertUid(uid),
          },
          channel: option.channel
        })
      }
      const handleJoinSuccess = (uid: number, elapsed: number) => {
        EduLogger.info("ELECTRON joinChannelSuccess", uid)
      }
      this._subClient[option.channel] = {
        id: "",
        client: subChannel,
        handleUserOnline,
        handleUserOffline,
        handleJoinSuccess
      }
      EduLogger.info(`ELECTRON subChannel joinChannelSuccess: ${subChannel}`)
      subChannel.on('joinChannelSuccess', this._subClient[option.channel].handleJoinSuccess)
      EduLogger.info(`ELECTRON subChannel userJoined: ${subChannel}`)
      subChannel.on('userJoined', this._subClient[option.channel].handleUserOnline)
      EduLogger.info(`ELECTRON subChannel userOffline: ${subChannel}`)
      subChannel.on('userOffline', this._subClient[option.channel].handleUserOffline)
      subChannel.setClientRole(1)
      let ret = subChannel.joinChannel(option.token, option.info, option.uid, {} as any)
      EduLogger.info(`ELECTRON joinChannel: ret: ${ret}`)
    } catch(err) {
      throw GenericErrorWrapper(err)
    }
  }
  
  async join(option: any): Promise<any> {
    try {
      let ret = this.client.joinChannel(option.token, option.channel, option.info, option.uid)
      EduLogger.info("electron.joinChannel ", ret, ` params: `, JSON.stringify(option))
      if (ret < 0) {
        throw GenericErrorWrapper({
          message: `joinSubChannel failure`,
          code: ret
        })
      }
      this.joined = true;
      this.client.setClientRole(1)
      return
    } catch(err) {
      throw GenericErrorWrapper(err)
    }
  }

  async leaveSubChannel(channelName: string): Promise<any> {
    EduLogger.info(`[ELECTRON] call leaveSubChannel: ${channelName}`)
    try {
      const subChannel = this._subClient[channelName]
      if (subChannel) {
        let ret = subChannel.client.leaveChannel()
        EduLogger.info("ELECTRON leaveSubChannel ", ret, " channelName ", channelName)
        subChannel.client.off('userJoined', subChannel.handleUserOnline)
        subChannel.client.off('userOffline', subChannel.handleUserOffline)
        delete this._subClient[channelName]
      }
      return
    } catch(err) {
      throw GenericErrorWrapper(err)
    }
  }

  async leave(): Promise<any> {
    try {
      let ret = this.client.setClientRole(2)
      // if (ret < 0) {
      //   throw GenericErrorWrapper({
      //     message: `setClientRole failure`,
      //     code: ret
      //   })
      // }
      EduLogger.info("electron.setClientRole ", ret)
      if (this.joined === false) {
        EduLogger.info("electron.leave already left")
        return
      }
      ret = this.client.leaveChannel()
      EduLogger.info("electron.already leaveChannel, ret ", ret)
      if (ret < 0) {
        throw GenericErrorWrapper({
          message: `leaveSubChannel failure`,
          code: ret
        })
      }
      this.joined = false
      return
    } catch(err) {
      throw GenericErrorWrapper(err)
    }
  }

  release() {
    let ret = this.client.release()
    if (ret < 0) {
      throw GenericErrorWrapper({
        message: `release failure`,
        code: ret
      })
    }
    this.reset()
  }

  async openCamera(option?: CameraOption): Promise<any> {
    try {
      let ret = this.client.enableLocalVideo(true)
      if (ret < 0) {
        throw GenericErrorWrapper({
          message: `enableLocalVideo failure`,
          code: ret
        })
      }
      if (option) {
        option.deviceId && (ret = this.client.setVideoDevice(option.deviceId))
        if (ret < 0) {
          throw GenericErrorWrapper({
            message: `setVideoDevice failure`,
            code: ret
          })
        }
        // TODO: cef configuration
        //@ts-ignore
        option.encoderConfig && (ret = this.client.setVideoEncoderConfiguration(new CEFVideoEncoderConfiguration(
          new CEFVideoDimensions(
            option.encoderConfig.width,
            option.encoderConfig.height
          ),
          option.encoderConfig.frameRate
          )
        ))
        if (ret < 0) {
          throw GenericErrorWrapper({
            message: `setVideoEncoderConfiguration failure`,
            code: ret
          })
        }
      }
      if (this.joined) {
        ret = this.client.muteLocalVideoStream(false)
        EduLogger.info("living muteLocalVideoStream, ret: ", ret)
        this.videoMuted = false
      }
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  closeCamera() {
    try {
      let ret = this.client.enableLocalVideo(false)
      if (ret < 0) {
        throw {
          message: `enableLocalVideo failure`,
          code: ret
        }
      }
      EduLogger.info("electron: closeCamera")
      if (this.joined) {
        ret = this.client.muteLocalVideoStream(true)
        this.videoMuted = true
        if (ret < 0) {
          throw {
            message: `enableLocalVideo failure`,
            code: ret
          }
        }
        EduLogger.info("electron: muteCamera")
      }
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async changeCamera(deviceId: string): Promise<any> {
    try {
      let ret = -1
      if (this._cefClient) {
        //@ts-ignore
        ret = this.client.videoDeviceManager.setDevice(deviceId)
      } else {
        ret = this.client.setVideoDevice(deviceId)
      }
      if (ret < 0) {
        throw GenericErrorWrapper({
          message: 'changeCamera failure',
          code: ret
        });
      }
    } catch (err) {
      throw GenericErrorWrapper(err);
    }
  }


  async getMicrophones (): Promise<any[]> {
    let list: any[] = []
    if (this._cefClient) {
      //@ts-ignore
      list = this.client.audioDeviceManager.enumerateRecordingDevices();
      list = list.map((it: any) => ({
        deviceid: it.deviceId,
        devicename: it.deviceName,
        kind: 'audioinput'
      }))
    } else {
      list = this.client.getAudioRecordingDevices();
    }
    const genList: any[] = list.map((it: any) => ({
      deviceId: it.deviceid,
      label: it.devicename,
      kind: 'audioinput'
    }))
    this.microphoneList = genList
    return genList
  }

  async getCameras(): Promise<any[]> {
    let list: any = []
    if (this._cefClient) {
      //@ts-ignore
      list = this.client.videoDeviceManager.enumerateVideoDevices()
      list = list.map((it: any) => ({
        deviceid: it.deviceId,
        devicename: it.deviceName,
        kind: 'videoinput'
      }))
    } else {
      list = this.client.getVideoDevices()
    }
    // const list = this.client.getVideoDevices()
    const genList: any[] = list.map((it: any) => ({
      deviceId: it.deviceid,
      label: it.devicename,
      kind: 'videoinput'
    }))
    this.cameraList = genList
    return genList
  }

  async changeResolution(config: any): Promise<any> {
    EduLogger.warn('changeResolution need implement', config)
    // try {
    //   let ret = this.client.setVideoEncoderConfiguration({
    //     height: 
    //   })
    //   if (ret < 0) {
    //     throw {
    //       message: 'changeCamera failure',
    //       code: ret
    //     }
    //   }
    // } catch (err) {
    //   GenericErrorWrapper(err);
    // }
  }

  async openMicrophone(option?: MicrophoneOption): Promise<any> {
    try {
      let ret = this.client.enableLocalAudio(true)
      if (ret < 0) {
        throw {
          message: `enableLocalAudio failure`,
          code: ret
        }
      }
      //TODO: cef api
      if (this._cefClient) {
        //@ts-ignore
        option.deviceId && this.client.audioDeviceManager.setRecordingDevice(option.deviceId)
      } else {
        //@ts-ignore
        option.deviceId && this.client.setAudioRecordingDevice(option.deviceId)
      }
      if (this.joined) {
        ret = this.client.muteLocalAudioStream(false)
        this.audioMuted = false
        EduLogger.info("living muteLocalAudioStream, ret: ", ret)
      }
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  closeMicrophone() {
    try {
      let ret = this.client.enableLocalAudio(false)
      if (ret < 0) {
        throw {
          message: `enableLocalAudio failure`,
          code: ret
        }
      }
      if (this._cefClient) {
        //@ts-ignore
        this.client.audioDeviceManager.stopRecordingDeviceTest()
      } else {
        this.client.stopAudioRecordingDeviceTest()
      }
      if (this.joined) {
        ret = this.client.muteLocalAudioStream(true)
        this.audioMuted = true
      }
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async changeMicrophone(deviceId: string): Promise<any> {
    try {
      let ret = -1
      if (this._cefClient) {
        //@ts-ignore
        ret = this.client.audioDeviceManager.setRecordingDevice(deviceId)
      } else {
        ret = this.client.setAudioRecordingDevice(deviceId)
      }
      if (ret < 0) {
        throw {
          message: 'setAudioRecordingDevice failure',
          code: ret
        }
      }
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async prepareScreenShare(params: PrepareScreenShareParams = {}): Promise<any> {
    try {
      //@ts-ignore
      let items = params.type === ScreenShareType.Screen ? this.client.getScreenDisplaysInfo() : this.client.getScreenWindowsInfo()
      const noImageSize = items.filter((it: any) => !it.image).length
      if (noImageSize) {
        throw {code: 'ELECTRON_PERMISSION_DENIED'}
      }
      if(params.type === ScreenShareType.Screen){
        return items.map((it: any, idx:number) => ({
          ownerName: it.ownerName,
          name: `Screen ${idx+1}`,
          windowId: it.displayId,
          image: CustomBtoa(it.image),
        }))
      }
      return items.map((it: any) => ({
        ownerName: it.ownerName,
        name: it.name,
        windowId: it.windowId,
        image: CustomBtoa(it.image),
      }))
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async startScreenShare(options: StartScreenShareParams): Promise<any> {
    const startScreenPromise = new Promise((resolve, reject) => {
      const config = options.config || {
        profile: 50,
        rect: {x: 0, y: 0, width: 0, height: 0},
        param: {
          width: 0, height: 0, bitrate: 500, frameRate: 15
        }
      }
      EduLogger.info('startScreenShare#options', options)
      EduLogger.info('startScreenShare ', JSON.stringify(config))
      try {
        let ret = this.client.videoSourceInitialize(this.appId)
        if (ret < 0) {
          reject({
            message: `videoSourceInitialize with APPID: ${this.appId} failured`,
            code: ret
          })
        }
        // this.client.
        this.client.videoSourceSetChannelProfile(1)
        this.client.videoSourceEnableWebSdkInteroperability(true)
        this.client.videoSourceSetVideoProfile(config && config.profile ? config.profile : 50, false)
        this.client.videoSourceSetVideoEncoderConfiguration({
          width: 640,
          height: 480,
          frameRate: 5,
          minFrameRate: 5,
          bitrate: 1500,
          minBitrate: 1500,
          degradationPreference: 0,
          orientationMode: 0,
          mirrorMode: 0
        })
        EduLogger.info(`[electron-log-path] checkout videoSourceLogPath: ${this.videoSourceLogPath}`)
        if (this.videoSourceLogPath) {
          this.client.videoSourceSetLogFile(this.videoSourceLogPath)
          window.setNodeAddonVideoSourceLogPath = this.videoSourceLogPath
          EduLogger.info(`[electron-log-path] set videoSourceLogPath: ${this.videoSourceLogPath}`)
        }
        const handleVideoSourceJoin = (uid: number) => {
          this.client.off('videoSourceJoinedSuccess', handleVideoSourceJoin)
          EduLogger.info("startScreenShare#options uid, ", uid, "  options", options)
          if(options.type === ScreenShareType.Window) {
            this.client.videoSourceStartScreenCaptureByWindow(options.shareId as number, config.rect, config.param)
          } else {
            this.client.videoSourceStartScreenCaptureByScreen(options.shareId, config.rect, config.param)
          }
          this.client.startScreenCapturePreview()
          resolve(uid)
        }
        this.client.on('videoSourceJoinedSuccess', handleVideoSourceJoin)
        const params = options.params
        ret = this.client.videoSourceJoin(params.token, params.channel, params.joinInfo ? params.joinInfo : '', params.uid)
        EduLogger.info("videoSourceJoin ret", ret, params)
        if (ret < 0) {
          this.client.off('videoSourceJoinedSuccess', handleVideoSourceJoin)
          reject({
            message: 'videoSourceJoin failure',
            code: ret
          })
        }
      } catch (err) {
        this.client.off('videoSourceJoinedSuccess', () => {})
        reject(err)
      }
    })

    return await Promise.race([startScreenPromise])
  }

  async stopScreenShare(): Promise<any> {
    const stopScreenSharePromise = new Promise((resolve, reject) => {
      const handleVideoSourceLeaveChannel = (evt: any) => {
        this.client.off('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
        const release = this.client.videoSourceRelease()
        EduLogger.info(' videoSourceLeave Channel', release)
        setTimeout(resolve, 1)
      }
      try {
        this.client.on('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
        let ret = this.client.videoSourceLeave()
        EduLogger.info("stopScreenShare leaveSubChannel", ret)
        // wait(8000).catch((err: any) => {
        //   this.client.off('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
        //   reject(err)
        // })
      } catch(err) {
        this.client.off('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
        reject(err)
      }
    })

    try {
      await stopScreenSharePromise
    } catch(err) {
      throw GenericErrorWrapper(err)
    }
  }

  async publish(): Promise<any> {
    EduLogger.info('Raw Message: media-service#publish, prepare')
    if (this.joined) {
      EduLogger.info('Raw Message: media-service#publish, publish')
      this.client.setClientRole(1)
    } else {
      EduLogger.info("before invoke publish, please join channel first")
    }
  }

  async unpublish(): Promise<any> {
    if (this.joined) {
      this.client.setClientRole(2)
    } else {
      EduLogger.info("before invoke unpublish, please join channel first")
    }
  }

  async openTestCamera(option?: CameraOption): Promise<any> {
    if (this.joined) {
      EduLogger.warn('joined mode not support openTestCamera')
      return
    }
    await this.openCamera(option)
  }
  
  closeTestCamera() {
    if (this.joined) {
      EduLogger.warn('joined mode not support closeTestCamera')
      return
    }
    this.closeCamera()
  }
  
  async changeTestCamera(deviceId: string): Promise<any> {
    if (this.joined) {
      EduLogger.warn('joined mode not support changeTestCamera')
      return
    }
    await this.changeCamera(deviceId)
  }
  
  async openTestMicrophone(option?: MicrophoneOption): Promise<any> {
    if (this.joined) {
      EduLogger.warn('joined mode not support openTestMicrophone')
      return
    }
    await this.openMicrophone(option)
    // const res = this.client.startAudioRecordingDeviceTest(300)
    // EduLogger.info('openTestMicrophone startAudioRecordingDeviceTest: ',  res)
  }
  
  async changeTestResolution(config: any): Promise<any> {
    if (this.joined) {
      EduLogger.warn('joined mode not support changeTestResolution')
      return
    }
    await this.changeResolution(config)
  }
  
  closeTestMicrophone() {
    if (this.joined) {
      EduLogger.warn('joined mode not support closeTestMicrophone')
      return
    }
    // const res = this.client.stopAudioRecordingDeviceTest()
    // EduLogger.info('closeTestMicrophone stopAudioRecordingDeviceTest: ',  res)
    this.closeMicrophone()
  }
  
  async changeTestMicrophone(deviceId: string): Promise<any> {
    if (this.joined) {
      EduLogger.warn('joined mode not support changeTestMicrophone')
      return
    }
    await this.changeMicrophone(deviceId)
  }
}