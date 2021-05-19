import {v4 as uuidv4} from 'uuid';
import { GenericErrorWrapper } from './../utils/generic-error';
import { EduLogger } from './../logger';
import { LocalUserRenderer, RemoteUserRenderer } from './renderer/index';
import { EventEmitter } from 'events';
import { IMediaService, RTCWrapperProvider, RTCProviderInitParams, CameraOption, MicrophoneOption, PrepareScreenShareParams, StartScreenShareParams, JoinOption, MediaVolume } from './interfaces';
import { AgoraElectronRTCWrapper } from './electron';
import { AgoraWebRtcWrapper } from './web';
import AgoraRTC, { ITrack, ILocalTrack } from 'agora-rtc-sdk-ng';
import { reportService } from '../services/report-service';

export class MediaService extends EventEmitter implements IMediaService {
  sdkWrapper!: RTCWrapperProvider;

  cameraTestRenderer?: LocalUserRenderer;

  cameraRenderer?: LocalUserRenderer;

  microphoneTrack?: ILocalTrack;

  screenRenderer?: LocalUserRenderer;

  remoteUsersRenderer: RemoteUserRenderer[] = [];

  screenShareIds: any[] = []

  readonly _id!: string

  constructor(rtcProvider: RTCProviderInitParams) {
    super();
    this._id = uuidv4()
    this.cameraRenderer = undefined
    this.screenRenderer = undefined
    this.remoteUsersRenderer = []
    EduLogger.info(`[rtcProvider] appId: ${rtcProvider.appId}, platform: ${rtcProvider.platform}`)
    if (rtcProvider.platform === 'electron') {
      const electronLogPath = rtcProvider.electronLogPath as any;
      this.sdkWrapper = new AgoraElectronRTCWrapper({
        cefClient: rtcProvider.cefClient,
        logPath: electronLogPath.logPath,
        videoSourceLogPath: electronLogPath.videoSourceLogPath,
        AgoraRtcEngine: rtcProvider.agoraSdk,
        appId: rtcProvider.appId,
        area: rtcProvider.rtcArea
      })
      window.ipc && window.ipc.once("initialize", (events: any, args: any) => {
        const logPath = args[0]
        const videoSourceLogPath = args[2];
        window.videoSourceLogPath = videoSourceLogPath;
        window.logPath = logPath
        EduLogger.info(`[media-service] set logPath: ${logPath}, ${videoSourceLogPath}`)
        this.electron.setAddonLogPath({logPath, videoSourceLogPath})
        this.electron.enableLogPersist()
      })
    } else {
      this.sdkWrapper = new AgoraWebRtcWrapper({
        uploadLog: true,
        agoraWebSdk: rtcProvider.agoraSdk,
        webConfig: {
          mode: 'live',
          codec: rtcProvider.codec,
          role: 'host',
        },
        appId: rtcProvider.appId,
        area: rtcProvider.rtcArea
      })
    }
    this.sdkWrapper.on('network-quality', (quality: any) => {
      this.fire('network-quality', quality)
    })
    this.sdkWrapper.on('connection-state-change', (curState: any) => {
      EduLogger.info("[media-service] connection-state-change ", curState)
      this.fire('connection-state-change', {curState})
    })
    this.sdkWrapper.on('volume-indication', (evt: any) => {
      this.fire('volume-indication', evt)
    })
    this.sdkWrapper.on('local-audio-volume', (evt: any) => {
      this.fire('local-audio-volume', evt)
    })
    this.sdkWrapper.on('exception', (err: any) => {
      this.fire('exception', err)
    })
    this.sdkWrapper.on('user-unpublished', (evt: any) => {
      const user = evt.user
      if (evt.mediaType === 'audio') return
      EduLogger.debug("sdkwrapper user-unpublished", user)
      const userIndex = this.remoteUsersRenderer.findIndex((it: any) => it.uid === user.uid && it.channel === evt.channel)
      if (userIndex !== -1) {
        const userRenderer = this.remoteUsersRenderer[userIndex]
        this.remoteUsersRenderer = this.remoteUsersRenderer.filter((it: any) => it !== userRenderer)
        this.fire('user-unpublished', {
          user,
          remoteUserRender: userRenderer
        })
      }
    })

    this.sdkWrapper.on('track-ended', (evt: any) => {
      this.fire('track-ended', evt)
    })

    this.sdkWrapper.on('user-published', (evt: any) => {
      const user = evt.user
      EduLogger.debug("sdk wrapper user-published", user)
      const userIndex = this.remoteUsersRenderer.findIndex((it: any) => it.uid === user.uid)
      if (userIndex === -1) {
        const newUserRenderer = new RemoteUserRenderer({
          context: this,
          uid: +user.uid,
          channel: evt.channel,
          videoTrack: user.videoTrack,
          sourceType: 'default',
        })
        this.remoteUsersRenderer.push(newUserRenderer)
        EduLogger.debug("sdk wrapper user-published add remote user renderer, renderers length: ", this.remoteUsersRenderer.length)
        this.fire('user-published', {
          user: user,
          remoteUserRender: newUserRenderer
        })
        return
      } else {
        if (user.videoTrack) {
          this.remoteUsersRenderer[userIndex].videoTrack = user.videoTrack
        }
      }
      this.fire('user-published', {
        user: user,
        remoteUserRender: this.remoteUsersRenderer[userIndex]
      })
    })
    this.sdkWrapper.on('rtcStats', (evt: any) => {
      this.fire('rtcStats', evt)
    })
    this.sdkWrapper.on('localVideoStats', (evt: any) => {
      let {stats = {}} = evt
      let {encoderOutputFrameRate = 0} = stats
      this.cameraRenderer?.setFPS(encoderOutputFrameRate)
      this.fire('localVideoStats', {
        renderState: this.cameraRenderer?.renderState,
        renderFrameRate: this.cameraRenderer?.renderFrameRate,
        freezeCount: this.cameraRenderer?.freezeCount,
        ...evt
      })
    })
    this.sdkWrapper.on('remoteVideoStats', (evt: any) => {
      let {stats = {}, user = {}} = evt
      let {decoderOutputFrameRate = 0} = stats
      let {uid} = user
      let remoteUserRender = this.remoteUsersRenderer.find(render => render.uid === uid)
      remoteUserRender?.setFPS(decoderOutputFrameRate)
      this.fire('remoteVideoStats', {
        user,
        stats: {
          renderState: remoteUserRender?.renderState,
          renderFrameRate: remoteUserRender?.renderFrameRate,
          freezeCount: remoteUserRender?.freezeCount,
          ...stats
        }
      })
    })
    this.sdkWrapper.on('localVideoStateChanged', (evt: any) => {
      this.fire('localVideoStateChanged', evt)
    })
    // this.sdkWrapper.on('volume-indication', (volumes: MediaVolume[]) => {
    //   this.fire('volume-indication', {
    //     volumes
    //   })
    // })
    //@ts-ignore
    if (window.agoraBridge) {
      this.electron.client.on('AudioDeviceStateChanged', (evt: any) => {
        this.fire('audio-device-changed', (evt))
      })

      this.electron.client.on('VideoDeviceStateChanged', (evt: any) => {
        this.fire('video-device-changed', (evt))
      })
    } else {
      AgoraRTC.onCameraChanged = (info) => {
        this.fire('video-device-changed', (info))
      }
      AgoraRTC.onMicrophoneChanged = (info) => {
        this.fire('audio-device-changed', (info))
      }
      AgoraRTC.onAudioAutoplayFailed = () => {
        this.fire('audio-autoplay-failed')
      }
    }

  }

