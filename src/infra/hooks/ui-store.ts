import { EduClassroomConfig, EduRoomTypeEnum, Platform } from 'agora-edu-core';
import React from 'react';
import { EduContext } from '../contexts';
import { EduClassroomUIStore } from '../stores/common';
import { EduInteractiveUIClassStore } from '../stores/interactive';
import { EduLectureUIStore } from '../stores/lecture';
import { EduLectureH5UIStore } from '../stores/lecture-mobile';
import { Edu1v1ClassUIStore } from '../stores/one-on-one';

export const use1v1UIStores = () =>
  React.useContext(EduContext.shared).oneToOneUI as Edu1v1ClassUIStore;
export const useInteractiveUIStores = () =>
  React.useContext(EduContext.shared).interactiveUI as EduInteractiveUIClassStore;
export const useLectureUIStores = () =>
  React.useContext(EduContext.shared).lectureUI as EduLectureUIStore;
export const useLectureH5UIStores = () =>
  React.useContext(EduContext.shared).lectureH5UI as EduLectureH5UIStore;

export function useStore(): EduClassroomUIStore {
  const oneToOneUIStores = React.useContext(EduContext.shared).oneToOneUI;
  const interactiveUIStores = React.useContext(EduContext.shared).interactiveUI;
  const lectureUIStores = React.useContext(EduContext.shared).lectureUI;
  const lectureH5UIStores = React.useContext(EduContext.shared).lectureH5UI;

  const type = EduClassroomConfig.shared.sessionInfo.roomType;
  const isH5 = EduClassroomConfig.shared.platform === Platform.H5;
  switch (type) {
    case EduRoomTypeEnum.Room1v1Class:
      return oneToOneUIStores;
    case EduRoomTypeEnum.RoomSmallClass:
      return interactiveUIStores;
    case EduRoomTypeEnum.RoomBigClass:
      return isH5 ? lectureH5UIStores : lectureUIStores;
    default:
      throw new Error(`Unsupported room type ${type}`);
  }
}
