import React from 'react';
import { EduRoomTypeEnum, EduStoreFactory, EduRoomSubtypeEnum } from 'agora-edu-core';
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
    const oneToOne = EduStoreFactory.createWithType(EduRoomTypeEnum.Room1v1Class);
    const interactive = EduStoreFactory.createWithType(EduRoomTypeEnum.RoomSmallClass);
    const lecture = EduStoreFactory.createWithType(EduRoomTypeEnum.RoomBigClass);
    const vocational = EduStoreFactory.createWithType(
      EduRoomTypeEnum.RoomBigClass,
      EduRoomSubtypeEnum.Vocational,
    );

    const oneToOneUI = EduUIStoreFactory.createWithType(EduRoomTypeEnum.Room1v1Class, oneToOne);
    const interactiveUI = EduUIStoreFactory.createWithType(
      EduRoomTypeEnum.RoomSmallClass,
      interactive,
    );
    const lectureUI = EduUIStoreFactory.createWithType(EduRoomTypeEnum.RoomBigClass, lecture);
    const lectureH5UI = EduUIStoreFactory.createWithTypeH5(EduRoomTypeEnum.RoomBigClass, lecture);
    const vocationalUI = EduUIStoreFactory.createWithType(
      EduRoomTypeEnum.RoomBigClass,
      vocational,
      EduRoomSubtypeEnum.Vocational,
    );
    const vocationalH5UI = EduUIStoreFactory.createWithTypeH5(
      EduRoomTypeEnum.RoomBigClass,
      vocational,
      EduRoomSubtypeEnum.Vocational,
    );

    return React.createContext({
      oneToOne: oneToOne,
      interactive: interactive,
      lecture: lecture,
      oneToOneUI,
      interactiveUI,
      lectureUI,
      lectureH5UI,
      vocationalUI,
      vocationalH5UI,
    });
  }
}