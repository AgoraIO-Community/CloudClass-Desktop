import { LocalUserRenderer, MediaService, AgoraWebRtcWrapper, AgoraElectronRTCWrapper, GenericErrorWrapper, EduLogger } from "agora-rte-sdk"
import { isEmpty } from "lodash"
import { observable, action, computed, reaction, runInAction } from "mobx"
import { EduScenarioAppStore } from "."
import { AgoraMediaDeviceEnum } from "../types"
import { getDeviceLabelFromStorage, GlobalStorage } from "../utilities/kit"
import {v4 as uuidv4} from 'uuid'
import { BehaviorSubject } from 'rxjs'

export class PretestStore {
  static resolutions: any[] = [
    {
      name: '480p',
      value: '480p_1',
    },
    {
      name: '720p',
      value: '720p_1',
    },
    {
      name: '1080p',
      value: '1080p_1'
    }
  ]

  @observable
  settingVisible: boolean = false

  @action.bound 
  showSetting() {
    this.settingVisible = true
  }

  @action.bound 
  hideSetting() {
    this.settingVisible = false
  }

  @observable
  activeDeviceItem: string = 'video'

  @action.bound
  setActiveItem(type: string) {
    this.activeDeviceItem = type
  }

  @computed
  get deviceTestSuccess(): boolean {
    if (
      this.cameraTestResult !== 'error' &&
      this.microphoneTestResult !== 'error' &&
      this.speakerTestResult !== 'error'
    ) {
      return true
    }
    return false
  }

  @observable
  cameraTestResult: string = 'error'
  
  @observable
  microphoneTestResult: string = 'error'

  @observable
  speakerTestResult: string = 'error'

  @action.bound
  setCameraTestResult(v: string) {
    this.cameraTestResult = v
  }

  @action.bound
  setMicrophoneTestResult(v: string) {
    this.microphoneTestResult = v
  }

  @action.bound
  setSpeakerTestResult(v: string) {
    this.speakerTestResult = v
  }

  @observable
  resolutionIdx: number = 0

  @observable
  deviceList: any[] = []

  @observable
  cameraLabel: string = getDeviceLabelFromStorage('cameraLabel');

  @observable
  microphoneLabel: string = getDeviceLabelFromStorage('microphoneLabel');
  _totalVolume: any;

  @observable
  _cameraId: string = '';

  @observable
  _microphoneId: string = '';

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

  @observable
  resolution: string = '480p_1'

  @computed
  get playbackVolume(): number {
    if (this._playbackVolume) {
      return this._playbackVolume
    }
    return this.mediaService.getPlaybackVolume()
  }

  @computed
  get microphoneLevel() {
    return this.appStore.mediaStore.totalVolume
  }

  @observable
  _playbackVolume: number = 0

  @action.bound
  changePlaybackVolume(volume: number) {
    this.mediaService.changePlaybackVolume(volume)
    this._playbackVolume = volume
  }

  @observable
  _cameraRenderer?: LocalUserRenderer = undefined;
  @observable
  _microphoneTrack?: any = undefined;
  @observable
  _screenVideoRenderer?: LocalUserRenderer = undefined;

  @computed
  get cameraRenderer(): LocalUserRenderer | undefined {
    return this._cameraRenderer;
  }

  @computed
  get totalVolume(): number {
    return this.appStore.mediaStore.totalVolume
  }

  @computed
  get isCameraOpen () {
    return !!this.appStore.sceneStore.cameraRenderer
  }

  appStore: EduScenarioAppStore;


  id: string = uuidv4()

  error$!: BehaviorSubject<{type: 'video' | 'audio', error: boolean}>

  constructor(appStore: EduScenarioAppStore) {
    console.log("[ID] pretestStore ### ", this.id)
    this.appStore = appStore
    reaction(() => JSON.stringify([this.cameraList, this.microphoneList, this.cameraLabel, this.microphoneLabel, this.speakerLabel]), this.handleDeviceChange.bind(this))
  }

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

  @action.bound
  resetCameraTrack () {
    this._cameraRenderer = undefined
  }

  @action.bound
  resetMicrophoneTrack () {
    this._microphoneTrack = undefined
  }

