import { AgoraFromUser, AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { EduClassroomConfig, EduRoleTypeEnum, EduStream } from '../../../..';
import { RteRole2EduRole } from '../../../../utils';
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

  get role(): EduRoleTypeEnum {
    return RteRole2EduRole(EduClassroomConfig.shared.sessionInfo.roomType, this.fromUser.role);
  }
}
