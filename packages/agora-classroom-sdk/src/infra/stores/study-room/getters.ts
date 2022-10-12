import { Getters } from '../common/getters';
import { StudyRoomLayoutUIStore } from './layout';

export class StudyRoomGetters extends Getters {
  get pinnedUser() {
    return (this._classroomUIStore.layoutUIStore as StudyRoomLayoutUIStore).pinnedUser;
  }

  get blackList() {
    return (this._classroomUIStore.layoutUIStore as StudyRoomLayoutUIStore).blackList;
  }
}
