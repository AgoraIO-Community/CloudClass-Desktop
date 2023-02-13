import { EduRoleTypeEnum } from 'agora-edu-core';

export enum DeviceState {
  // 设备开启
  enabled,
  // 设备关闭
  disabled,
  // 设备不可用
  unavailable,
  // 设备禁用
  unauthorized,
}

export type Operation =
  | 'podium'
  | 'grant-board'
  | 'camera'
  | 'microphone'
  | 'kick'
  | 'chat'
  | 'star'
  | 'supervise-student';

export type Operations = Partial<Record<Operation, { interactable: boolean }>>;

export type Profile = {
  uid: string | number;
  isOnPodium: boolean;
  cameraState: DeviceState;
  microphoneState: DeviceState;
};

/**
 * 分页查询用户参数
 */
export interface FetchUserParam {
  /**
   * 下一页的ID
   */
  nextId: string | number | null | undefined;
  /**
   * 一页查询多少条
   */
  count: number;
  /**
   * 筛选类型 0:全部 1:禁言
   */
  type: FetchUserType;
  /**
   * 查询角色
   */
  role: EduRoleTypeEnum;
  /**
   * 查询的用户名称，模糊查询
   */
  userName?: string;
}

/**
 * 筛选用户类型 0:全部 1:禁言
 */
export enum FetchUserType {
  /**
   * 筛选全部的用户
   */
  all = '0',
  /**
   * 筛选禁言的用户
   */
  mute = '1',
}
