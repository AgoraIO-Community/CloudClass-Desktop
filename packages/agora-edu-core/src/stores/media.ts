import { BehaviorSubject } from 'rxjs';
import {v4 as uuidv4} from 'uuid';
import { debounce, uniq } from 'lodash';
import { observable, action, computed, reaction, autorun } from 'mobx';
import { LocalUserRenderer, EduLogger } from 'agora-rte-sdk';
import { BizLogger } from '../utilities/biz-logger';
import { eduSDKApi } from '../services/edu-sdk-api';
import { EduScenarioAppStore } from './index';
import { MediaDeviceState } from './constants';

const delay = 2000

type LocalPacketLoss = {
  audioStats: { audioLossRate: number },
  videoStats: { videoLossRate: number }
}

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

// const networkQualityLevel = [
//   'unknown',
//   'excellent',
//   'good',
//   'poor',
//   'bad',
//   'very bad',
//   'down',
// ]

const networkQualityLevel = [
  'unknown',
  'excellent',
  'good',
  'bad',
  'bad',
  'bad',
  'bad',
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
  remoteVideoStats: Map<string, any> = new Map<string, any>()

  @observable
  signalStatus: any[] = []

  get mediaService() {
    return this.appStore.mediaService
  }

  @observable
  cpuUsage: number = 0

  @observable
  localVideoState: LocalVideoStreamState = LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_STOPPED

  @observable
  _delay: number = 0

  @computed
  get delay(): number {
    return +this._delay
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

  @action
  updateNetworkPacketLostRate(localPacketLoss: unknown) {
    this.localPacketLoss = localPacketLoss as LocalPacketLoss
  }

  @computed
  get localPacketLostRate() {
    return Math.max(this.localPacketLoss.audioStats.audioLossRate, this.localPacketLoss.videoStats.videoLossRate)
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
  private appStore: EduScenarioAppStore;

  id: string = uuidv4()

  @computed
  get device(): boolean {
    if (this.localVideoState === LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_FAILED) {
      return false
    }

    if ((this.cameraRenderer?.freezeCount || 0) < 3) {
      return true
    } else {
      return false
    }
  }
  

  get pretestNotice () {
    return this.appStore.pretestNotice$
  }

  // get uiStore() {
  //   return this.appStore.uiStore;
  // }

  constructor(appStore: EduScenarioAppStore) {
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
        }).catch((err: Error) => {
          BizLogger.info(`[demo] action in report web device camera state failed, reason: ${err}`)
        })
      }

      if (evt.tag === 'microphoneTestTrack' && this.appStore.pretestStore.cameraRenderer) {
        this.appStore.pretestStore.resetMicrophoneTrack()
        this.totalVolume = 0
      }
      if (evt.tag === 'microphoneTrack' && this.appStore.sceneStore._microphoneTrack!) {
        this.appStore.sceneStore.resetMicrophoneTrack()
      }
      const handleDevicePulled = (evt: any) => {
        const notice = MediaDeviceState.getNotice(evt.resource)
        if (notice) {
          if (!this.pretestNotice.isStopped) {
            this.pretestNotice.next({
              type: 'error',
              info: notice,
              kind: 'toast',
              id: uuidv4()
            })
          }
          if (!this.appStore.roomStore.toast$.isStopped) {
            this.appStore.roomStore.fireToast(notice)
          }
        }
        switch(evt.resource) {
          case 'video': {
            this.appStore.pretestStore.muteCamera()
            break;
          }
          case 'audio': {
            this.appStore.pretestStore.muteMicrophone()
            break;
          }
        }
      }

      if (evt.operation === 'pulled') {
        handleDevicePulled(evt)
      }
      BizLogger.info("track-ended", evt)
    })
    this.mediaService.on('audio-device-changed', debounce(async (info: any) => {
      BizLogger.info("audio device changed ", info)
      if (appStore.isNotInvisible) {
        this.pretestNotice.next({
          type: 'audio',
          info: 'device_changed',
          id: uuidv4()
        })
        // this.appStore.uiStore.fireToast('toast.audio_equipment_has_changed')
      }
      // const prevLength = this.appStore.pretestStore._microphoneList.length
      await this.appStore.pretestStore.init({ audio: true})
      // const latestLength = this.appStore.pretestStore._microphoneList.length
      // latestLength > prevLength && this.appStore.roomStore.joining && this.uiStore.fireToast('detect_new_device_in_room')
      // await this.appStore.deviceStore.init({ audio: true })
    }, delay))
    this.mediaService.on('video-device-changed', debounce(async (info: any) => {
      BizLogger.info("video device changed ", info)
      if (appStore.isNotInvisible) {
        this.pretestNotice.next({
          type: 'video',
          info: 'device_changed',
          id: uuidv4()
        })
      }
      // const prevLength = this.appStore.pretestStore._cameraList.length
      await this.appStore.pretestStore.init({ video: true})
      // const latestLength = this.appStore.pretestStore._cameraList.length
      // latestLength > prevLength && this.appStore.roomStore.joining && this.uiStore.fireToast('detect_new_device_in_room')
    }, delay))
    this.mediaService.on('audio-autoplay-failed', () => {
      if (!this.autoplay) {
        this.autoplay = true
        this.appStore.roomStore.fireToast('toast.autoplay')
      }
    })
    this.mediaService.on('user-published', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
      EduLogger.info(`[agora-apaas] [media#renderers] user-published ${this.mediaService.remoteUsersRenderer.map((e => e.uid))}`)
      const uid = evt.user.uid
      console.log('sdkwrapper update user-pubilshed', evt)
    })
    this.mediaService.on('user-unpublished', (evt: any) => {
      this.remoteUsersRenderer = this.mediaService.remoteUsersRenderer
      EduLogger.info(`[agora-apaas] [media#renderers] user-unpublished ${this.mediaService.remoteUsersRenderer.map((e => e.uid))}`)
      const uid = evt.user.uid
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
      if (this.appStore.isElectron) {
        this.totalVolume = +Number(((totalVolume / 255) * 100)).toFixed(3)
      } else {
        this.totalVolume = totalVolume * 100;
      }
    })
    this.mediaService.on('volume-indication', (evt: any) => {
      const {speakers, speakerNumber, totalVolume} = evt
      
      autorun(() => {
        speakers.forEach((speaker: any) => {
          this.updateSpeaker(+speaker.uid, speaker.volume)
        })
      })
    })
    this.mediaService.on('localVideoStats', (evt: any) => {
      let {freezeCount} = evt
      BizLogger.info("localVideoStats", " encode fps " , evt.stats.encoderOutputFrameRate, ', freeze: ', freezeCount)
      autorun(() => {
        if(this.cameraRenderer) {
          this.cameraRenderer.freezeCount = freezeCount
        }
      })
    })
    this.mediaService.on('remoteVideoStats', (evt: any) => {
      let {stats = {}, user = {}} = evt
      let {uid} = user
      BizLogger.info(`remoteVideoStats ${uid}, decode fps ${stats.decoderOutputFrameRate}, freezeCount: ${stats.freezeCount}`)
      autorun(() => {
        this.updateRemoteVideoStats(`${uid}`, stats)
      })
    })

    reaction(() => JSON.stringify([
      this.appStore.roomInfo.roomUuid,
      this.appStore.roomInfo.userUuid,
      this.device,
      this.appStore.roomStore.roomJoined,
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

  @observable
  totalVolume: number = 0
  
  @observable
  speakers = new Map<number, number>()

  updateSpeaker(uid: number, value: number) {
    this.speakers.set(+uid, value)
  }

  updateRemoteVideoStats(uid: string, stats: any) {
    this.remoteVideoStats.set(`${uid}`, stats)
  }

  @observable
  networkQuality: string = 'unknown'

  @action
  updateNetworkQuality(v: string) {
    this.networkQuality = v
  }

  reset() {
    this.cpuUsage = 0
    this.localVideoState = LocalVideoStreamState.LOCAL_VIDEO_STREAM_STATE_STOPPED
    this.remoteUsersRenderer = []
    EduLogger.info(`[agora-apaas] [media#renderers] reset clear remoteUsersRenderer`)
    this.networkQuality = 'unknown'
    this.autoplay = false
    this.totalVolume = 0
    this.speakers.clear()
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