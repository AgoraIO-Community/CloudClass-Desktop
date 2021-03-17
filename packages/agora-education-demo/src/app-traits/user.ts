import { AgoraEduUser, EduRoleTypeEnum } from "agora-rte-sdk";

/**
 * 用户
 */
 export interface LocalUserInterface {

  userUuid: string;
  userName: string;
  userRole: EduRoleTypeEnum;

  state: number;

  publishStream(): Promise<any>;
  unPublishStream(): Promise<any>;
  publishScreenShare(): Promise<any>;
  unPublishScreenShare(): Promise<any>;
}

/**
 * 人员事件接口
 */
export interface UserEventHandlerInterface {

  Kick: (reason: string, operator: AgoraEduUser) => void;
  /**
   * 失败
   */
  Error: (error: Error, reason: string) => void;
}