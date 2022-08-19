import { BoardConnectionState, BoardMountState } from '@/infra/protocol/type';
import {
  AgoraExtensionRoomEvent,
  AgoraExtensionWidgetEvent,
  AgoraWidgetBase,
  AgoraWidgetLifecycle,
} from 'agora-classroom-sdk';
import { AgoraWidgetController, EduRoleTypeEnum } from 'agora-edu-core';
import { bound, Injectable, Log } from 'agora-rte-sdk';
import dayjs from 'dayjs';
import ReactDOM from 'react-dom';
import { transI18n } from '~ui-kit';
import { App } from './app';
import { FcrBoardFactory } from './factory';
import { FcrBoardRoom } from './wrapper/board-room';
import { FcrBoardMainWindow } from './wrapper/board-window';
import {
  FcrBoardMainWindowEvent,
  FcrBoardMainWindowFailureReason,
  FcrBoardRegion,
  FcrBoardRoomEvent,
  FcrBoardRoomJoinConfig,
} from './wrapper/type';
import { downloadCanvasImage } from './wrapper/utils';
import { reaction, IReactionDisposer } from 'mobx';

@Log.attach({ proxyMethods: false })
export class FcrBoardWidget extends AgoraWidgetBase implements AgoraWidgetLifecycle {
  private static _installationDisposer?: CallableFunction;
  private logger!: Injectable.Logger;
  private _boardRoom?: FcrBoardRoom;
  private _boardMainWindow?: FcrBoardMainWindow;
  private _outerDom?: HTMLElement;
  private _boardDom?: HTMLDivElement | null;
  private _collectorDom?: HTMLDivElement | null;
  private _listenerDisposer?: CallableFunction;
  private _initialized = false;
  private _mounted = false;
  private _isInitialUser = false;
  private _initArgs?: {
    appId: string;
    region: FcrBoardRegion;
  };
  private _grantedUsers = new Set<string>();
  private _disposers: IReactionDisposer[] = [];

  get widgetName() {
    return 'netlessBoard';
  }

  set collectorDom(dom: HTMLDivElement | null) {
    this._collectorDom = dom;
  }

  set boardDom(dom: HTMLDivElement | null) {
    this._boardDom = dom;
  }

  locate() {
    const dom = document.querySelector('.widget-slot-board');
    if (dom) {
      return dom as HTMLElement;
    }
    this.logger.info('Cannot find a proper DOM to render the FCR board widget');
  }

  render(dom: HTMLElement) {
    dom.classList.add('netless-whiteboard-wrapper');
    this._outerDom = dom;
    ReactDOM.render(<App widget={this} />, dom);
  }

  unload() {
    if (this._outerDom) {
      ReactDOM.unmountComponentAtNode(this._outerDom);
      this._outerDom = undefined;
    }
  }

  onInstall(controller: AgoraWidgetController): void {
    const handleOpen = (toggle: boolean) => {
      const widgetId = this.widgetId;
      if (toggle) {
        // 打开远端
        controller.setWidegtActive(widgetId);
        // 打开本地
        controller.broadcast(AgoraExtensionWidgetEvent.WidgetBecomeActive, {
          widgetId,
        });
      } else {
        // 关闭远端
        controller.setWidgetInactive(widgetId);
        // 关闭本地
        controller.broadcast(AgoraExtensionWidgetEvent.WidgetBecomeInactive, {
          widgetId,
        });
      }
    };

    controller.addBroadcastListener({
      messageType: AgoraExtensionRoomEvent.ToggleBoard,
      onMessage: handleOpen,
    });

    FcrBoardWidget._installationDisposer = () => {
      controller.removeBroadcastListener({
        messageType: AgoraExtensionRoomEvent.ToggleBoard,
        onMessage: handleOpen,
      });
    };
  }

