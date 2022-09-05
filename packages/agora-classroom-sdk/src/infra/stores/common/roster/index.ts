import { action, computed, IReactionDisposer, observable, reaction } from 'mobx';
import {
  AGError,
  AgoraRteMediaSourceState,
  AgoraRteAudioSourceType,
  AgoraRteMediaPublishState,
  AgoraRteVideoSourceType,
  Lodash,
  bound,
} from 'agora-rte-sdk';
import { toLower } from 'lodash';
import { computedFn } from 'mobx-utils';
import { EduUIStoreBase } from '../base';
import { DialogCategory } from '../share-ui';

import { Operations, DeviceState, Operation, Profile } from './type';
import { interactionThrottleHandler } from '@/infra/utils/interaction';
import {
  AGEduErrorCode,
  AGServiceErrorCode,
  EduClassroomConfig,
  EduErrorCenter,
  EduRoleTypeEnum,
  GroupState,
  iterateMap,
} from 'agora-edu-core';
import { BoardGrantState, transI18n } from '~ui-kit';
import { EduStreamUI } from '../stream/struct';

export class RosterUIStore extends EduUIStoreBase {
  /**
   * width: 花名册窗口宽度
   */
  get uiOverrides() {
    return { ...super.uiOverrides, width: 710 };
  }

  protected _disposers: IReactionDisposer[] = [];
  onInstall() {
    // update carousel when room properties change
    this._disposers.push(
      reaction(
        () => this.classroomStore.roomStore.carousel,
        (carousel) => {
          const props = {
            isOpenCarousel: !!carousel?.state,
            mode: `${carousel?.range || 1}`,
            randomValue: `${carousel?.type || 1}`,
            times: typeof carousel?.interval === 'undefined' ? '10' : `${carousel.interval}`,
          };
          this.updateCarousel(props);
        },
      ),
    );
  }

  /** Observables */

  /**
   * 检索字符串
   */
  @observable
  searchKeyword = '';

  /**
   * 轮播参数
   */
  @observable
  carousel = {
    isOpenCarousel: false,
    mode: '1',
    randomValue: '1',
    times: '10',
  };

  /** Methods */

  /**
   * 开始轮播
   * @param start
   */
  @Lodash.debounced(500, { trailing: true })
  private startCarousel(start: boolean) {
    const { startCarousel, stopCarousel } = this.classroomStore.roomStore;
    const { randomValue, mode, times } = this.carousel;

    if (start) {
      startCarousel({
        range: Number(mode),
        type: Number(randomValue),
        interval: Number(times),
      }).catch((e) => this.shareUIStore.addGenericErrorDialog(e));
    } else {
      stopCarousel().catch((e) => this.shareUIStore.addGenericErrorDialog(e));
    }
  }

  /**
   * 轮播参数事件
   * @param propKey
   * @returns
   */
  private updatePartial<T>(propKey: string) {
    return (val: T, eventType?: 'change' | 'blur') => {
      if (propKey === 'times' && eventType === 'blur') {
        let times = Number((val as unknown as string).replace(/\D+/g, '').replace(/\b(0+)/gi, ''));
        if (times < 10) {
          times = 10;
        } else if (Number(times) > 99) times = 99;
        val = times as unknown as T;
      }

      this.updateCarousel({
        ...this.carousel,
        [propKey]: val,
      });

      const shouldFireRestart =
        propKey !== 'times' || (propKey === 'times' && eventType === 'blur');

      // update carousel when conditions changed & carousel state is open
      const shouldRestartCarousel = propKey === 'isOpenCarousel' || this.carousel.isOpenCarousel;

      if (shouldFireRestart && shouldRestartCarousel) {
        this.startCarousel(val as unknown as boolean);
      }
    };
  }

  /**
   * 获取主流
   * @param userUuid
   * @returns
   */
  protected getMainStream(userUuid: string) {
    const { streamByUserUuid, streamByStreamUuid } = this.classroomStore.streamStore;

    const streams = streamByUserUuid.get(userUuid);

    if (streams) {
      const mainStreamUuid = Array.from(streams || []).find(
        (streamUuid) =>
          streamByStreamUuid.get(streamUuid)?.videoSourceType === AgoraRteVideoSourceType.Camera ||
          streamByStreamUuid.get(streamUuid)?.audioSourceType === AgoraRteAudioSourceType.Mic,
      );
      if (mainStreamUuid) {
        const mainStream = streamByStreamUuid.get(mainStreamUuid);

        return mainStream;
      }
    }
    return null;
  }

