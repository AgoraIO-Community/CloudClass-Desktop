import { action, computed, IReactionDisposer, observable, reaction } from 'mobx';
import {
  AGError,
  AgoraRteMediaSourceState,
  AgoraRteAudioSourceType,
  AgoraRteMediaPublishState,
  AgoraRteVideoSourceType,
  Lodash,
} from 'agora-rte-sdk';
import { toLower } from 'lodash';
import { EduUIStoreBase } from '../base';
import { DialogCategory } from '../share-ui';
import { iterateMap } from '../../../../utils/collection';
import { Operations, DeviceState, Operation } from './type';
import { EduClassroomConfig, EduRoleTypeEnum } from '../../../..';
import { AGServiceErrorCode } from '../../../../services/error';
import { transI18n } from '../i18n';

export class RosterUIStore extends EduUIStoreBase {
  uiOverrides = {
    width: 640,
  };

  private _disposers: IReactionDisposer[] = [];
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
  @observable
  searchKeyword: string = '';

  @observable
  carousel = {
    isOpenCarousel: false,
    mode: '1',
    randomValue: '1',
    times: '10',
  };

  /** Methods */

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

      // update carousel when conditions changed & carousel state is open
      const shouldRestartCarousel = propKey === 'isOpenCarousel' || this.carousel.isOpenCarousel;

      if (shouldRestartCarousel) {
        this.startCarousel(val as unknown as boolean);
      }
    };
  }

  private getMainStream(userUuid: string) {
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

  private shouldBlockMediaAction(deviceState: DeviceState) {
    return [DeviceState.unauthorized, DeviceState.unavailable].includes(deviceState);
  }

  /** Actions */
  @action.bound
  updateCarousel(carousel: RosterUIStore['carousel']) {
    this.carousel = carousel;
  }

  @action.bound
  setKeyword(keyword: string) {
    this.searchKeyword = keyword;
  }

  @action.bound
  clickRowAction(
    operation: Operation,
    profile: {
      uid: string | number;
      isOnPodium: boolean;
      cameraState: DeviceState;
      microphoneState: DeviceState;
    },
  ) {
    const { addDialog, addGenericErrorDialog } = this.shareUIStore;
    const { roomUuid, userUuid, sendRewards } = this.classroomStore.roomStore;
    const { grantUsers, grantPermission, revokePermission } = this.classroomStore.boardStore;
    const { localUser, kickOutOnceOrBan } = this.classroomStore.userStore;
    const { enableLocalVideo, enableLocalAudio, localCameraTrackState, localMicTrackState } =
      this.classroomStore.mediaStore;
    const { updateRemotePublishState } = this.classroomStore.streamStore;
    const { onPodium, offPodium } = this.classroomStore.handUpStore;

    switch (operation) {
      case 'podium': {
        if (profile.isOnPodium) {
          offPodium(`${profile.uid}`).catch((e) => {
            if (
              !AGError.isOf(
                e,
                AGServiceErrorCode.SERV_PROCESS_CONFLICT,
                AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
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
                AGServiceErrorCode.SERV_ACCEPT_NOT_FOUND,
              )
            ) {
              addGenericErrorDialog(e);
            }
          });
        }
        break;
      }
      case 'grant-board': {
        const userUuid = profile.uid as string;

        try {
          if (grantUsers.has(userUuid)) {
            revokePermission(userUuid);
          } else {
            grantPermission(userUuid);
          }
        } catch (e) {
          addGenericErrorDialog(e as AGError);
        }
        break;
      }
      case 'camera': {
        // mute or unmute video
        const userUuid = profile.uid as string;
        if (localUser.userUuid === userUuid) {
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

        break;
      }
      case 'microphone': {
        // mute or unmute audio
        const userUuid = profile.uid as string;
        if (localUser.userUuid === userUuid) {
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
        break;
      }
      case 'star': {
        // send stars
        sendRewards(roomUuid, [
          {
            userUuid: profile.uid as string,
            changeReward: 1,
          },
        ]).catch((e) => this.shareUIStore.addGenericErrorDialog(e as AGError));
        break;
      }
      case 'kick': {
        const onOk = (ban: boolean) => {
          kickOutOnceOrBan(profile.uid as string, ban).catch((e) => addGenericErrorDialog(e));
        };

        addDialog(DialogCategory.KickOut, {
          id: 'kick-out',
          roomUuid,
          onOk,
        });

        break;
      }
      case 'chat': {
      }
    }
  }

  /** Computed */
  @computed
  get teacherName() {
    const { teacherList } = this.classroomStore.userStore;

    const { list } = iterateMap(teacherList, {
      onMap: (_, { userName }) => userName,
    });

    return list.join(',');
  }

  @computed
  get userList() {
    const { list } = iterateMap(this.classroomStore.userStore.studentList, {
      onMap: (userUuid: string, { userName }) => {
        const { acceptedList, chatMuted } = this.classroomStore.roomStore;
        const { rewards } = this.classroomStore.userStore;
        const { grantUsers } = this.classroomStore.boardStore;
        const uid = userUuid;
        const name = userName;

        const isOnPodium = acceptedList.some(({ userUuid: uid }) => userUuid === uid);
        const isBoardGranted = grantUsers.has(userUuid);
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
          isBoardGranted,
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

  @computed
  get rosterFunctions() {
    const { canKickOut, canOperateCarousel, canSearchInRoster } = this;
    const functions = ['podium', 'grant-board', 'stars'] as Array<
      'search' | 'carousel' | 'kick' | 'grant-board' | 'podium' | 'stars'
    >;
    if (canKickOut) {
      functions.push('kick');
    }
    if (canOperateCarousel) {
      functions.push('carousel');
    }
    if (canSearchInRoster) {
      functions.push('search');
    }
    return functions;
  }

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

  /** Getters */
  get canKickOut() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }
  get canGrantWhiteboardPermissions() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  get canOperatePodium() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  get canMuteChat() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  get canOperateMedia() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }
  get canOperateCarousel() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }
  get canSearchInRoster() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  get canSendRewards() {
    const { sessionInfo } = EduClassroomConfig.shared;
    return [EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(sessionInfo.role);
  }

  onDestroy() {
    this._disposers.forEach((disposer) => disposer());
  }
}