  @action.bound
  reset() {
    this.resolutionIdx = 0
    this.cameraLabel = getDeviceLabelFromStorage('cameraLabel')
    this.microphoneLabel =  getDeviceLabelFromStorage('microphoneLabel')
    this.web.reset()
    this.resetCameraTrack()
    this.resetMicrophoneTrack()
    this.activeDeviceItem = 'video'
    this.cameraTestResult = 'default'
    this.microphoneTestResult = 'default'
    this.speakerTestResult = 'default'
  }

  @observable
  _cameraList: any[] = []

  @computed
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

  @observable
  _speakerList: any[] = []
  
  @computed
  get speakerList(): any[] {
    // if (this.appStore.uiStore.isElectron) {
    //   return this._speakerList
    // }
    return [{
      label: 'browser default',
      deviceId: 'web_default'
    }]
    // return this._speakerList
  }

  init(option: {video?: boolean, audio?: boolean} = {video: true, audio: true}) {
    if (option.video) {
      this.mediaService.getCameras().then((list: any[]) => {
        runInAction(() => {
          this._cameraList = list
        })
      })
    }
    if (option.audio) {
      this.mediaService.getMicrophones().then((list: any[]) => {
        runInAction(() => {
          this._microphoneList = list
        })
      })
    }
  }

  @observable
  cameraError?: string = ''

  @observable
  microphoneError?: string = ''

