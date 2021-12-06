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
