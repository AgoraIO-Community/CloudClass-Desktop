export enum DeviceState {
  enabled,
  disabled,
  unavailable,
}

export type Operation =
  | 'podium'
  | 'grant-board'
  | 'camera'
  | 'microphone'
  | 'kick'
  | 'chat'
  | 'star';
