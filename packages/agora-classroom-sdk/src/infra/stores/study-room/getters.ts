import { computed } from 'mobx';
import { Getters } from '../common/getters';

export class StudyRoomGetters extends Getters {
  @computed
  get localUserUuid() {
    const { localUser } = this._classroomStore.userStore;
    return localUser?.userUuid;
  }

  @computed
  get pinnedUser() {
    return '';
  }

  get blackList() {
    return new Set();
  }
}
