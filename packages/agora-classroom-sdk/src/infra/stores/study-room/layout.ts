import { EduEventUICenter } from '@/infra/utils/event-center';
import { EduStream } from 'agora-edu-core';
import {
  AgoraRteEventType,
  AgoraRteRemoteStreamType,
  AgoraRteVideoSourceType,
  AgoraUser,
  AGRtcState,
  bound,
  Log,
  Scheduler,
} from 'agora-rte-sdk';
import {
  action,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { computedFn } from 'mobx-utils';
import { LayoutUIStore } from '../common/layout';
import { StudyRoomGetters } from './getters';

export enum ViewMode {
  Divided = 'divided',
  Surrounded = 'surrounded',
}

@Log.attach({ proxyMethods: false })
export class StudyRoomLayoutUIStore extends LayoutUIStore {
  protected _disposers: (IReactionDisposer | Lambda)[] = [];

  private static readonly PAGE_SIZE_BY_MODE = {
    [ViewMode.Divided]: 20,
    [ViewMode.Surrounded]: 8,
  };

  private _subscribeTask?: Scheduler.Task;
  private _videoDoms = new Map<string, HTMLDivElement>();

  @observable
  viewMode: ViewMode = ViewMode.Divided;

  @observable
  blackList: Set<string> = new Set();

  @observable
  pinnedUser?: string;

  @observable
  pageIndex = 0;

  @observable
  waitingSub: EduStream[] = [];
  @observable
  doneSub: EduStream[] = [];
  @observable
  quitSub: EduStream[] = [];

  @observable
  orderedUserList: string[] = [];
  @observable
  chatVisibility = false;
  @observable
  rosterVisibility = false;

  get getters(): StudyRoomGetters {
    return super.getters as StudyRoomGetters;
  }

  @computed
  get userCount() {
    return this.orderedUserList.length;
  }

  @computed
  get localUserUuid() {
    return this.getters.localUserUuid;
  }

  @computed
  get visibleUsers() {
    return this.orderedUserList.filter((userUuid) => !this.blackList.has(userUuid));
  }

  @computed
  get showPager() {
    return this.totalPage > 1;
  }

  @computed
  get pageSize() {
    return StudyRoomLayoutUIStore.PAGE_SIZE_BY_MODE[this.viewMode];
  }

  @computed
  get totalPage() {
    let totalUser = this.visibleUsers.length;
    if (this.viewMode === ViewMode.Surrounded) {
      totalUser -= 1;
    }

    const p = Math.floor(totalUser / this.pageSize);
    return totalUser % this.pageSize > 0 ? p + 1 : p;
  }

  @computed
  get connected() {
    return this.classroomStore.connectionStore.rtcState === AGRtcState.Connected;
  }

  @action.bound
  prevPage() {
    if (this.pageIndex === 0) {
      return;
    }
    this.pageIndex -= 1;
    this.logger.info('Set page index to', this.pageIndex);
  }

  @action.bound
  nextPage() {
    if (this.pageIndex + 1 === this.totalPage) {
      return;
    }
    this.pageIndex += 1;
    this.logger.info('Set page index to', this.pageIndex);
  }

  @bound
  updateVideoDom(streamUuid: string, dom: HTMLDivElement) {
    this._videoDoms.set(streamUuid, dom);
  }

  @bound
  removeVideoDom(streamUuid: string) {
    this._videoDoms.delete(streamUuid);
  }

  @action.bound
  toggleUserBlackList(userUuid: string) {
    if (!this.blackList.has(userUuid)) {
      this.blackList.add(userUuid);
    } else {
      this.blackList.delete(userUuid);
    }
  }

  @action.bound
  togglePinUser(userUuid: string) {
    if (this.pinnedUser === userUuid) {
      this.pinnedUser = undefined;
      this.viewMode = ViewMode.Divided;
    } else {
      this.pinnedUser = userUuid;
      this.viewMode = ViewMode.Surrounded;
    }
  }

  @action.bound
  toggleViewMode() {
    const viewMode = this.viewMode === ViewMode.Divided ? ViewMode.Surrounded : ViewMode.Divided;
    if (viewMode === ViewMode.Divided) {
      this.pinnedUser = undefined;
    } else {
      this.pinnedUser = this.getters.localUserUuid;
    }
    this.viewMode = viewMode;
    this.pageIndex = 0;
  }

  /**
   * @en Get a user list of the current page
   * @zh 获取当前页的用户列表
   */
  getCurrentPageUsers = computedFn((size: number) => {
    const startIndex = this.pageIndex * size;

    const pinnedUser = this.pinnedUser;

    const userList = pinnedUser
      ? this.visibleUsers.filter((userUuid) => {
          return userUuid !== pinnedUser;
        })
      : this.visibleUsers;

    const needFill = userList.length > size && startIndex + size > userList.length;

    let resultUserList = [];

    if (needFill) {
      resultUserList = userList.slice(userList.length - size, userList.length);
    } else {
      resultUserList = userList.slice(startIndex, startIndex + size);
    }

    return resultUserList;
  });

  @action.bound
  subscribeMass(streams: EduStream[]) {
    const subst = streams.filter((s) => {
      return !s.isLocal;
    });
    this.waitingSub = subst;
  }

  @action.bound
  toggleChat() {
    this.chatVisibility = !this.chatVisibility;
  }

  @action.bound
  toggleRoster() {
    this.rosterVisibility = !this.rosterVisibility;
  }

  @action.bound
  private _handleUserAdded(users: AgoraUser[]) {
    users.forEach(({ userUuid }) => {
      if (this.orderedUserList.includes(userUuid)) {
        return;
      }
      if (userUuid === this.getters.localUserUuid) {
        this.orderedUserList.unshift(userUuid);
      } else {
        this.orderedUserList.push(userUuid);
      }
    });
  }

  @action.bound
  private _handleUserRemoved(users: AgoraUser[]) {
    const uuids = users.map(({ userUuid }) => userUuid);

    this.orderedUserList = this.orderedUserList.filter((userUuid) => {
      return !uuids.includes(userUuid);
    });

    const quitSub = Array.from(this.classroomStore.streamStore.streamByStreamUuid.values()).filter(
      (s) => {
        return !uuids.includes(s.fromUser.userUuid);
      },
    );

    this.quitSub = this.quitSub.concat(quitSub);
  }

  @bound
  private async _handleSubscribe() {
    if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
      return;
    }
    const waitingSub = this.waitingSub.slice();
    const quitSub = this.quitSub.slice();
    let doneSub = this.doneSub.filter((s) => {
      return !quitSub.includes(s);
    });
    runInAction(() => {
      this.quitSub = [];
    });

    // 需要订阅
    const tobeSub = waitingSub.filter((stream) => {
      return !doneSub.includes(stream);
    });
    // 需要取消订阅
    const tobeUnsub = doneSub.filter((stream) => {
      return !waitingSub.includes(stream);
    });

    const { muteRemoteVideoStreamMass, setupRemoteVideo, setRemoteVideoStreamType } =
      this.classroomStore.streamStore;

    if (tobeUnsub.length) {
      await muteRemoteVideoStreamMass(tobeUnsub, true);
      doneSub = doneSub.filter((stream) => {
        return !tobeUnsub.includes(stream);
      });
    }

    let subList: string[] = [];

    if (tobeSub.length) {
      subList = (await muteRemoteVideoStreamMass(tobeSub, false)) || [];

      const newSub = tobeSub.filter(({ streamUuid }) => {
        return subList.includes(streamUuid);
      });

      await Promise.all(
        newSub.map(async (stream) => {
          const streamType =
            stream.fromUser.userUuid === this.pinnedUser
              ? AgoraRteRemoteStreamType.HIGH_STREAM
              : AgoraRteRemoteStreamType.LOW_STREAM;

          await setRemoteVideoStreamType(stream.streamUuid, streamType);
        }),
      );

      doneSub = doneSub.concat(newSub);
    }

    doneSub.forEach((stream) => {
      const dom = this._videoDoms.get(stream.streamUuid);
      if (dom) {
        const needMirror = stream.videoSourceType !== AgoraRteVideoSourceType.ScreenShare;
        setupRemoteVideo(stream, dom, needMirror);
      }
    });

    runInAction(() => {
      this.doneSub = doneSub;
    });
  }

  onInstall() {
    this._disposers.push(
      reaction(
        () => this.classroomStore.connectionStore.scene,
        (scene) => {
          if (scene) {
            scene.addListener(AgoraRteEventType.UserAdded, this._handleUserAdded);
            scene.addListener(AgoraRteEventType.UserRemoved, this._handleUserRemoved);
            this.classroomStore.streamStore.unpublishScreenShare();
          }
        },
      ),
    );

    this._disposers.push(
      // add a hook for correcting page count fired when total page number changed
      reaction(
        () => this.totalPage,
        (totalPage) => {
          if (this.pageIndex + 1 > totalPage) {
            this.pageIndex = totalPage === 0 ? 0 : totalPage - 1;
          }
        },
      ),
    );

    this._subscribeTask = Scheduler.shared.addPollingTask(
      this._handleSubscribe,
      Scheduler.Duration.second(1),
    );

    EduEventUICenter.shared.on('toggle-pin-user', this.togglePinUser);
    EduEventUICenter.shared.on('toggle-user-black-list', this.toggleUserBlackList);
  }

  onDestroy() {
    EduEventUICenter.shared.off('toggle-pin-user', this.togglePinUser);
    EduEventUICenter.shared.off('toggle-user-black-list', this.toggleUserBlackList);
    this._subscribeTask?.stop();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
