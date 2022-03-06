import { AgoraUser } from 'agora-rte-sdk';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomTypeEnum } from '../../../..';
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

export interface IAgoraUserSessionInfo {
  roomUuid: string;
  roomName: string;
  roomType: EduRoomTypeEnum;
  userUuid: string;
  userName: string;
  role: EduRoleTypeEnum;
}

export class EduUserSessionInfo {
  roomUuid: string;
  roomName: string;
  roomType: EduRoomTypeEnum;
  userUuid: string;
  userName: string;
  role: EduRoleTypeEnum;
  constructor(data: IAgoraUserSessionInfo) {
    this.roomUuid = data.roomUuid;
    this.roomName = data.roomName;
    this.roomType = data.roomType;
    this.userUuid = data.userUuid;
    this.userName = data.userName;
    this.role = data.role;
  }
}
