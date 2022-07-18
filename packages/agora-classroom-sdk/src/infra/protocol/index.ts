import { AgoraWidgetController } from 'agora-edu-core';
import { Injectable } from 'agora-rte-sdk';
import { action, computed, observable } from 'mobx';
import uuid from 'uuid';
import { CabinetItem } from '../stores/common/type';
import { AgoraExtensionRoomEvent, AgoraExtensionWidgetEvent } from './events';
import {
  FcrBoardH5WindowConfig,
  FcrBoardMaterialWindowConfig,
  FcrBoardMediaWindowConfig,
  StreamMediaPlayerOpenParams,
  WebviewOpenParams,
} from './type';

export class Extension {
  private logger!: Injectable.Logger;
  private _controller?: AgoraWidgetController;
  @observable.shallow
  private _registeredCabinetItems: CabinetItem[] = [];

  @computed
  get cabinetItems() {
    return this._registeredCabinetItems;
  }

  install(controller: AgoraWidgetController) {
    this._controller = controller;
    this._controller.addBroadcastListener({
      messageType: AgoraExtensionWidgetEvent.RegisterCabinetTool,
      onMessage: this._handleRegisterCabinetTool,
    });
    this._controller.addBroadcastListener({
      messageType: AgoraExtensionWidgetEvent.UnregisterCabinetTool,
      onMessage: this._handleUnregisterCabinetTool,
    });
  }

  uninstall() {
    this._controller?.removeBroadcastListener({
      messageType: AgoraExtensionWidgetEvent.RegisterCabinetTool,
      onMessage: this._handleRegisterCabinetTool,
    });
    this._controller?.removeBroadcastListener({
      messageType: AgoraExtensionWidgetEvent.UnregisterCabinetTool,
      onMessage: this._handleUnregisterCabinetTool,
    });
  }

  @action.bound
  private _handleRegisterCabinetTool(cabinetItem: CabinetItem) {
    const existed = this._registeredCabinetItems.some(({ id }) => id === cabinetItem.id);
    if (!existed) {
      this._registeredCabinetItems.push(cabinetItem);
    }
  }

  @action.bound
  private _handleUnregisterCabinetTool(id: string) {
    this._registeredCabinetItems = this._registeredCabinetItems.filter((item) => id !== item.id);
  }

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
