import { AppStore } from '@/stores/app';
import { debounce } from 'lodash';
import { t } from '@/i18n';
import { observable, action, computed } from 'mobx';
import { LocalUserRenderer } from '@/sdk/education/core/media-service/renderer';
import { BizLogger } from '@/utils/biz-logger';

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

const networkQualities: {[key: string]: string} = {
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

  get mediaService() {
    return this.appStore.mediaService
  }

  @observable
  _delay: number = 0

  @computed
  get delay(): string {
    return `${this._delay}`
  }

  private appStore: AppStore;

  constructor(appStore: any) {
    this.appStore = appStore
    this.mediaService.on('rtcStats', (evt: any) => {
      this.appStore.updateCpuRate(evt.cpuTotalUsage)
    })
    this.mediaService.on('audio-device-changed', debounce(async (info: any) => {
      BizLogger.info("audio device changed")
      this.appStore.uiStore.addToast(t('toast.audio_equipment_has_changed'))
      await this.appStore.deviceStore.init({audio: true})
    }, delay))
    this.mediaService.on('video-device-changed', debounce(async (info: any) => {
      BizLogger.info("video device changed")
      this.appStore.uiStore.addToast(t('toast.video_equipment_has_changed'))
      await this.appStore.deviceStore.init({video: true})
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
      console.log('sdkwrapper update user-pubilshed', evt)
    })
    this.mediaService.on('user-unpublished', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
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
      // BizLogger.info('network-quality', evt, qualityStr)
    })
    this.mediaService.on('connection-state-change', (evt: any) => {
      BizLogger.info('connection-state-change', JSON.stringify(evt))
    })
  }

  @observable
  networkQuality: string = 'unknown'

  @action
  updateNetworkQuality(v: string) {
    this.networkQuality = v
  }

  reset () {
    this.remoteUsersRenderer = []
    this.networkQuality = 'unknown'
    this.autoplay = false
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