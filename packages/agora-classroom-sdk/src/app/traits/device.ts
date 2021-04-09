import { ListenerCallbackType } from "@/types";
import { LocalUserRenderer } from "agora-rte-sdk";
import { QualityDiagnosticsInterface } from ".";


export interface DeviceManager {
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
  NetworkQuality: (quality: QualityDiagnosticsInterface, reason: string) => void;
}

export interface DevicePretestManagerInterface {
  /**
   * 打开摄像头
   */
  openTestCamera(): Promise<LocalUserRenderer>;
  /**
   * 关闭摄像头
   */
  closeTestCamera(): void;
  /**
   * 切换摄像头
   */
  changeTestCamera(deviceId: string): Promise<any>;
  /**
   * 打卡麦克风
   */
  openTestMicrophone(): Promise<any>;
  /**
   * 关闭麦克风
   */
  closeTestMicrophone(): void;
  /**
   * 更换麦克风
   */
  changeTestMicrophone(deviceId: string): void;
}

export interface DevicePretestManagerEventHandlerInterface {
  CameraRenderer: (renderer: LocalUserRenderer, reason: LocalRendererReason) => void;
}