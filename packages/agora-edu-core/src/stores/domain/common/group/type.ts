// 是否开启分组 1开启 0不开启
export enum GroupState {
  OPEN = 1,
  CLOSE = 0,
}

export interface GroupUser {
  userUuid: string;
  notJoined?: boolean;
}

export type GroupDetail = {
  groupName: string;
  users: GroupUser[];
  sort?: number;
};

export type GroupDetails = Record<string, GroupDetail>;

export interface PatchGroup {
  groupUuid: string;
  groupName?: string;
  sort?: number;
  addUsers?: string[];
  removeUsers?: string[];
}

export enum BroadcastMessageRange {
  MainRoom = 1,
  SubRoom = 2,
  All = 3,
}

export enum BroadcastMessageType {
  Text = 'txt',
  Image = 'img',
  Location = 'loc',
  Audio = 'audio',
  Video = 'video',
  File = 'file',
}
