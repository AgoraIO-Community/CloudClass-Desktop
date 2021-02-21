import { ReplayAppStore } from '@/stores/replay-app';
import { EduRecordService } from '../../sdk/record/edu-record-service';
import { BoardClient } from '@/components/netless-board/board-client';
import { observable, action, computed } from "mobx";
import CombinePlayerFactory from '@netless/combine-player';
import { t } from '@/i18n';
import { AnimationMode, PlayerPhase, Room } from 'white-web-sdk';
import { BizLogger } from '@/utils/biz-logger';
export class PlayerStore {

  @observable
  combinePlayer: any

  @observable
  roomUuid: string = ''

  @observable
  boardUuid: string = ''

  @observable
  boardPreparing: boolean = false

  @observable
  statusText: string = ''

  @observable
  startTime: number = 0

  @observable
  endTime: number = 0

  _boardClient?: BoardClient
  _recordService?: EduRecordService

  appStore: ReplayAppStore

  @computed
  get uiStore() {
    return this.appStore.uiStore;
  }

  async destroy() {
    try {
      await this.boardClient.destroy()
      this.boardClient.removeAllListeners()
      this.reset()
    } catch (err) {
      this.boardClient.removeAllListeners()
      this.reset()
    }
  }

  @action
  reset() {
    this.combinePlayer = undefined
    this.roomUuid = ''
    this.boardUuid = ''
    this.boardPreparing = false
    this.statusText = ''
    this.startTime = 0
    this.endTime = 0
    this._boardClient = undefined
    this._recordService = undefined
    this.ready = true
    this.online = false
    this.scale = 1
    this.player = undefined
    this.currentTime = 0
    this.playFailed = false
    this.phase = ''
    this.firstFrame = false
    this.recordStatus = 0
    this.mediaUrl = ''
    this.boardId = ''
    this.boardToken = ''
    this.progress = 0
  }

  get boardClient() {
    return this._boardClient as BoardClient
  }

  get recordService() {
    return this._recordService as EduRecordService
  }

  constructor(appStore: ReplayAppStore) {
    const {
      config,
      replayConfig
    } = appStore.params
    this.appStore = appStore
    this._boardClient = new BoardClient({identity: "host", appIdentifier: config.agoraNetlessAppId})
    this._recordService = new EduRecordService({
      prefix: `${config.sdkDomain}/recording/apps/%app_id`.replace('%app_id', config.agoraAppId),
      sdkDomain: this.appStore.params.config.sdkDomain,
      appId: this.appStore.params.config.agoraAppId,
      rtmToken: this.appStore.params.config.rtmToken,
      rtmUid: this.appStore.params.config.rtmUid,
      roomUuid: '',
    })
    this.mediaUrl = replayConfig.whiteboardUrl
    this.boardId = replayConfig.whiteboardId
    this.boardToken = replayConfig.whiteboardToken
    this.startTime = replayConfig.startTime
    this.endTime = replayConfig.endTime
  }

  @computed
  get duration(): number {
    return Math.abs(this.startTime - this.endTime)
  }

  pptAutoFullScreen() {
    if (this.room && this.online) {
      const room = this.room
      const scene = room.state.sceneState.scenes[room.state.sceneState.index];
      if (scene && scene.ppt) {
          const width = scene.ppt.width;
          const height = scene.ppt.height;
          room.moveCameraToContain({
              originX: - width / 2,
              originY: - height / 2,
              width: width,
              height: height,
              animationMode: AnimationMode.Immediately,
          });
      }
      // TODO: scale ppt to fit
      // room.scalePptToFit("immediately")
      this.scale = this.room.state.zoomScale
    }
  }

  @observable
  ready: boolean = true;

  @observable
  online: boolean = false;

  @observable
  scale: number = 1

  get room(): Room {
    return this.boardClient?.room
  }

  @observable
  player: any = undefined

  @observable
  currentTime: number = 0

  @observable
  playFailed: boolean = false

  @observable
  phase: any = ''

  @observable
  firstFrame: boolean = false


  @observable
  recordStatus: number = 0

