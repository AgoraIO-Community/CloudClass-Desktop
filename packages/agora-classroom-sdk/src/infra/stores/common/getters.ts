import { EduClassroomConfig, EduClassroomStore, EduRoomTypeEnum } from 'agora-edu-core';

export class Getters {
  constructor(private _classroomStore: EduClassroomStore) {}

  /**
   * 讲台显示/隐藏
   */
  get stageVisible() {
    const { flexProps } = this._classroomStore.roomStore;
    if (EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomSmallClass)
      return typeof flexProps.stage === 'undefined' ? true : !!flexProps?.stage;
    return false;
  }
}
