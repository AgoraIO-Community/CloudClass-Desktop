import { AgoraRteEventType } from 'agora-rte-sdk';
import { startsWith } from 'lodash';
import get from 'lodash/get';
import { action, observable, reaction } from 'mobx';
import { EduClassroomConfig } from '../../../..';
import { EduEventCenter } from '../../../../event-center';
import { AgoraEduClassroomEvent } from '../../../../type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';
import { SubRoomStore } from '../sub-room';
import { GroupDetail, GroupUser, PatchGroup } from './type';
import { GroupDetails, GroupState } from './type';

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

  private _subRooms: Map<string, SubRoomStore> = new Map();

  @observable
  state: GroupState = GroupState.CLOSE;

  @observable
  groupDetails: Map<string, GroupDetail> = new Map();

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
        const groupsDetail = get(roomProperties, 'groups', {});
        this.state = groupsDetail.state;
        this._setDetails(groupsDetail.details);
        this._checkSubRoom();
      }
    });

    const { cmd, data } = cause;

    // Emit event when local user is invited by teacher
    if (cmd === 501 && startsWith(data.processUuid, GroupStore.CMD_PROCESS_PREFIX)) {
      const groupUuid = data.processUuid.substring(GroupStore.CMD_PROCESS_PREFIX);
      const progress = data.addProgress as { userUuid: string; ts: number }[];
      const { userUuid: localUuid } = EduClassroomConfig.shared.sessionInfo;

      const invitedLocal = progress.some(({ userUuid }) => userUuid === localUuid);

      if (invitedLocal) {
        EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.InvitedToGroup, {
          groupUuid,
        });
      }
    }
  }

  @action.bound
  private _setDetails(details: GroupDetails) {
    Object.entries(details).forEach(([groupUuid, groupDetail]) => {
      this.groupDetails.set(groupUuid, groupDetail);
    });
  }

  private _checkSubRoom() {
    const { userUuid: localUuid } = EduClassroomConfig.shared.sessionInfo;

    for (const [groupUuid, group] of this.groupDetails.entries()) {
      const local = group.users.find(({ userUuid }) => userUuid === localUuid);
      const notInSubRoom = local && !this._subRooms.has(groupUuid);

      if (notInSubRoom) {
        this._entrySubRoom(groupUuid);
      }
    }
  }

  /**
   * 添加分组
   * @param groupDetail 创建分组信息
   * @param inProgress 是否邀请
   */
  async addGroups(groupDetails: GroupDetail[], inProgress: boolean) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;

    await this.classroomStore.api.updateGroupState(roomUuid, {
      groups: groupDetails,
      inProgress,
    });
  }

  /**
   * 关闭分组
   */
  async stopGroup() {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.classroomStore.api.updateGroupState(roomUuid, {}, GroupState.CLOSE);
  }

  /**
   * 移除子房间
   * @param groups 子房间 Id 列表
   */
  async removeGroups(groups: string[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.classroomStore.api.removeGroup(roomUuid, { removeGroupUuids: groups });
  }

  /**
   * 移除所有子房间
   * 关闭分组状态
   */
  async removeAllGroups() {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.classroomStore.api.updateGroupState(roomUuid, {}, GroupState.CLOSE);
  }

  /**
   * 进入房间
   */
  private _entrySubRoom(groupUuid: string) {
    let sessionInfo = EduClassroomConfig.shared.sessionInfo;

    this._subRooms.set(
      groupUuid,
      new SubRoomStore(this, {
        ...sessionInfo,
        roomUuid: groupUuid,
      }),
    );

    this._currentGroupUuid = groupUuid;
  }

  async leaveSubRoom() {
    if (this._currentGroupUuid) {
      const subRoom = this._subRooms.get(this._currentGroupUuid);

      await subRoom?.leaveSubRoom();
    }
  }

  /**
   * 邀请用户从主房间加入子房间
   */
  async inviteUserListToGroup(toGroupUuid: string, userList: GroupUser[], invite: boolean = true) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this._moveUserListToGroup(roomUuid, toGroupUuid, userList, userList, invite);
  }

  /**
   * 将用户移入子房间，跳过邀请步骤
   */
  async addUserListToGroup(
    fromGroupUuid: string,
    toGroupUuid: string,
    fromUserList: GroupUser[],
    toUserList: GroupUser[],
  ) {
    await this._moveUserListToGroup(fromGroupUuid, toGroupUuid, fromUserList, toUserList, false);
  }

  /**
   * 移除子房间
   * @param groupUuid
   * @param userList
   * @returns
   */
  async removeUserListFromGroup(groupUuid: string, userList: GroupUser[]) {
    const fromGroup = { groupUuid, removeUser: userList };

    await this.classroomStore.api.updateGroupUsers(groupUuid, {
      groups: [fromGroup],
      inProgress: false,
    });
  }

  /**
   * 将用户从原来的子房间里移动到目标的子房间
   * @param fromGroupUuid 原小组
   * @param toGroupUuid 目标小组
   * @param fromUserList 原小组用户列表
   * @param toUserList 目标小组用户列表
   * @param userList 用户列表
   * @param inProgress 是否需要邀请
   */
  private async _moveUserListToGroup(
    fromGroupUuid: string,
    toGroupUuid: string,
    fromUserList: GroupUser[],
    toUserList: GroupUser[],
    inProgress: boolean,
  ) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    let fromGroup = { groupUuid: fromGroupUuid, removeUser: fromUserList };
    let toGroup = { groupUuid: toGroupUuid, addUsers: toUserList };
    let groups = [fromGroup, toGroup];
    await this.classroomStore.api.updateGroupUsers(roomUuid, { groups, inProgress });
  }

  /**
   * 接受邀请加入到小组
   */
  async acceptGroupInvited(groupUuid: string) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.classroomStore.api.acceptGroupInvited(roomUuid, groupUuid);
  }

  /**
   * 更新分组信息
   * @param groups
   */
  async updateGroupInfo(groups: PatchGroup[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.classroomStore.api.updateGroupInfo(roomUuid, {
      groups,
    });
  }

  /** Hooks */
  onInstall() {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        scene && scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
      },
    );
  }

  onDestroy() {}
}
