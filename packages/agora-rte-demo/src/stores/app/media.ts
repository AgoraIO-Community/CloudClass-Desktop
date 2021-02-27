import uuidv4 from 'uuid/v4';
import { AppStore } from '@/stores/app';
import { debounce, uniq } from 'lodash';
import { t } from '@/i18n';
import { observable, action, computed } from 'mobx';
import { LocalUserRenderer,EduRoleTypeEnum } from 'agora-rte-sdk';
import { BizLogger } from '@/utils/biz-logger';
import { dialogManager } from 'agora-aclass-ui-kit';

const delay = 2000


const networkQualityLevel = [
  'unknown',
  'excellent',
  'good',
  'poor',
  'bad',
  'very bad',
  'down',
]

const networkQualities: { [key: string]: string } = {
  'excellent': 'network-good',
  'good': 'network-good',
  'poor': 'network-normal',
  'bad': 'network-normal',
  'very bad': 'network-bad',
  'down': 'network-bad',
  'unknown': 'network-bad',
}

export class MediaStore {

  @observable
  autoplay: boolean = false;

  @observable
  remoteUsersRenderer: any[] = []

  @observable
  signalStatus: any[] = []

  get mediaService() {
    return this.appStore.mediaService
  }

  @observable
  _delay: number = 0

  @computed
  get delay(): string {
    return `${this._delay}`
  }