  /**
   * 是否不可点击操作
   * @param deviceState
   * @returns
   */
  protected shouldBlockMediaAction(deviceState: DeviceState) {
    return [DeviceState.unauthorized, DeviceState.unavailable].includes(deviceState);
  }

  /**
   * 更新轮播参数
   * @param carousel
   */
  /** Actions */
  @action.bound
  updateCarousel(carousel: RosterUIStore['carousel']) {
    this.carousel = carousel;
  }

  /**
   * 设置检索字符串
   * @param keyword
   */
  @action.bound
  setKeyword(keyword: string) {
    this.searchKeyword = keyword;
  }

  /**
   * 花名册功能按钮点击
   * @param operation
   * @param profile
   */
  clickRowAction = interactionThrottleHandler(
    (operation: Operation, profile: Profile) => {
      switch (operation) {
        case 'podium': {
          this.clickPodium(profile);
          break;
        }
        case 'grant-board': {
          this.clickGrantBoard(profile);
          break;
        }
        case 'camera': {
          this.clickCamera(profile);
          break;
        }
        case 'microphone': {
          this.clickMicrophone(profile);
          break;
        }
        case 'star': {
          this.clickStar(profile);
          break;
        }
        case 'kick': {
          this.clickKick(profile);
          break;
        }
        case 'supervise-student': {
          this.chickStudentView(profile);
          break;
        }
      }
    },
    (message) => this.shareUIStore.addToast(message, 'warning'),
  );

  clickPodium = (profile: Profile) => {
    const { addGenericErrorDialog } = this.shareUIStore;
    const { onPodium, offPodium } = this.classroomStore.handUpStore;

    if (profile.isOnPodium) {
      offPodium(`${profile.uid}`).catch((e) => {
        if (
          !AGError.isOf(
            e,
            AGServiceErrorCode.SERV_PROCESS_CONFLICT,
            AGServiceErrorCode.SERV_PROCESS_CONFLICT,
          )
        ) {
          addGenericErrorDialog(e);
        }
      });
    } else {
      onPodium(`${profile.uid}`).catch((e) => {
        if (AGError.isOf(e, AGServiceErrorCode.SERV_ACCEPT_MAX_COUNT)) {
          this.shareUIStore.addToast(transI18n('on_podium_max_count'), 'warning');
        } else if (
          !AGError.isOf(
            e,
            AGServiceErrorCode.SERV_PROCESS_CONFLICT,
            AGServiceErrorCode.SERV_PROCESS_CONFLICT,
          )
        ) {
          addGenericErrorDialog(e);
        }
      });
    }
  };

  clickGrantBoard = (profile: Profile) => {
    const { grantedUsers, grantPrivilege } = this.boardApi;
    const userUuid = profile.uid as string;

    if (grantedUsers.has(userUuid)) {
      grantPrivilege(userUuid, false);
    } else {
      grantPrivilege(userUuid, true);
    }
  };

  clickCamera = (profile: Profile) => {
    const { addGenericErrorDialog } = this.shareUIStore;
    const { enableLocalVideo, localCameraTrackState } = this.classroomStore.mediaStore;
    const { localUser } = this.classroomStore.userStore;
    const { updateRemotePublishState } = this.classroomStore.streamStore;

    // mute or unmute video
    const userUuid = profile.uid as string;
    if (localUser?.userUuid === userUuid) {
      const isEnabled = localCameraTrackState === AgoraRteMediaSourceState.started;
      enableLocalVideo(!isEnabled);
    } else {
      const mainStream = this.getMainStream(userUuid);
      const isPublished = mainStream?.videoState === AgoraRteMediaPublishState.Published;
      if (mainStream) {
        updateRemotePublishState(userUuid, mainStream.streamUuid, {
          videoState: isPublished
            ? AgoraRteMediaPublishState.Unpublished
            : AgoraRteMediaPublishState.Published,
        }).catch((e) => addGenericErrorDialog(e));
      }
    }
  };

