export interface GroupUser {
  userUuid: string;
  userName: string;
}

export class GroupDetail {
  groupName: string;
  users: GroupUser[];
  sort?: number;
  constructor(groupName: string, users: GroupUser[], sort?: number) {
    this.groupName = groupName;
    this.users = users;
    this.sort = sort;
  }
}

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

export interface PatchGroup {
  groupUuid: string;
  groupName?: string;
  sort?: number;
  addUsers?: GroupUser[];
  removeUsers?: GroupUser[];
}
