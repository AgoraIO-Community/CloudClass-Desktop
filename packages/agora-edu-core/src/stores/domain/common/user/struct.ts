import { AgoraUser } from 'agora-rte-sdk';
import { EduClassroomConfig, EduRoleTypeEnum } from '../../../..';
import { RteRole2EduRole } from '../../../../utils';

export class EduUser {
  userUuid: string;
  userName: string;
  userRole: EduRoleTypeEnum;
  userProperties: any;
  constructor(user: AgoraUser) {
    this.userUuid = user.userUuid;
    this.userName = user.userName;
    this.userRole = RteRole2EduRole(EduClassroomConfig.shared.sessionInfo.roomType, user.userRole);
    this.userProperties = user.userProperties;
  }
}
