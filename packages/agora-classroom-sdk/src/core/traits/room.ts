/**
 * 房间协议
 */
 export interface RoomInterface {

  roomName: string;

  join(): Promise<any>;
  leave(): Promise<any>;
}

export type RoomState = {
  roomUuid: string,
  classState: number,
  state: 'joining' | 'joined' | 'leaving' | 'left'
}

/**
 * 白板事件接口
 */
export interface RoomEventHandlerInterface {
  /**
   * 房间状态变化
   */
  RoomState: (roomState: RoomState) => void;
  /**
   * 失败
   */
  RoomError: (error: Error, reason: string) => void;
}