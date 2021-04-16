import { eduSDKApi } from "@/services/edu-sdk-api"
import { AgoraMediaDeviceEnum } from "@/types"
import { BizLogger, debounce, getDeviceLabelFromStorage, GlobalStorage } from "@/utils/utils"
import { AgoraElectronRTCWrapper, AgoraWebRtcWrapper, EduLogger, GenericErrorWrapper, LocalUserRenderer, RemoteUserRenderer } from "agora-rte-sdk"
import { isEmpty, uniq } from "lodash"
import { computed, observable, reaction } from "mobx"
import { BehaviorSubject } from "rxjs"
import { v4 as uuidv4 } from 'uuid'
import { SceneStore } from "./scene"

export enum LocalVideoStreamState {
  LOCAL_VIDEO_STREAM_STATE_STOPPED = 0,
  LOCAL_VIDEO_STREAM_STATE_CAPTURING = 1,
  LOCAL_VIDEO_STREAM_STATE_ENCODING = 2,
  LOCAL_VIDEO_STREAM_STATE_FAILED = 3
}

export enum LocalVideoErrorEnum {
  OK = 0,
  FAILURE = 2,
  NO_PERMISSION = 2,
  BUSY = 3,
  CAPTURE_FAILURE = 4,
  ENCODE_FAILURE = 5,
  SCREEN_CAPTURE_WINDOW_MINIMIZED = 11,
  SCREEN_CAPTURE_WINDOW_CLOSED = 12
}

const networkQualityLevel = [
  'unknown',
  'excellent',
  'good',
  'bad',
  'bad',
  'bad',
  'bad',
]

type LocalPacketLoss = {
  audioStats: { audioLossRate: number },
  videoStats: { videoLossRate: number }
}

const delay = 300

export class MediaStore {
  @observable
  remoteUsersRenderer: any[] = []

  @observable
  signalStatus: any[] = []
  @observable
  rendererOutputFrameRate: any

  @observable
  autoplay: any

  @observable
  networkQuality: string = 'unknown'

  @observable
  totalVolume: number = 0

  @observable
  speakers: any

  @observable
  _microphoneTrack?: any

  @observable
  _microphoneTestTrack?: any

  @observable
  resolution: any

  @observable
  _cameraRenderer: LocalUserRenderer | undefined

  @observable
  _testCameraRenderer: LocalUserRenderer | undefined

  @observable
  _cameraId: string = '';

  @observable
  _microphoneId: string = '';

  get mediaService() {
    return this.sceneStore.mediaService
  }
  
  @observable
  _cameraList: any[] = []

  get cameraList(): any[] {
    return this._cameraList
      // .concat([{
      //   deviceId: AgoraMediaDeviceEnum.Default,
      //   label: '禁用',
      // }])
  }

  @observable
  _microphoneList: any[] = []

  @computed
  get microphoneList(): any[] {
    return this._microphoneList
      // .concat([{
      //   deviceId: AgoraMediaDeviceEnum.Default,
      //   label: '禁用',
      // }])
  }

  get web(): AgoraWebRtcWrapper {
    return (this.mediaService.sdkWrapper as AgoraWebRtcWrapper)
  }

  get isWeb(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraWebRtcWrapper
  }

  get isElectron(): boolean {
    return this.mediaService.sdkWrapper instanceof AgoraElectronRTCWrapper
  }

  @observable
  cameraError?: string = ''

  @observable
  microphoneError?: string = ''

  @observable
  _speakerList: any[] = []
  
  @computed
  get speakerList(): any[] {
    return [{
      label: 'browser default',
      deviceId: 'web_default'
    }]
  }

  init(option: {video?: boolean, audio?: boolean} = {video: true, audio: true}) {
    if (option.video) {
      this.mediaService.getCameras().then((list: any[]) => {
        this._cameraList = list
      })
    }
    if (option.audio) {
      this.mediaService.getMicrophones().then((list: any[]) => {
        this._microphoneList = list
      })
    }
  }

  @observable
  cpuUsage: number = 0

  @observable
  localVideoState: LocalVideoStreamState = LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_STOPPED

  @observable
  _delay: number = 0

  @computed
  get delay(): string {
    return `${this._delay}`
  }

  @observable
  localPacketLoss: LocalPacketLoss = {
    audioStats: {
      audioLossRate: 0
    },
    videoStats: {
      videoLossRate: 0
    }
  }

