import { EduClassroomConfig, EduRoleTypeEnum, EduStream, RteRole2EduRole } from 'agora-edu-core';
import { AgoraFromUser, AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { action, computed, observable } from 'mobx';

/**
 * 业务流 UI 对象
 */
export class EduStreamUI {
  @observable
  private _renderAt: 'Window' | 'Bar' = 'Bar';
  readonly stream: EduStream;

  constructor(stream: EduStream) {
    this.stream = stream;
  }

  get micIconType() {
    const deviceDisabled = this.stream.audioSourceState === AgoraRteMediaSourceState.stopped;
    if (deviceDisabled) {
      return 'microphone-disabled';
    }
    if (
      this.stream.audioSourceState === AgoraRteMediaSourceState.started &&
      this.stream.audioState === AgoraRteMediaPublishState.Published
    ) {
      return 'microphone-on';
    }
    return 'microphone-off';
  }

  get isCameraMuted() {
    return (
      this.stream.videoSourceState !== AgoraRteMediaSourceState.started ||
      this.stream.videoState === AgoraRteMediaPublishState.Unpublished
    );
  }

  get isMicMuted() {
    return this.micIconType.endsWith('off') || this.micIconType.endsWith('disabled');
  }

  get fromUser(): AgoraFromUser {
    return this.stream.fromUser;
  }

  get isMirrorMode() {
    return false;
  }

  get role(): EduRoleTypeEnum {
    return RteRole2EduRole(EduClassroomConfig.shared.sessionInfo.roomType, this.fromUser.role);
  }

  @computed
  get renderAt() {
    return this._renderAt;
  }

  @action.bound
  setRenderAt(at: 'Bar' | 'Window') {
    this._renderAt = at;
  }
}

export interface StreamBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
  [key: string]: number;
}
