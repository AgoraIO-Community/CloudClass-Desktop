import { action, computed, observable } from 'mobx';
import { EduUIStoreBase } from './base';
import { EduClassroomStore, groupUser } from 'agora-edu-core';
import { EduShareUIStore } from './share-ui';

export class GroupUIStore extends EduUIStoreBase {
  private ERROR_MAX_PER_GROUP_PERSON_CODE = 'MAX_PER_GROUP_PERSON';
  @observable
  groupNumbers = 6;

  @observable
  subRoomList: Map<Symbol, groupUser[]> = new Map();

  @observable
  groupTailNumber = 0;

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  /**
   * 当前房间 主房间id，如果不为空，则表示是小组，小房间才有
   */
  @computed
  get currentRoomUuid() {
    return this.classroomStore.groupStore.parentRoomUuid;
  }

  /**
   * 当前是否开放分组
   */
  @computed
  get groupState() {
    return this.classroomStore.groupStore.state;
  }

  /**
   * 重命名组
   * @param from 原名字
   * @param to 新名字
   */
  @action.bound
  renameGroupName(from: string, to: string) {
    let exist = this.subRoomList.has(Symbol.for(to));
    if (exist) {
      throw new Error('INCORPERATED');
    } else {
      // 修改subroomList group name
      let oldSubRoomList = this.subRoomList.get(Symbol.for(from)) as groupUser[];
      this.subRoomList.set(Symbol.for(to), oldSubRoomList);
      this.subRoomList.delete(Symbol.for(from));
    }
  }

  /**
   * 新增组
   */
  @action.bound
  addGroup() {
    this.groupTailNumber++;
    this.subRoomList.set(Symbol(`untitled-group${this.groupTailNumber}`), []);
  }

  /**
   * 删除组
   * @param groupName 组名
   */
  @action.bound
  deleteGroup(groupName: string) {
    this.subRoomList.delete(Symbol.for(groupName));
  }

  /**
   * 分配用户
   * @param groupName
   * @param user
   */
  @action.bound
  assignUserToGroup(groupName: string, user: groupUser) {
    let currentUsers = this.subRoomList.get(Symbol(groupName)) || [];
    currentUsers.push(user);
    this.subRoomList.set(Symbol(groupName), currentUsers);
  }

  /**
   * 清除分组信息
   */
  @action.bound
  clearGroups() {
    this.subRoomList.clear();
  }

  /**
   * 处理自动分组问题
   * @param count
   */
  @action.bound
  handleGenerateSubRooms = (count: number) => {
    try {
      this.subRoomList = this.generateSubRoomList(count);
    } catch (e) {
      if (e === this.ERROR_MAX_PER_GROUP_PERSON_CODE) {
        // handle excesstive group person
      }
    }
  };

  /**
   * 自动分组
   * @param count 分组数量
   * @returns
   */
  @action.bound
  private generateSubRoomList = (count: number) => {
    const studentListSize = this.classroomStore.userStore.studentList.size;
    if (studentListSize) {
      let cursor = 0,
        lastCount = count,
        subRoomUserList = new Map<Symbol, groupUser[]>(),
        userList = [...this.classroomStore.userStore.studentList.values()];

      while (lastCount) {
        ++this.groupTailNumber;
        if (cursor < userList.length) {
          const perSubroomUserList = userList.slice(cursor, cursor + count);
          if (perSubroomUserList.length >= this.classroomStore.groupStore.MAX_PER_GROUP_PERSON) {
            throw new Error(this.ERROR_MAX_PER_GROUP_PERSON_CODE);
          }
          const perGroupName = Symbol.for(`untitled-group${this.groupTailNumber}`);
          subRoomUserList.set(perGroupName, perSubroomUserList);
          cursor += cursor + count;
        } else {
          const perGroupName = Symbol.for(`untitled-group${this.groupTailNumber}`);
          subRoomUserList.set(perGroupName, []);
        }
        --lastCount;
      }
      return subRoomUserList;
    }
    return new Map<Symbol, groupUser[]>();
  };

  startGroup = (list: groupUser[]) => {
    // this.classroomStore.groupStore.inviteUserListToSubRoom()
  };

  stopGroup = () => {
    this.classroomStore.groupStore.stopGroup();
  };

  translateGroups = () => {};

  onInstall() {}
  onDestroy() {}
}
