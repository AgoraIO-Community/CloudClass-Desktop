import { AgoraRteEventType, AgoraRteScene, bound } from 'agora-rte-sdk';
import { cloneDeep, startsWith } from 'lodash';
import get from 'lodash/get';
import { action, computed, observable } from 'mobx';
import { EduClassroomConfig } from '../../../../configs';
import { EduEventCenter } from '../../../../event-center';
import { AgoraEduClassroomEvent } from '../../../../type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';
import {
  BroadcastMessageRange,
  BroadcastMessageType,
  GroupDetail,
  GroupUser,
  PatchGroup,
} from './type';
import { GroupDetails, GroupState } from './type';

enum OperationType {
  // 加入分组
  Join,
  // 离开分组
  Leave,
  //
  Move,
}

type OperationQueue = {
  type: OperationType;
  fromGroupUuid?: string;
  toGroupUuid?: string;
}[];

/**
 * 负责功能：
 *  1.获取子房间
 *  2.获取子房间对象
 *  3.加入子房间
 *  4.离开子房间
 *  5.主房间属性
 *  6.新增房间
 *  7.删除房间
 *  8.删除所有子房间
 *  9.添加用户到房间
 *  10.邀请用户到房间
 *  11.用户接收邀请进入房间
 *  12.用户移动至指定房间
 */
export class GroupStore extends EduStoreBase {
  static readonly MAX_GROUP_COUNT = 20; // 最大分组数量
  static readonly MIN_GROUP_COUNT = 2;
  static readonly MAX_PER_GROUP_PERSON = 15; // 单组最大人数
  static readonly CMD_PROCESS_PREFIX = 'groups-';

  private _currentGroupUuid?: string;
  private _inviting = false;

  @observable
  state: GroupState = GroupState.CLOSE;

  @observable
  groupDetails: Map<string, GroupDetail> = new Map();

  @observable
  operationQueue: OperationQueue = [];

