export interface groupUser {
  userUuid: string;
  userName: string;
}
export class EduGroupDetail {
  groupName: string;
  users: groupUser[];
  sort?: number;
  constructor(groupName: string, users: groupUser[], sort?: number) {
    this.groupName = groupName;
    this.users = users;
    this.sort = sort;
  }
}

export class EduSubRoomConfig {
  subRoomName: string;
  invitationUserList: groupUser[];
  subRoomProperties?: Record<string, any>;
  constructor(
    subRoomName: string,
    invitationUserList: groupUser[],
    subRoomProperties?: Record<string, any>,
  ) {
    this.subRoomName = subRoomName;
    this.invitationUserList = invitationUserList;
    this.subRoomProperties = subRoomProperties;
  }
}

export interface EduPatchGroup {
  groupUuid: string;
  addUsers?: groupUser[];
  removeUsers?: groupUser[];
}