  clickMicrophone = (profile: Profile) => {
    const { addGenericErrorDialog } = this.shareUIStore;
    const { localUser } = this.classroomStore.userStore;
    const { enableLocalAudio, localMicTrackState } = this.classroomStore.mediaStore;
    const { updateRemotePublishState } = this.classroomStore.streamStore;

    // mute or unmute audio
    const userUuid = profile.uid as string;
    if (localUser?.userUuid === userUuid) {
      const isEnabled = localMicTrackState === AgoraRteMediaSourceState.started;
      enableLocalAudio(!isEnabled);
    } else {
      const mainStream = this.getMainStream(userUuid);
      const isPublished = mainStream?.audioState === AgoraRteMediaPublishState.Published;
      if (mainStream) {
        updateRemotePublishState(userUuid, mainStream.streamUuid, {
          audioState: isPublished
            ? AgoraRteMediaPublishState.Unpublished
            : AgoraRteMediaPublishState.Published,
        }).catch((e) => addGenericErrorDialog(e));
      }
    }
  };

  clickStar = (profile: Profile) => {
    const { sendRewards } = this.classroomStore.roomStore;

    // send stars
    sendRewards([
      {
        userUuid: profile.uid as string,
        changeReward: 1,
      },
    ]).catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
  };

  clickKick = (profile: Profile) => {
    const { addDialog, addGenericErrorDialog } = this.shareUIStore;
    const { kickOutOnceOrBan } = this.classroomStore.userStore;
    const onOk = (ban: boolean) => {
      kickOutOnceOrBan(profile.uid as string, ban).catch((e) => addGenericErrorDialog(e));
    };

    addDialog(DialogCategory.KickOut, {
      id: 'kick-out',
      onOk,
    });
  };

  chickStudentView = (profile: Profile) => {
    const uid = profile.uid;
    this.subcribeUsers(1, { publishUserUuids: [`${uid}`] });
    this.shareUIStore.addDialog(DialogCategory.StreamView, { id: uid });
  };