  /**
   * 组件创建
   */
  onCreate(props: any, userProps: any) {
    this._isInitialUser = userProps.initial;
    const boardEvents = Object.values(AgoraExtensionRoomEvent).filter((key) =>
      key.startsWith('board-'),
    );

    const disposers = boardEvents.map((key) => {
      const listener = {
        messageType: key,
        onMessage: this._extractMessage(key as AgoraExtensionRoomEvent),
      };

      this.addBroadcastListener(listener);

      return () => {
        this.removeBroadcastListener(listener);
      };
    });

    this._listenerDisposer = () => {
      disposers.forEach((d) => d());
    };

    // 处理
    this._checkBoard(props);
    // 处理授权列表变更
    this._checkPrivilege(props);
    // 处理讲台隐藏/显示，重新计算白板宽高比
    this._disposers.push(reaction(() => !!(this.classroomStore.roomStore.flexProps?.stage ?? true), () => {
      const { _boardDom } = this;
      if (_boardDom) {
        setTimeout(() => {
          const aspectRatio = _boardDom.clientHeight / _boardDom.clientWidth

          this._boardMainWindow?.setAspectRatio(aspectRatio);
        });
      }
    }));
  }

  /**
   * 组件销毁
   */
  onDestroy() {
    this._leave();

    if (this._listenerDisposer) {
      this._listenerDisposer();
    }
    this._disposers.forEach(d => d());
    this._disposers = [];
  }

  private _checkBoard(props: any) {
    const { boardAppId, boardId, boardRegion, boardToken } = props.extra || {};

    if (!this._initialized && boardAppId && boardId && boardRegion && boardToken) {
      const { userUuid: userId, userName } = this.classroomConfig.sessionInfo;

      this._initArgs = {
        appId: boardAppId,
        region: boardRegion,
      };

      this._join({
        roomId: boardId,
        roomToken: boardToken,
        userId,
        userName,
        hasOperationPrivilege: this.hasPrivilege,
      });

      this._initialized = true;
    }
  }

  private _extractMessage(event: AgoraExtensionRoomEvent) {
    return (args: unknown[]) => this._handleMessage({ command: event, args });
  }

  private _handleMessage(message: unknown) {
    const { command, args = [] } = message as {
      command: AgoraExtensionRoomEvent;
      args: unknown[];
    };

    if (!command) {
      this.logger.warn('No command specified');
      return;
    }

    const mainWindow = this._boardMainWindow;

    let cmdMapping: Record<string, CallableFunction> = {
      [AgoraExtensionRoomEvent.BoardGrantPrivilege]: this._grantPrivilege,
    };
    // these commands can only be executed after main window created
    if (mainWindow) {
      cmdMapping = Object.assign(cmdMapping, {
        [AgoraExtensionRoomEvent.BoardSelectTool]: mainWindow.selectTool,
        [AgoraExtensionRoomEvent.BoardAddPage]: mainWindow.addPage,
        [AgoraExtensionRoomEvent.BoardRemovePage]: mainWindow.removePage,
        [AgoraExtensionRoomEvent.BoardDrawShape]: mainWindow.drawShape,
        [AgoraExtensionRoomEvent.BoardClean]: mainWindow.clean,
        [AgoraExtensionRoomEvent.BoardGotoPage]: mainWindow.setPageIndex,
        [AgoraExtensionRoomEvent.BoardPutImageResource]: mainWindow.putImageResource,
        [AgoraExtensionRoomEvent.BoardPutImageResourceIntoWindow]:
          mainWindow.putImageResourceIntoWindow,
        [AgoraExtensionRoomEvent.BoardOpenMaterialResourceWindow]:
          mainWindow.createMaterialResourceWindow,
        [AgoraExtensionRoomEvent.BoardOpenMediaResourceWindow]:
          mainWindow.createMediaResourceWindow,
        [AgoraExtensionRoomEvent.BoardRedo]: mainWindow.redo,
        [AgoraExtensionRoomEvent.BoardUndo]: mainWindow.undo,
        [AgoraExtensionRoomEvent.BoardChangeStrokeWidth]: mainWindow.changeStrokeWidth,
        [AgoraExtensionRoomEvent.BoardChangeStrokeColor]: mainWindow.changeStrokeColor,
        [AgoraExtensionRoomEvent.BoardSaveAttributes]: this._saveAttributes,
        [AgoraExtensionRoomEvent.BoardLoadAttributes]: this._loadAttributes,
        [AgoraExtensionRoomEvent.BoardGetSnapshotImageList]: mainWindow.getSnapshotImage,
        [AgoraExtensionRoomEvent.BoardSetDelay]: mainWindow.setTimeDelay,
        [AgoraExtensionRoomEvent.BoardOpenH5ResourceWindow]: mainWindow.createH5Window
      });
    }

    if (cmdMapping[command]) {
      // @ts-ignore
      cmdMapping[command](...args);
    } else {
      this.logger.warn(
        'Cannot execute [',
        command,
        '] command whether the command is not supported or the main window is not created!',
      );
    }
  }

