import { EduEventUICenter } from '@/infra/utils/event-center';
import { EduClassroomConfig, EduStream } from 'agora-edu-core';
import {
  AgoraRteEventType,
  AGRemoteVideoStreamType,
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

  subSet = new Set<string>();

  get getters(): StudyRoomGetters {
    return super.getters as StudyRoomGetters;
  }

  get localUserUuid() {
    return EduClassroomConfig.shared.sessionInfo.userUuid;
  }

  @computed
  get userCount() {
    return this.orderedUserList.length;
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
      if (this.pinnedUser === userUuid) {
        this.pinnedUser = this.localUserUuid;
      }
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
      this.pinnedUser = this.localUserUuid;
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
      if (userUuid === this.localUserUuid) {
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
        return uuids.includes(s.fromUser.userUuid);
      },
    );

    this.quitSub = this.quitSub.concat(quitSub);
  }

  @bound
  private async _handleSubscribe() {
    if (this.classroomStore.connectionStore.rtcState !== AGRtcState.Connected) {
      return;
    }
    // 页面上显示的视频创列表
    const waitingSub = this.waitingSub.slice();
    // timer休眠时退出的用户
    const quitSub = this.quitSub.slice();
    
    // 过滤掉timer休眠时退出的用户
    let doneSub = this.doneSub.filter((s) => {
      return !quitSub.includes(s);
    });
    // 先清空列表
    runInAction(() => {
      this.quitSub = [];
    });
    // 已订阅 diff 当前页面视频列表 = 需要取消订阅的流列表
    const toUnsub = doneSub.filter((stream) => {
      return !waitingSub.includes(stream);
    }).concat(quitSub);
    // 当前页面视频列表 diff 已订阅 = 需要订阅的流列表
    const toSub = waitingSub.filter((stream) => {
      return !doneSub.includes(stream);
    });

    const { muteRemoteVideoStreamMass, setupRemoteVideo, setRemoteVideoStreamType } =
      this.classroomStore.streamStore;

    if (toUnsub.length) {
      await muteRemoteVideoStreamMass(toUnsub, true);
      toUnsub.forEach(({ streamUuid }) => {
        this.subSet.delete(streamUuid);
      });

      // 从已订阅列表移除
      doneSub = doneSub.filter((stream) => {
        return !toUnsub.includes(stream);
      });
    }

    let subList: string[] = [];

    if (toSub.length) {
      // 订阅成功的列表
      subList = (await muteRemoteVideoStreamMass(toSub, false)) || [];
      subList.forEach((streamUuid) => {
        this.subSet.add(streamUuid);
      });
      // 取到流对象
      const newSub = toSub.filter(({ streamUuid }) => {
        return subList.includes(streamUuid);
      });

      // await Promise.all(
      //   newSub.map(async (stream) => {
      //     const streamType =
      //       stream.fromUser.userUuid === this.pinnedUser
      //         ? AGRemoteVideoStreamType.HIGH_STREAM
      //         : AGRemoteVideoStreamType.LOW_STREAM;
      //     // 根据是否被pin设置大小流
      //     await setRemoteVideoStreamType(stream.streamUuid, streamType);
      //   }),
      // );
      // 加入已订阅
      doneSub = doneSub.concat(newSub);
    }
    // 重新渲染视频流
    doneSub.forEach((stream) => {
      const dom = this._videoDoms.get(stream.streamUuid);
      if (dom) {
        const needMirror = stream.videoSourceType !== AgoraRteVideoSourceType.ScreenShare;
        setupRemoteVideo(stream, dom, needMirror);
      }
    });
    // 更新已订阅列表
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

    this._disposers.push(
      // set stream type of the pinned video when pinnedUser changed
      computed(() => this.pinnedUser).observe(
        ({ oldValue: lastPinned, newValue: currentPinned }) => {
          const { streamByUserUuid, setRemoteVideoStreamType } = this.classroomStore.streamStore;
          const setUserStreamType = (userUuid: string, streamType: AGRemoteVideoStreamType) => {
            const streams = streamByUserUuid.get(userUuid);
            if (streams) {
              streams.forEach((streamUuid) => {
                setRemoteVideoStreamType(streamUuid, streamType);
              });
            }
          };

          if (lastPinned && lastPinned !== this.localUserUuid) {
            setUserStreamType(lastPinned, AGRemoteVideoStreamType.LOW_STREAM);
          }

          if (currentPinned && currentPinned !== this.localUserUuid) {
            setUserStreamType(currentPinned, AGRemoteVideoStreamType.HIGH_STREAM);
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