  @observable
  mediaUrl: string = ''

  @observable
  boardId: string = ''

  @observable
  boardToken: string = ''

  @observable
  progress: number = 0

  @computed
  get totalTime(): number {
    return Math.abs(this.startTime - this.endTime)
  }

  @action
  setCurrentTime(t: number) {
    this.currentTime = t
  }

  @action
  setReplayFail(v: boolean) {
    this.playFailed = v
  }

  @action
  updatePhaseState(v: any) {
    this.phase = v
  }

  @action
  loadFirstFrame() {
    this.firstFrame = true
    if (this.player) {
      this.player.seekToProgressTime(0)
    }
  }

  @action
  async replay($board: HTMLDivElement, $el: HTMLVideoElement) {
    BizLogger.info("[replay] replayed", $board);
    this.boardClient.on('onCatchErrorWhenRender', error => {
      BizLogger.warn('onCatchErrorWhenRender', error)
    })
    this.boardClient.on('onCatchErrorWhenAppendFrame', error => {
      BizLogger.warn('onCatchErrorWhenAppendFrame', error)
    })
    this.boardClient.on('onPhaseChanged', state => {
      this.updatePhaseState(state)
    })
    this.boardClient.on('onLoadFirstFrame', state => {
      this.loadFirstFrame()
      BizLogger.info('onLoadFirstFrame', state)
    })
    this.boardClient.on('onSliceChanged', () => {
      BizLogger.info('onSliceChanged')
    })
    this.boardClient.on('onPlayerStateChanged', state => {
      BizLogger.info('onPlayerStateChanged', state)
    })
    this.boardClient.on('onStoppedWithError', error => {
      this.uiStore.addToast(t('toast.replay_failed'))
      this.setReplayFail(true)
      BizLogger.warn('onStoppedWithError', JSON.stringify(error))
    })
    this.boardClient.on('onProgressTimeChanged', scheduleTime => {
      this.setCurrentTime(scheduleTime)
    })
    try {
      await this.boardClient.replay({
        beginTimestamp: this.startTime,
        duration: this.duration,
        room: this.boardId,
        // mediaURL: `${cdnPrefix}/${this.mediaUrl}`,
        roomToken: this.boardToken,
      });
      this.player = this.boardClient.player
      this.player.seekToProgressTime(0);
    } catch (err) {
      this.uiStore.addToast(t('toast.replay_failed'))
      throw err
    }

    this.player.bindHtmlElement($board)

    const combinePlayerFactory = new CombinePlayerFactory(this.player, {
      url: `${this.mediaUrl}`,
      videoDOM: $el
    }, true)

    const combinePlayer = combinePlayerFactory.create()
    combinePlayer.setOnStatusChange((status: any, message: any) => {
      console.log("[aclass] [replay] combine player status: ", status, message)
    })
    
    this.combinePlayer = combinePlayer
    this.online = true
    const keydown = (evt: any) => {
      if (evt.code === 'Space') {
        const player = this.player
        if (this.online && player) {
          switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
              player.play();
              break;
            }
            case PlayerPhase.Playing: {
              player.pause();
              break;
            }
            case PlayerPhase.Ended: {
              player.seekToProgressTime(0);
              break;
            }
          }
        }
      }
    }
  }

  pauseCurrentTime() {
    if (this.online && this.player) {
      this.player.pause()
    }
  }

  seekToCurrentTime() {
    const player = this.player
    if (this.online && player) {
      player.seekToProgressTime(this.currentTime);
      player.play();
    }
  }

  @action
  updateProgress(v: number) {
    this.progress = v;
    this.currentTime = v;
  }

  handlePlayerClick() {
    const player = this.player
    if (this.online && player) {
      if (player.phase === PlayerPhase.Playing) {
        player.pause();
        return;
      }
      if (player.phase === PlayerPhase.WaitingFirstFrame || player.phase === PlayerPhase.Pause) {
        player.play();
        return;
      }
  
      if (player.phase === PlayerPhase.Ended) {
        player.seekToProgressTime(0);
        player.play();
        return;
      }
    }
  }
}