import { EduClassroomStore, EduRoomTypeEnum } from 'agora-edu-core';
import { EduClassroomUIStore } from '../stores/common';
import { EduInteractiveUIClassStore } from '../stores/interactive';
import { EduLectureUIStore } from '../stores/lecture';
import { EduLectureH5UIStore } from '../stores/lecture-mobile';
import { Edu1v1ClassUIStore } from '../stores/one-on-one';

export class EduUIStoreFactory {
  static createWithType(roomType: EduRoomTypeEnum, store: EduClassroomStore): EduClassroomUIStore {
    switch (roomType) {
      case EduRoomTypeEnum.Room1v1Class:
        return new Edu1v1ClassUIStore(store);
      case EduRoomTypeEnum.RoomSmallClass:
        return new EduInteractiveUIClassStore(store);
      case EduRoomTypeEnum.RoomBigClass:
        return new EduLectureUIStore(store);
      default:
        throw new Error(`No supported UIStore for room type: ${roomType}`);
    }
  }
  static createWithTypeH5(
    roomType: EduRoomTypeEnum,
    store: EduClassroomStore,
  ): EduClassroomUIStore {
    switch (roomType) {
      case EduRoomTypeEnum.RoomBigClass:
        return new EduLectureH5UIStore(store);
      default:
        throw new Error(`No supported UIStore for room type: ${roomType}`);
    }
  }
}
