import { BoardState, FcrBoardRegion, MountOptions, FcrBoardRoomJoinConfig } from './wrapper/type';

export type BoardConfig = {
  appId: string;
  region: FcrBoardRegion;
  defaultState: BoardState;
  mountOptions: MountOptions;
} & FcrBoardRoomJoinConfig;
