import { ListenerCallbackType } from "@/types";
import { LocalUserRenderer } from "agora-rte-sdk";


export interface DeviceManagerInterface {
  /**
   * 打开摄像头
   */
  openCamera(): Promise<LocalUserRenderer>;
  /**
   * 关闭摄像头
   */
  closeCamera(): void;
  /**
   * 打卡麦克风
   */
  openMicrophone(): Promise<any>;
  /**
   * 关闭麦克风
   */
  closeMicrophone(): void;
  /**
   * 申请屏幕共享权限
   */
  requestScreenShare(): Promise<any>;
  /**
   * 打开屏幕共享
   */
  startScreenShare(): Promise<any>;
  /**
   * 停止屏幕共享
   */
  stopScreenShare(): Promise<any>;

  on<EventName extends keyof DeviceManagerEventHandlerInterface>(
    eventName: EventName,
    listener: (
      ...args: ListenerCallbackType<DeviceManagerEventHandlerInterface[EventName]>
    ) => any
  ): this;
}

export enum LocalRendererReason {
  Success = 1,
  Failure = 2,
  Busy = 3,
  Stub = 4,
  Freeze = 5,
}

export interface DeviceManagerEventHandlerInterface {
  CameraRenderer: (renderer: LocalUserRenderer, reason: LocalRendererReason) => void;
  ScreenRenderer: (renderer: LocalUserRenderer, reason: LocalRendererReason) => void;
}