  private fire(...params: any[]) {
    const [message, ...args] = params
    if (!['local-audio-volume', 'volume-indication', 'watch-rtt', 'network-quality'].includes(message)) {
      EduLogger.info(args[0], args)
    }
    this.emit(message, ...args)
  }

  get isWeb (): boolean {
    return this.sdkWrapper instanceof AgoraWebRtcWrapper
  }

  get isElectron (): boolean {
    return this.sdkWrapper instanceof AgoraElectronRTCWrapper
  }

  private getNativeCurrentVideoDevice() {
    if (this.electron._cefClient) {
      //@ts-ignore
      return this.electron.client.videoDeviceManager.getDevice()
    }
    return this.electron.client.getCurrentVideoDevice()
  }

  private getNativeVideoDevices() {
    //@ts-ignore
    if (this.electron._cefClient) {
      //@ts-ignore
      let list = this.electron.client.videoDeviceManager.enumerateVideoDevices()
      list = list.map((it: any) => ({
        deviceid: it.deviceId,
        devicename: it.deviceName,
        kind: 'videoinput'
      }))
      return list
    }
    return this.electron.client.getVideoDevices()
  }

  private getNativeCurrentAudioDevice() {
    if (this.electron._cefClient) {
      //@ts-ignore
      return this.electron.client.audioDeviceManager.getRecordingDevice()
    }
    return this.electron.client.getCurrentAudioRecordingDevice()
  }

