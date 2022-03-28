import { EduClassroomConfig, EduRoomTypeEnum } from 'agora-edu-core';
import React from 'react';
import { EduContext } from '../contexts';
import { EduClassroomUIStore } from '../stores/common';

export const use1v1UIStores = () => React.useContext(EduContext.shared).oneToOneUI;
export const useInteractiveUIStores = () => React.useContext(EduContext.shared).interactiveUI;
export const useLectureUIStores = () => React.useContext(EduContext.shared).lectureUI;
export const useLectureH5UIStores = () => React.useContext(EduContext.shared).lectureH5UI;

export function useStore(): EduClassroomUIStore {
  const oneToOneUIStores = React.useContext(EduContext.shared).oneToOneUI;
  const interactiveUIStores = React.useContext(EduContext.shared).interactiveUI;
  const lectureUIStores = React.useContext(EduContext.shared).lectureUI;

  const type = EduClassroomConfig.shared.sessionInfo.roomType;
  switch (type) {
    case EduRoomTypeEnum.Room1v1Class:
      return oneToOneUIStores;
    case EduRoomTypeEnum.RoomSmallClass:
      return interactiveUIStores;
    case EduRoomTypeEnum.RoomBigClass:
      return lectureUIStores;
    default:
      throw new Error(`Unsupported room type ${type}`);
  }
}
