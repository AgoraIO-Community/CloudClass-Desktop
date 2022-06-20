import { EduClassroomConfig, EduRoomTypeEnum, EduRoomSubtypeEnum } from 'agora-edu-core';
import React from 'react';
import { EduContext } from '../contexts';
import { EduClassroomUIStore } from '../stores/common';

export const use1v1UIStores = () => React.useContext(EduContext.shared).oneToOneUI;
export const useInteractiveUIStores = () => React.useContext(EduContext.shared).interactiveUI;
export const useLectureUIStores = () => React.useContext(EduContext.shared).lectureUI;
export const useLectureH5UIStores = () => React.useContext(EduContext.shared).lectureH5UI;
export const useVocationalUIStores = () => React.useContext(EduContext.shared).vocationalUI;
export const useVocationalH5UIStores = () => React.useContext(EduContext.shared).vocationalH5UI;

export function useStore(): EduClassroomUIStore {
  const oneToOneUIStores = React.useContext(EduContext.shared).oneToOneUI;
  const interactiveUIStores = React.useContext(EduContext.shared).interactiveUI;
  const lectureUIStores = React.useContext(EduContext.shared).lectureUI;
  const vocationalUIStores = React.useContext(EduContext.shared).vocationalUI;

  const type = EduClassroomConfig.shared.sessionInfo.roomType;
  const subType = EduClassroomConfig.shared.sessionInfo.roomSubtype;
  switch (type) {
    case EduRoomTypeEnum.Room1v1Class:
      return oneToOneUIStores;
    case EduRoomTypeEnum.RoomSmallClass:
      return interactiveUIStores;
    case EduRoomTypeEnum.RoomBigClass:
      if (subType === EduRoomSubtypeEnum.Vocational) {
        return vocationalUIStores;
      } else {
        return lectureUIStores;
      }
    default:
      throw new Error(`Unsupported room type ${type}`);
  }
}