  mount() {
    const { _boardMainWindow, _boardDom } = this;

    if (_boardDom && _boardMainWindow) {
      this._mounted = true;
      const aspectRatio = _boardDom.clientHeight / _boardDom.clientWidth
      _boardMainWindow.mount(_boardDom, {
        containerSizeRatio: aspectRatio,
        collectorContainer: this._collectorDom ?? undefined,
      });
    }
  }

  unmount() {
    if (this._mounted && this._boardMainWindow) {
      this._boardMainWindow.destroy();
      this._boardMainWindow = undefined;
    }
    this._mounted = false;
  }

  @bound
  private _grantPrivilege(userUuid: string, granted: boolean) {
    if (granted) {
      this.updateWidgetProperties({
        extra: {
          [`grantedUsers.${userUuid}`]: true,
        },
      });
    } else {
      this.removeWidgetExtraProperties([`grantedUsers.${userUuid}`]);
    }
  }

  @bound
  private async _saveAttributes() {
    const mainWindow = this._boardMainWindow;
    const { sessionInfo } = this.classroomConfig;
    if (mainWindow) {
      const attr = mainWindow.getAttributes();
      await this.classroomStore.api.setWindowManagerAttributes(sessionInfo.roomUuid, attr);
    }
  }

  @bound
  private async _loadAttributes() {
    if (!this._isInitialUser) {
      return;
    }
    const mainWindow = this._boardMainWindow;
    const { sessionInfo } = this.classroomConfig;
    if (mainWindow) {
      const attributes = await this.classroomStore.api.getWindowManagerAttributes(sessionInfo.roomUuid);

      mainWindow.setAttributes(attributes);
    }
  }

  private _join(config: FcrBoardRoomJoinConfig) {
    const { roomId, roomToken, userId, userName, hasOperationPrivilege } = config;

    this.logger.info('create board client with config', config);

    this._boardRoom = FcrBoardFactory.createBoardRoom({
      appId: this._initArgs?.appId!,
      region: this._initArgs?.region!,
    });

    const joinConfig = {
      roomId,
      roomToken,
      userId,
      userName,
      hasOperationPrivilege,
    }

    const boardRoom = this._boardRoom;

    boardRoom.on(FcrBoardRoomEvent.JoinSuccess, (mainWindow) => {
      this.logger.info('Fcr board join success');
      mainWindow.updateOperationPrivilege(this.hasPrivilege);
      this._deliverWindowEvents(mainWindow);
      this.unmount();
      this._boardMainWindow = mainWindow;
      this.mount();
    });

    boardRoom.on(FcrBoardRoomEvent.JoinFailure, (e) => {
      this.logger.error('Fcr board join failure', e);
    });

    boardRoom.on(FcrBoardRoomEvent.ConnectionStateChanged, (state) => {
      this.logger.info('Fcr board connection state changed to', state);
      // this.broadcast(FcrBoardRoomEvent.ConnectionStateChanged, state);
      if (state === BoardConnectionState.Disconnected) {
        this.logger.info('Fcr board start reconnecting');
        boardRoom.join(joinConfig);
      }
      if (state === BoardConnectionState.Connected) {
        if (this._boardMainWindow) {
          this._boardMainWindow.emitPageInfo();
        }
      }
      this.broadcast(AgoraExtensionWidgetEvent.BoardConnStateChanged, state);
    });

    boardRoom.on(FcrBoardRoomEvent.MemberStateChanged, (state) => {
      this.logger.info('Fcr board member state changed to', state);
      // this.broadcast(FcrBoardRoomEvent.ConnectionStateChanged, state);
      this.broadcast(AgoraExtensionWidgetEvent.BoardMemberStateChanged, state);
    });

    boardRoom.join(joinConfig);
  }

