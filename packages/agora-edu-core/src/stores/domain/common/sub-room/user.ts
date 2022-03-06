import { AgoraRteEventType, AgoraRteScene, AgoraUser } from 'agora-rte-sdk';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { SubRoomStore } from '.';
import {
  AgoraEduClassroomEvent,
  EduEventCenter,
  EduRoleTypeEnum,
  RteRole2EduRole,
} from '../../../..';
import { EduUser } from '../user/struct';
import { EduSubRoomSessionInfo } from './struct';

// for users
export class UserStoreEach {
  //observes
  @observable users: Map<string, EduUser> = new Map<string, EduUser>();

  @observable teacherList: Map<string, EduUser> = new Map<string, EduUser>();

  @observable studentList: Map<string, EduUser> = new Map<string, EduUser>();

  @observable assistantList: Map<string, EduUser> = new Map<string, EduUser>();

  @observable
  rewards: Map<string, number> = new Map<string, number>();

  @observable
  private _localUser?: EduUser;

  subRoomStore: SubRoomStore;

  constructor(store: SubRoomStore) {
    this.subRoomStore = store;

    reaction(
      () => this.subRoomStore.scene,
      (scene) => {
        scene && this._addEventHandlers(scene);
      },
    );

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

  //others
  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.UserAdded, (users: AgoraUser[]) => {
      const sessionInfo = this.subRoomStore.subRoomSeesionInfo;
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

          const reward = user.userProperties.get('reward');
          if (reward) {
            this.rewards.set(user.userUuid, reward.count || 0);
          }
        });
      });
    });
    scene.on(AgoraRteEventType.UserRemoved, (users: AgoraUser[], type: number) => {
      const sessionInfo = this.subRoomStore.subRoomSeesionInfo;
      runInAction(() => {
        users.forEach((user) => {
          const userRole = RteRole2EduRole(0, user.userRole); //
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
    });
    scene.on(AgoraRteEventType.UserUpdated, (users: AgoraUser[]) => {
      const sessionInfo = this.subRoomStore.subRoomSeesionInfo;
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
    });

    scene.on(
      AgoraRteEventType.UserPropertyUpdated,
      (userUuid: string, userProperties: any, operator: any, cause: any) => {
        const { reward } = userProperties;
        if (reward) {
          runInAction(() => {
            const newRewards = new Map(this.rewards);
            newRewards.set(userUuid, reward.count || 0);
            this.rewards = newRewards;
          });
        }
      },
    );

    scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
  }

  @computed
  get localUser() {
    return this._localUser;
  }
}
