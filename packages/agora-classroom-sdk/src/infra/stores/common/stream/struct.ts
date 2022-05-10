import { EduClassroomConfig, EduRoleTypeEnum, EduStream, RteRole2EduRole } from 'agora-edu-core';
import { AgoraFromUser, AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';

/**
 * 业务流 UI 对象
 */
export class EduStreamUI {
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