  private _leave() {
    if (this._boardRoom) {
      this._boardRoom.leave();
      this._boardRoom = undefined;
    }
  }

  private _deliverWindowEvents(mainWindow: FcrBoardMainWindow) {
    mainWindow.on(FcrBoardMainWindowEvent.MountSuccess, () => {
      if (this._boardMainWindow) {
        this._boardMainWindow.emitPageInfo();
      }
      this.broadcast(AgoraExtensionWidgetEvent.BoardMountStateChanged, BoardMountState.Mounted);
    });
    mainWindow.on(FcrBoardMainWindowEvent.Unmount, () => {
      this.broadcast(AgoraExtensionWidgetEvent.BoardMountStateChanged, BoardMountState.NotMounted);
    });
    mainWindow.on(FcrBoardMainWindowEvent.PageInfoUpdated, (info) => {
      this.broadcast(AgoraExtensionWidgetEvent.BoardPageInfoChanged, info);
    });
    mainWindow.on(FcrBoardMainWindowEvent.RedoStepsUpdated, (steps) => {
      this.broadcast(AgoraExtensionWidgetEvent.BoardRedoStepsChanged, steps);
    });
    mainWindow.on(FcrBoardMainWindowEvent.UndoStepsUpdated, (steps) => {
      this.broadcast(AgoraExtensionWidgetEvent.BoardUndoStepsChanged, steps);
    });
    mainWindow.on(FcrBoardMainWindowEvent.SnapshotSuccess, (canvas: HTMLCanvasElement) => {
      const fileName = `${this.classroomConfig.sessionInfo.roomName}_${dayjs().format(
        'YYYYMMDD_HHmmSSS',
      )}.jpg`;

      downloadCanvasImage(canvas, fileName);
      this.shareUIStore.addToast(transI18n('toast2.save_success'));
    });
    mainWindow.on(FcrBoardMainWindowEvent.Failure, (reason) => {
      this.logger.error('operation failure, reason: ', reason);
      if (reason === FcrBoardMainWindowFailureReason.ResourceWindowAlreadyOpened) {
        this.shareUIStore.addToast(transI18n('edu_error.600074'), 'error');
      }
      if (reason === FcrBoardMainWindowFailureReason.SnapshotFailure) {
        this.shareUIStore.addToast(transI18n('toast2.save_error'));
      }
    });

  }

  @bound
  handleDragOver(e: unknown) {
    this.broadcast(AgoraExtensionWidgetEvent.BoardDragOver, e);
  }

  @bound
  handleDrop(e: unknown) {
    this.broadcast(AgoraExtensionWidgetEvent.BoardDrop, e);
  }

  private _checkPrivilege(props: any) {
    const { userUuid } = this.classroomConfig.sessionInfo;
    const prev = this._grantedUsers.has(userUuid);
    const keys = Object.keys(props.extra?.grantedUsers || {});
    this._grantedUsers = new Set<string>(keys);
    const grantedUsers = this._grantedUsers;
    const hasPrivilege = this.hasPrivilege;
    if (prev !== hasPrivilege && this._boardMainWindow) {
      this._boardMainWindow.updateOperationPrivilege(hasPrivilege);
    }

    this.broadcast(AgoraExtensionWidgetEvent.BoardGrantedUsersUpdated, grantedUsers);
  }

  get hasPrivilege() {
    const { userUuid, role } = this.classroomConfig.sessionInfo;
    const granted = this._grantedUsers.has(userUuid);
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role) ? true : granted;
  }

  /**
   * 房间属性变更
   * @param props
   */
  onPropertiesUpdate(props: any) {
    // 处理
    this._checkBoard(props);
    // 处理授权列表变更
    this._checkPrivilege(props);
  }
  /**
   * 用户属性变更
   * @param props
   */
  onUserPropertiesUpdate(userProps: any) {
    this._isInitialUser = userProps.initial;
  }

  onUninstall(controller: AgoraWidgetController) {
    if (FcrBoardWidget._installationDisposer) {
      FcrBoardWidget._installationDisposer();
    }
  }
}
