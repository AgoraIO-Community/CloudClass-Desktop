import {
  AgoraEduClassroomEvent,
  EduEventCenter,
  GroupDetail,
  GroupState,
  PatchGroup,
} from 'agora-edu-core';
import { AGError, bound, Log } from 'agora-rte-sdk';
import { difference, range } from 'lodash';
import { action, computed, observable, runInAction } from 'mobx';
import { EduUIStoreBase } from './base';
import { transI18n } from './i18n';
import uuidv4 from 'uuid';

export enum GroupMethod {
  AUTO,
  MANUAL,
}

@Log.attach({ proxyMethods: false })
export class GroupUIStore extends EduUIStoreBase {
  private _groupSeq = 0;
  @observable
  joiningSubRoom = false;

  @observable
  localGroups: Map<string, GroupDetail> = new Map();

  private _groupNum = 0;

  /**
   * 分组列表
   */
  @computed
  get groups() {
    const list: { id: string; text: string; children: { id: string; text: string }[] }[] = [];

    const { users } = this.classroomStore.userStore;

    this.groupDetails.forEach((group, groupUuid) => {
      const tree = {
        id: groupUuid,
        text: group.groupName,
        children: group.users.map(({ userUuid }: { userUuid: string }) => ({
          id: userUuid,
          text: users.get(userUuid)?.userName || 'unknown',
        })) as { id: string; text: string }[],
      };

      list.push(tree);
    });

    if (this.groupState === GroupState.OPEN) {
      const notGrouped: { id: string; text: string }[] = [];

      this.classroomStore.userStore.studentList.forEach((student, studentUuid) => {
        const groupUuid = this.groupUuidByUserUuid.get(studentUuid);
        if (!groupUuid) {
          notGrouped.push({ id: studentUuid, text: student.userName });
        }
      });

      if (notGrouped.length > 0) {
        list.unshift({
          id: '',
          text: transI18n('breakout_room.not_grouped'),
          children: notGrouped,
        });
      }
    }

    return list;
  }

  @computed
  get groupDetails() {
    const { groupDetails } = this.classroomStore.groupStore;

    return this.groupState === GroupState.OPEN ? groupDetails : this.localGroups;
  }

  @computed
  get groupUuidByUserUuid() {
    const map: Map<string, string> = new Map();

    this.groupDetails.forEach((group, groupUuid) => {
      group.users.forEach(({ userUuid }) => {
        map.set(userUuid, groupUuid);
      });
    });

    return map;
  }

  /**
   * 学生列表
   */
  @computed
  get students() {
    const list: { userUuid: string; userName: string; groupUuid: string | undefined }[] = [];

    this.classroomStore.userStore.studentList.forEach((user) => {
      const groupUuid = this.groupUuidByUserUuid.get(user.userUuid);

      list.push({
        userUuid: user.userUuid,
        userName: user.userName,
        groupUuid,
      });
    });

    return list;
  }

  /**
   *
   */
  @computed
  get notGroupedCount() {
    const count = this.students.reduce((prev, { groupUuid }) => {
      if (groupUuid) {
        prev += 1;
      }

      return prev;
    }, 0);
    return count;
  }

  @computed
  get numberToBeAssigned() {
    return 0;
  }

  /**
   * 当前是否开放分组
   */
  @computed
  get groupState() {
    return this.classroomStore.groupStore.state;
  }

  /**
   * 当前房间
   */
  get currentSubRoom() {
    return this.classroomStore.groupStore.currentSubRoom;
  }

  /**
   * 设置分组用户列表
   * @param groupUuid
   * @param users
   */
  @action.bound
  setGroupUsers(groupUuid: string, users: string[]) {
    this.logger.info('Set group users', groupUuid, users);

    let patches: PatchGroup[] = [];

    this.groupDetails.forEach((group, uuid) => {
      if (groupUuid === uuid) {
        const groupUsers = group.users.map(({ userUuid }) => userUuid);

        const removeUsers = difference(groupUsers, users);

        const addUsers = difference(users, groupUsers);

        patches.push({
          groupUuid,
          addUsers,
          removeUsers,
        });
      }
    });

    if (this.groupState === GroupState.OPEN) {
      patches = patches.filter(
        ({ removeUsers, addUsers }) => removeUsers?.length || addUsers?.length,
      );
      this.classroomStore.groupStore.updateGroupUsers(patches);
    } else {
      patches.forEach(({ removeUsers = [], addUsers = [], groupUuid }) => {
        const groupDetail = this.localGroups.get(groupUuid);

        if (groupDetail) {
          const users = addUsers.map((userUuid) => ({ userUuid }));

          const newUsers = groupDetail.users
            .filter(({ userUuid }) => !removeUsers.includes(userUuid))
            .concat(users);

          groupDetail.users = newUsers;

          this.localGroups.set(groupUuid, groupDetail);
        }
      });
    }
  }

  /**
   * 重命名组
   * @param from 原名字
   * @param to 新名字
   */
  @action.bound
  renameGroupName(groupUuid: string, groupName: string) {
    if (this.groupState === GroupState.OPEN) {
      this.classroomStore.groupStore.updateGroupInfo([
        {
          groupUuid,
          groupName,
        },
      ]);
    } else {
      const groupDetail = this.localGroups.get(groupUuid);

      if (groupDetail) {
        groupDetail.groupName = groupName;
        this.localGroups.set(groupUuid, groupDetail);
      }
    }
  }