  @action
  updateSignalStatusWithRemoteUser(mixSignalStatus: any[]) {
    this.signalStatus = mixSignalStatus
  }
  private userSignalStatus(mixSignalStatus: any[]) {
    const signalStatus: any[] = []
    this.appStore.sceneStore.streamList.forEach((user) => {
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
  private appStore: AppStore;

  id: string = uuidv4()

  constructor(appStore: AppStore) {
    console.log("[ID] mediaStore ### ", this.id)
    this.appStore = appStore
    this.mediaService.on('rtcStats', (evt: any) => {
      this.appStore.updateCpuRate(evt.cpuTotalUsage)
    })
    this.mediaService.on('track-ended', (evt: any) => {
      if (evt.tag === 'cameraTestRenderer' && this.appStore.pretestStore.cameraRenderer) {
        this.appStore.pretestStore.cameraRenderer.stop()
        this.appStore.pretestStore.resetCameraTrack()
      }
      if (evt.tag === 'cameraRenderer' && this.appStore.sceneStore.cameraRenderer) {
        this.appStore.sceneStore.cameraRenderer.stop()
        this.appStore.sceneStore.resetCameraTrack()
      }

      if (evt.tag === 'microphoneTestTrack' && this.appStore.pretestStore.cameraRenderer) {
        this.appStore.pretestStore.resetMicrophoneTrack()
      }
      if (evt.tag === 'microphoneTrack' && this.appStore.sceneStore._microphoneTrack!) {
        this.appStore.sceneStore.resetMicrophoneTrack()
      }
      BizLogger.info("track-ended", evt)
    })
    this.mediaService.on('audio-device-changed', debounce(async (info: any) => {
      BizLogger.info("audio device changed")
      appStore.isNotInvisible && this.appStore.uiStore.addToast(t('toast.audio_equipment_has_changed'))
      appStore.isNotInvisible && dialogManager.show({
        title: t('aclass.device.audio_failed'),
        text: t('aclass.device.audio_failed'),
        showConfirm: true,
        showCancel: true,
        confirmText: t('aclass.device.reload'),
        visible: true,
        cancelText: t('aclass.device.cancel'),
        onConfirm: () => {
          window.location.reload()
        },
        onCancel: () => {
        }
      })
      await this.appStore.pretestStore.init({ audio: true})
      // await this.appStore.deviceStore.init({ audio: true })
    }, delay))
    this.mediaService.on('video-device-changed', debounce(async (info: any) => {
      BizLogger.info("video device changed")
      appStore.isNotInvisible &&  dialogManager.show({
        title: t('aclass.device.video_failed'),
        text: t('aclass.device.video_failed'),
        showConfirm: true,
        showCancel: true,
        confirmText: t('aclass.device.reload'),
        visible: true,
        cancelText: t('aclass.device.cancel'),
        onConfirm: () => {
          window.location.reload()
        },
        onCancel: () => {
        }
      })
      this.appStore.uiStore.addToast(t('toast.video_equipment_has_changed'))
      // await this.appStore.deviceStore.init({ video: true })
      await this.appStore.pretestStore.init({ video: true})
    }, delay))
    this.mediaService.on('audio-autoplay-failed', () => {
      if (!this.autoplay) {
        this.autoplay = true
        this.appStore.uiStore.showAutoplayNotification()
      }
    })
    this.mediaService.on('watch-rtt', (evt: any) => {
      // console.log(`media-service: ${this.mediaService._id}`)
      this._delay = evt.RTT
    })
    this.mediaService.on('user-published', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
      const uid = evt.user.uid
      this.rendererOutputFrameRate[`${uid}`] = 1
      console.log('sdkwrapper update user-pubilshed', evt)
    })
    this.mediaService.on('user-unpublished', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
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
      // BizLogger.info('[web] network-quality value', value, qualityStr)
      // if (downlinkNetworkQuality <= uplinkNetworkQuality) {
      //   qualityStr = networkQualityLevel[downlinkNetworkQuality]
      // } else {
      //   qualityStr = networkQualityLevel[uplinkNetworkQuality]
      // }
      this.updateNetworkQuality(qualityStr || defaultQuality)
      const { remotePacketLoss: { audioStats, videoStats } } = evt;
      const mixSignalStatus = this.remoteMaxPacketLoss(audioStats, videoStats);
      this.updateSignalStatusWithRemoteUser(this.userSignalStatus(mixSignalStatus))
    })
    this.mediaService.on('connection-state-change', (evt: any) => {
      BizLogger.info('connection-state-change', JSON.stringify(evt))
    })
    this.mediaService.on('localVideoStateChanged', (evt: any) => {
      BizLogger.info(' ###localVideoStateChanged### ', JSON.stringify(evt))
    })
    this.mediaService.on('local-audio-volume', (evt: any) => {
      const {totalVolume} = evt
      if (this.appStore.uiStore.isElectron) {
        this.totalVolume = Number((totalVolume / 255).toFixed(3))
      } else {
        this.totalVolume = totalVolume;
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
      BizLogger.info("remoteVideoStats", " encoderOutputFrameRate " , evt.stats.encoderOutputFrameRate, " renderOutput " , JSON.stringify(this.rendererOutputFrameRate))
    })
    this.mediaService.on('remoteVideoStats', (evt: any) => {
      if (this.rendererOutputFrameRate.hasOwnProperty(evt.user.uid)) {
        this.rendererOutputFrameRate[`${evt.user.uid}`] = evt.stats.decoderOutputFrameRate
        BizLogger.info("remoteVideoStats", " decodeOutputFrameRate " , evt.stats.decoderOutputFrameRate, " renderOutput " , JSON.stringify(this.rendererOutputFrameRate))
      }
    })
  }

  @observable
  totalVolume: number = 0
  
  @observable
  speakers: Record<number, number> = {}

  @observable
  rendererOutputFrameRate: Record<number, number> = {}

  @observable
  networkQuality: string = 'unknown'

  @action
  updateNetworkQuality(v: string) {
    this.networkQuality = v
  }

  reset() {
    this.remoteUsersRenderer = []
    this.networkQuality = 'unknown'
    this.autoplay = false
    this.totalVolume = 0
    this.speakers = {}
    this.rendererOutputFrameRate = {}
  }

  @observable
  _microphoneTrack?: any = undefined;

  @observable
  _cameraRenderer?: LocalUserRenderer = undefined;

  @observable
  _screenVideoRenderer?: LocalUserRenderer = undefined;

  @computed
  get cameraRenderer(): LocalUserRenderer | undefined {
    return this._cameraRenderer;
  }
  @computed
  get screenVideoRenderer(): LocalUserRenderer | undefined {
    return this._screenVideoRenderer;
  }

  @action
  async openCamera() {

  }

  @action
  async startWebSharing() {

  }

  @action
  async stopWebSharing() {

  }

  @action
  async stopNativeSharing() {

  }

  @action
  async showScreenShareWindowWithItems() {

  }

  @action
  async prepareScreenShare() {

  }


  @action
  resetRoomState() {
    this.remoteUsersRenderer = []
    this.networkQuality = 'unknown'
    this.autoplay = false
    this._delay = 0
  }
}