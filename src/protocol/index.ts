import { AgoraWidgetController } from 'agora-edu-core';
import { Log, Logger } from 'agora-rte-sdk';
import uuid from 'uuid';
import { AgoraExtensionRoomEvent } from './events';
import {
  FcrBoardH5WindowConfig,
  FcrBoardMaterialWindowConfig,
  FcrBoardMediaWindowConfig,
  OrientationStates,
  StreamMediaPlayerOpenParams,
  WebviewOpenParams,
} from './type';
import { CustomMessageHandsUpState, MobileCallState } from '../uistores/type';

@Log.attach()
export class Extension {
  logger!: Logger;
  private _controller?: AgoraWidgetController;
  install(controller: AgoraWidgetController) {
    this._controller = controller;
  }
  uninstall() {}
  openWebview(params: WebviewOpenParams) {
    this._broadcastMessage(AgoraExtensionRoomEvent.OpenWebview, params);
  }

  openMediaStreamPlayer(params: StreamMediaPlayerOpenParams) {
    this._broadcastMessage(AgoraExtensionRoomEvent.OpenStreamMediaPlayer, params);
  }

  openMaterialResourceWindow(resource: FcrBoardMaterialWindowConfig) {
    this._broadcastMessage(AgoraExtensionRoomEvent.BoardOpenMaterialResourceWindow, [resource]);
  }

  openMediaResourceWindow(resource: FcrBoardMediaWindowConfig) {
    this._broadcastMessage(AgoraExtensionRoomEvent.BoardOpenMediaResourceWindow, [resource]);
  }

  openH5ResourceWindow(resource: FcrBoardH5WindowConfig) {
    this._broadcastMessage(AgoraExtensionRoomEvent.BoardOpenH5ResourceWindow, [resource]);
  }

  updateOrientationStates(param: OrientationStates) {
    this._broadcastMessage(AgoraExtensionRoomEvent.OrientationStatesChanged, param);
  }
  updateMobileLandscapeToolBarVisible(visible: boolean) {
    this._broadcastMessage(AgoraExtensionRoomEvent.MobileLandscapeToolBarVisibleChanged, visible);
  }
  updateMobileCallState(callState: MobileCallState) {
    this._broadcastMessage(AgoraExtensionRoomEvent.MobileCallStateChanged, callState);
  }
  updateRaiseHandState(state: CustomMessageHandsUpState) {
    this._broadcastMessage(AgoraExtensionRoomEvent.RaiseHandStateChanged, state);
  }
  private _broadcastMessage(event: AgoraExtensionRoomEvent, args?: unknown, messageId?: string) {
    if (!messageId) {
      messageId = uuid();
    }

    if (this._controller) {
      this._controller.broadcast(event, args);
    } else {
      this.logger.warn('Widget controller not ready, cannot broadcast message');
    }
  }
}
