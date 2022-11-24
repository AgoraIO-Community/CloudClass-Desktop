import { EduClassroomStore, EduRoomServiceTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { EduClassroomUIStore } from '../stores/common';
import { EduInteractiveUIClassStore } from '../stores/interactive';
import { EduLectureUIStore } from '../stores/lecture';
import { EduLectureH5UIStore } from '../stores/lecture-h5';
import { Edu1v1ClassUIStore } from '../stores/one-on-one';
import { EduVocationalUIStore } from '../stores/vocational';
import { EduVocationalH5UIStore } from '../stores/vocational-h5';

export class EduUIStoreFactory {
  static createWithType(
    roomType: EduRoomTypeEnum,
    store: EduClassroomStore,
    serviceType: EduRoomServiceTypeEnum = EduRoomServiceTypeEnum.LivePremium,
  ): EduClassroomUIStore {
    const isVocational = serviceType !== EduRoomServiceTypeEnum.LivePremium;
    switch (roomType) {
      case EduRoomTypeEnum.Room1v1Class:
        return new Edu1v1ClassUIStore(store);
      case EduRoomTypeEnum.RoomSmallClass:
        return new EduInteractiveUIClassStore(store);
      case EduRoomTypeEnum.RoomBigClass:
        if (isVocational) {
          return new EduVocationalUIStore(store);
        }
        return new EduLectureUIStore(store);
      default:
        return new EduClassroomUIStore(store); // return default
    }
  }
  static createWithTypeH5(
    roomType: EduRoomTypeEnum,
    store: EduClassroomStore,
    serviceType: EduRoomServiceTypeEnum = EduRoomServiceTypeEnum.LivePremium,
  ): EduClassroomUIStore {
    const isVocational = serviceType !== EduRoomServiceTypeEnum.LivePremium;
    switch (roomType) {
      case EduRoomTypeEnum.RoomBigClass:
        if (isVocational) {
          return new EduVocationalH5UIStore(store);
        }
        return new EduLectureH5UIStore(store);
      default:
        return new EduClassroomUIStore(store); // return default
    }
  }
}
