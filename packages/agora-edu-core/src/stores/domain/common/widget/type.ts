export interface IAgoraWidget {
  widgetId: string;
  widgetDidLoad(dom: Element, widgetProps: any, sendMsg?: any, onReceivedMsg?: any): void;
  widgetWillUnload(): void;
}

export declare type AgoraWidgetUserInfo = {
  userUuid: string;
  userName: string;
  roleType: number;
};
export declare type AgoraWidgetRoomInfo = {
  roomUuid: string;
  roomName: string;
  roomType: number;
};
export declare type AgoraWidgetContext = {
  events: any;
  actions: any;
  dependencies: Map<string, any>;
  localUserInfo: AgoraWidgetUserInfo;
  roomInfo: AgoraWidgetRoomInfo;
  language: string;
};

// 弹窗式组件，嵌入式组件
export enum AgoraExtensionAppTypeEnum {
  'POPUP' = 'PUPUP',
  'PLUGININ' = 'PLUGININ',
}

export interface IAgoraExtensionRoomProperties {
  state: 0 | 1;
  ownerUserUuid: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  extra: any;
}

export interface IAgoraExtensionStore {
  roomProperties: IAgoraExtensionRoomProperties;
  userProperties: any;
  setRoomProperties(properties: IAgoraExtensionRoomProperties): void;
  setUserProperties(properites: any): void;
}

export interface IAgoraExtensionController {
  updateWidgetProperties(body: any): void;
  deleteWidgetProperties(body: any): void;
  removeWidgetExtraProperties(body: any): void;
  setWidgetUserProperties(userUuid: string, body: any): void;
  removeWidgetUserProperties(userUuid: string, body: any): void;
}

export interface IAgoraExtensionApp {
  type: AgoraExtensionAppTypeEnum;
  trackPath?: boolean;
  icon?: any;
  width: number;
  height: number;
  appIdentifier: string;
  appName: string;
  customHeader?: JSX.Element;
  apply(stroe: IAgoraExtensionStore, extensionController: IAgoraExtensionController): void;
  render(dom: HTMLElement): void;
  destory(): void;
}

enum AgoraWidgetContextMethodsEnum {
  'GetTimestampGap' = 'getTimestampGap',
  'SetActive' = 'setActive',
  'SetInactive' = 'setInactive',
}

export type AgoraExtensionAppContext = {
  dependencies: Map<string, any>;
  localUserInfo: AgoraExtensionAppUserInfo;
  roomInfo: AgoraExtensionAppRoomInfo;
  language: string;
  methods: Record<AgoraWidgetContextMethodsEnum, any>;
};

export type AgoraExtensionAppUserInfo = {
  userUuid: string;
  userName: string;
  roleType: number;
};

export type AgoraExtensionAppRoomInfo = {
  roomUuid: string;
  roomName: string;
  roomType: number;
};