  /**
   * 新增组
   */
  @action.bound
  addGroup() {
    if (this.groupState === GroupState.OPEN) {
      this.classroomStore.groupStore.addGroups([
        {
          groupName: this._generateGroupName(),
          users: [],
        },
      ]);
    } else {
      this.localGroups.set(`${uuidv4()}`, {
        groupName: this._generateGroupName(),
        users: [],
      });
    }
  }

  /**
   * 删除组
   * @param groupUuid 组id
   */
  @action.bound
  removeGroup(groupUuid: string) {
    if (this.groupState === GroupState.OPEN) {
      this.classroomStore.groupStore.removeGroups([groupUuid]);
    } else {
      this.localGroups.delete(groupUuid);
    }
  }

  /**
   * 移动用户
   * @param fromGroupUuid
   * @param toGroupUuid
   * @param user
   */
  @action.bound
  moveUserToGroup(fromGroupUuid: string, toGroupUuid: string, userUuid: string) {
    if (this.groupState === GroupState.OPEN) {
      if (!fromGroupUuid) {
        this.classroomStore.groupStore.updateGroupUsers([
          {
            groupUuid: toGroupUuid,
            addUsers: [userUuid],
          },
        ]);
      }

      this.classroomStore.groupStore.addUserListToGroup(
        fromGroupUuid,
        toGroupUuid,
        [userUuid],
        [userUuid],
      );
    } else {
      const fromGroup = this.localGroups.get(fromGroupUuid);
      const toGroup = this.localGroups.get(toGroupUuid);
      if (fromGroup && toGroup) {
        fromGroup.users = fromGroup.users.filter(({ userUuid: uuid }) => uuid !== userUuid);
        toGroup.users = toGroup.users.concat([{ userUuid }]);
        this.localGroups.set(fromGroupUuid, fromGroup);
        this.localGroups.set(toGroupUuid, toGroup);
      }
    }
  }

  /**
   * 用户组互换
   * @param userUuid1
   * @param userUuid2
   */
  @bound
  interchangeGroup(userUuid1: string, userUuid2: string) {
    const patches: PatchGroup[] = [];

    let groupUuid1 = '';
    let groupUuid2 = '';

    if (this.groupState === GroupState.CLOSE) {
      throw new Error('not supported');
    }

    this.classroomStore.groupStore.groupDetails.forEach(({ users }, gropuUuid) => {
      const hasUser1 = users.some(({ userUuid }) => userUuid === userUuid1);
      if (hasUser1) {
        groupUuid1 = gropuUuid;
      }

      const hasUser2 = users.find(({ userUuid }) => userUuid === userUuid2);
      if (hasUser2) {
        groupUuid2 = gropuUuid;
      }
    });

    if (groupUuid1 && groupUuid2) {
      patches.push({
        groupUuid: groupUuid1,
        addUsers: [userUuid2],
        removeUsers: [userUuid1],
      });

      patches.push({
        groupUuid: groupUuid2,
        addUsers: [userUuid1],
        removeUsers: [userUuid2],
      });

      this.classroomStore.groupStore.updateGroupUsers(patches);
    } else {
      this.logger.info('cannot know which group the user is in');
    }
  }

  @bound
  startGroup() {
    const groupDetails: GroupDetail[] = [];

    this.localGroups.forEach((group) => {
      groupDetails.push({
        groupName: group.groupName,
        users: group.users,
      });
    });

    this.classroomStore.groupStore
      .startGroup(groupDetails)
      .then(() => {
        runInAction(() => {
          this.localGroups = new Map();
        });
      })
      .catch((e) => {
        this.shareUIStore.addGenericErrorDialog(e as AGError);
      });
  }

  /**
   * 结束分组
   */
  @bound
  stopGroup() {
    this.classroomStore.groupStore.stopGroup();
  }

  /**
   * 创建分组
   * @param type
   * @param group
   */
  @action.bound
  createGroups(type: GroupMethod, count?: number) {
    if (count) {
      this._groupNum = count;
    }

    this.localGroups = new Map();
    this._groupSeq = 0;

    if (type === GroupMethod.MANUAL) {
      range(0, this._groupNum).forEach(() => {
        const groupDetail = {
          groupName: this._generateGroupName(),
          users: [],
        };

        this.localGroups.set(`${uuidv4()}`, groupDetail);
      });
    }

    // Not supported
  }

  /**
   * 离开子房间
   */
  leave() {
    this.classroomStore.groupStore.leaveSubRoom();
  }

  private _generateGroupName() {
    const nextSeq = (this._groupSeq += 1);

    return `${transI18n('breakout_room.group_label')} ${nextSeq}`;
  }

  onInstall() {
    EduEventCenter.shared.onClassroomEvents((type, args) => {
      if (type === AgoraEduClassroomEvent.JoinSubRoom) {
        if (this.currentSubRoom) {
        } else {
          this.shareUIStore.addToast('Cannot find subroom');
        }
      }
      if (type === AgoraEduClassroomEvent.LeaveSubRoom) {
        this.shareUIStore.addToast('Leave sub room');
      }
      if (type === AgoraEduClassroomEvent.AcceptedToGroup) {
        this.logger.info('Accepted to group', args);
        this.shareUIStore.addToast('Accepted to group');
      }

      if (type === AgoraEduClassroomEvent.InvitedToGroup) {
        this.shareUIStore.addConfirmDialog(
          transI18n('breakout_room.confirm_title'),
          transI18n('breakout_room.confirm_content'),
          () => {
            const { groupUuid } = args;
            this.classroomStore.groupStore.joinSubRoom(groupUuid);
          },
        );
      }
      if (type === AgoraEduClassroomEvent.MoveToOtherGroup) {
      }
    });
  }
  onDestroy() {}
}
