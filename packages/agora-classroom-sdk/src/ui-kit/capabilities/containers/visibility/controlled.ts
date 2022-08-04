import { FcrUIConfig } from '@/infra/types/config';

// header
export const headerEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.header.stateBar.enable;
};

export const networkStateEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.header.stateBar.networkState.enable;
};

export const roomNameEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.header.stateBar.roomName.enable;
};

export const scheduleTimeEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.header.stateBar.scheduleTime.enable;
};

export const cameraSwitchEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.header.stateBar.camera.enable;
};

export const microphoneSwitchEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.header.stateBar.microphone.enable;
};

// stage
export const teacherVideoEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.teacherVideo.enable;
};

export const teacherOffStageEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.teacherVideo.offStage.enable;
};

export const teacherResetPosEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.teacherVideo.resetPosition.enable;
};

export const studentVideoEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.studentVideo.enable;
};

export const studentBoardAuthEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.studentVideo.boardAuthorization.enable;
};

export const studentCameraToolEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.studentVideo.camera.enable;
};

export const studentMicrophoneToolEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.studentVideo.microphone.enable;
};

export const studentOffStageEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.studentVideo.offStage.enable;
};

export const studentRewardEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.stage.studentVideo.reward.enable;
};
//engagement
export const boardEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.netlessBoard.enable;
};
export const boardEraserEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.eraser.enable;
};
export const boardHandEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.move.enable;
};
export const boardLaserPointerEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.laserPointer.enable;
};
export const boardMouseEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.mouse.enable;
};
export const boardPencilEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.pencil.enable;
};
export const boardSaveEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.save.enable;
};
export const boardSelectorEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.selector.enable;
};
export const boardSwitchEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.switch.enable;
};
export const boardTextEnabled = (uiConfig: FcrUIConfig) => {
  return boardEnabled(uiConfig) && uiConfig.engagement.netlessBoard.text.enable;
};
export const chatEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.extension.agoraChat.enable;
};
export const chatEmojiEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.extension.agoraChat.emoji.enable;
};
export const chatMuteAllEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.extension.agoraChat.muteAll.enable;
};
export const chatPictureEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.extension.agoraChat.picture.enable;
};
export const breakoutRoomEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.breakoutRoom.enable;
};
export const cloudStorageEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.cloudStorage.enable;
};
export const counterEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.counter.enable;
};
export const pollEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.poll.enable;
};
export const popupQuizEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.popupQuiz.enable;
};
export const raiseHandEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.raiseHand.enable;
};
export const rosterEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.roster.enable;
};
export const screenShareEnabled = (uiConfig: FcrUIConfig) => {
  return uiConfig.engagement.screenShare.enable;
};

export const toolbarEnabled = (uiConfig: FcrUIConfig) => {
  return (
    boardEraserEnabled(uiConfig) ||
    boardHandEnabled(uiConfig) ||
    boardMouseEnabled(uiConfig) ||
    boardPencilEnabled(uiConfig) ||
    boardSaveEnabled(uiConfig) ||
    boardSelectorEnabled(uiConfig) ||
    boardSwitchEnabled(uiConfig) ||
    boardTextEnabled(uiConfig) ||
    cloudStorageEnabled(uiConfig) ||
    rosterEnabled(uiConfig) ||
    cabinetEnabled(uiConfig)
  );
};

export const cabinetEnabled = (uiConfig: FcrUIConfig) => {
  return (
    screenShareEnabled(uiConfig) ||
    breakoutRoomEnabled(uiConfig) ||
    boardLaserPointerEnabled(uiConfig) ||
    popupQuizEnabled(uiConfig) ||
    counterEnabled(uiConfig) ||
    pollEnabled(uiConfig)
  );
};

export const teacherStreamToolsPanelEnabled = (uiConfig: FcrUIConfig) => {
  return teacherOffStageEnabled(uiConfig) || teacherResetPosEnabled(uiConfig);
};

export const studentStreamToolsPanelEnabled = (uiConfig: FcrUIConfig) => {
  return (
    studentBoardAuthEnabled(uiConfig) ||
    studentCameraToolEnabled(uiConfig) ||
    studentMicrophoneToolEnabled(uiConfig) ||
    studentOffStageEnabled(uiConfig) ||
    studentRewardEnabled(uiConfig)
  );
};
