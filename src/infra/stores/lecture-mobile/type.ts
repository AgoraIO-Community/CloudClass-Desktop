export enum CustomMessageCommandType {
  deviceSwitch = 'deviceSwitch',
  deviceSwitchBatch = 'deviceSwitchBatch',
  handsUp = 'handsUp',
  handsUpAll = 'handsUpAll',
}
export type DialogType = 'confirm' | 'class-info';

export type CustomMessageData<T> = {
  cmd: CustomMessageCommandType;
  data: T;
};
export type CustomMessageDeviceSwitchType = {
  deviceState: CustomMessageDeviceState;
  deviceType: CustomMessageDeviceType;
};
export enum CustomMessageDeviceType {
  camera = 1,
  mic = 2,
}
export enum CustomMessageDeviceState {
  close = 0,

  open = 1,
}

export enum DeviceSwitchDialogId {
  StartVideo = 'start-video',
  Unmute = 'unmute',
}

export type CommonDialogType<T = unknown> = {
  id?: string;
} & T;