import { Getters } from '../common/getters';
import { StudyRoomLayoutUIStore } from './layout';

export class StudyRoomGetters extends Getters {
  get localUserUuid() {
    const { localUser } = this.classroomStore.userStore;
    return localUser?.userUuid;
  }

  get pinnedUser() {
    return (this._classroomUIStore.layoutUIStore as StudyRoomLayoutUIStore).pinnedUser;
  }

  get blackList() {
    return (this._classroomUIStore.layoutUIStore as StudyRoomLayoutUIStore).blackList;
  }
}
