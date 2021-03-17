import { ListenerCallbackType } from "@/types";
import { DeviceManagerInterface } from "./device";
import { QualityDiagnosticsInterface } from "./quality";
import { LocalUserInterface } from "./user";

/**
 * 房间协议
 */
 export interface RoomInterface {

  roomUuid: string;
  localUser: LocalUserInterface;
  deviceManager: DeviceManagerInterface;
  qualityDiagnostics: QualityDiagnosticsInterface;

  join(): Promise<any>;
  leave(): Promise<any>;

  on<EventName extends keyof RoomEventHandlerInterface>(
    eventName: EventName,
    listener: (
      ...args: ListenerCallbackType<RoomEventHandlerInterface[EventName]>
    ) => any
  ): this;
}

export type RoomState = {
  roomUuid: string,
  classState: number,
}

/**
 * 白板事件接口
 */
export interface RoomEventHandlerInterface {
  /**
   * 本地用户状态变化
   */
  LocalUser: (userState: LocalUserInterface) => void;
  /**
   * 质量变化
   */
  QualityDiagnostics: (quality: QualityDiagnosticsInterface) => void;
  /**
   * 房间状态变化
   */
  RoomState: (roomState: RoomState) => void;
  /**
   * 失败
   */
  Error: (error: Error, reason: string) => void;
}