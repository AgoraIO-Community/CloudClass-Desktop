import {IAgoraRtcEngine} from './types/agora_sdk'
import { EventEmitter } from 'events';
import { wait } from '../utils';
import { CameraOption, StartScreenShareParams, MicrophoneOption, ElectronWrapperInitOption, IElectronRTCWrapper } from '../interfaces/index';
import { CustomBtoa } from '@/utils/helper';
import { EduLogger } from '../../logger';
import { GenericErrorWrapper } from '../../utils/generic-error';

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
  on(event: 'userJoined', listener: (uid: number) => void): void
  on(event: 'userOffline', listener: (uid: number) => void): void
  on(event: 'channelError', listener: (error: number, message: string) => void): void
  on(event: 'channelWarning', listener: (warn: number, message: string) => void): void
  off(event: string, listener: Function): void
  removeAllListeners(): void
  joinChannel(...args: any[]): number
  leaveChannel(): number
}

interface SubChannelClient {
  client: IAgoraRtcChannel
  handleUserOnline: Function
  handleUserOffline: Function
  handleJoinSuccess: Function
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

  _subClient: Record<string, SubChannelClient>;

  get deviceList(): any[] {
    return this.cameraList.concat(this.microphoneList)
  }

  constructor(options: ElectronWrapperInitOption) {
    super();
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
    //@ts-ignore
    this.client = options.AgoraRtcEngine
    let ret = this.client.initialize(this.appId)
    if (ret < 0) {
      throw new GenericErrorWrapper({
        message: `AgoraRtcEngine initialize with APPID: ${this.appId} failured`,
        code: ret
      })
    }
    this.init()
    this.client.setChannelProfile(1)
    this.client.enableVideo()
    this.client.enableAudio()
    this.client.enableWebSdkInteroperability(true)
    this.client.enableAudioVolumeIndication(1000, 3, true)
    this.client.setVideoProfile(43, false);
    const config = {
      bitrate: 0,
      frameRate: 15,
      height: 360,
      width: 640,
    }
    this.client.setVideoEncoderConfiguration(config)
    console.log("[electron] video encoder config ", JSON.stringify(config))
    this.client.setClientRole(2)
    if (this.logPath) {
      EduLogger.info(`[electron-log-path] set logPath: ${this.logPath}`)
      this.client.setLogFile(this.logPath)
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
    this.releaseSubChannels()
  }

  reset() {
    this.resetState()
    // this.releaseAllClient()
  }

  private fire(...eventArgs: any[]) {
    const [eventName, ...args] = eventArgs
    // EduLogger.info(eventName, ...args)
    this.emit(eventName, ...args)
  }

  init() {
    EduLogger.info("electron start event observer")
    this.client.on('error', (err: any) => {
      this.fire('exception', err)
    })
    this.client.on('groupAudioVolumeIndication', (speakers: any[], speakerNumber: number, totalVolume: number) => {
      this.fire('volume-indication', {
        speakers, speakerNumber, totalVolume
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
          uid,
        },
        channel: this.channel
      })
    })
    //or event removeStream
    this.client.on('removestream', (uid: number, elapsed: number) => {
      EduLogger.info("removestream", uid)
      this.fire('user-unpublished', {
        user: {
          uid,
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
        uplinkNetworkQuality: args[2]
      })
    })
    this.client.on('remoteVideoStateChanged', (uid: number, state: number, reason: any) => {
      EduLogger.info('remoteVideoStateChanged ', reason, uid)
      if (reason === 5) {
        this.fire('user-unpublished', {
          user: {
            uid,
          },
          mediaType: 'video',
        })
      }

      if (reason === 6) {
        this.fire('user-published', {
          user: {
            uid,
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
      this.fire('user-info-updated', {
        uid: this.localUid,
        state,
        type: 'video',
        msg: error
      })
    })
    this.client.on('localAudioStateChanged', (state: number, error: number) => {
      this.fire('user-info-updated', {
        uid: this.localUid,
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
        uid: this.localUid,
        isFallbackOrRecover
      })
    })
    this.client.on('remoteSubscribeFallbackToAudioOnly', (uid: any, isFallbackOrRecover: boolean) => {
      this.fire('stream-fallback', {
        uid,
        isFallbackOrRecover
      })
    })
    this.client.on('rtcStats', (evt: any) => {
      this.fire('rtcStats', evt)
    })
  }
  
  async joinSubChannel(option: any): Promise<any> {
    try {
      EduLogger.info(`ELECTRON ### ${JSON.stringify({...option})} subChannel: ${Object.keys(this._subClient)}`)
      const subChannel = this.client.createChannel(option.channel)
      const handleUserOnline = (uid: number, elapsed: number) => {
        EduLogger.info('ELECTRON user-published channel ', uid, option.channel)
        this.fire('user-published', {
          user: {
            uid,
          },
          channel: option.channel
        })
      }
      const handleUserOffline = (uid: number, elapsed: number) => {
        EduLogger.info('ELECTRON user-unpublished channel ', uid, option.channel)
        this.fire('user-unpublished', {
          user: {
            uid,
          },
          channel: option.channel
        })
      }
      const handleJoinSuccess = (uid: number, elapsed: number) => {
        EduLogger.info("ELECTRON joinChannelSuccess", uid)
      }
      this._subClient[option.channel] = {
        client: subChannel,
        handleUserOnline,
        handleUserOffline,
        handleJoinSuccess
      }
      EduLogger.info(`ELECTRON subChannel joinChannelSuccess: ${subChannel.id}`)
      subChannel.on('joinChannelSuccess', this._subClient[option.channel].handleJoinSuccess)
      EduLogger.info(`ELECTRON subChannel userJoined: ${subChannel.id}`)
      subChannel.on('userJoined', this._subClient[option.channel].handleUserOnline)
      EduLogger.info(`ELECTRON subChannel userOffline: ${subChannel.id}`)
      subChannel.on('userOffline', this._subClient[option.channel].handleUserOffline)
      subChannel.setClientRole(1)
      let ret = subChannel.joinChannel(option.token, option.info, option.uid)
      EduLogger.info(`ELECTRON joinChannel: ret: ${ret}`)
    } catch(err) {
      throw new GenericErrorWrapper(err)
    }
  }
  
  async join(option: any): Promise<any> {
    try {
      let ret = this.client.joinChannel(option.token, option.channel, option.info, option.uid)
      EduLogger.info("electron joinSubChannel ", ret)
      if (ret < 0) {
        throw new GenericErrorWrapper({
          message: `joinSubChannel failure`,
          code: ret
        })
      }
      this.joined = true;
      return
    } catch(err) {
      throw new GenericErrorWrapper(err)
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
      throw new GenericErrorWrapper(err)
    }
  }

  async leave(): Promise<any> {
    try {
      let ret = this.client.setClientRole(2)
      if (ret < 0) {
        throw new GenericErrorWrapper({
          message: `setClientRole failure`,
          code: ret
        })
      }
      if (this.joined === false) {
        return
      }
      ret = this.client.leaveChannel()
      if (ret < 0) {
        throw new GenericErrorWrapper({
          message: `leaveSubChannel failure`,
          code: ret
        })
      }
      this.joined = false
      return
    } catch(err) {
      throw new GenericErrorWrapper(err)
    }
  }

  release() {
    let ret = this.client.release()
    if (ret < 0) {
      throw new GenericErrorWrapper({
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
        throw new GenericErrorWrapper({
          message: `enableLocalVideo failure`,
          code: ret
        })
      }
      if (option) {
        option.deviceId && this.client.setVideoDevice(option.deviceId)
        option.encoderConfig && this.client.setVideoEncoderConfiguration(option.encoderConfig)
      }
      if (this.joined) {
        ret = this.client.muteLocalVideoStream(false)
        EduLogger.info("living muteLocalVideoStream, ret: ", ret)
        this.videoMuted = false
      }
    } catch (err) {
      throw new GenericErrorWrapper(err)
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
      throw new GenericErrorWrapper(err)
    }
  }

  async changeCamera(deviceId: string): Promise<any> {
    try {
      let ret = this.client.setVideoDevice(deviceId)
      if (ret < 0) {
        throw {
          message: 'changeCamera failure',
          code: ret
        }
      }
    } catch (err) {
      throw new GenericErrorWrapper(err);
    }
  }


  async getMicrophones (): Promise<any[]> {
    const list = this.client.getAudioRecordingDevices();
    const genList: any[] = list.map((it: any) => ({
      deviceId: it.deviceid,
      label: it.devicename,
      kind: 'audioinput'
    }))
    this.microphoneList = genList
    return genList
  }

  async getCameras(): Promise<any[]> {
    const list = this.client.getVideoDevices()
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
    //   new GenericErrorWrapper(err);
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
      if (option) {
        option.deviceId && this.client.setAudioRecordingDevice(option.deviceId)
      }
      if (this.joined) {
        ret = this.client.muteLocalAudioStream(false)
        this.audioMuted = false
        EduLogger.info("living muteLocalAudioStream, ret: ", ret)
      }
    } catch (err) {
      throw new GenericErrorWrapper(err)
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
      this.client.stopAudioRecordingDeviceTest()
      if (this.joined) {
        ret = this.client.muteLocalAudioStream(true)
        this.audioMuted = true
      }
    } catch (err) {
      throw new GenericErrorWrapper(err)
    }
  }

  async changeMicrophone(deviceId: string): Promise<any> {
    try {
      let ret = this.client.setAudioRecordingDevice(deviceId)
      if (ret < 0) {
        throw {
          message: 'setAudioRecordingDevice failure',
          code: ret
        }
      }
    } catch (err) {
      throw new GenericErrorWrapper(err)
    }
  }

  async prepareScreenShare(): Promise<any> {
    try {
      let items = this.client.getScreenWindowsInfo()
      const noImageSize =items.filter((it: any) => !it.image).length
      if (noImageSize) {
        throw {code: 'ELECTRON_PERMISSION_DENIED'}
      }
      return items.map((it: any) => ({
        ownerName: it.ownerName,
        name: it.name,
        windowId: it.windowId,
        image: CustomBtoa(it.image),
      }))
    } catch (err) {
      throw new GenericErrorWrapper(err)
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
        EduLogger.info(`[electron-log-path] checkout videoSourceLogPath: ${this.videoSourceLogPath}`)
        if (this.videoSourceLogPath) {
          this.client.videoSourceSetLogFile(this.videoSourceLogPath)
          window.setNodeAddonVideoSourceLogPath = this.videoSourceLogPath
          EduLogger.info(`[electron-log-path] set videoSourceLogPath: ${this.videoSourceLogPath}`)
        }
        const handleVideoSourceJoin = (uid: number) => {
          this.client.off('videoSourceJoinedSuccess', handleVideoSourceJoin)
          EduLogger.info("startScreenShare#options uid, ", uid, "  options", options)
          this.client.videoSourceStartScreenCaptureByWindow(options.windowId as number, config.rect, config.param)
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

    return await Promise.race([startScreenPromise, wait(8000)])
  }

  async stopScreenShare(): Promise<any> {
    const stopScreenSharePromise = new Promise((resolve, reject) => {
      const handleVideoSourceLeaveChannel = (evt: any) => {
        this.client.off('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
        setTimeout(resolve, 1)
      }
      try {
        this.client.on('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
        let ret = this.client.videoSourceLeave()
        EduLogger.info("stopScreenShare leaveSubChannel", ret)
        wait(8000).catch((err: any) => {
          this.client.off('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
          reject(err)
        })
      } catch(err) {
        this.client.off('videoSourceLeaveChannel', handleVideoSourceLeaveChannel)
        reject(err)
      }
    })

    try {
      await stopScreenSharePromise
    } catch(err) {
      throw new GenericErrorWrapper(err)
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
      throw 'electron not support openTestCamera'
    }
    await this.openCamera(option)
  }
  
  closeTestCamera() {
    if (this.joined) {
      throw 'electron not support closeTestCamera'
    }
    this.closeCamera()
  }
  
  async changeTestCamera(deviceId: string): Promise<any> {
    if (this.joined) {
      throw 'electron not support changeTestCamera'
    }
    await this.changeCamera(deviceId)
  }
  
  async openTestMicrophone(option?: MicrophoneOption): Promise<any> {
    if (this.joined) {
      throw 'electron not support openTestMicrophone'
    }
    await this.openMicrophone(option)
    this.client.startAudioRecordingDeviceTest(300)
  }
  
  async changeTestResolution(config: any): Promise<any> {
    if (this.joined) {
      throw 'electron not support changeTestResolution'
    }
    await this.changeResolution(config)
  }
  
  closeTestMicrophone() {
    if (this.joined) {
      throw 'electron not support closeTestMicrophone'
    }
    this.closeMicrophone()
  }
  
  async changeTestMicrophone(deviceId: string): Promise<any> {
    if (this.joined) {
      throw 'electron not support changeTestMicrophone'
    }
    await this.changeMicrophone(deviceId)
  }
}