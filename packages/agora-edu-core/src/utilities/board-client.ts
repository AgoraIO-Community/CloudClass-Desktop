import { EventEmitter } from 'events';
import { Room, WhiteWebSdk, DeviceType, createPlugins, Plugins, JoinRoomParams, Player, ReplayRoomParams, ViewMode, RoomState, ApplianceNames, LoggerReportMode } from 'white-web-sdk';
import { videoPlugin2 } from '@netless/white-video-plugin2';
import { audioPlugin2 } from '@netless/white-audio-plugin2';
import { get } from 'lodash';
import { BizLogger } from './biz-logger';
import {IframeBridge, IframeWrapper} from "@netless/iframe-bridge"
import {PluginId, Version, videoJsPlugin} from '@netless/video-js-plugin'

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

  constructor(config: {identity: string, appIdentifier: string, enable: boolean} = {identity: 'guest', appIdentifier: '', enable: false}) {
    super()
    this.appIdentifier = config.appIdentifier
    this.initPlugins(config.identity, config.enable)
    this.init()
  }

  initPlugins (identity: string, enable: boolean) {
    const plugins = createPlugins({
      // "video2": videoPlugin2,
      // "audio2": audioPlugin2,
      [PluginId]: videoJsPlugin()
    });

    // plugins.setPluginContext("video2", {identity});
    // plugins.setPluginContext("audio2", {identity});
    plugins.setPluginContext(PluginId, { enable, verbose: true });
    this.plugins = plugins;
  }
  
  init () {
    this.client = new WhiteWebSdk({
        // 其他参数
      // invisiblePlugins: [IframeBridge],
      // wrappedComponents: [IframeWrapper],
      pptParams: {
        useServerWrap: true
      },
      deviceType: DeviceType.Surface,
      plugins: this.plugins,
      appIdentifier: this.appIdentifier,
      preloadDynamicPPT: true,
      loggerOptions: {
        reportQualityMode: LoggerReportMode.AlwaysReport,
        reportDebugLogMode: LoggerReportMode.AlwaysReport,
        // disableReportLog: true,
        reportLevelMask: "debug",
        printLevelMask: "debug",
      }
    })
    this.disconnected = true
  }

  async join(params: JoinRoomParams, isAssistant?: boolean) {
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
    if (isAssistant) {
      this.room.setMemberState({
        strokeColor: [252, 58, 63],
        currentApplianceName: ApplianceNames.clicker,
        textSize: 24,
      })
    } else {
      this.room.setMemberState({
        strokeColor: [252, 58, 63],
        currentApplianceName: ApplianceNames.clicker,
        textSize: 24,
      })
    }

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
    //@ts-ignore
    // this.room && this.room.dispose()
    if (this.room && !this.disconnected) {
      await this.room.disconnect()
      this.disconnected = true
    }
  }

  get bridge() {
    if (!this.room) return
    return this.room.getInvisiblePlugin(IframeBridge.kind)
  }

}