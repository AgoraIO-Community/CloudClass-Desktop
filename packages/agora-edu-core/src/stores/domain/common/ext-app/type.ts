import { ClassroomState } from '../../../..';

export type AgoraExtAppContext = {
  properties: any;
  dependencies: Map<string, any>;
  localUserInfo: AgoraExtAppUserInfo;
  roomInfo: AgoraExtAppRoomInfo;
  language: string;
};

export type AgoraExtAppEventType =
  | 'user-list-changed'
  | 'room-state-changed'
  | 'connection-state-changed';
export interface AgoraExtAppEventHandler {
  onUserListChanged?(userList: AgoraExtAppUserInfo[]): void;
  onRoomStateChanged?(state: ClassroomState): void;
  onClose?(): void;
}

export interface AgoraExtAppController {
  shutdown(): void;
}

export interface IAgoraExtApp {
  language: string;
  appIdentifier: string;
  appName: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  icon?: any;
  customHeader?: JSX.Element;
  eventHandler?: AgoraExtAppEventHandler;
  extAppDidLoad(dom: Element, ctx: AgoraExtAppContext, handle: AgoraExtAppHandle): void;
  extAppRoomPropertiesDidUpdate(properties: any, cause: any): void;
  extAppWillUnload(): Promise<boolean>;
  setController?(controller: AgoraExtAppController): void;
}

export type AgoraExtAppHandle = {
  updateRoomProperties: (properties: any, common: any, cause: any) => Promise<void>;
  deleteRoomProperties: (properties: string[], cause: any) => Promise<void>;
};

export type AgoraExtAppUserInfo = {
  userUuid: string;
  userName: string;
  roleType: number;
};

export type AgoraExtAppRoomInfo = {
  roomUuid: string;
  roomName: string;
  roomType: number;
};
