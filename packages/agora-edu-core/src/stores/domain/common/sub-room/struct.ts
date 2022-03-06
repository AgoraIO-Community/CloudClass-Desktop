import { EduRoleTypeEnum } from '../../../..';

export interface IAgoraSubRoomSessionInfo {
  roomUuid: string;
  roomName: string;
  userUuid: string;
  userName: string;
  role: EduRoleTypeEnum;
}

export class EduSubRoomSessionInfo {
  roomUuid: string;
  roomName: string;
  userUuid: string;
  userName: string;
  role: EduRoleTypeEnum;
  constructor(data: IAgoraSubRoomSessionInfo) {
    this.roomUuid = data.roomUuid;
    this.roomName = data.roomName;
    this.userUuid = data.userUuid;
    this.userName = data.userName;
    this.role = data.role;
  }
}
