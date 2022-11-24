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
