import { AgoraFromUser, AgoraRteMediaPublishState } from 'agora-rte-sdk';
import { EduClassroomConfig, EduRoleTypeEnum, EduStream } from '../../../..';
import { RteRole2EduRole } from '../../../../utils';
import { CameraPlaceholderType } from '../type';
export class EduStreamUI {
  readonly stream: EduStream;
  constructor(stream: EduStream) {
    this.stream = stream;
  }

  get micIconType() {
    //TODO device state
    return this.audioMuted ? 'microphone-off' : 'microphone-on';
  }

  get micIconClass() {
    //TODO device state
    return 'available';
  }

  get videoMuted(): boolean {
    return this.stream.videoState === AgoraRteMediaPublishState.Unpublished;
  }

  get audioMuted(): boolean {
    return this.stream.audioState === AgoraRteMediaPublishState.Unpublished;
  }

  get fromUser(): AgoraFromUser {
    return this.stream.fromUser;
  }

  get role(): EduRoleTypeEnum {
    return RteRole2EduRole(EduClassroomConfig.shared.sessionInfo.roomType, this.fromUser.role);
  }
}
