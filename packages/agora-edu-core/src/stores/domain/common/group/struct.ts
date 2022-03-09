import { GroupUser } from './type';

export class SubRoomConfig {
  subRoomUuid: string;
  subRoomName: string;
  invitationUserList: GroupUser[];
  subRoomProperties?: Record<string, any>;
  constructor(
    subRoomUuid: string,
    subRoomName: string,
    invitationUserList: GroupUser[],
    subRoomProperties?: Record<string, any>,
  ) {
    this.subRoomUuid = subRoomUuid;
    this.subRoomName = subRoomName;
    this.invitationUserList = invitationUserList;
    this.subRoomProperties = subRoomProperties;
  }
}
