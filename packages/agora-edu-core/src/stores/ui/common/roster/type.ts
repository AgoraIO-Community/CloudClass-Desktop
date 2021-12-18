export enum DeviceState {
  // published
  enabled,
  // unpublished
  disabled,
  // not on podium
  unavailable,
  // on podium but device is unauthorized
  unauthorized,
}

export type Operation =
  | 'podium'
  | 'grant-board'
  | 'camera'
  | 'microphone'
  | 'kick'
  | 'chat'
  | 'star';

export type Operations = Partial<Record<Operation, { interactable: boolean }>>;