  /**
   * 获取指定学生 stream
   * @param uid
   * @returns
   */
  getStudentStream = computedFn((uid: string) => {
    const streamSet = new Set<EduStreamUI>();
    const streamUuids = this.classroomStore.streamStore.streamByUserUuid.get(uid) || new Set();
    for (const streamUuid of streamUuids) {
      const stream = this.classroomStore.streamStore.streamByStreamUuid.get(streamUuid);
      if (stream) {
        const uiStream = new EduStreamUI(stream);
        streamSet.add(uiStream);
      }
    }
    if (streamSet.size > 1) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UNEXPECTED_STUDENT_STREAM_LENGTH,
        new Error(`unexpected stream size ${streamSet.size}`),
      );
    }
    return Array.from(streamSet)[0];
  });

  /**
   * 关闭视频监听
   */
  @bound
  closeStudentView() {
    this.subcribeUsers(0);
  }

  /**
   * 开启扩展屏状态，并且发布需要订阅的学生流信息
   * @param state
   * @param data
   */
  @bound
  async subcribeUsers(
    state: 1 | 0,
    data?: {
      publishUserUuids?: string[] | undefined;
      unpublishUserUuids?: string[];
    },
  ) {
    try {
      await this.classroomStore.streamStore.updateExpandedScopeAndStreams(state, data);
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /** Computed */

  /**
   * 老师名称
   * @returns
   */
  @computed
  get teacherName() {
    const { teacherList } = this.classroomStore.userStore;

    const { list } = iterateMap(teacherList, {
      onMap: (_, { userName }) => userName,
    });

    return list.join(',');
  }

  /**
   * 学生列表
   * @returns
   */
  @computed
  get userList() {
    const isMainRoom =
      this.classroomStore.connectionStore.sceneId ===
      this.classroomStore.connectionStore.mainRoomScene?.sceneId;
    let studentList = this.classroomStore.userStore.studentList;

    if (isMainRoom) {
      studentList = new Map();

      const { groupUuidByUserUuid } = this.classroomStore.groupStore;

      this.classroomStore.userStore.studentList.forEach((user) => {
        if (!groupUuidByUserUuid.has(user.userUuid)) {
          studentList.set(user.userUuid, user);
        }
      });
    }

    const { list } = iterateMap(studentList, {
      onMap: (userUuid: string, { userName }) => {
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
          const isCameraAvailCanMute =
            mainStream.videoState === AgoraRteMediaPublishState.Published;

          const isMicAvailCanMute = mainStream.audioState === AgoraRteMediaPublishState.Published;

          cameraState = isCameraAvailCanMute ? DeviceState.enabled : DeviceState.disabled;

          microphoneState = isMicAvailCanMute ? DeviceState.enabled : DeviceState.disabled;

          const isCameraUnauthorized =
            mainStream.videoSourceState === AgoraRteMediaSourceState.stopped;
          const isMicUnauthorized =
            mainStream.audioSourceState === AgoraRteMediaSourceState.stopped;

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
      },
    });

    // users which are on podium put at begining of the roster list
    return list
      .filter(({ name }) => toLower(name).includes(toLower(this.searchKeyword)))
      .sort(({ name: n1, isOnPodium: i1 }, { name: n2, isOnPodium: i2 }) => {
        if (i1 === i2) {
          const byName = n1 === n2 ? 0 : n1 > n2 ? 1 : -1;
          return byName;
        } else {
          const byState = i1 ? -1 : 1;
          return byState;
        }
      });
  }

  /**
   * 花名册功能列表
   * @returns
   */
  @computed
  get rosterFunctions() {
    const { canKickOut, canOperateCarousel, canSearchInRoster } = this;

    const functions = ['podium', 'grant-board'] as Array<
      'search' | 'carousel' | 'kick' | 'grant-board' | 'podium' | 'stars' | 'supervise-student'
    >;
    this.classroomStore.connectionStore.mainRoomScene?.sceneId;
    const { mainRoomScene, sceneId } = this.classroomStore.connectionStore;
    const isInMainRoom = mainRoomScene?.sceneId === sceneId;

    if (canKickOut && isInMainRoom) {
      functions.push('kick');
    }
    if (canOperateCarousel && isInMainRoom && !this.groupStarted && this.stageVisible) {
      functions.push('carousel');
    }
    if (canSearchInRoster) {
      functions.push('search');
    }
    if (isInMainRoom) {
      functions.push('stars');
    }
    return functions;
  }

  /**
   * 轮播组件属性
   * @returns
   */
  @computed
  get carouselProps() {
    return {
      ...this.carousel,
      onTimesChange: this.updatePartial<string>('times'),
      onModeChange: this.updatePartial<string>('mode'),
      onRandomValueChange: this.updatePartial<string>('randomValue'),
      onOpenCarousel: this.updatePartial<boolean>('isOpenCarousel'),
    };
  }

  @computed
  get groupStarted() {
    return this.classroomStore.groupStore.state === GroupState.OPEN;
  }

  @computed
  get stageVisible() {
    return this.getters.stageVisible;
  }

  /** Getters */
  /**
   * 是否有踢人权限
   * @returns
   */
  get canKickOut() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  /**
   * 是否有白板授权权限
   * @returns
   */
  get canGrantWhiteboardPermissions() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return (
      [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role) &&
      this.boardApi.mounted
    );
  }

  /**
   * 是否可以操作上下台
   * @returns
   */
  get canOperatePodium() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  /**
   * 是否可以禁言IM
   * @returns
   */
  get canMuteChat() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  /**
   * 是否可以开启和关闭学生音视频
   * @returns
   */
  get canOperateMedia() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  /**
   * 是否可以操作轮播
   * @returns
   */
  get canOperateCarousel() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  /**
   * 是否可以检索
   * @returns
   */
  get canSearchInRoster() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  /**
   * 是否可以发奖励
   * @returns
   */
  get canSendRewards() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  get canSubscribeUser() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  get canSuperviseStudent() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  onDestroy() {
    this._disposers.forEach((disposer) => disposer());
    this._disposers = [];
  }
}
