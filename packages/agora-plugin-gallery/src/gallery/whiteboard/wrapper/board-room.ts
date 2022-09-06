import { AGEventEmitter, Injectable, Log } from 'agora-rte-sdk';
import {
  WhiteWebSdk,
  Room,
  WhiteWebSdkConfiguration,
  DeviceType,
  LoggerReportMode,
  createPlugins,
  ViewMode,
  RoomPhase,
  RoomState,
} from 'white-web-sdk';
import * as netlessVideoPlugin from '@netless/video-js-plugin';
import { WindowManager } from '@netless/window-manager';
import { FcrBoardMainWindow } from './board-window';
import {
  FcrBoardRoomEventEmitter,
  FcrBoardRegion,
  FcrBoardRoomOptions,
  FcrBoardRoomJoinConfig,
  FcrBoardRoomEvent,
  BoardState,
} from './type';
import { BoardConnectionState, FcrBoardShape, FcrBoardTool } from '@/infra/protocol/type';
import { convertToFcrBoardToolShape, hexColorToWhiteboardColor, textColors } from './helper';

@Log.attach({ proxyMethods: true })
export class FcrBoardRoom implements FcrBoardRoomEventEmitter {
  private logger!: Injectable.Logger;
  private _client: WhiteWebSdk;
  private _room?: Room;
  private _boardView?: FcrBoardMainWindow;
  private _eventBus: AGEventEmitter = new AGEventEmitter();
  private _connState: BoardConnectionState = BoardConnectionState.Disconnected;

  constructor(
    private _appId: string,
    private _region: FcrBoardRegion,
    private _options: FcrBoardRoomOptions,
  ) {
    const plugins = this._createPlugins();

    const config: WhiteWebSdkConfiguration = {
      useMobXState: true,
      pptParams: {
        useServerWrap: true,
      },
      deviceType: DeviceType.Surface,
      plugins,
      appIdentifier: _appId,
      preloadDynamicPPT: true,
      loggerOptions: {
        reportQualityMode: LoggerReportMode.AlwaysReport,
        reportDebugLogMode: LoggerReportMode.AlwaysReport,
        reportLevelMask: _options.debug ? 'debug' : 'info',
        printLevelMask: _options.debug ? 'debug' : 'info',
      },
    };

    this._client = new WhiteWebSdk(config);
  }

  @Log.silence
  private _createPlugins() {
    const plugins = createPlugins({
      [netlessVideoPlugin.PluginId]: netlessVideoPlugin.videoJsPlugin(),
    });

    plugins.setPluginContext(netlessVideoPlugin.PluginId, { enable: true, verbose: true });
    return plugins;
  }

  async join(config: FcrBoardRoomJoinConfig) {
    if (this._connState !== BoardConnectionState.Disconnected) {
      return;
    }
    const joinParams = {
      region: this._region,
      uuid: config.roomId,
      uid: config.userId,
      roomToken: config.roomToken,
      isWritable: config.hasOperationPrivilege,
      disableDeviceInputs: !config.hasOperationPrivilege,
      disableCameraTransform: true,
      disableNewPencil: false,
      disableEraseImage: false,
      wrappedComponents: [],
      invisiblePlugins: [WindowManager],
      useMultiViews: true,
      disableMagixEventDispatchLimit: true,
      userPayload: {
        userId: config.userId,
        avatar: '',
        cursorName: config.userName,
        disappearCursor: true,
      },
      floatBar: {
        colors: textColors.map((color) => hexColorToWhiteboardColor(color)),
      },
    };

    try {
      this.logger.info('Join board room with params', joinParams);
      const room = await this._client.joinRoom(joinParams, {
        onPhaseChanged: this._handleConnectionStateUpdated,
        onRoomStateChanged: this._handleRoomStateUpdated,
      });

      this._room = room;

      if (config.hasOperationPrivilege) {
        room.setViewMode(ViewMode.Broadcaster);
      } else {
        room.setViewMode(ViewMode.Follower);
      }

      this._boardView = new FcrBoardMainWindow(room, config.hasOperationPrivilege, this._options);

      this._eventBus.emit(FcrBoardRoomEvent.JoinSuccess, this._boardView);
    } catch (e) {
      this._eventBus.emit(FcrBoardRoomEvent.JoinFailure, e);
    }
  }

  async leave() {
    if (this._room) {
      this._room.disconnect();
      this._room = undefined;
    }
  }

  @Log.silence
  private _handleRoomStateUpdated(state: Partial<RoomState>) {
    const { strokeColor, strokeWidth, currentApplianceName, textSize, shapeType } =
      state.memberState || {};

    const localState: Partial<BoardState> = {};

    const [tool, shape] = convertToFcrBoardToolShape(currentApplianceName, shapeType);
    localState.tool = tool as FcrBoardTool;
    localState.shape = shape as FcrBoardShape;

    if (typeof strokeColor !== 'undefined') {
      const [r, g, b] = strokeColor;
      localState.strokeColor = { r, g, b };
    }

    if (typeof strokeWidth !== 'undefined') {
      localState.strokeWidth = strokeWidth;
    }

    if (typeof textSize !== 'undefined') {
      localState.textSize = textSize;
    }

    this._eventBus.emit(FcrBoardRoomEvent.MemberStateChanged, { ...localState });
  }

  @Log.silence
  private _handleConnectionStateUpdated(phase: RoomPhase) {
    if (phase === RoomPhase.Connecting) {
      this._connState = BoardConnectionState.Connecting;
      this._eventBus.emit(
        FcrBoardRoomEvent.ConnectionStateChanged,
        BoardConnectionState.Connecting,
      );
    } else if (phase === RoomPhase.Connected) {
      this._connState = BoardConnectionState.Connected;
      this._eventBus.emit(FcrBoardRoomEvent.ConnectionStateChanged, BoardConnectionState.Connected);
    } else if (phase === RoomPhase.Reconnecting) {
      this._connState = BoardConnectionState.Reconnecting;
      this._eventBus.emit(
        FcrBoardRoomEvent.ConnectionStateChanged,
        BoardConnectionState.Reconnecting,
      );
    } else if (phase === RoomPhase.Disconnected) {
      this._connState = BoardConnectionState.Disconnected;
      this._eventBus.emit(
        FcrBoardRoomEvent.ConnectionStateChanged,
        BoardConnectionState.Disconnected,
      );
    } else if (phase === RoomPhase.Disconnecting) {
      this._connState = BoardConnectionState.Disconnecting;
      this._eventBus.emit(
        FcrBoardRoomEvent.ConnectionStateChanged,
        BoardConnectionState.Disconnecting,
      );
    }
  }

  on(eventName: FcrBoardRoomEvent.JoinSuccess, cb: (mainWindow: FcrBoardMainWindow) => void): void;
  on(eventName: FcrBoardRoomEvent.JoinFailure, cb: (e: Error) => void): void;
  on(
    eventName: FcrBoardRoomEvent.ConnectionStateChanged,
    cb: (state: BoardConnectionState) => void,
  ): void;
  on(eventName: FcrBoardRoomEvent.MemberStateChanged, cb: (state: BoardState) => void): void;

  on(eventName: FcrBoardRoomEvent, cb: CallableFunction): void {
    this._eventBus.on(eventName, cb);
  }

  off(eventName: FcrBoardRoomEvent, cb: CallableFunction): void {
    this._eventBus.off(eventName, cb);
  }
}
