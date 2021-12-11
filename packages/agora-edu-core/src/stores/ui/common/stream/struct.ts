import { AgoraFromUser, AgoraRteMediaPublishState, AgoraRteMediaSourceState } from 'agora-rte-sdk';
import { EduClassroomConfig, EduRoleTypeEnum, EduStream } from '../../../..';
import { RteRole2EduRole } from '../../../../utils';
import { CameraPlaceholderType } from '../type';
export class EduStreamUI {
  readonly stream: EduStream;
  constructor(stream: EduStream) {
    this.stream = stream;
  }

  get micIconType() {
    if (
      this.stream.audioSourceState === AgoraRteMediaSourceState.started &&
      this.stream.audioState === AgoraRteMediaPublishState.Published
    ) {
      return 'microphone-on';
    }
    return 'microphone-off';
  }

  get micIconClass() {
    //TODO device state
    return 'available';
  }

  get fromUser(): AgoraFromUser {
    return this.stream.fromUser;
  }

  get role(): EduRoleTypeEnum {
    return RteRole2EduRole(EduClassroomConfig.shared.sessionInfo.roomType, this.fromUser.role);
  }
}
