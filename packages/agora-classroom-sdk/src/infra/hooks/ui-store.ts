import { EduClassroomConfig, EduRoomTypeEnum, EduRoomSubtypeEnum } from 'agora-edu-core';
import React from 'react';
import { EduContext } from '../contexts';
import { EduClassroomUIStore } from '../stores/common';
import { EduInteractiveUIClassStore } from '../stores/interactive';
import { EduLectureUIStore } from '../stores/lecture';
import { EduLectureH5UIStore } from '../stores/lecture-h5';
import { Edu1v1ClassUIStore } from '../stores/one-on-one';
import { EduVocationalUIStore } from '../stores/vocational';
import { EduVocationalH5UIStore } from '../stores/vocational-h5';

export const use1v1UIStores = () =>
  React.useContext(EduContext.shared).oneToOneUI as Edu1v1ClassUIStore;
export const useInteractiveUIStores = () =>
  React.useContext(EduContext.shared).interactiveUI as EduInteractiveUIClassStore;
export const useLectureUIStores = () =>
  React.useContext(EduContext.shared).lectureUI as EduLectureUIStore;
export const useLectureH5UIStores = () =>
  React.useContext(EduContext.shared).lectureH5UI as EduLectureH5UIStore;
export const useVocationalUIStores = () =>
  React.useContext(EduContext.shared).vocationalUI as EduVocationalUIStore;
export const useVocationalH5UIStores = () =>
  React.useContext(EduContext.shared).vocationalH5UI as EduVocationalH5UIStore;

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
