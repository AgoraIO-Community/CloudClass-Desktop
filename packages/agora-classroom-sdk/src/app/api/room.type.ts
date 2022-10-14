import { EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';

export enum RoomState {
  NO_STARTED,
  GOING,
  ENDED,
}

export type RoomInfo = {
  roomName: string;
  creatorId: string;
  roomId: string;
  roomType: EduRoomTypeEnum;
  roomState: RoomState;
  startTime: number;
  endTime: number;
  industry?: string;
  roleConfig?: Record<number, number>;
  roomProperties: RoomProperties;
  role: EduRoleTypeEnum; // 上次加入房间的角色
};

export type RoomListRequest = {
  nextId?: string;
  count?: number;
};

export type RoomListResponse = {
  total: number;
  nextId: string;
  count: number;
  list: RoomInfo[];
};
type RoomProperties = Record<string, any>;
export type RoomCreateRequest = {
  roomName: string;
  roomType: EduRoomTypeEnum;
  startTime: number;
  endTime: number;
  roomProperties?: RoomProperties;
};
export type RoomCreateResponse = {
  roomId: string;
};

export type RoomJoinRequest = {
  roomId: string;
  role: EduRoleTypeEnum;
};

export type RoomJoinNoAuthRequest = RoomJoinRequest & {
  userUuid: string;
};

export type RoomJoinResponse = {
  token: string;
  appId: string;
  roomDetail: RoomInfo;
};

export type RoomCredentialRequest = {
  roomUuid: string;
  userUuid: string;
  role: number;
};

export type RoomCredentialResponse = {
  appId: string;
  token: string;
  roomUuid: string;
  userUuid: string;
  role: number;
};

export type RoomCredentialNoAuthRequest = {
  roomUuid: string;
  userUuid: string;
  role: number;
};

export type RoomCredentialNoAuthResponse = {
  appId: string;
  token: string;
  roomUuid: string;
  userUuid: string;
  role: number;
};
