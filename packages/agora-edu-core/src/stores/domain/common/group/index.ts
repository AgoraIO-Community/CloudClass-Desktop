import { AgoraRteEventType, AgoraRteScene } from 'agora-rte-sdk';
import { startsWith } from 'lodash';
import get from 'lodash/get';
import { action, computed, observable } from 'mobx';
import { EduClassroomConfig } from '../../../../configs';
import { EduEventCenter } from '../../../../event-center';
import { AgoraEduClassroomEvent } from '../../../../type';
import { EduStoreBase } from '../base';
import { GroupDetail, PatchGroup } from './type';
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

    if (cause) {
      const { cmd, data } = cause;
      // Emit event when local user is invited by teacher
      if (cmd === 501 && startsWith(data.processUuid, GroupStore.CMD_PROCESS_PREFIX)) {
        const groupUuid = data.processUuid.substring(GroupStore.CMD_PROCESS_PREFIX);
        const progress = (data.addProgress as { userUuid: string; ts: number }[]) || [];
        const accepted = (data.addAccepted as { userUuid: string }[]) || [];
        const actionType = data.actionType as number;
        const { userUuid: localUuid } = EduClassroomConfig.shared.sessionInfo;

        const invitedLocal = progress.some(({ userUuid }) => userUuid === localUuid);

        if (invitedLocal) {
          EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.InvitedToGroup, {
            groupUuid,
          });
        }

        if (actionType === 2 && accepted?.length) {
          EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.AcceptedToGroup, {
            groupUuid,
            accepted,
          });
        }
      }
    }
  }

  @action.bound
  private _setDetails(details: GroupDetails) {
    const newGroupDetails = new Map<string, GroupDetail>();
    Object.entries(details).forEach(([groupUuid, groupDetail]) => {
      newGroupDetails.set(groupUuid, groupDetail);
    });
    this.groupDetails = newGroupDetails;
  }

  private _checkSubRoom() {
    const { userUuid: localUuid } = EduClassroomConfig.shared.sessionInfo;

    for (const [groupUuid, group] of this.groupDetails.entries()) {
      const local = group.users.find(({ userUuid }) => userUuid === localUuid);
      const notInSubRoom = local && groupUuid !== this._currentGroupUuid;

      if (notInSubRoom) {
        this.joinSubRoom(groupUuid);
      }
    }
  }

  /**
   * 添加分组
   * @param groupDetail 创建分组信息
   * @param inProgress 是否邀请
   */
  async addGroups(groupDetails: GroupDetail[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;

    await this.api.addGroup(roomUuid, { groups: groupDetails, inProgress: false });
  }

  /**
   * 移除分组
   * @param groups 子房间 Id 列表
   */
  async removeGroups(groups: string[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.removeGroup(roomUuid, { removeGroupUuids: groups });
  }

  /**
   * 开启分组
   * @param groupDetails
   */
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
  async stopGroup() {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.updateGroupState(roomUuid, { groups: [] }, GroupState.CLOSE);
  }

  /**
   * 进入房间
   */
  joinSubRoom(groupUuid: string) {
    this._currentGroupUuid = groupUuid;

    EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.JoinSubRoom);
  }

  /**
   * 离开子房间
   */
  async leaveSubRoom() {
    if (this._currentGroupUuid) {
      await this.updateGroupUsers([
        {
          groupUuid: this._currentGroupUuid,
          removeUsers: [EduClassroomConfig.shared.sessionInfo.userUuid],
        },
      ]);

      this._currentGroupUuid = undefined;

      EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.LeaveSubRoom);
    }
  }

  /**
   * 邀请用户从主房间加入子房间
   */
  async inviteUserListToGroup(toGroupUuid: string, userList: string[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this._moveUserListToGroup(roomUuid, toGroupUuid, userList, true);
  }

  /**
   * 更新分组成员列表
   * @param groupUuid
   * @param addUsers
   * @param removeUsers
   */
  async updateGroupUsers(patches: PatchGroup[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.updateGroupUsers(roomUuid, { groups: patches, inProgress: false });
  }

  /**
   * 将用户移入子房间，跳过邀请步骤
   */
  async addUserListToGroup(fromGroupUuid: string, toGroupUuid: string, userList: string[]) {
    await this._moveUserListToGroup(fromGroupUuid, toGroupUuid, userList, false);
  }

  /**
   * 将用户从原来的子房间里移动到目标的子房间
   * @param fromGroupUuid 原小组
   * @param toGroupUuid 目标小组
   * @param userList 原小组用户列表
   * @param userList 用户列表
   * @param inProgress 是否需要邀请
   */
  private async _moveUserListToGroup(
    fromGroupUuid: string,
    toGroupUuid: string,
    userList: string[],
    inProgress: boolean,
  ) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    let fromGroup = { groupUuid: fromGroupUuid, removeUsers: userList };
    let toGroup = { groupUuid: toGroupUuid, addUsers: userList };
    let groups = [fromGroup, toGroup];
    await this.api.updateGroupUsers(roomUuid, { groups, inProgress });
  }

  /**
   * 接受邀请加入到小组
   */
  async acceptGroupInvited(groupUuid: string) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.acceptGroupInvited(roomUuid, groupUuid);
  }

  /**
   * 更新分组信息
   * @param groups
   */
  async updateGroupInfo(groups: PatchGroup[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    await this.api.updateGroupInfo(roomUuid, {
      groups,
    });
  }

  /**
   * 当前所在子房间
   */
  get currentSubRoom() {
    return this._currentGroupUuid;
  }

  //others
  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  private _removeEventHandlers(scene: AgoraRteScene) {
    scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  @action
  private _resetData() {}

  /** Hooks */
  onInstall() {
    computed(() => this.classroomStore.connectionStore.mainRoomScene).observe(
      ({ newValue, oldValue }) => {
        if (oldValue) {
          this._removeEventHandlers(oldValue);
        }
        if (newValue) {
          this._resetData();
          //bind events
          this._addEventHandlers(newValue);
        }
      },
    );
  }

  onDestroy() {}
}
