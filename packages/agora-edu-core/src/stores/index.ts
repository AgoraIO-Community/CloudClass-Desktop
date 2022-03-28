import {
  Edu1v1ClassStore,
  EduLectureStore,
  EduInteractiveClassStore,
  EduClassroomStore,
} from './domain';
import { EduRoomTypeEnum } from '../type';

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
      default:
        return new EduClassroomStore(); // return default
    }
  }
}
