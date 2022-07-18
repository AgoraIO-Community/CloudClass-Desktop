import { observable, action, computed, runInAction, reaction } from 'mobx';
import { FetchUserParam, FetchUserType, EduRoleTypeEnum } from 'agora-edu-core';
import {
  AgoraRteMediaSourceState,
  AgoraRteMediaPublishState,
  Lodash,
  AGError,
} from 'agora-rte-sdk';
import { RosterUIStore } from '../common/roster';
import { DeviceState, Operations, Profile } from '../common/roster/type';
import { DialogCategory } from '../common/share-ui';
import { BoardGrantState } from '~ui-kit';

export class LectureRosterUIStore extends RosterUIStore {
  get uiOverrides() {
    return { ...super.uiOverrides, width: 400 };
  }

  /**
   * 查询下一页的参数
   */
  get fetchUsersListParams() {
    return {
      nextId: this._usersNextPageId,
      count: 10,
      type: FetchUserType.all,
      role: EduRoleTypeEnum.student,
    };
  }

  /**
   * 查询下一页的ID
   */
  @observable
  private _usersNextPageId: number | string | undefined = 0;

  /**
   * 分页查询到的用户列表
   */
  @observable
  private _usersList = [];

  /**
   * 获取下一页的用户列表
   */
  @Lodash.debounced(300, { trailing: true })
  fetchNextUsersList(override?: Partial<FetchUserParam>, reset?: boolean) {
    const params = {
      ...this.fetchUsersListParams,
      ...override,
    };
    this.classroomStore.userStore
      .fetchUserList({
        ...params,
        userName: this.searchKeyword,
      })
      .then((data) => {
        runInAction(() => {
          this._usersNextPageId = data.nextId;
          this._usersList = (reset ? [] : this._usersList).concat(data.list);
        });
      })
      .catch((e) => {
        this.shareUIStore.addGenericErrorDialog(e);
      });
  }

  /**
   * 重置用户列表及查询条件
   */
  @action.bound
  resetUsersList() {
    this._usersList = [];
    this.setKeyword('');
    this._usersNextPageId = 0;
  }

  clickKick = (profile: Profile) => {
    const { addDialog, addGenericErrorDialog } = this.shareUIStore;

    const { kickOutOnceOrBan } = this.classroomStore.userStore;
    const onOk = async (ban: boolean) => {
      try {
        await kickOutOnceOrBan(profile.uid as string, ban);
        runInAction(() => {
          this._usersList = this._usersList.filter((it: any) => it.userUuid !== profile.uid);
        });
      } catch (e) {
        addGenericErrorDialog(e as AGError);
      }
    };

    addDialog(DialogCategory.KickOut, {
      id: 'kick-out',
      onOk,
    });
  };

  /**
   * 用户列表
   */
  @computed
  get userList() {
    const list = this._usersList.map(({ userUuid, userName }) => {
      const { acceptedList, chatMuted } = this.classroomStore.roomStore;
      const { rewards } = this.classroomStore.userStore;
      const { grantedUsers, connected: boardReady } = this.boardApi;
      const uid = userUuid;
      const name = userName;

      const isOnPodium = acceptedList.some(({ userUuid: uid }) => userUuid === uid);
      const boardGrantState = boardReady
        ? grantedUsers.has(userUuid)
          ? BoardGrantState.Granted
          : BoardGrantState.NotGranted
        : BoardGrantState.Disabled;
      const stars = rewards.get(userUuid) || 0;
      const isChatMuted = chatMuted;
      let cameraState = DeviceState.unavailable;
      let microphoneState = DeviceState.unavailable;

      // disabled: user has not publish streams
      // enabled: user has published streams
      // unavailable: user has no streams

      const mainStream = this.getMainStream(userUuid);

      if (mainStream) {
        const isCameraAvailCanMute = mainStream.videoState === AgoraRteMediaPublishState.Published;

        const isMicAvailCanMute = mainStream.audioState === AgoraRteMediaPublishState.Published;

        cameraState = isCameraAvailCanMute ? DeviceState.enabled : DeviceState.disabled;

        microphoneState = isMicAvailCanMute ? DeviceState.enabled : DeviceState.disabled;

        const isCameraUnauthorized =
          mainStream.videoSourceState === AgoraRteMediaSourceState.stopped;
        const isMicUnauthorized = mainStream.audioSourceState === AgoraRteMediaSourceState.stopped;

        cameraState = isCameraUnauthorized ? DeviceState.unauthorized : cameraState;

        microphoneState = isMicUnauthorized ? DeviceState.unauthorized : microphoneState;
      }

      const operations: Operations = {
        podium: { interactable: this.canOperatePodium },
        chat: { interactable: this.canMuteChat },
        kick: { interactable: this.canKickOut },
        camera: {
          interactable: this.canOperateMedia && !this.shouldBlockMediaAction(cameraState),
        },
        microphone: {
          interactable: this.canOperateMedia && !this.shouldBlockMediaAction(microphoneState),
        },
        star: { interactable: this.canSendRewards },
        'grant-board': { interactable: this.canGrantWhiteboardPermissions },
        'supervise-student': { interactable: this.canSuperviseStudent },
      };

      return {
        uid,
        name,
        isOnPodium,
        boardGrantState,
        isChatMuted,
        cameraState,
        microphoneState,
        stars,
        operations,
      };
    });
    return list;
  }

  /**
   * 是否还有更多用户等待查询
   */
  @computed
  get hasMoreUsers() {
    if (this._usersNextPageId === undefined) {
      return false;
    } else {
      return true;
    }
  }

  @computed
  get rosterFunctions() {
    const { canKickOut, canSearchInRoster } = this;
    const functions = [] as Array<
      'search' | 'carousel' | 'kick' | 'grant-board' | 'podium' | 'stars' | 'supervise-student'
    >;
    if (canKickOut) {
      functions.push('kick');
    }
    if (canSearchInRoster) {
      functions.push('search');
    }
    functions.push('supervise-student');
    return functions;
  }

  onInstall() {
    super.onInstall();

    this._disposers.push(
      reaction(
        () => this._usersList.length,
        () => {
          if (this._usersList.length < 10) {
            this.fetchNextUsersList({ nextId: null }, true);
          }
        },
        {
          equals: (preCount: number, currentCount: number) => {
            //用户被移除且当前总数不足10个 则请求拉取用户
            const isFetchUser = currentCount < 10 && preCount > currentCount;
            return !isFetchUser;
          },
        },
      ),
    );
  }
}
