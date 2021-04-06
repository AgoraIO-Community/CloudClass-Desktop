import { t } from '@/i18n';
import { eduSDKApi } from '@/services/edu-sdk-api';
import { AppStore } from '@/stores/app';
import { BizLogger } from '@/utils/biz-logger';
import { dialogManager } from 'agora-aclass-ui-kit';
import { EduLogger, LocalUserRenderer } from 'agora-rte-sdk';
import { debounce, uniq } from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import uuidv4 from 'uuid/v4';

const delay = 2000

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
  localVideoState: LocalVideoStreamState = LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_STOPPED

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

  @computed
  get device(): boolean {
    if (this.rendererOutputFrameRate[`${0}`] > 0) {
      return true
    } else {
      return false
    }
  }

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
        eduSDKApi.reportCameraState({
          roomUuid: this.appStore.roomInfo.roomUuid,
          userUuid: this.appStore.roomInfo.userUuid,
          state: 0
        }).catch((err) => {
          BizLogger.info(`[demo] action in report web device camera state failed, reason: ${err}`)
        })
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
      EduLogger.info(`[agora-apaas] [media#renderers] user-published ${this.mediaService.remoteUsersRenderer.map((e => e.uid))}`)
      const uid = evt.user.uid
      this.rendererOutputFrameRate[`${uid}`] = 0
      this.rendererOutputFreezeCount[`${uid}`] = 0
      this.rendererFirstFrameRendered[`${uid}`] = false
      console.log('sdkwrapper update user-pubilshed', evt)
    })
    this.mediaService.on('user-unpublished', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
      EduLogger.info(`[agora-apaas] [media#renderers] user-unpublished ${this.mediaService.remoteUsersRenderer.map((e => e.uid))}`)
      const uid = evt.user.uid
      delete this.rendererOutputFrameRate[`${uid}`]
      delete this.rendererOutputFreezeCount[`${uid}`]
      delete this.rendererFirstFrameRendered[`${uid}`]
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
      const {state, msg} = evt
      // if ([LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_FAILED,
      //     LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_ENCODING].includes(state)) {
      //   this.localVideoState = state
      // }
      this.localVideoState = state
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
      BizLogger.info("localVideoStats", " encoderOutputFrameRate " , evt.stats.encoderOutputFrameRate, " renderOutput " , JSON.stringify(this.rendererOutputFrameRate))
    })
    this.mediaService.on('remoteVideoStats', (evt: any) => {
      if (this.rendererOutputFrameRate.hasOwnProperty(evt.user.uid)) {
        this.rendererOutputFrameRate[`${evt.user.uid}`] = evt.stats.decoderOutputFrameRate
        if(evt.stats.decoderOutputFrameRate === 0 ){
          this.rendererOutputFreezeCount[`${evt.user.uid}`]++
        } else if(evt.stats.decoderOutputFrameRate > 0) {
          this.rendererOutputFreezeCount[`${evt.user.uid}`] = 0
          this.rendererFirstFrameRendered[`${evt.user.uid}`] = true
        }
        BizLogger.info("remoteVideoStats", " decodeOutputFrameRate " , evt.stats.decoderOutputFrameRate, " renderOutput " , JSON.stringify(this.rendererOutputFrameRate))
      }
    })

    reaction(() => JSON.stringify([
      this.appStore.roomInfo.roomUuid,
      this.appStore.roomInfo.userUuid,
      this.device
    ]), (data: string) => {
      const [roomUuid, userUuid, device] = JSON.parse(data)
      if (roomUuid && userUuid) {
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

  @observable
  totalVolume: number = 0
  
  @observable
  speakers: Record<number, number> = {}

  @observable
  rendererOutputFrameRate: Record<number, number> = {
    0: 0
  }

  @observable
  rendererOutputFreezeCount: Record<number, number> = {}
  
  @observable
  rendererFirstFrameRendered: Record<number, boolean> = {}

  @observable
  networkQuality: string = 'unknown'

  @action
  updateNetworkQuality(v: string) {
    this.networkQuality = v
  }

  reset() {
    this.localVideoState = LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_STOPPED
    this.remoteUsersRenderer = []
    EduLogger.info(`[agora-apaas] [media#renderers] reset clear remoteUsersRenderer`)
    this.networkQuality = 'unknown'
    this.autoplay = false
    this.totalVolume = 0
    this.speakers = {}
    this.rendererOutputFrameRate = {
      0: 0
    }
    this.rendererOutputFreezeCount = {}
    this.rendererFirstFrameRendered = {}
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
    EduLogger.info(`[agora-apaas] [media#renderers] resetRoomState clear remoteUsersRenderer`)
    this.networkQuality = 'unknown'
    this.autoplay = false
    this._delay = 0
  }
}