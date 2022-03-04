import { computed, observable } from 'mobx';
import { AGError, bound } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import { EduClassroomStore } from 'agora-edu-core';
import { EduShareUIStore } from './share-ui';
import { groupUser } from '../../../../../agora-edu-core/src/stores/domain/common/group/struct';

export class GroupUIStore extends EduUIStoreBase {
  @observable
  groupNumbers = 6;

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  @computed
  get currentRoomUuid() {
    return this.classroomStore.groupStore.parentRoomUuid;
  }

  @computed
  get groupState() {
    return '';
  }

  generateSubRooms = (count: number) => {
    const studentListSize = this.classroomStore.userStore.studentList.size;
    if (studentListSize) {
      let cursor = 0,
        subRoomList = [],
        userList = [...this.classroomStore.userStore.studentList.values()];

      while (cursor < userList.length) {
        const subroomUserList = userList.slice(cursor, cursor + count);
        subRoomList.push(subroomUserList);
        cursor += cursor + count;
      }
      return subRoomList;
    }
  };

  submitSubRoomList = (list: groupUser[]) => {
    // this.classroomStore.groupStore.inviteUserListToSubRoom()
  };

  onInstall() {}
  onDestroy() {}
}