  get mediaService(): MediaService {
    return this.appStore.eduManager.mediaService as MediaService;
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

  @action.bound
  async openTestCamera() {
    try {
      const deviceId = this.getDeviceItem(this.cameraList, {type: 'label', value: this.cameraLabel, targetField: 'deviceId'})
      await this.mediaService.openTestCamera({
        deviceId,
        encoderConfig: {
          ...this.appStore.sceneStore.videoEncoderConfiguration
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
    // this.appStore.deviceInfo.cameraName = this.cameraLabel
  }

  @action.bound
  closeTestCamera() {
    this.mediaService.closeTestCamera()
    this.resetCameraTrack()
  }

  @action.bound
  async changeTestCamera(deviceId: string) {
    try {
      if (deviceId === AgoraMediaDeviceEnum.Default) {
        await this.mediaService.closeTestCamera()
        this._cameraRenderer = undefined
        this._cameraId = deviceId
        this.cameraLabel = ''
      } else {
        if (this.cameraRenderer) {
          if (this.appStore.isElectron) {
            await this.mediaService.changeTestCamera(deviceId)
            this._cameraRenderer = this.mediaService.cameraRenderer
          } else {
            await this.mediaService.changeTestCamera(deviceId)
          }
        } else {
          await this.mediaService.openTestCamera({
            deviceId,
            encoderConfig: {
              ...this.appStore.sceneStore.videoEncoderConfiguration
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

  @action.bound
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

  @action.bound
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

  @action.bound
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
      const error = GenericErrorWrapper(err)
      this.appStore.uiStore.fireToast('toast.switch_camera_failed', {reason: error})
    }
  }

  async changeWebCamera(deviceId: string) {
    if (this.appStore.sceneStore.cameraRenderer) {
      await this.mediaService.changeCamera(deviceId)
      const label = this.mediaService.getCameraLabel()
      this.appStore.pretestStore.updateCameraLabel(label)
    } else {
      const sceneStore = this.appStore.sceneStore
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
      this.appStore.sceneStore._cameraRenderer = this.mediaService.cameraRenderer
      const label = this.mediaService.getCameraLabel()
      this.updateCameraLabel(label)
    }
  }

  async changeWebMicrophone(deviceId: string) {
    if (this.appStore.sceneStore._microphoneTrack) {
      await this.mediaService.changeMicrophone(deviceId)
      const label = this.mediaService.getMicrophoneLabel()
      this.updateMicrophoneLabel(label)
    } else {
      const sceneStore = this.appStore.sceneStore
      const cameraEduStream = sceneStore.cameraEduStream
      if (!cameraEduStream || !!cameraEduStream.hasAudio === false) {
        EduLogger.info("userStream has been muted audio")
        const deviceLabel = this.appStore.pretestStore.getAudioDeviceLabelBy(deviceId)
        if (deviceLabel) {
          this.updateMicrophoneLabel(deviceLabel)
        }
        return
      }
      await this.mediaService.openMicrophone({deviceId})
      this.appStore.sceneStore._microphoneTrack = this.mediaService.microphoneTrack
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
      const error = GenericErrorWrapper(err)
      this.appStore.uiStore.fireToast('toast.switch_camera_failed', {reason: error})
    }
  }

  // TODO: need poc implementation
  async switchSpeaker(deviceId: string) {
  }


  /// live room camera operator
  @action.bound
  async openCamera() {
    const deviceId = this.getDeviceItem(this.cameraList, {type: 'label', value: this.cameraLabel, targetField: 'deviceId'})
    await this.mediaService.openCamera({
      deviceId,
      encoderConfig: {
        ...this.appStore.sceneStore.videoEncoderConfiguration
      }
    })
    this._cameraRenderer = this.mediaService.cameraRenderer
    this.cameraLabel = this.mediaService.getCameraLabel()
    this._cameraId = this.cameraId
    // this.appStore.deviceInfo.cameraName = this.cameraLabel
  }

  @action.bound
  closeCamera() {
    this.mediaService.closeCamera()
    this.resetCameraTrack()
  }

  @action.bound
  async changeCamera(deviceId: string) {
    if (deviceId === AgoraMediaDeviceEnum.Default) {
      await this.mediaService.closeCamera()
      this._cameraRenderer = undefined
      this._cameraId = deviceId
      this.cameraLabel = ''
    } else {
      let sceneCameraRenderer = this.appStore.sceneStore._cameraRenderer
      if (sceneCameraRenderer) {
        if (this.appStore.isElectron) {
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
            ...this.appStore.sceneStore.videoEncoderConfiguration
          }
        })
      }
      sceneCameraRenderer = this.mediaService.cameraRenderer
      this.cameraLabel = this.mediaService.getCameraLabel()
      this._cameraId = this.cameraId
      // this.appStore.deviceInfo.cameraName = this.cameraLabel
    }
  }

  @action.bound
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
    // this.appStore.deviceInfo.microphoneName = this.microphoneLabel
    this._microphoneId = this.microphoneId
  }

  @action.bound
  closeMicrophone() {
    this.mediaService.closeTestMicrophone()
    this.resetMicrophoneTrack()
  }

  @action.bound
  async changeNativeCamera(deviceId: string) {
    EduLogger.info("changeNativeCamera ", deviceId)
    await this.mediaService.changeCamera(deviceId)
    this.cameraLabel = this.mediaService.getTestCameraLabel()
    this._cameraId = this.cameraId
    EduLogger.info("changeNativeCamera#cameraLabel get camera id: ", this.cameraId, " cameraLabel ", this.cameraLabel)
  }

  @action.bound
  async changeNativeMicrophone(deviceId: string) {
    EduLogger.info("changeNativeMicrophone ", deviceId)
    await this.mediaService.changeMicrophone(deviceId)
    EduLogger.info("changeNativeMicrophone#changeMicrophone ", deviceId)
    this.microphoneLabel = this.mediaService.getTestMicrophoneLabel()
    this._microphoneId = this.microphoneId
    EduLogger.info("changeNativeMicrophone#changeMicrophone _microphoneId: ", this._microphoneId, " microphoneLabel ", this.microphoneLabel)
  }

  @action.bound
  async changeElectronTestSpeaker(deviceId: string) {
    console.log('device id', deviceId)
  }

  @action.bound
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

  @action.bound
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
      this.appStore.deviceInfo.microphoneName = this.microphoneLabel
      this._microphoneId = this.microphoneId
    }
  }
  /// live room camera operator

  @action.bound
  async changeTestResolution(resolution: any) {
    await this.mediaService.changeTestResolution(resolution)
    runInAction(() => {
      this.resolution = resolution
    })
  }

  @computed
  get speakerLabel(): string {
    if (this.appStore.uiStore.isElectron) {
      return this.appStore.eduManager.mediaService.getSpeakerLabel()
    }
    return '默认'
  }
}