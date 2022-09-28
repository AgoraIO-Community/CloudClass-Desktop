import { interactionThrottleHandler } from '@/infra/utils/interaction';
import { iterateMap } from 'agora-edu-core';
import { AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { toLower } from 'lodash';
import { computed } from 'mobx';
import { BoardGrantState, DeviceState, Operation, Operations, Profile } from '~components';
import { RosterUIStore } from '../common/roster';

export class StudyRoomRosterUIStore extends RosterUIStore {
  get uiOverrides() {
    return { ...super.uiOverrides, width: 400 };
  }

  @computed
  get rosterFunctions() {
    const funcs = ['search', 'pin', 'eye'];
    if (this.canKickOut) {
      funcs.push('kick');
    }
    return funcs as ('search' | 'pin' | 'eye' | 'kick')[];
  }

  /**
   * 学生列表
   * @returns
   */
  @computed
  get userList() {
    let studentList = this.classroomStore.userStore.studentList;

    studentList = new Map();

    const { groupUuidByUserUuid } = this.classroomStore.groupStore;

    this.classroomStore.userStore.studentList.forEach((user) => {
      if (!groupUuidByUserUuid.has(user.userUuid)) {
        studentList.set(user.userUuid, user);
      }
    });

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
          pin: { interactable: true },
          eye: { interactable: true },
          kick: { interactable: true },
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
          pinned: this.shareUIStore.pinnedUser === userUuid,
          eyeClosed: this.shareUIStore.blackList.has(userUuid),
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
   * 花名册功能按钮点击
   * @param operation
   * @param profile
   */
  //@ts-ignore
  clickRowAction = interactionThrottleHandler(
    (operation: Operation, profile: Profile) => {
      switch (operation) {
        case 'pin': {
          this.shareUIStore.togglePinUser({ userUuid: profile.uid } as any);
          break;
        }

        case 'eye': {
          this.shareUIStore.toggleUserBlackList({ userUuid: profile.uid } as any);
          break;
        }
        case 'kick': {
          this.clickKick(profile);
          break;
        }
      }
    },
    (message) => this.shareUIStore.addToast(message, 'warning'),
  );
}
