import { EduClassroomStore, EduClassroomUIStore, EduRoomTypeEnum } from 'agora-edu-core';
import { EduInteractiveUIClassStore } from '../stores/interactive';
import { EduLectureUIStore } from '../stores/lecture';
import { Edu1v1ClassUIStore } from '../stores/one-on-one';
import { EduOneOnOneH5UIStore } from '../stores/one-on-one-h5';
import { EduLectureH5UIStore } from '../stores/lecture-h5';
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
  static createWithTypeH5(type: EduRoomTypeEnum, store: EduClassroomStore): EduClassroomUIStore {
    switch (type) {
      case EduRoomTypeEnum.RoomBigClass:
        return new EduLectureH5UIStore(store);
      case EduRoomTypeEnum.Room1v1Class:
        return new EduOneOnOneH5UIStore(store);
      default:
        return new EduClassroomUIStore(store); // return default
    }
  }
}
