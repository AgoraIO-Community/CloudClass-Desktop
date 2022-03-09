// import { GroupDetail } from './struct';

// 是否开启分组 1开启 0不开启
export enum GroupState {
  OPEN = 1,
  CLOSE = 0,
}

export interface GroupUser {
  userUuid: string;
  userName: string;
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
  addUsers?: GroupUser[];
  removeUsers?: GroupUser[];
}