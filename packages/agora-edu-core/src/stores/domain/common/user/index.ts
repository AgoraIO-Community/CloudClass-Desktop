import { AgoraRteEventType, AgoraRteScene, AgoraUser } from 'agora-rte-sdk';
import { observable, reaction, runInAction, action, computed } from 'mobx';
import { EduStoreBase } from '../base';
import { EduUser } from './struct';
import { EduClassroomConfig, EduEventCenter } from '../../../..';
import { AgoraEduInteractionEvent, EduRoleTypeEnum } from '../../../../type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { RteRole2EduRole } from '../../../../utils';

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
  get localUser(): EduUser {
    if (!this._localUser) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_LOCAL_USER_INFO_NOT_READY,
        new Error(`localUser is undefined, not logged in?`),
      );
    }
    return this._localUser;
  }

  @action.bound
  async kickOutOnceOrBan(userUuid: string, isBan: boolean) {
    try {
      const { sessionInfo } = EduClassroomConfig.shared;
      await this.classroomStore.api.kickOutOnceOrBan(userUuid, isBan, sessionInfo.roomUuid);
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

  //others
  private _addEventHandlers(scene: AgoraRteScene) {
    scene.on(AgoraRteEventType.UserAdded, (users: AgoraUser[]) => {
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

          const reward = user.userProperties.get('reward');
          if (reward) {
            this.rewards.set(user.userUuid, reward.count || 0);
          }
        });
      });
    });
    scene.on(AgoraRteEventType.UserRemoved, (users: AgoraUser[], type: number) => {
      const { sessionInfo } = EduClassroomConfig.shared;
      runInAction(() => {
        users.forEach((user) => {
          const userRole = RteRole2EduRole(sessionInfo.roomType, user.userRole);
          if (user.userUuid === sessionInfo.userUuid) {
            this._localUser = undefined;
            // 2 means user has been kicked out
            if (type === 2) {
              EduEventCenter.shared.emitInteractionEvents(AgoraEduInteractionEvent.KickOut);
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

  onInstall() {
    reaction(
      () => this.classroomStore.connectionStore.scene,
      (scene) => {
        if (scene) {
          //bind events
          this._addEventHandlers(scene);
        } else {
          //clean up
        }
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
        EduEventCenter.shared.emitInteractionEvents(
          AgoraEduInteractionEvent.RewardReceived,
          userNames.join(','),
        );
      }
    });
  }
  onDestroy() {}
}
