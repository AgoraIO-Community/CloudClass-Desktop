import { AgoraRteEventType, AgoraRteScene, AgoraUser } from 'agora-rte-sdk';
import { observable, runInAction, action, computed } from 'mobx';
import { EduStoreBase } from '../base';
import { EduUser } from './struct';
import { EduClassroomConfig, EduEventCenter } from '../../../..';
import { AgoraEduClassroomEvent, EduRoleTypeEnum } from '../../../../type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { RteRole2EduRole } from '../../../../utils';
import { FetchUserParam } from './type';

//for users
export class UserStore extends EduStoreBase {
  //observes
  @observable users: Map<string, EduUser> = new Map<string, EduUser>();

  @observable teacherList: Map<string, EduUser> = new Map<string, EduUser>();

  @observable studentList: Map<string, EduUser> = new Map<string, EduUser>();

  @observable assistantList: Map<string, EduUser> = new Map<string, EduUser>();

  @observable
  rewards: Map<string, number> = new Map<string, number>();

  @observable
  private _localUser?: EduUser;

  @computed
  get localUser() {
    return this._localUser;
  }

  async fetchUserList(params: FetchUserParam) {
    try {
      const data = await this.classroomStore.api.fetchUserList(
        this.classroomStore.connectionStore.sceneId,
        {
          ...params,
        },
      );
      return {
        total: data.total,
        count: data.count,
        nextId: data.nextId,
        list: data.list,
      };
    } catch (error) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_FETCH_USER_LIST,
        error as Error,
      );
    }
  }

  @action.bound
  async kickOutOnceOrBan(userUuid: string, isBan: boolean) {
    try {
      await this.classroomStore.api.kickOutOnceOrBan(
        userUuid,
        isBan,
        this.classroomStore.connectionStore.sceneId,
      );
    } catch (error) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_KICK_OUT_FAIL,
        error as Error,
      );
    }
  }

  @action.bound
  private _handleRoomPropertiesChange(changedRoomProperties: string[], roomProperties: any) {
    if (changedRoomProperties.includes('students')) {
      this.rewards = new Map(
        Object.entries(roomProperties['students']).map(([userUuid, { reward }]: any) => {
          return [userUuid, reward];
        }),
      );
    }
  }

  @action.bound
  private _addUsers(users: AgoraUser[]) {
    const { sessionInfo } = EduClassroomConfig.shared;
    users.forEach((user) => {
      let userItem = new EduUser(user);
      if (userItem.userUuid === sessionInfo.userUuid) {
        this._localUser = userItem;
      }
      if (userItem.userRole === EduRoleTypeEnum.teacher) {
        this.teacherList.set(user.userUuid, userItem);
      }
      if (userItem.userRole === EduRoleTypeEnum.student) {
        this.studentList.set(user.userUuid, userItem);
      }
      if (userItem.userRole === EduRoleTypeEnum.assistant) {
        this.assistantList.set(user.userUuid, userItem);
      }
      this.users.set(user.userUuid, userItem);

      const reward = user.userProperties.get('reward');
      if (reward) {
        this.rewards.set(user.userUuid, reward.count || 0);
      }
    });
  }

  @action.bound
  private _removeUsers(users: AgoraUser[], type: number) {
    const { sessionInfo } = EduClassroomConfig.shared;
    runInAction(() => {
      users.forEach((user) => {
        const userRole = RteRole2EduRole(sessionInfo.roomType, user.userRole);
        if (user.userUuid === sessionInfo.userUuid) {
          this._localUser = undefined;
          // 2 means user has been kicked out
          if (type === 2) {
            EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.KickOut);
            return;
          }
        }
        if (userRole === EduRoleTypeEnum.teacher) {
          this.teacherList.delete(user.userUuid);
        }
        if (userRole === EduRoleTypeEnum.student) {
          this.studentList.delete(user.userUuid);
        }
        if (userRole === EduRoleTypeEnum.assistant) {
          this.assistantList.delete(user.userUuid);
        }
        this.users.delete(user.userUuid);
      });
    });
  }

  @action.bound
  private _updateUsers(users: AgoraUser[]) {
    const { sessionInfo } = EduClassroomConfig.shared;
    runInAction(() => {
      users.forEach((user) => {
        let userItem = new EduUser(user);
        if (userItem.userUuid === sessionInfo.userUuid) {
          this._localUser = userItem;
        }
        if (userItem.userRole === EduRoleTypeEnum.teacher) {
          this.teacherList.set(user.userUuid, userItem);
        }
        if (userItem.userRole === EduRoleTypeEnum.student) {
          this.studentList.set(user.userUuid, userItem);
        }
        if (userItem.userRole === EduRoleTypeEnum.assistant) {
          this.assistantList.set(user.userUuid, userItem);
        }
        this.users.set(user.userUuid, userItem);
      });
    });
  }

  @action.bound
  private _updateUserProperties(userUuid: string, userProperties: any, operator: any, cause: any) {
    const { reward } = userProperties;
    if (reward) {
      runInAction(() => {
        const newRewards = new Map(this.rewards);
        newRewards.set(userUuid, reward.count || 0);
        this.rewards = newRewards;
      });
    }
  }

  //others
  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.UserAdded, this._addUsers);
    scene.on(AgoraRteEventType.UserRemoved, this._removeUsers);
    scene.on(AgoraRteEventType.UserUpdated, this._updateUsers);
    scene.on(AgoraRteEventType.UserPropertyUpdated, this._updateUserProperties);
    scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  private _removeEventHandlers(scene: AgoraRteScene) {
    scene.off(AgoraRteEventType.UserAdded, this._addUsers);
    scene.off(AgoraRteEventType.UserRemoved, this._removeUsers);
    scene.off(AgoraRteEventType.UserUpdated, this._updateUsers);
    scene.off(AgoraRteEventType.UserPropertyUpdated, this._updateUserProperties);
    scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  @action
  private _resetData() {
    this.users = new Map();
    this.teacherList = new Map();
    this.studentList = new Map();
    this.assistantList = new Map();
    this.rewards = new Map();
    this._localUser = undefined;
  }

  onInstall() {
    computed(() => this.classroomStore.connectionStore.scene).observe(({ newValue, oldValue }) => {
      if (oldValue) {
        this._removeEventHandlers(oldValue);
      }
      if (newValue) {
        this._resetData();
        //bind events
        this._addEventHandlers(newValue);
      }
    });

    computed(() => this.rewards).observe(({ newValue, oldValue }) => {
      let changedUserUuids: string[] = [];
      for (const [userUuid] of newValue) {
        let previousReward = 0;
        if (oldValue) {
          previousReward = oldValue.get(userUuid) || 0;
        }
        let reward = newValue.get(userUuid) || 0;
        if (reward > previousReward) {
          changedUserUuids.push(userUuid);
        }
      }
      if (changedUserUuids.length > 0) {
        const userNames = changedUserUuids.map(
          (userUuid) => this.studentList.get(userUuid)?.userName,
        );
        EduEventCenter.shared.emitClasroomEvents(
          AgoraEduClassroomEvent.RewardReceived,
          userNames.join(','),
        );
      }
    });
  }
  onDestroy() {}
}