  private getNativeAudioDevices() {
    if (this.electron._cefClient) {
      //@ts-ignore
      let list = this.electron.client.audioDeviceManager.enumerateRecordingDevices()
      list = list.map((it: any) => ({
        deviceid: it.deviceId,
        devicename: it.deviceName,
        kind: 'audioinput'
      }))
      return list
    }
    return this.electron.client.getAudioRecordingDevices()
  }

  getTestCameraLabel(): string {
    const defaultLabel = '';
    if (this.isWeb) {
      if (this.web.cameraTestTrack) {
        return this.web.cameraTestTrack.getTrackLabel()
      }
    }
    if (this.isElectron) {
      const deviceId = this.getNativeCurrentVideoDevice()
      const videoDeviceList = this.getNativeVideoDevices()
      const videoDevice: any = videoDeviceList.find((d: any) => d.deviceid === deviceId)
      if (videoDevice) {
        return videoDevice.devicename
      }
    }
    return defaultLabel
  }

  getTestMicrophoneLabel(): string {
    const defaultLabel = '';
    if (this.isWeb) {
      if (this.web.microphoneTestTrack) {
        return this.web.microphoneTestTrack.getTrackLabel()
      }
    }
    if (this.isElectron) {
      const deviceId = this.getNativeCurrentAudioDevice()
      const audioDeviceList = this.getNativeAudioDevices()
      const audioDevice: any = audioDeviceList.find((d: any) => d.deviceid === deviceId)
      if (audioDevice) {
        return audioDevice.devicename
      }
    }
    return defaultLabel
  }

  getCameraLabel(): string {
    const defaultLabel = '';
    if (this.isWeb) {
      if (this.web.cameraTrack) {
        return this.web.cameraTrack.getTrackLabel()
      }
    }
    if (this.isElectron) {
      const deviceId = this.getNativeCurrentVideoDevice()
      const videoDeviceList = this.getNativeVideoDevices()
      const videoDevice: any = videoDeviceList.find((d: any) => d.deviceid === deviceId)
      if (videoDevice) {
        return videoDevice.devicename
      }
    }
    return defaultLabel
  }

  private getNativeSpeakerLabel(): string {
    if (this.isElectron) {
      if (this.electron._cefClient) {
        //@ts-ignore TODO: can uuse camelCase transform function get deviceName
        return this.electron.client.audioDeviceManager.getPlaybackDeviceInfo().deviceName
      }
      //@ts-ignore
      const deviceItem = this.electron.client.getPlaybackDeviceInfo()[0]
      //@ts-ignore
      return deviceItem.devicename
    }
    return ''
  }

  getSpeakerLabel(): string {
    if (this.isElectron) {
      return this.getNativeSpeakerLabel()
    }

    return ''
  }

