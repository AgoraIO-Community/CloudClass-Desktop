export enum OrientationEnum {
  portrait = 'portrait',
  landscape = 'landscape',
}

export type ConfirmDialogAction = 'ok' | 'cancel';

export enum LayoutMaskCode {
  None = 0,
  StageVisible = 1,
  VideoGalleryVisible = 2,
}
export enum CustomMessageCommandType {
  deviceSwitch = 'deviceSwitch',
  deviceSwitchBatch = 'deviceSwitchBatch',
  handsUp = 'handsUp',
  handsUpAll = 'handsUpAll',
  inviteTeacher = 'inviteTeacher',
  cancelInvite = 'cancelInvite',
  teacherRejectInvite = 'teacherRejectInvite',
  teacherAcceptInvite = 'teacherAcceptInvite',
}
export type CustomMessageCancelInviteType = {
  groupUuid: string;
  groupName: string;
  isInvite: boolean;
  userUuid: string;
  userName: string;
};
export type CustomMessageRejectInviteType = {
  groupUuid: string;
};
export type CustomMessageAcceptInviteType = {
  groupUuid: string;
};
export type DialogType = 'confirm' | 'class-info';

export type CustomMessageData<T> = {
  cmd: CustomMessageCommandType;
  data: T;
};
export type CustomMessageInviteType = {
  groupUuid: string;
  groupName: string;
  isInvite: boolean;
  children: {
    id: string;
    name: string;
    isInvite: boolean;
  }[];

};
export type CustomMessageHandsUpType = {
  userUuid: string;
  state: CustomMessageHandsUpState;
};
export enum CustomMessageHandsUpState {
  lowerHand = 0,
  raiseHand = 1,
}
export type CustomMessageHandsUpAllType = {
  roomId?: string;
  operation: CustomMessageHandsUpState;
};
export type CustomMessageDeviceSwitchType = {
  roomId?: string;
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
export enum MobileCallState {
  Initialize = 'initialize',
  Processing = 'processing',
  VoiceCall = 'voiceCall',
  VideoCall = 'videoCall',
  VideoAndVoiceCall = 'videoAndVoiceCall',
  DeviceOffCall = 'deviceOffCall',
}
export type RejectToGroupArgs = {
  groupUuid: string;
  inviting: string;
  removeProgress: {
    fromUserUuid: string;
    payload: { groupName: string; groupUuid: string };
    role: string;
    userName: string;
    userUuid: string;
  }[];
};
