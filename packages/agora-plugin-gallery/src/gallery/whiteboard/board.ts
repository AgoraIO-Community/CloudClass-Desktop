import { EventEmitter } from 'events';
import { get } from 'lodash';
import type {WhiteWebSdk, Plugins, Room, Player, JoinRoomParams, RoomState, ReplayRoomParams, ViewMode} from 'white-web-sdk'

const BizLogger = {
  info: console.info
}

export interface SceneFile {
  name: string
  type: string
}

export type SceneOption = {
  name?: string
  type?: string
  currentScene: boolean
}
export class BoardClient extends EventEmitter {
  client!: WhiteWebSdk;
  plugins?: Plugins<Object>;
  room!: Room;
  player!: Player;

  sceneIndex: number = 0;

  disconnected?: boolean = true

  private appIdentifier!: string
  private whiteboardDependencies: any

  constructor(config: {identity: string, appIdentifier: string, dependencies:Map<string, any>} = {identity: 'guest', appIdentifier: '', dependencies: new Map<string, any>()}) {
    super()
    this.appIdentifier = config.appIdentifier
    this.whiteboardDependencies = config.dependencies.get('white-web-sdk')
    const whiteVideoPlugin = config.dependencies.get('@netless/white-video-plugin') || {}
    const {videoPlugin} = whiteVideoPlugin
    const whiteAudioPlugin = config.dependencies.get('@netless/white-audio-plugin') || {}
    const {audioPlugin} = whiteAudioPlugin
    this.initPlugins(config.identity, videoPlugin, audioPlugin)
    this.init()
  }

  initPlugins (identity: string, videoPlugin: any, audioPlugin: any) {
    const {createPlugins} = this.whiteboardDependencies
    const plugins = createPlugins({"video": videoPlugin, "audio": audioPlugin});

    plugins.setPluginContext("video", {identity});
    plugins.setPluginContext("audio", {identity});
    this.plugins = plugins;
  }
  
  init () {
    const {WhiteWebSdk, DeviceType} = this.whiteboardDependencies
    this.client = new WhiteWebSdk({
      deviceType: DeviceType.Surface,
      plugins: this.plugins,
      appIdentifier: this.appIdentifier,
      pptParams: {
        useServerWrap: true
      },
      loggerOptions: {
        // reportQualityMode: "alwaysReport",
        // reportDebugLogMode: "alwaysReport",
        // disableReportLog: true,
        reportLevelMask: "debug",
        printLevelMask: "debug",
      }
    })
    this.disconnected = true
  }

  async join(params: JoinRoomParams) {
    const {ApplianceNames} = this.whiteboardDependencies
    BizLogger.info('[breakout board] before board client join', params)
    this.room = await this.client.joinRoom(params, {
      onPhaseChanged: phase => {
        this.emit('onPhaseChanged', phase);
      },
      onRoomStateChanged: (state: Partial<RoomState>) => {
        this.emit('onRoomStateChanged', state)
      },
      onDisconnectWithError: error => {
        this.emit('onDisconnectWithError', error)
      },
      onKickedWithReason: reason => {
        this.emit('onKickedWithReason', reason)
      },
      onKeyDown: event => {
        this.emit('onKeyDown', event)
      },
      onKeyUp: event => {
        this.emit('onKeyUp', event)
      },
      onHandToolActive: active => {
        this.emit('onHandToolActive', active)
      },
      onPPTLoadProgress: (uuid: string, progress: number) => {
        this.emit('onPPTLoadProgress', {uuid, progress})
      },
    })
    this.room.setMemberState({
      strokeColor: [252, 58, 63],
      currentApplianceName: ApplianceNames.selector,
      textSize: 24,
    })

    BizLogger.info('[breakout board] board client join')
    this.disconnected = false
  }

  async replay(params: ReplayRoomParams) {
    this.player = await this.client.replayRoom(params, {
      onPhaseChanged: phase => {
        this.emit('onPhaseChanged', phase)
      },
      onLoadFirstFrame: () => {
        BizLogger.info('onLoadFirstFrame')
        this.emit('onLoadFirstFrame')
      },
      onSliceChanged: () => {
        BizLogger.info('onSliceChanged')
        this.emit('onSliceChanged')
      },
      onPlayerStateChanged: (error) => {
        this.emit('onPlayerStateChanged', error)
      },
      onStoppedWithError: (error) => {
        this.emit('onStoppedWithError', error)
      },
      onProgressTimeChanged: (scheduleTime) => {
        this.emit('onProgressTimeChanged', scheduleTime)
      }
    })
  }

  followMode(mode: ViewMode) {
    if (this.room && !this.disconnected) {
      this.room.setViewMode(mode)
    }
  }

  startFollow() {
    if (this.room && !this.disconnected) {
      this.room.setGlobalState({
        follow: true
      })
      BizLogger.info('[board] set start follow')
    }
  }

  cancelFollow() {
    if (this.room && !this.disconnected) {
      this.room.setGlobalState({
        follow: false
      })
      BizLogger.info('[board] set cancel follow')
    }
  }

  grantPermission(userUuid: string) {
    if (this.room && !this.disconnected) {
      const grantUsers = get(this.room.state.globalState, 'grantUsers', [])
      if (!grantUsers.find((it: string) => it === userUuid)) {
        grantUsers.push(userUuid)
        this.room.setGlobalState({
          grantUsers: grantUsers
        })
        BizLogger.info('[board] grantUsers ', JSON.stringify(grantUsers))
      }
    }
  }

  revokePermission(userUuid: string) {
    if (this.room && !this.disconnected) {
      const grantUsers = get(this.room.state.globalState, 'grantUsers', [])
      let newIds = grantUsers.filter((uid: string) => uid !== userUuid)
      this.room.setGlobalState({
        grantUsers: newIds
      })
      BizLogger.info('[board] grantUsers ', JSON.stringify(grantUsers))
    }
  }

  async destroy() {
    if (this.room && !this.disconnected) {
      await this.room.disconnect()
      this.disconnected = true
    }
  }

}