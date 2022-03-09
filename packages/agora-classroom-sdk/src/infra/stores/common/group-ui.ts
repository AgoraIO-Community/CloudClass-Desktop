import { EduClassroomConfig, GroupDetail, GroupUser } from 'agora-edu-core';
import { AGError, bound } from 'agora-rte-sdk';
import { range } from 'lodash';
import { action, computed } from 'mobx';
import { EduUIStoreBase } from './base';
import { transI18n } from './i18n';

export enum GroupMethod {
  AUTO,
  MANUAL,
}

export class GroupUIStore extends EduUIStoreBase {
  // static readonly ERROR_MAX_PER_GROUP_PERSON_CODE = 'MAX_PER_GROUP_PERSON';

  /**
   * 分组列表
   */
  @computed
  get groups() {
    const { groupDetails } = this.classroomStore.groupStore;

    const list: { id: string; text: string; children: { id: string; text: string }[] }[] = [];

    groupDetails.forEach((group, groupUuid) => {
      const tree = {
        id: groupUuid,
        text: group.groupName,
        children: group.users.map(({ userUuid }: { userUuid: string }) => ({
          id: userUuid,
          text: userUuid,
        })) as { id: string; text: string }[],
      };

      list.push(tree);
    });

    return list;
  }

  /**
   * 学生列表
   */
  @computed
  get students() {
    const { groupDetails } = this.classroomStore.groupStore;

    const list: { userUuid: string; userName: string }[] = [];

    groupDetails;

    this.classroomStore.userStore.studentList.forEach((user) => {
      list.push({
        userUuid: user.userUuid,
        userName: user.userName,
      });
    });

    return list;
  }

  /**
   * 当前房间 主房间id，如果不为空，则表示是小组，小房间才有
   */
  @computed
  get currentRoomUuid() {
    return EduClassroomConfig.shared.sessionInfo.roomUuid;
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
  renameGroupName(groupUuid: string, groupName: string) {
    // const exist = this.subRoomList.has(Symbol.for(to));
    // if (exist) {
    //   throw new Error('INCORPERATED');
    // } else {
    //   // 修改subroomList group name
    //   const oldSubRoomList = this.subRoomList.get(Symbol.for(from)) as GroupUser[];
    //   this.subRoomList.set(Symbol.for(to), oldSubRoomList);
    //   this.subRoomList.delete(Symbol.for(from));
    // }

    this.classroomStore.groupStore.updateGroupInfo([
      {
        groupUuid,
        groupName,
      },
    ]);
  }

  /**
   * 新增组
   */
  @action.bound
  addGroup(group: GroupDetail) {
    // this.groupTailNumber++;
    // this.subRoomList.set(Symbol(`untitled-group${this.groupTailNumber}`), []);
    // this.classroomStore.groupStore.createSubRoomObject();
    // this.classroomStore.groupStore.addSubRoomList();

    this.classroomStore.groupStore.addGroups([group], false);
  }

  /**
   * 删除组
   * @param groupUuid 组id
   */
  @action.bound
  deleteGroup(groupUuid: string) {
    // this.subRoomList.delete(Symbol.for(groupName));
    this.classroomStore.groupStore.removeGroups([groupUuid]);
  }

  /**
   * 分配用户
   * @param groupUuid
   * @param user
   */
  @action.bound
  assignUserToGroup(groupUuid: string, user: GroupUser) {
    // const currentUsers = this.subRoomList.get(Symbol(groupName)) || [];
    // currentUsers.push(user);
    // this.subRoomList.set(Symbol(groupName), currentUsers);

    this.classroomStore.groupStore.inviteUserListToGroup(groupUuid, [user]);
  }

  /**
   * 移出房间
   * @param groupUuid
   * @param user
   */
  @action.bound
  removeUserFromGroup(groupUuid: string, user: GroupUser) {
    this.classroomStore.groupStore.removeUserListFromGroup(groupUuid, [user]);
  }

  /**
   * 移动用户
   * @param fromGroupUuid
   * @param toGroupUuid
   * @param user
   */
  moveUserToGroup(fromGroupUuid: string, toGroupUuid: string, user: GroupUser) {
    this.classroomStore.groupStore.addUserListToGroup(fromGroupUuid, toGroupUuid, [user], [user]);
  }

  /**
   * 处理自动分组问题
   * @param count
   */
  @action.bound
  private _handleGenerateSubRooms = (count: number) => {
    // try {
    //   this.subRoomList = this.generateSubRoomList(count);
    // } catch (e) {
    //   if (e === GroupUIStore.ERROR_MAX_PER_GROUP_PERSON_CODE) {
    //     // handle excesstive group person
    //   }
    // }
  };

  /**
   * 自动分组
   * @param count 分组数量
   * @returns
   */
  @action.bound
  private generateSubRoomList = (count: number) => {
    // const studentListSize = this.classroomStore.userStore.studentList.size;
    // if (studentListSize) {
    //   let cursor = 0;
    //   let lastCount = count;
    //   const subRoomUserList = new Map<symbol, GroupUser[]>();
    //   const userList = [...this.classroomStore.userStore.studentList.values()];
    //   while (lastCount) {
    //     ++this.groupTailNumber;
    //     if (cursor < userList.length) {
    //       const perSubroomUserList = userList.slice(cursor, cursor + count);
    //       if (perSubroomUserList.length >= this.classroomStore.groupStore.MAX_PER_GROUP_PERSON) {
    //         throw new Error(GroupUIStore.ERROR_MAX_PER_GROUP_PERSON_CODE);
    //       }
    //       const perGroupName = Symbol.for(`untitled-group${this.groupTailNumber}`);
    //       subRoomUserList.set(perGroupName, perSubroomUserList);
    //       cursor += cursor + count;
    //     } else {
    //       const perGroupName = Symbol.for(`untitled-group${this.groupTailNumber}`);
    //       subRoomUserList.set(perGroupName, []);
    //     }
    //     --lastCount;
    //   }
    //   return subRoomUserList;
    // }
    // return new Map<symbol, GroupUser[]>();
  };

  /**
   * 开始分组
   * @param list
   */
  startGroup = (list: GroupUser[]) => {
    // this.classroomStore.groupStore.inviteUserListToSubRoom()
    this.classroomStore.groupStore;
  };

  /**
   * 关闭分组
   */
  stopGroup = () => {
    this.classroomStore.groupStore.stopGroup();
  };

  /**
   * 创建分组
   * @param type
   * @param group
   */
  @bound
  createGroups(type: GroupMethod, count: number) {
    if (type === GroupMethod.MANUAL) {
      const groupDetails = range(0, count).map((i) => ({
        groupName: this._generateGroupName(i),
        users: [],
      }));

      this.classroomStore.groupStore.addGroups(groupDetails, false).catch((e) => {
        this.shareUIStore.addGenericErrorDialog(e as AGError);
      });
    }

    // Not supported
  }

  leave() {
    this.classroomStore.groupStore.leaveSubRoom();
  }

  private _generateGroupName(no: number) {
    return `${transI18n('breakout_room.group_label')} ${no}`;
  }

  onInstall() {}
  onDestroy() {}
}
