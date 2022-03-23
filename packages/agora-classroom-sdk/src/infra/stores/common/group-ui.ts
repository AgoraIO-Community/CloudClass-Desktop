import {
  AgoraEduClassroomEvent,
  EduClassroomConfig,
  EduEventCenter,
  EduRoleTypeEnum,
  GroupDetail,
  GroupState,
  PatchGroup,
  WhiteboardState,
  WhiteboardTool,
} from 'agora-edu-core';
import { AGError, bound, Log, RtcState } from 'agora-rte-sdk';
import { difference, range } from 'lodash';
import { action, computed, observable, runInAction, when } from 'mobx';
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

    const { users, studentList } = this.userData;

    this.groupDetails.forEach((group, groupUuid) => {
      const students = [] as { id: string; text: string; notJoined?: boolean }[];

      group.users.forEach(({ userUuid, notJoined }) => {
        if (studentList.has(userUuid)) {
          students.push({
            id: userUuid,
            text: users.get(userUuid)?.userName || 'unknown',
            notJoined,
          });
        }
      });

      const tree = {
        id: groupUuid,
        text: group.groupName,
        children: students,
      };

      list.push(tree);
    });

    if (this.groupState === GroupState.OPEN) {
      const notGrouped: { id: string; text: string }[] = [];

      studentList.forEach((student, studentUuid) => {
        const groupUuid = this.getUserGroupUuid(studentUuid);
        const user = this.getGroupUserByUuid(studentUuid);

        if (!groupUuid && !user?.notJoined) {
          notGrouped.push({ id: studentUuid, text: student.userName });
        }
      });

      if (notGrouped.length > 0) {
        list.unshift({
          id: '',
          text: transI18n('breakout_room.not_grouped'),
          // waitForAccept: false,
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

  /**
   * 获取学生所在组ID
   * @param userUuid
   */
  @bound
  getUserGroupUuid(userUuid: string) {
    return this.classroomStore.groupStore.groupUuidByUserUuid.get(userUuid);
  }

  /**
   * 获取学生信息
   * @param userUuid
   */
  @bound
  getGroupUserByUuid(userUuid: string) {
    return this.classroomStore.groupStore.userByUuid.get(userUuid);
  }

  /**
   * 学生列表
   */
  @computed
  get students() {
    const list: { userUuid: string; userName: string; groupUuid: string | undefined }[] = [];

    this.userData.studentList.forEach((user) => {
      const groupUuid = this.getUserGroupUuid(user.userUuid);

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
      if (!groupUuid) {
        prev += 1;
      }

      return prev;
    }, 0);
    return count;
  }

  @computed
  get numberToBeAssigned() {
    return this.userData.studentList.size;
  }

  @computed
  get userData() {
    return this.classroomStore.userStore.mainRoomDataStore;
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

    const patches: PatchGroup[] = [];

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

  /**
   * 重命名组
   * @param from 原名字
   * @param to 新名字
   */
  @action.bound
  renameGroupName(groupUuid: string, groupName: string) {
    if (this._isGroupExisted({ groupUuid, groupName })) {
      this.shareUIStore.addToast(transI18n('toast.breakout_room_group_name_existed'));
      return;
    }

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
    const newGroup = { groupUuid: uuidv4(), groupName: this._generateGroupName() };

    if (this._isGroupExisted(newGroup)) {
      newGroup.groupName += ' 1';
    }

    if (this.groupState === GroupState.OPEN) {
      this.classroomStore.groupStore.addGroups([
        {
          groupName: newGroup.groupName,
          users: [],
        },
      ]);
    } else {
      this.localGroups.set(newGroup.groupUuid, {
        groupName: newGroup.groupName,
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
        this.classroomStore.groupStore.updateGroupUsers(
          [
            {
              groupUuid: toGroupUuid,
              addUsers: [userUuid],
            },
          ],
          true,
        );
      } else {
        this.classroomStore.groupStore.moveUsersToGroup(fromGroupUuid, toGroupUuid, [userUuid]);
      }
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

  private _isGroupExisted({ groupName, groupUuid }: { groupName: string; groupUuid: string }) {
    return this.groups.some(({ text, id }) => groupName === text && id !== groupUuid);
  }

  @bound
  getGroupUserCount(groupUuid: string) {
    return this.groupDetails.get(groupUuid)?.users.reduce((prev, { userUuid }) => {
      if (this.userData.studentList.has(userUuid)) prev += 1;
      return prev;
    }, 0);
  }
  /**
   * 加入子房间
   * @param groupUuid
   */
  @bound
  joinSubRoom(groupUuid: string) {
    if (groupUuid === this.classroomStore.groupStore.currentSubRoom) {
      this.shareUIStore.addToast(transI18n('breakout_room.already_in_room'));
      return;
    }

    if (!this.classroomStore.groupStore.currentSubRoom) {
      this.classroomStore.groupStore.updateGroupUsers([
        {
          groupUuid: groupUuid,
          addUsers: [EduClassroomConfig.shared.sessionInfo.userUuid],
        },
      ]);
    } else {
      this.classroomStore.groupStore.moveUsersToGroup(
        this.classroomStore.groupStore.currentSubRoom,
        groupUuid,
        [EduClassroomConfig.shared.sessionInfo.userUuid],
      );
    }
  }

  private _generateGroupName() {
    const nextSeq = (this._groupSeq += 1);

    return `${transI18n('breakout_room.group_label')} ${nextSeq}`;
  }

  @action
  private setConnectionState(state: boolean) {
    this.joiningSubRoom = state;
  }

  private async _waitUntilLeft() {
    await when(
      () =>
        this.classroomStore.connectionStore.whiteboardState === WhiteboardState.Idle &&
        this.classroomStore.connectionStore.rtcState === RtcState.Idle,
    );
  }

  private async _waitUntilConnected() {
    await when(
      () =>
        this.classroomStore.connectionStore.whiteboardState === WhiteboardState.Connected &&
        this.classroomStore.connectionStore.rtcState === RtcState.Connected,
    );
  }

  private async _waitUntilJoined() {
    if (this.joiningSubRoom) {
      await when(() => !this.joiningSubRoom);
    }
  }

  @bound
  private async _joinSubRoom() {
    await this._waitUntilJoined();
    this.setConnectionState(true);
    const roomUuid = this.classroomStore.groupStore.currentSubRoom;
    if (roomUuid) {
      try {
        await this._waitUntilConnected();

        // workaround: room may not exist when whiteboard state is connected, it will no op  if leave board at this time
        await new Promise((r) => setTimeout(r, 500));

        await this.classroomStore.connectionStore.leaveRTC();
        if (this.classroomStore.connectionStore.whiteboardState !== WhiteboardState.Disconnecting) {
          await this.classroomStore.connectionStore.leaveWhiteboard();
        }

        await this._waitUntilLeft();

        await this.classroomStore.connectionStore.joinSubRoom(roomUuid);

        await this.classroomStore.connectionStore.joinRTC();

        await this.classroomStore.streamStore.updateLocalPublishState({
          videoState: 1,
          audioState: 1,
        });
      } catch (e) {
        this.shareUIStore.addToast('Cannot join sub room');
      } finally {
        this.setConnectionState(false);
      }
      if (EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student) {
        await when(() => this.classroomStore.boardStore.managerReady);
        await this.classroomStore.boardStore.setWritable(true);
        this.classroomStore.boardStore.setTool(WhiteboardTool.selector);
        await this.classroomStore.boardStore.grantPermission(
          EduClassroomConfig.shared.sessionInfo.userUuid,
        );
      }
    } else {
      this.shareUIStore.addToast('Cannot find room');
    }
  }

  @bound
  private async _leaveSubRoom() {
    await this._waitUntilJoined();
    this.setConnectionState(true);
    try {
      await this.classroomStore.connectionStore.leaveSubRoom();

      await when(
        () =>
          this.classroomStore.connectionStore.whiteboardState === WhiteboardState.Idle &&
          this.classroomStore.connectionStore.rtcState === RtcState.Idle,
      );

      await this.classroomStore.connectionStore.joinRTC();
    } catch (e) {
      this.shareUIStore.addToast('Cannot leave sub room');
    } finally {
      this.setConnectionState(false);
    }
  }

  @bound
  private async _changeSubRoom() {
    await this._waitUntilJoined();
    this.setConnectionState(true);
    try {
      const roomUuid = this.classroomStore.groupStore.currentSubRoom;
      if (roomUuid) {
        await this.classroomStore.connectionStore.leaveSubRoom();

        await when(
          () =>
            this.classroomStore.connectionStore.rtcState === RtcState.Idle &&
            this.classroomStore.connectionStore.whiteboardState === WhiteboardState.Idle,
        );

        await this.classroomStore.connectionStore.joinSubRoom(roomUuid);

        await this.classroomStore.connectionStore.joinRTC();

        await this.classroomStore.streamStore.updateLocalPublishState({
          videoState: 1,
          audioState: 1,
        });
      }
    } catch (e) {
      this.shareUIStore.addToast('Cannot change sub room');
    } finally {
      this.setConnectionState(false);
    }
  }

  onInstall() {
    EduEventCenter.shared.onClassroomEvents((type, args) => {
      if (type === AgoraEduClassroomEvent.JoinSubRoom) {
        this._joinSubRoom();
      }
      if (type === AgoraEduClassroomEvent.LeaveSubRoom) {
        this.shareUIStore.addToast('Leave sub room');
        this._leaveSubRoom();
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
            this.classroomStore.groupStore.acceptGroupInvited(groupUuid);
          },
        );
      }
      if (type === AgoraEduClassroomEvent.MoveToOtherGroup) {
        this._changeSubRoom();
      }
    });
  }
  onDestroy() {}
}
