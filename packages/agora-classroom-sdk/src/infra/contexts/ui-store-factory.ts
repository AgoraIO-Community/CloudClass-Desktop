import { EduClassroomStore, EduRoomTypeEnum, EduRoomSubtypeEnum } from 'agora-edu-core';
import { EduInteractiveUIClassStore } from '../stores/interactive';
import { EduLectureUIStore } from '../stores/lecture';
import { Edu1v1ClassUIStore } from '../stores/one-on-one';
import { EduLectureH5UIStore } from '../stores/lecture-h5';
import { EduClassroomUIStore } from '../stores/common';
import { EduVocationalUIStore } from '../stores/vocational';
import { EduVocationalH5UIStore } from '../stores/vocational-h5';

export class EduUIStoreFactory {
  static createWithType(
    type: EduRoomTypeEnum,
    store: EduClassroomStore,
    subType?: EduRoomSubtypeEnum,
  ): EduClassroomUIStore {
    switch (type) {
      case EduRoomTypeEnum.Room1v1Class:
        return new Edu1v1ClassUIStore(store);
      case EduRoomTypeEnum.RoomSmallClass:
        return new EduInteractiveUIClassStore(store);
      case EduRoomTypeEnum.RoomBigClass:
        if (subType && subType === EduRoomSubtypeEnum.Vocational) {
          return new EduVocationalUIStore(store);
        } else {
          return new EduLectureUIStore(store);
        }
      default:
        return new EduClassroomUIStore(store); // return default
    }
  }
  static createWithTypeH5(
    type: EduRoomTypeEnum,
    store: EduClassroomStore,
    subType?: EduRoomSubtypeEnum,
  ): EduClassroomUIStore {
    switch (type) {
      case EduRoomTypeEnum.RoomBigClass:
        if (subType && subType === EduRoomSubtypeEnum.Vocational) {
          return new EduVocationalH5UIStore(store);
        }
        return new EduLectureH5UIStore(store);
      default:
        return new EduClassroomUIStore(store); // return default
    }
  }
}