  /** Methods */
  @action.bound
  private _handleRoomPropertiesChange(
    changedRoomProperties: string[],
    roomProperties: any,
    operator: any,
    cause: any,
  ) {
    changedRoomProperties.forEach((key) => {
      if (key === 'groups') {
        const groups = get(roomProperties, 'groups', {});
        const processes = get(roomProperties, 'processes', {});
        const progress = this._getProgress(processes);
        this._setDetails(groups.details || {}, progress);
        this.state = groups.state;
        this._checkSubRoom();
      }

      if (key === 'processes') {
        const groups = get(roomProperties, 'groups', {});
        const processes = get(roomProperties, 'processes', {});
        const progress = this._getProgress(processes);
        this._setDetails(groups.details || {}, progress);
        this.state = groups.state;
      }
    });

    if (cause) {
      const { cmd, data } = cause;
      // Emit event when local user is invited by teacher
      if (cmd === 501 && startsWith(data.processUuid, GroupStore.CMD_PROCESS_PREFIX)) {
        const groupUuid = data.processUuid.substring(GroupStore.CMD_PROCESS_PREFIX.length);
        const progress =
          (data.addProgress as {
            userUuid: string;
            ts: number;
            payload: { groupUuid: string; groupName: string };
          }[]) || [];
        const accepted = (data.addAccepted as { userUuid: string }[]) || [];
        const actionType = data.actionType as number;
        const removeProgress = (data.removeProgress as { userUuid: string }[]) || [];
        const { userUuid: localUuid } = EduClassroomConfig.shared.sessionInfo;

        const invitedLocal = progress.find(({ userUuid }) => userUuid === localUuid);

        if (invitedLocal) {
          EduEventCenter.shared.emitClasroomEvents(
            AgoraEduClassroomEvent.InvitedToGroup,
            invitedLocal.payload,
          );
        }
        // accepted
        if (actionType === 2 && accepted.length) {
          EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.AcceptedToGroup, {
            groupUuid,
            accepted,
          });
        }
        // reject invitation
        if ((actionType === 3 || actionType === 7) && removeProgress.length) {
          const inviting = this._inviting;
          this._inviting = false;
          EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.RejectedToGroup, {
            groupUuid,
            removeProgress,
            inviting,
          });
        }
      }
      // user in out
      if (cmd === 11 && data.actionType === 4) {
        const groups: { groupUuid: string; addUsers: []; removeUsers: [] }[] =
          data.changeGroups || [];
        groups.forEach(({ groupUuid, addUsers, removeUsers }) => {
          if (addUsers.length) {
            EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.UserJoinGroup, {
              groupUuid,
              users: addUsers.map(({ userUuid }) => userUuid),
            });
          }
          if (removeUsers.length) {
            EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.UserLeaveGroup, {
              groupUuid,
              users: removeUsers.map(({ userUuid }) => userUuid),
            });
          }
        });
      }
    }
  }

  private _getProgress(processes: any) {
    const progress = Object.keys(processes).reduce((prev, k) => {
      if (k.startsWith(GroupStore.CMD_PROCESS_PREFIX)) {
        const groupUuid = k.substring(GroupStore.CMD_PROCESS_PREFIX.length);
        const users = processes[k].progress.map(({ userUuid }: { userUuid: string }) => userUuid);
        prev.set(groupUuid, users);
      }
      return prev;
    }, new Map<string, string[]>());

    return progress;
  }

  @action.bound
  private _setDetails(details: GroupDetails, progress: Map<string, string[]>) {
    const newGroupDetails = new Map<string, GroupDetail>();
    const cloneDetails = cloneDeep(details);
    Object.entries(cloneDetails).forEach(([groupUuid, groupDetail]) => {
      if (progress.has(groupUuid)) {
        const notJoinedUsers =
          progress
            .get(groupUuid)
            ?.map((userUuid) => ({ userUuid, notJoined: true } as GroupUser)) || [];

        groupDetail.users.unshift(...notJoinedUsers);
      }

      newGroupDetails.set(groupUuid, groupDetail);
    });
    this.groupDetails = newGroupDetails;
  }

  private _checkSubRoom() {
    const { userUuid: localUuid } = EduClassroomConfig.shared.sessionInfo;

    let lastGroupUuid = '';
    for (const [groupUuid, group] of this.groupDetails.entries()) {
      const local = group.users.find(
        ({ userUuid, notJoined }) => userUuid === localUuid && !notJoined,
      );
      if (local) {
        lastGroupUuid = groupUuid;
        break;
      }
    }

    if (lastGroupUuid) {
      if (this._currentGroupUuid && lastGroupUuid !== this._currentGroupUuid) {
        this.operationQueue.push({
          fromGroupUuid: this._currentGroupUuid,
          toGroupUuid: lastGroupUuid,
          type: OperationType.Move,
        });
      } else if (!this._currentGroupUuid) {
        this.operationQueue.push({
          toGroupUuid: lastGroupUuid,
          type: OperationType.Join,
        });
      }
    } else {
      if (this._currentGroupUuid) {
        this.operationQueue.push({
          fromGroupUuid: this._currentGroupUuid,
          type: OperationType.Leave,
        });
      }
    }

    setTimeout(this._run);
  }

  /**
   * 添加分组
   * @param groupDetail 创建分组信息
   * @param inProgress 是否邀请
   */
  @bound
  async addGroups(groupDetails: GroupDetail[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;

    await this.api.addGroup(roomUuid, { groups: groupDetails, inProgress: true });
  }

  /**
   * 移除分组
   * @param groups 子房间 Id 列表
   */
  @bound
  async removeGroups(groups: string[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.removeGroup(roomUuid, { removeGroupUuids: groups });
  }

  /**
   * 更新分组信息
   * @param groups
   */
  @bound
  async updateGroupInfo(groups: PatchGroup[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.updateGroupInfo(roomUuid, {
      groups,
    });
  }

  /**
   * 开启分组
   * @param groupDetails
   */
  @bound
  async startGroup(groupDetails: GroupDetail[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.updateGroupState(
      roomUuid,
      {
        groups: groupDetails,
        inProgress: true,
      },
      GroupState.OPEN,
    );
  }

  /**
   * 关闭分组
   */
  @bound
  async stopGroup() {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.updateGroupState(roomUuid, { groups: [] }, GroupState.CLOSE);
  }

  /**
   * 更新分组成员列表
   * @param groupUuid
   * @param addUsers
   * @param removeUsers
   */
  @bound
  async updateGroupUsers(patches: PatchGroup[], sendInvitation: boolean = false) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.updateGroupUsers(roomUuid, { groups: patches, inProgress: sendInvitation });
    if (sendInvitation) {
      this._inviting = true;
    }
  }

  /**
   * 从分组移除用户
   * @param fromGroupUuid
   * @param users
   */
  @bound
  async removeGroupUsers(fromGroupUuid: string, users: string[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    let fromGroup = { groupUuid: fromGroupUuid, removeUsers: users };
    await this.api.updateGroupUsers(roomUuid, { groups: [fromGroup], inProgress: false });
  }

  /**
   * 将用户移入子房间
   * @param fromGroupUuid
   * @param toGroupUuid
   * @param users
   */
  @bound
  async moveUsersToGroup(fromGroupUuid: string, toGroupUuid: string, users: string[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    const fromGroup = { groupUuid: fromGroupUuid, removeUsers: users };
    const toGroup = { groupUuid: toGroupUuid, addUsers: users };
    const groups = [fromGroup, toGroup];
    await this.api.updateGroupUsers(roomUuid, { groups, inProgress: false });
  }

  /**
   * 接受邀请加入到小组
   * @param groupUuid
   */
  @bound
  async acceptGroupInvited(groupUuid: string) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.acceptGroupInvited(roomUuid, groupUuid);
  }

  @bound
  async rejectGroupInvited(groupUuid: string) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.rejectGroupInvited(roomUuid, groupUuid);
  }

  /**
   * 进入房间
   * @param groupUuid
   */
  @bound
  joinSubRoom(groupUuid: string) {
    this._currentGroupUuid = groupUuid;

    EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.JoinSubRoom);
  }

  /**
   *
   * 用户移动入房间
   * @param fromGroupUuid
   * @param toGroupUuid
   */
  @bound
  moveIntoSubRoom(fromGroupUuid: string, toGroupUuid: string) {
    this._currentGroupUuid = toGroupUuid;

    EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.MoveToOtherGroup, {
      fromGroupUuid,
      toGroupUuid,
    });
  }

  @bound
  leaveSubRoom() {
    if (this._currentGroupUuid) {
      this._currentGroupUuid = undefined;

      EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.LeaveSubRoom);
    }
  }

  @bound
  broadcastMessage(messageText: string) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    try {
      this.api.broadcastMessage(roomUuid, {
        range: BroadcastMessageRange.All,
        type: BroadcastMessageType.Text,
        msg: messageText,
      });
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_GROUP_BROADCAST_FAIL,
        e as Error,
      );
    }
  }

  /**
   * 执行队列任务
   * @returns
   */
  @action.bound
  private async _run() {
    const operation = this.operationQueue.pop();

    if (!operation) {
      return;
    }

    switch (operation.type) {
      case OperationType.Join:
        this.joinSubRoom(operation.toGroupUuid!);
        break;
      case OperationType.Leave:
        this.leaveSubRoom();
        break;
      case OperationType.Move:
        this.moveIntoSubRoom(operation.fromGroupUuid!, operation.toGroupUuid!);
        break;
    }
  }

  /**
   * 是否发送邀请
   */
  get inviting() {
    return this._inviting;
  }

  /**
   * 当前所在子房间
   */
  get currentSubRoom() {
    return this._currentGroupUuid;
  }

  /**
   * 用户所在组ID映射关系
   */
  @computed
  get groupUuidByUserUuid() {
    const map: Map<string, string> = new Map();

    this.groupDetails.forEach((group, groupUuid) => {
      group.users.forEach(({ userUuid, notJoined }) => {
        if (!notJoined) {
          map.set(userUuid, groupUuid);
        }
      });
    });

    return map;
  }

  /**
   * 组内用户数据
   */
  @computed
  get userByUuid() {
    const map: Map<string, GroupUser> = new Map();

    this.groupDetails.forEach((group) => {
      group.users.forEach((user) => {
        map.set(user.userUuid, user);
      });
    });

    return map;
  }

  //others
  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  private _removeEventHandlers(scene: AgoraRteScene) {
    scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  /** Hooks */
  onInstall() {
    computed(() => this.classroomStore.connectionStore.mainRoomScene).observe(
      ({ newValue, oldValue }) => {
        if (oldValue) {
          this._removeEventHandlers(oldValue);
        }
        if (newValue) {
          //bind events
          this._addEventHandlers(newValue);
        }
      },
    );
  }

  onDestroy() {}
}
