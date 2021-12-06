import {
  Edu1v1ClassStore,
  EduLectureStore,
  EduInteractiveClassStore,
  EduClassroomStore,
} from './domain';
import { Edu1v1ClassUIStore, EduLectureUIStore, EduInteractiveUIClassStore } from './ui';
import { EduRoomTypeEnum } from '../type';
import { EduClassroomUIStore } from './ui/common';

// root domain store
export class EduStoreFactory {
  static createWithType(type: EduRoomTypeEnum): EduClassroomStore {
    switch (type) {
      case EduRoomTypeEnum.Room1v1Class:
        return new Edu1v1ClassStore();
      case EduRoomTypeEnum.RoomSmallClass:
        return new EduInteractiveClassStore();
      case EduRoomTypeEnum.RoomBigClass:
        return new EduLectureStore();
    }
  }
}

export class EduUIStoreFactory {
  static createWithType(type: EduRoomTypeEnum, store: EduClassroomStore): EduClassroomUIStore {
    switch (type) {
      case EduRoomTypeEnum.Room1v1Class:
        return new Edu1v1ClassUIStore(store);
      case EduRoomTypeEnum.RoomSmallClass:
        return new EduInteractiveUIClassStore(store);
      case EduRoomTypeEnum.RoomBigClass:
        return new EduLectureUIStore(store);
    }
  }
}