  getMicrophoneLabel(): string {
    const defaultLabel = '';
    if (this.isWeb) {
      if (this.web.microphoneTrack) {
        return this.web.microphoneTrack.getTrackLabel()
      }
    }
    if (this.isElectron) {
      const deviceId = this.getNativeCurrentAudioDevice()
      const audioDeviceList = this.getNativeAudioDevices()
      const audioDevice: any = audioDeviceList.find((d: any) => d.deviceid === deviceId)
      if (audioDevice) {
        return audioDevice.devicename
      }
    }
    return defaultLabel
  }

  changePlaybackVolume(volume: number): void {
    if (this.isWeb) {
      this.sdkWrapper.changePlaybackVolume(volume)
    }
    if (this.isElectron) {
      this.sdkWrapper.changePlaybackVolume(volume)
    }
  }
  
  async muteLocalVideo(val: boolean): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.muteLocalVideo(val)
    }
    if (this.isElectron) {
      await this.sdkWrapper.muteLocalVideo(val)
    }
  }

  async muteLocalAudio(val: boolean): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.muteLocalAudio(val)
    }
    if (this.isElectron) {
      await this.sdkWrapper.muteLocalAudio(val)
    }
  }

  async muteRemoteVideo(uid: any, val: boolean): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.muteRemoteVideo(uid, val)
    }
    if (this.isElectron) {
      await this.sdkWrapper.muteRemoteVideo(uid, val)
    }
  }

  async muteRemoteAudio(uid: any, val: boolean): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.muteRemoteAudio(uid, val)
    }
    if (this.isElectron) {
      await this.sdkWrapper.muteRemoteAudio(uid, val)
    }
  }

  // async muteRemoteVideoByClient(client: any, uid: any, val: boolean): Promise<any> {
  //   if (this.isWeb) {
  //     await this.web.muteRemoteVideoByClient(client, uid, val)
  //   } else {
  //     throw 'no Implemented'
  //   }
  // }
  // async muteRemoteAudioByClient(client: any, uid: any, val: boolean): Promise<any> {
  //   if (this.isWeb) {
  //     await this.web.muteRemoteAudioByClient(client, uid, val)
  //   } else {
  //     throw 'no Implemented'
  //   }
  // }

  get web (): AgoraWebRtcWrapper {
    return (this.sdkWrapper as AgoraWebRtcWrapper)
  }

  get electron (): AgoraElectronRTCWrapper {
    return (this.sdkWrapper as AgoraElectronRTCWrapper)
  }

  init() {
    if (this.isWeb) {
      this.sdkWrapper.init()
    }

    if (this.isElectron) {
      this.sdkWrapper.init()
    }
  }

  release () {
    if (this.isWeb) {
      this.sdkWrapper.release()
    }

    if (this.isElectron) {
      this.sdkWrapper.release()
    }
  }

  async join(option: JoinOption): Promise<any> {
    try {
      // REPORT
      reportService.startTick('joinRoom', 'rtc', 'joinChannel')
      await this._join(option)
      reportService.reportElapse('joinRoom', 'rtc', {api: 'joinChannel', result: true})
    } catch(e) {
      reportService.reportElapse('joinRoom', 'rtc', {api: 'joinChannel', result: false, errCode: `${e.code || e.message}`})
      throw e
    }
  }

  async _join(option: JoinOption): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.join(option)
    }
    if (this.isElectron) {
      await this.sdkWrapper.join(option)
    }
  }

  private destroyAllRenderers() {
    if (this.cameraRenderer) {
      if (this.cameraRenderer._playing) {
        this.cameraRenderer.stop()
      }
      this.cameraRenderer = undefined
      EduLogger.info("remove local camera renderer success")
    }
    if (this.screenRenderer) {
      if (this.screenRenderer._playing) {
        this.screenRenderer.stop()
      }
      this.screenRenderer = undefined
      EduLogger.info("remove local screen renderer success")
    }
    if (this.microphoneTrack) {
      if (this.microphoneTrack.isPlaying) {
        this.microphoneTrack.stop()
      }
      this.microphoneTrack = undefined
      EduLogger.info("remove local microphone track success")
    }
    if (this.remoteUsersRenderer && this.remoteUsersRenderer.length) {
      for (let render of this.remoteUsersRenderer) {
        if (render._playing) {
          render.stop()
        }
      }
      this.remoteUsersRenderer = []
      EduLogger.info("remove remote users renderer success")
    }
  }

  async leave(): Promise<any> {
    try {
      if (this.isWeb) {
        await this.sdkWrapper.leave()
      }
      if (this.isElectron) {
        await this.sdkWrapper.leave()
      }
      this.destroyAllRenderers()
    } catch (err) {
      this.destroyAllRenderers()
      GenericErrorWrapper(err)
    }
  }

  async joinSubChannel(option: JoinOption): Promise<any> {
    if (!option.channel) throw 'channelName is invalid'
    if (this.isWeb) {
      await this.sdkWrapper.joinSubChannel(option)
    } else {
      await this.sdkWrapper.joinSubChannel(option)
    }
  }

  async leaveSubChannel(channelName: string): Promise<any> {
    EduLogger.info(`call leaveSubChannel `, `${JSON.stringify(channelName)}`)
    if (!channelName) throw GenericErrorWrapper({ message: 'channelName is invalid' })
    if (this.isWeb) {
      await this.sdkWrapper.leaveSubChannel(channelName)
    } else {
      await this.sdkWrapper.leaveSubChannel(channelName)
    }
  }

  async publish(): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.publish()
    }
    if (this.isElectron) {
      await this.sdkWrapper.publish()
    }
  }

  async unpublish(): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.unpublish()
    }
    if (this.isElectron) {
      await this.sdkWrapper.unpublish()
    }
  }

  async openCamera(option?: CameraOption): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.openCamera(option)
      if (!this.web.cameraTrack) return

      if (!this.cameraRenderer) {
        this.cameraRenderer = new LocalUserRenderer({
          context: this,
          uid: 0,
          channel: 0,
          sourceType: 'default',
          videoTrack: this.web.cameraTrack
        })
      } else {
        if (this.cameraRenderer._playing) {
          this.cameraRenderer.stop()
        }
        this.cameraRenderer.videoTrack = this.web.cameraTrack
      }
    }
    if (this.isElectron) {
      await this.sdkWrapper.openCamera()

      if (!this.cameraRenderer) {
        this.cameraRenderer = new LocalUserRenderer({
          context: this,
          uid: 0,
          channel: 0,
          sourceType: 'default',
        })
      }
    }
  }

  async changeCamera(deviceId: string): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.changeCamera(deviceId)
    }
    if (this.isElectron) {
      await this.sdkWrapper.changeCamera(deviceId)
    }
  }

  async closeCamera() {
    if (this.isWeb) {
      await this.sdkWrapper.closeCamera()
    }
    if (this.isElectron) {
      await this.sdkWrapper.closeCamera()
    }
    if (this.cameraRenderer) {
      this.cameraRenderer.stop()
      this.cameraRenderer = undefined
    }
  }

  async openMicrophone(option?: MicrophoneOption): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.openMicrophone(option)
      this.microphoneTrack = this.web.microphoneTrack
    }
    if (this.isElectron) {
      await this.sdkWrapper.openMicrophone(option)
      //@ts-ignore
      this.microphoneTrack = {}
    }
  }

  async changeMicrophone(deviceId: string): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.changeMicrophone(deviceId)
    }
    if (this.isElectron) {
      await this.sdkWrapper.changeMicrophone(deviceId)
    }
  }

  async closeMicrophone() {
    await this.sdkWrapper.closeMicrophone()
    this.microphoneTrack = undefined
  }

  async openTestCamera(option: CameraOption): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.openTestCamera(option)
      if (!this.web.cameraTestTrack) return

      if (!this.cameraTestRenderer) {
        this.cameraTestRenderer = new LocalUserRenderer({
          context: this,
          uid: 0,
          channel: 0,
          sourceType: 'default',
          videoTrack: this.web.cameraTestTrack
        })
      } else {
        this.cameraTestRenderer.videoTrack = this.web.cameraTestTrack
      }
    }
    if (this.isElectron) {
      await this.sdkWrapper.openTestCamera()

      if (!this.cameraTestRenderer) {
        this.cameraTestRenderer = new LocalUserRenderer({
          context: this,
          uid: 0,
          channel: 0,
          sourceType: 'default',
        })
      }
    }
  }

  closeTestCamera() {
    this.sdkWrapper.closeTestCamera()
    if (this.cameraTestRenderer) {
      this.cameraTestRenderer.stop()
      this.cameraTestRenderer = undefined
    }
  }

  async changeTestCamera(deviceId: string): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.changeTestCamera(deviceId)
      if (!this.cameraTestRenderer) {
        this.cameraTestRenderer = new LocalUserRenderer({
          context: this,
          uid: 0,
          channel: 0,
          sourceType: 'default',
          videoTrack: this.web.cameraTestTrack
        })
      } else {
        this.cameraTestRenderer.videoTrack = this.web.cameraTestTrack
      }
    }
    if (this.isElectron) {
      await this.sdkWrapper.changeTestCamera(deviceId)
    }
  }

  async changeTestResolution(config: any) {
    if (this.isWeb) {
      await this.web.changeTestResolution(config)
    }
    if (this.isElectron) {
      await this.electron.changeTestResolution(config)
    }
  }

  async openTestMicrophone(option?: MicrophoneOption): Promise<any> {
    await this.sdkWrapper.openTestMicrophone(option)
  }

  closeTestMicrophone() {
    this.sdkWrapper.closeTestMicrophone()
  }

  async changeTestMicrophone(id: string): Promise<any> {
    await this.sdkWrapper.changeTestMicrophone(id)
  }

  async getCameras(): Promise<any> {
    if (this.isWeb) {
      return await this.web.getCameras()
    }

    if (this.isElectron) {
      return await this.electron.getCameras()
    }
  }

  async getMicrophones(): Promise<any> {
    if (this.isWeb) {
      return await this.web.getMicrophones()
    }

    if (this.isElectron) {
      return await this.electron.getMicrophones()
    }
  }

  async prepareScreenShare(params: PrepareScreenShareParams = {}): Promise<any> {
    if (this.isWeb) {
      await this.web.prepareScreenShare(params)
      this.screenRenderer = new LocalUserRenderer({
        context: this,
        uid: 0,
        channel: 0,
        videoTrack: this.web.screenVideoTrack as ITrack,
        sourceType: 'screen',
      })
    }
    if (this.isElectron) {
      let items = await this.electron.prepareScreenShare(params)
      return items
    }
  }

  async startScreenShare(option: StartScreenShareParams): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.startScreenShare(option)
    }
    if (this.isElectron) {
      await this.sdkWrapper.startScreenShare(option)
      this.screenRenderer = new LocalUserRenderer({
        context: this,
        uid: 0,
        channel: 0,
        videoTrack: undefined,
        sourceType: 'screen',
      })
    }
  }

  async stopScreenShare(): Promise<any> {
    if (this.isWeb) {
      await this.sdkWrapper.stopScreenShare()
    }
    if (this.isElectron) {
      await this.sdkWrapper.stopScreenShare()
    }
  }

  async changeResolution(config: any) {
    if (this.isWeb) {
      await this.web.changeResolution(config)
    }
    if (this.isElectron) {
      await this.electron.changeResolution(config)
    }
  }

  getPlaybackVolume(): number {
    if (this.isElectron) {
      return +(this.electron.client.getAudioPlaybackVolume() / 255 * 100).toFixed(1) 
    }
    return 100;
  }

  reset(): void {
    if (this.isWeb) {
      this.web.reset()
    }
    if (this.isElectron) {
      this.electron.reset()
    }
  }
}