  updateNetworkPacketLostRate(localPacketLoss: unknown) {
    this.localPacketLoss = localPacketLoss as LocalPacketLoss
  }

  @computed
  get localPacketLostRate() {
    return Math.max(this.localPacketLoss.audioStats.audioLossRate, this.localPacketLoss.videoStats.videoLossRate)
  }

  updateSignalStatusWithRemoteUser(mixSignalStatus: any[]) {
    this.signalStatus = mixSignalStatus
  }

  private userSignalStatus(mixSignalStatus: any[]) {
    const signalStatus: any[] = []
    this.sceneStore.streamList.forEach((user: { userInfo?: any; streamUuid?: any }) => {
      const { streamUuid: uid } = user;
      const target = mixSignalStatus.find(x => x.uid === +uid)
      signalStatus.push({
        ...user,
        ...user.userInfo,
        ...target,
      })
    })
    return signalStatus
  }

  @computed
  get cameraRenderer(): LocalUserRenderer | undefined {
    return this._cameraRenderer;
  }

  @computed
  get isCameraOpen () {
    return !!this.sceneStore.cameraRenderer
  }

  resetMicrophoneTrack () {
    this._microphoneTrack = undefined
  }

  resetCameraTrack () {
    this._cameraRenderer = undefined
  }

  resetTestMicrophoneTrack () {
    this._microphoneTestTrack = undefined
  }

  resetTestCameraTrack () {
    this._testCameraRenderer = undefined
  }

  private remoteMaxPacketLoss(audioStats: any = {}, videoStats: any = {}) {
    const mixSignalStatus: any[] = []
    uniq([...Object.keys(audioStats), ...Object.keys(videoStats)]).forEach(item => {
      const videoStatsItem = videoStats[item] || {}
      const audioStatsItem = audioStats[item] || {}
      const { packetLossRate: videoLossRate, receiveDelay: videoReceiveDelay } = videoStatsItem
      const { packetLossRate: audioLossRate, receiveDelay: audioReceiveDelay } = audioStatsItem
      const packetLossRate = Math.max(videoLossRate || 0, audioLossRate || 0);
      const receiveDelay = Math.max(videoReceiveDelay || 0, audioReceiveDelay || 0);
      mixSignalStatus.push({
        audioStats: { ...audioStatsItem },
        videoStats: { ...videoStatsItem },
        uid: +item,
        packetLossRate,
        receiveDelay,
      })
    })
    return mixSignalStatus;
  }
  private sceneStore: SceneStore;

  id: string = uuidv4()

  get device(): boolean {
    if (this.rendererOutputFrameRate[`${0}`] > 0) {
      return true
    } else {
      return false
    }
  }

