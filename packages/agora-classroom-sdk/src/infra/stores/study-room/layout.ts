import { EduClassroomStore, EduStream } from 'agora-edu-core';
import {
  AgoraFromUser,
  AgoraRteEventType,
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
import { EduShareUIStore } from '../common/share-ui';
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

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore, new StudyRoomGetters(store));
  }

  get getters(): StudyRoomGetters {
    return super.getters as StudyRoomGetters;
  }

  @computed
  get localUserUuid() {
    return this.getters.localUserUuid;
  }

  @computed
  get allUsers() {
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
    let totalUser = this.allUsers.length;
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
  toggleUserBlackList(user: AgoraFromUser) {
    if (!this.blackList.has(user.userUuid)) {
      this.blackList.add(user.userUuid);
    } else {
      this.blackList.delete(user.userUuid);
    }
  }

  @action.bound
  togglePinUser(user: AgoraFromUser) {
    if (this.pinnedUser === user.userUuid) {
      this.pinnedUser = undefined;
      this.viewMode = ViewMode.Divided;
    } else {
      this.pinnedUser = user.userUuid;
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
      ? this.allUsers.filter((userUuid) => {
          return userUuid !== pinnedUser;
        })
      : this.allUsers;

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

    const { muteRemoteVideoStreamMass, setupRemoteVideo } = this.classroomStore.streamStore;

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
  }

  onDestroy() {
    this._subscribeTask?.stop();
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
