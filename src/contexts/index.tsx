import { EduRoomTypeEnum, EduStoreFactory } from 'agora-edu-core';
import React from 'react';
import { EduUIStoreFactory } from './ui-store-factory';

export class EduContext {
  private static _shareContext?: React.Context<any>;
  static get shared(): React.Context<any> {
    if (!this._shareContext) {
      this._shareContext = EduContext.create();
    }
    return this._shareContext;
  }

  static reset() {
    this._shareContext = undefined;
  }

  static create() {
    const UIStore = EduUIStoreFactory.create(
      EduStoreFactory.createWithType(EduRoomTypeEnum.RoomSmallClass),
    );

    return React.createContext({
      UIStore,
    });
  }
}