  constructor(sceneStore: SceneStore) {
    console.log("[ID] mediaStore ### ", this.id)
    this.sceneStore = sceneStore
    this.mediaService.on('rtcStats', (evt: any) => {
      this.sceneStore.updateCpuRate(evt.cpuTotalUsage)
    })
    this.mediaService.on('track-ended', (evt: any) => {
      if (evt.tag === 'cameraTestRenderer' && this._testCameraRenderer) {
        this._testCameraRenderer?.stop()
        this.resetTestCameraTrack()
      }
      if (evt.tag === 'cameraRenderer' && this.sceneStore.cameraRenderer) {
        this.sceneStore.cameraRenderer.stop()
        this.sceneStore.resetCameraTrack()
        eduSDKApi.reportCameraState({
          roomUuid: this.sceneStore.roomInfo.roomUuid,
          userUuid: this.sceneStore.roomInfo.userUuid,
          state: 0
        }).catch((err: Error) => {
          BizLogger.info(`[demo] action in report web device camera state failed, reason: ${err}`)
        })
      }

      if (evt.tag === 'microphoneTestTrack' && this.cameraRenderer) {
        this.resetMicrophoneTrack()
      }
      if (evt.tag === 'microphoneTrack' && this.sceneStore._microphoneTrack!) {
        this.sceneStore.resetMicrophoneTrack()
      }
      BizLogger.info("track-ended", evt)
    })
    this.mediaService.on('audio-device-changed', debounce(async (info: any) => {
      BizLogger.info("audio device changed")
      // if (sceneStore.isNotInvisible) {
      //   this.sceneStore.uiStore.addToast(transI18n('toast.audio_equipment_has_changed'))
      // }

      await this.init({ audio: true})
      // await this.sceneStore.deviceStore.init({ audio: true })
    }, delay))
    this.mediaService.on('video-device-changed', debounce(async (info: any) => {
      BizLogger.info("video device changed")
      // this.sceneStore.uiStore.addToast(transI18n('toast.video_equipment_has_changed'))
      // await this.sceneStore.deviceStore.init({ video: true })
      await this.init({ video: true})
    }, delay))
    this.mediaService.on('audio-autoplay-failed', () => {
      if (!this.autoplay) {
        this.autoplay = true
        // this.sceneStore.uiStore.showAutoplayNotification()
      }
    })
    this.mediaService.on('user-published', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
      EduLogger.info(`[agora-apaas] [media#renderers] user-published ${this.mediaService.remoteUsersRenderer.map((e: RemoteUserRenderer) => e.uid)}`)
      const uid = evt.user.uid
      this.rendererOutputFrameRate[`${uid}`] = 0
      console.log('sdkwrapper update user-pubilshed', evt)
    })
    this.mediaService.on('user-unpublished', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
      EduLogger.info(`[agora-apaas] [media#renderers] user-unpublished ${this.mediaService.remoteUsersRenderer.map((e: RemoteUserRenderer)=> e.uid)}`)
      const uid = evt.user.uid
      delete this.rendererOutputFrameRate[`${uid}`]
      console.log('sdkwrapper update user-unpublished', evt)
    })
    this.mediaService.on('network-quality', (evt: any) => {
      let defaultQuality = 'unknown'

      let downlinkNetworkQuality = +evt.downlinkNetworkQuality;
      let uplinkNetworkQuality = +evt.uplinkNetworkQuality;
      let qualityStr = defaultQuality
      let value = Math.max(downlinkNetworkQuality, uplinkNetworkQuality)
      qualityStr = networkQualityLevel[value]
      this.updateNetworkQuality(qualityStr || defaultQuality)
      const {
        remotePacketLoss: { audioStats, videoStats },
        localPacketLoss
      } = evt;
      const mixSignalStatus = this.remoteMaxPacketLoss(audioStats, videoStats);
      if (evt.hasOwnProperty('cpuUsage')) {
        this.cpuUsage = evt.cpuUsage
      }
      this._delay = evt.rtt
      this.updateNetworkPacketLostRate(localPacketLoss)
      this.updateSignalStatusWithRemoteUser(this.userSignalStatus(mixSignalStatus))
    })
    this.mediaService.on('connection-state-change', (evt: any) => {
      BizLogger.info('connection-state-change', JSON.stringify(evt))
    })
    this.mediaService.on('localVideoStateChanged', (evt: any) => {
      const {state, msg} = evt
      if ([LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_FAILED,
          LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_ENCODING].includes(state)) {
        this.localVideoState = state
      }
    })
    this.mediaService.on('local-audio-volume', (evt: any) => {
      const {totalVolume} = evt
      if (this.sceneStore.isElectron) {
        this.totalVolume = Number((totalVolume / 255).toFixed(3))
      } else {
        this.totalVolume = totalVolume * 100;
      }
    })
    this.mediaService.on('volume-indication', (evt: any) => {
      const {speakers, speakerNumber, totalVolume} = evt
      
      speakers.forEach((speaker: any) => {
        this.speakers[+speaker.uid] = + speaker.volume
        // this.speakers.set(+speaker.uid, +speaker.volume)
      })
    })
    this.mediaService.on('localVideoStats', (evt: any) => {
      this.rendererOutputFrameRate[`${0}`] = evt.stats.encoderOutputFrameRate
      BizLogger.info("localVideoStats", " encoderOutputFrameRate " , evt.stats.encoderOutputFrameRate, " renderOutput " , JSON.stringify(this.rendererOutputFrameRate))
    })
    this.mediaService.on('remoteVideoStats', (evt: any) => {
      if (this.rendererOutputFrameRate.hasOwnProperty(evt.user.uid)) {
        this.rendererOutputFrameRate[`${evt.user.uid}`] = evt.stats.decoderOutputFrameRate
        BizLogger.info("remoteVideoStats", " decodeOutputFrameRate " , evt.stats.decoderOutputFrameRate, " renderOutput " , JSON.stringify(this.rendererOutputFrameRate))
      }
    })

    reaction(() => JSON.stringify([
      this.sceneStore.roomInfo.roomUuid,
      this.sceneStore.roomInfo.userUuid,
      this.device,
      this.sceneStore.roomJoined,
    ]), (data: string) => {
      const [roomUuid, userUuid, device, roomJoined] = JSON.parse(data)
      if (roomJoined && roomUuid && userUuid) {
        eduSDKApi.reportCameraState({
          roomUuid: roomUuid,
          userUuid: userUuid,
          state: +device
        }).catch((err) => {
          BizLogger.info(`[demo] action in report native device camera state failed, reason: ${err}`)
        }).then(() => {
          BizLogger.info(`[CAMERA] report camera device not working`)
        })
      }
    })
  }
  
  updateNetworkQuality(v: string) {
    this.networkQuality = v
  }

  error$!: BehaviorSubject<{type: 'video' | 'audio', error: boolean}>

  onDeviceTestError(cb: (evt: {type: 'video' | 'audio', error: boolean}) => void) {
    this.error$ = new BehaviorSubject<{type: 'video' | 'audio', error: boolean}>({} as any)
    this.error$.subscribe({
      next: (value: any) => cb(value)
    })
    return () => {
      this.error$.complete()
      this.error$ = null as any
    }
  }

  getDeviceItem(list: any[], queryDevice: {type: string, value: string, targetField: string}) {
    const type = `${queryDevice.type}`
    const targetField = `${queryDevice.targetField}`
    const _defaultValue = targetField === 'label' ? 'default' : ''
    const defaultValue = isEmpty(list) ? _defaultValue : list[0][type]
    const device: any = list.find((it: any) => it[type] === queryDevice.value)
    const targetLabelValue = device ? device[targetField] : defaultValue
    return targetLabelValue
  }

  getVideoDeviceLabelBy(deviceId: string) {
    return this.getDeviceItem(this.cameraList, {type: 'deviceId', value: deviceId, targetField: 'label'})
  }

  getAudioDeviceLabelBy(deviceId: string) {
    return this.getDeviceItem(this.microphoneList, {type: 'deviceId', value: deviceId, targetField: 'label'})
  }

  @computed
  get exactCameraId(): string {
    return this.getDeviceItem(this.cameraList, {type: 'label', value: this.cameraLabel, targetField: 'label'})
  }

  @computed
  get exactMicrophoneId(): string {
    return this.getDeviceItem(this.microphoneList, {type: 'label', value: this.microphoneLabel, targetField: 'label'})
  }

  handleDeviceChange (...args: any[]) {
    const prevMediaDevice = GlobalStorage.read("mediaDevice") || {}

    const cameraLabel = this.getDeviceItem(this.cameraList, {type: 'label', value: this.cameraLabel, targetField: 'label'})
    const microphoneLabel = this.getDeviceItem(this.microphoneList, {type: 'label', value: this.microphoneLabel, targetField: 'label'})

    GlobalStorage.save("mediaDevice", {
      ...prevMediaDevice,
      cameraLabel: cameraLabel,
      microphoneLabel: microphoneLabel,
    })
  }

  @observable
  cameraLabel: string = getDeviceLabelFromStorage('cameraLabel');

  @observable
  microphoneLabel: string = getDeviceLabelFromStorage('microphoneLabel');

  @computed
  get cameraId(): string {
    const defaultValue = AgoraMediaDeviceEnum.Default
    const idx = this.cameraList.findIndex((it: any) => it.label === this.cameraLabel)
    if (this.cameraList[idx]) {
      return this.cameraList[idx].deviceId
    }
    return defaultValue
  }

  @computed
  get microphoneId(): string {
    const defaultValue = AgoraMediaDeviceEnum.Default
    const idx = this.microphoneList.findIndex((it: any) => it.label === this.microphoneLabel)
    if (this.microphoneList[idx]) {
      return this.microphoneList[idx].deviceId
    }
    return defaultValue
  }

  @computed
  get speakerId(): string {
    return 'web_default'
  }

  @computed
  get playbackVolume(): number {
    if (this._playbackVolume) {
      return this._playbackVolume
    }
    return this.mediaService.getPlaybackVolume()
  }

  @computed
  get microphoneLevel() {
    return this.totalVolume
  }

  @observable
  _playbackVolume: number = 0

  changePlaybackVolume(volume: number) {
    this.mediaService.changePlaybackVolume(volume)
    this._playbackVolume = volume
  }

  async openTestCamera() {
    try {
      const deviceId = this.getDeviceItem(this.cameraList, {type: 'label', value: this.cameraLabel, targetField: 'deviceId'})
      await this.mediaService.openTestCamera({
        deviceId,
        encoderConfig: {
          ...this.sceneStore.videoEncoderConfiguration
        }
      })
      this._cameraRenderer = this.mediaService.cameraTestRenderer
      this.cameraLabel = this.mediaService.getTestCameraLabel()
      this._cameraId = this.cameraId
    } catch(err) {
      const error = GenericErrorWrapper(err)
      this.error$ && this.error$.next({type: 'video', error: true})
      throw error
    }
    // this.sceneStore.deviceInfo.cameraName = this.cameraLabel
  }

  closeTestCamera() {
    this.mediaService.closeTestCamera()
    this.resetCameraTrack()
  }

  async changeTestCamera(deviceId: string) {
    try {
      if (deviceId === AgoraMediaDeviceEnum.Default) {
        await this.mediaService.closeTestCamera()
        this._cameraRenderer = undefined
        this._cameraId = deviceId
        this.cameraLabel = ''
      } else {
        if (this.cameraRenderer) {
          if (this.sceneStore.isElectron) {
            await this.mediaService.changeTestCamera(deviceId)
            this._cameraRenderer = this.mediaService.cameraRenderer
          } else {
            await this.mediaService.changeTestCamera(deviceId)
          }
        } else {
          await this.mediaService.openTestCamera({
            deviceId,
            encoderConfig: {
              ...this.sceneStore.videoEncoderConfiguration
            }
          })
        }
        this.updateTestCameraLabel()
      }
    } catch(err) {
      const error = GenericErrorWrapper(err)
      this.error$ && this.error$.next({type: 'video', error: true})
      throw error
    }
  }
  
  async openTestMicrophone(payload: {enableRecording: boolean}) {
    try {
      const deviceId = this.getDeviceItem(this.microphoneList, {type: 'label', value: this.microphoneLabel, targetField: 'deviceId'})
      await this.mediaService.openTestMicrophone({deviceId})
      if (this.isWeb) {
        this._microphoneTrack = this.web.microphoneTestTrack
      }
      if (this.isElectron) {
        payload.enableRecording && this.mediaService.electron.client.startAudioRecordingDeviceTest(300)
      }
      this.microphoneLabel = this.mediaService.getTestMicrophoneLabel()
      this._microphoneId = this.microphoneId
    } catch(err) {
      const error = GenericErrorWrapper(err)
      this.error$ && this.error$.next({type: 'audio', error: true})
      throw error
    }
  }

  closeTestMicrophone() {
    if (this.isElectron) {
      this.mediaService.electron.client.stopAudioRecordingDeviceTest()
    }
    this.mediaService.closeTestMicrophone()
    this.resetMicrophoneTrack()
  }

  updateCameraLabel(label: string) {
    this.cameraLabel = label
    this._cameraId = this.cameraId
  }

  updateMicrophoneLabel(label: string) {
    this.microphoneLabel = label
    this._microphoneId = this.microphoneId
  }

  updateTestMicrophoneLabel() {
    if (this.isWeb) {
      this._microphoneTrack = this.web.microphoneTestTrack
    }
    this.microphoneLabel = this.mediaService.getTestMicrophoneLabel()
    this._microphoneId = this.microphoneId
  }

  updateTestCameraLabel() {
    this._cameraRenderer = this.mediaService.cameraTestRenderer
    this.cameraLabel = this.mediaService.getTestCameraLabel()
    this._cameraId = this.cameraId
  }

  
  async changeTestMicrophone(deviceId: string) {
    try {
      if (deviceId === AgoraMediaDeviceEnum.Default) {
        await this.mediaService.closeTestMicrophone()
        if (this.isWeb) {
          this._microphoneTrack = undefined
        }
        this._microphoneId = deviceId
        this.microphoneLabel = this.getDeviceItem(this.microphoneList, {type: 'deviceId', value: this._microphoneId, targetField: 'label'})
        return
      } else {
        await this.mediaService.changeTestMicrophone(deviceId)
        this.updateTestMicrophoneLabel()
      }
    } catch(err) {
      const error = GenericErrorWrapper(err)
      this.error$ && this.error$.next({type: 'audio', error: true})
      // PretestStore.errCallback(error, 'audio')
      throw error
    }
  }

  get isNative(): boolean { 
    return !!this.mediaService.isElectron
  }

  async switchCamera(deviceId: string) {
    try {
      if (this.isNative) {
        await this.changeNativeCamera(deviceId)
      } else {
        await this.changeWebCamera(deviceId)
      }
    } catch (err) {
      // this.sceneStore.uiStore.addToast(err)
    }
  }

  async changeWebCamera(deviceId: string) {
    if (this.sceneStore.cameraRenderer) {
      await this.mediaService.changeCamera(deviceId)
      const label = this.mediaService.getCameraLabel()
      this.updateCameraLabel(label)
    } else {
      const sceneStore = this.sceneStore
      const cameraEduStream = sceneStore.cameraEduStream
      if (!cameraEduStream || !!cameraEduStream.hasVideo === false) {
        EduLogger.info("userStream has been muted video")
        const deviceLabel = this.getVideoDeviceLabelBy(deviceId)
        if (deviceLabel) {
          this.updateCameraLabel(deviceLabel)
        }
        return
      }
      await this.mediaService.openCamera({deviceId, encoderConfig: {width: 320, height: 240, frameRate: 15}})
      this.sceneStore._cameraRenderer = this.mediaService.cameraRenderer
      const label = this.mediaService.getCameraLabel()
      this.updateCameraLabel(label)
    }
  }

  async changeWebMicrophone(deviceId: string) {
    if (this.sceneStore._microphoneTrack) {
      await this.mediaService.changeMicrophone(deviceId)
      const label = this.mediaService.getMicrophoneLabel()
      this.updateMicrophoneLabel(label)
    } else {
      const sceneStore = this.sceneStore
      const cameraEduStream = sceneStore.cameraEduStream
      if (!cameraEduStream || !!cameraEduStream.hasAudio === false) {
        EduLogger.info("userStream has been muted audio")
        const deviceLabel = this.getAudioDeviceLabelBy(deviceId)
        if (deviceLabel) {
          this.updateMicrophoneLabel(deviceLabel)
        }
        return
      }
      await this.mediaService.openMicrophone({deviceId})
      this.sceneStore._microphoneTrack = this.mediaService.microphoneTrack
      const label = this.mediaService.getMicrophoneLabel()
      this.updateMicrophoneLabel(label)
    }
  }

  async switchMicrophone(deviceId: string) {
    try {
      if (this.isNative) {
        await this.changeNativeMicrophone(deviceId)
      } else {
        await this.changeWebMicrophone(deviceId)
      }
    } catch (err) {
      // this.sceneStore.uiStore.addToast(err)
    }
  }

  // TODO: need poc implementation
  async switchSpeaker(deviceId: string) {
  }


  /// live room camera operator
  
  async openCamera() {
    const deviceId = this.getDeviceItem(this.cameraList, {type: 'label', value: this.cameraLabel, targetField: 'deviceId'})
    await this.mediaService.openCamera({
      deviceId,
      encoderConfig: {
        ...this.sceneStore.videoEncoderConfiguration
      }
    })
    this._cameraRenderer = this.mediaService.cameraRenderer
    this.cameraLabel = this.mediaService.getCameraLabel()
    this._cameraId = this.cameraId
    // this.sceneStore.deviceInfo.cameraName = this.cameraLabel
  }

  
  closeCamera() {
    this.mediaService.closeCamera()
    this.resetCameraTrack()
  }

  
  async changeCamera(deviceId: string) {
    if (deviceId === AgoraMediaDeviceEnum.Default) {
      await this.mediaService.closeCamera()
      this._cameraRenderer = undefined
      this._cameraId = deviceId
      this.cameraLabel = ''
    } else {
      let sceneCameraRenderer = this.sceneStore._cameraRenderer
      if (sceneCameraRenderer) {
        if (this.sceneStore.isElectron) {
          sceneCameraRenderer.stop()
          await this.mediaService.changeCamera(deviceId)
          sceneCameraRenderer = this.mediaService.cameraRenderer
        } else {
          await this.mediaService.changeCamera(deviceId)
        }
      } else {
        await this.mediaService.openCamera({
          deviceId,
          encoderConfig: {
            ...this.sceneStore.videoEncoderConfiguration
          }
        })
      }
      sceneCameraRenderer = this.mediaService.cameraRenderer
      this.cameraLabel = this.mediaService.getCameraLabel()
      this._cameraId = this.cameraId
      // this.sceneStore.deviceInfo.cameraName = this.cameraLabel
    }
  }

  
  async openMicrophone() {
    const deviceId = this.getDeviceItem(this.microphoneList, {type: 'label', value: this.microphoneLabel, targetField: 'deviceId'})
    await this.mediaService.openMicrophone({deviceId})
    if (this.isWeb) {
      this._microphoneTrack = this.web.microphoneTrack
    }
    // if (this.isElectron) {
    //   this.mediaService.electron.client.stopAudioRecordingDeviceTest()
    // }
    this.microphoneLabel = this.mediaService.getMicrophoneLabel()
    // this.sceneStore.deviceInfo.microphoneName = this.microphoneLabel
    this._microphoneId = this.microphoneId
  }

  
  closeMicrophone() {
    this.mediaService.closeTestMicrophone()
    this.resetMicrophoneTrack()
  }

  
  async changeNativeCamera(deviceId: string) {
    EduLogger.info("changeNativeCamera ", deviceId)
    await this.mediaService.changeCamera(deviceId)
    this.cameraLabel = this.mediaService.getTestCameraLabel()
    this._cameraId = this.cameraId
    EduLogger.info("changeNativeCamera#cameraLabel get camera id: ", this.cameraId, " cameraLabel ", this.cameraLabel)
  }

  
  async changeNativeMicrophone(deviceId: string) {
    EduLogger.info("changeNativeMicrophone ", deviceId)
    await this.mediaService.changeMicrophone(deviceId)
    EduLogger.info("changeNativeMicrophone#changeMicrophone ", deviceId)
    this.microphoneLabel = this.mediaService.getTestMicrophoneLabel()
    this._microphoneId = this.microphoneId
    EduLogger.info("changeNativeMicrophone#changeMicrophone _microphoneId: ", this._microphoneId, " microphoneLabel ", this.microphoneLabel)
  }

  
  async changeElectronTestSpeaker(deviceId: string) {
    console.log('device id', deviceId)
  }

  
  async changeTestSpeaker(deviceId: string) {
    if (this.mediaService.isElectron) {
      await this.changeElectronTestSpeaker(deviceId)
      return
    }
  }

  async changeSpeaker(value: any) {
    throw new Error('Method not implemented.');
  }

  async changeTestSpeakerVolume(value: any) {
    throw new Error('Method not implemented.');
  }

  async changeTestMicrophoneVolume(value: any) {
    throw new Error('Method not implemented.');
  }


  async changeSpeakerVolume(value: any) {
    if (this.mediaService.isElectron) {
      this.mediaService.electron.client.adjustPlaybackSignalVolume(value)
    }
  }

  async changeMicrophoneVolume(value: any) {
    if (this.mediaService.isElectron) {
      this.mediaService.electron.client.adjustRecordingSignalVolume(value)
    }
  }

  
  async changeMicrophone(deviceId: string) {
    if (deviceId === AgoraMediaDeviceEnum.Default) {
      await this.mediaService.closeMicrophone()
      if (this.isWeb) {
        this._microphoneTrack = undefined
      }
      this._microphoneId = deviceId
      this.microphoneLabel = deviceId
    } else {
      await this.mediaService.changeMicrophone(deviceId)
      if (this.isWeb) {
        this._microphoneTrack = this.web.microphoneTrack
      }
      this.microphoneLabel = this.mediaService.getMicrophoneLabel()
      this.sceneStore.deviceInfo.microphoneName = this.microphoneLabel
      this._microphoneId = this.microphoneId
    }
  }
  /// live room camera operator

  
  async changeTestResolution(resolution: any) {
    await this.mediaService.changeTestResolution(resolution)
    this.resolution = resolution
  }

  @computed
  get speakerLabel(): string {
    if (this.sceneStore.isElectron) {
      return this.sceneStore.eduManager.mediaService.getSpeakerLabel()
    }
    return '默认'
  }
  
  resetRoomState() {
    this.remoteUsersRenderer = []
    EduLogger.info(`[agora-apaas] [media#renderers] resetRoomState clear remoteUsersRenderer`)
    this.networkQuality = 'unknown'
    this.autoplay = false
    this._delay = 0
  }
}