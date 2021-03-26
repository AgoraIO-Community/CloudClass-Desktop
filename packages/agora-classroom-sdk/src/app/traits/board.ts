import { ListenerCallbackType } from "@/types";
import { GlobalState } from "white-web-sdk";

/**
 * 白板协议
 */
 export interface WhiteBoardInterface {
  join(): Promise<any>;
  leave(): Promise<any>;

  grant: boolean;
  follow: boolean;
  networkConnected: boolean;
  fullscreen: boolean;

  on<EventName extends keyof WhiteBoardEventHandlerInterface>(
    eventName: EventName,
    listener: (
      ...args: ListenerCallbackType<WhiteBoardEventHandlerInterface[EventName]>
    ) => any
  ): this;
}

/**
 * 白板事件接口
 */
export interface WhiteBoardEventHandlerInterface {
  /**
   * GlobalState改变
   */
  GlobalStateChanged: (state: GlobalState) => void;
  /**
   * 授权白板
   */
  Grant: (state: boolean) => void;
  /**
   * 跟随
   */
  Follow: (state: boolean) => void;
  /**
   * 白板连接
   */
  Connection: (state: boolean) => void;
  /**
   * 全屏
   */
  FullScreen: (state: boolean) => void;
  /**
   * 失败
   */
  Error: (error: Error, reason: string) => void;
}