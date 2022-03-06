import { AgoraRteEventType } from 'agora-rte-sdk';
import get from 'lodash/get';
import { action, computed, observable, reaction } from 'mobx';
import { EduClassroomConfig } from '../../../..';
import { EduSessionInfo } from '../../../../type';
import { EduStoreBase } from '../base';
import { SubRoomStore } from '../sub-room';
import { EduGroupDetail, EduSubRoomConfig, groupUser } from './struct';
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
  /** Observables */
  // @observable
  // subRoomList: WeakMap<any, SubRoomStore> = new WeakMap<any, SubRoomStore>()

  MAX_GROUP_COUNT = 20; // 最大分组数量
  MIN_GROUP_COUNT = 2;
  MAX_PER_GROUP_PERSON = 15; // 单组最大人数

  @observable
  state: GroupState = GroupState.CLOSE;

  @observable
  groupDetails: Map<string, EduGroupDetail> = new Map<string, EduGroupDetail>();

  @observable
  parentRoomUuid: string = ''; // 主房间id，如果不为空，则表示是小组，小房间才有

  get api() {
    return this.classroomStore.api;
  }

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
        this.setDetails(groupsDetail.details);
      }
    });
  }

  @action.bound
  setDetails(details: GroupDetails) {
    Object.entries(details).forEach(([groupUuid, groupDetail]: [string, EduGroupDetail]) => {
      this.groupDetails.set(groupUuid, groupDetail);
    });
  }

  // 获取分组信息
  @computed
  get getGroupInfo() {
    return {
      state: this.state,
    };
  }

  /**
   * 分组数量显示 MAX_GROUP_COUNT
   * 通过 groups.state 先判断是否开启 group，如果未开启请求后台的 "开启/关闭分组" 接口；如果开启了，请求后台的 "新增组" 接口
   * @param configList
   * @param inProgress 是否需要发送要求信息
   */
  addSubRoomList(configList: EduSubRoomConfig[], inProgress: boolean) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    const groupList = configList.map((value: EduSubRoomConfig) => {
      return new EduGroupDetail(value.subRoomName, value.invitationUserList);
    });
    if (this.state) {
      this.classroomStore.api.addRoomList(roomUuid, { groups: groupList, inProgress });
    } else {
      return this.classroomStore.api.addSubRoomList(roomUuid, GroupState.OPEN, {
        groups: groupList,
        inProgress,
      });
    }
  }

  /**
   * 关闭分组
   */
  stopGroup() {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    this.classroomStore.api.addSubRoomList(roomUuid, GroupState.CLOSE, {});
  }

  // 移除子房间
  /**
   *
   * @param subRoomList 子房间 Id 列表
   */
  removeSubRoomList(subRoomList: string[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    return this.classroomStore.api.removeSubRoom(roomUuid, { removeGroupUuids: subRoomList });
  }

  /**
   * 移除所有子房间
   * 关闭分组状态
   */
  removeAllSubRoomList() {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    return this.classroomStore.api.addSubRoomList(roomUuid, GroupState.CLOSE, {});
  }

  /**
   * 获取子房间列表
   */
  @computed
  get getSubRoomList() {
    return Object.entries(this.groupDetails).map(
      ([groupUuid, groupDetail]: [string, EduGroupDetail]) => ({
        subRoomUuid: groupUuid,
        subRoomName: groupDetail.groupName,
      }),
    );
  }

  /**
   * 创建子房间对象，由外界管理该对象的生命周期
   */
  createSubRoomObject(subRoomUuid: string) {
    let sessionInfo = EduClassroomConfig.shared.sessionInfo;
    let subRoomSeesionInfo: EduSessionInfo = sessionInfo;
    subRoomSeesionInfo.roomUuid = subRoomUuid;
    return new SubRoomStore(this, subRoomSeesionInfo);
  }

  /**
   * 获取子房间对象
   */
  getUserListFromSubRoom(subRoomUuid: string) {}

  /**
   * 邀请用户从主房间加入子房间
   */
  inviteUserListToSubRoom(toGroupUuid: string, userList: groupUser[]) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    return this._moveUserListToSubRoom(roomUuid, toGroupUuid, userList, userList, true);
  }

  /**
   * 将用户移入子房间，跳过邀请步骤
   */
  addUserListToSubRoom(
    fromGroupUuid: string,
    toGroupUuid: string,
    fromUserList: groupUser[],
    toUserList: groupUser[],
  ) {
    return this._moveUserListToSubRoom(fromGroupUuid, toGroupUuid, fromUserList, toUserList, false);
  }
  /**
   * 用户接受邀请进入子房间
   */
  // userListAcceptInvitationToSubRoom() {

  // }

  /**
   * 将用户从子房间里移除
   */
  userListRemoveFromSubRoom() {}

  /**
   * 将用户从原来的子房间里移动到目标的子房间
   * @param fromGroupUuid 原小组
   * @param toGroupUuid 目标小组
   * @param fromUserList 原小组用户列表
   * @param toUserList 目标小组用户列表
   * @param userList 用户列表
   * @param inProgress 是否需要邀请
   */
  private _moveUserListToSubRoom(
    fromGroupUuid: string,
    toGroupUuid: string,
    fromUserList: groupUser[],
    toUserList: groupUser[],
    inProgress: boolean,
  ) {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    let fromGroup = { groupUuid: fromGroupUuid, removeUser: fromUserList };
    let toGroup = { groupUuid: toGroupUuid, addUsers: toUserList };
    let groups = [fromGroup, toGroup];
    return this.classroomStore.api.updateSubRoomUsers(roomUuid, { groups, inProgress });
  }

  /**
   * 接受邀请加入到小组
   */
  acceptSubRoomInvited = (groupUuid: string) => {
    const roomUuid = EduClassroomConfig.shared.sessionInfo.roomUuid;
    return this.classroomStore.api.acceptSubRoomInvited(roomUuid, groupUuid);
  };

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
