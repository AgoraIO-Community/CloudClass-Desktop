import { EduStoreBase } from '../base';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { bound } from 'agora-rte-sdk';
import { PodiumSrouce } from './type';

export class HandUpStore extends EduStoreBase {
  @bound
  async onPodium(userUuid: string, source: PodiumSrouce = PodiumSrouce.InvitedByTeacher) {
    try {
      await this.api.acceptHandsUp({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        toUserUuid: userUuid,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        source === PodiumSrouce.AcceptedByTeacher
          ? AGEduErrorCode.EDU_ERR_HAND_UP_ACCEPT_FAIL
          : AGEduErrorCode.EDU_ERR_HAND_UP_ON_PODIUM_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async offPodium(userUuid: string) {
    try {
      await this.api.revokeCoVideo({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        toUserUuid: userUuid,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_HAND_UP_OFF_PODIUM_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async offPodiumAll() {
    try {
      await this.api.revokeAllCoVideo({
        roomUuid: this.classroomStore.connectionStore.sceneId,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_HAND_UP_OFF_PODIUM_ALL_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async rejectHandUp(userUuid: string) {
    try {
      await this.api.refuseHandsUp({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        toUserUuid: userUuid,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_HAND_UP_REJECT_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async cancelHandUp() {
    try {
      await this.api.cancelHandsUp({
        roomUuid: this.classroomStore.connectionStore.sceneId,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_HAND_UP_CANCEL_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async handUp(teacherUuid: string) {
    try {
      await this.api.startHandsUp({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        toUserUuid: teacherUuid,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_HAND_UP_HAND_UP_FAIL,
        err as Error,
      );
    }
  }

  @bound
  async waveArm(teacherUuid: string, duration: -1 | 3, payload?: object) {
    try {
      await this.api.waveArm({
        roomUuid: this.classroomStore.connectionStore.sceneId,
        toUserUuid: teacherUuid,
        timout: duration,
        retry: true,
        payload: payload,
      });
    } catch (err) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_HAND_UP_WAVE_FAIL,
        err as Error,
      );
    }
  }

  onInstall() {}
  onDestroy() {}
}
