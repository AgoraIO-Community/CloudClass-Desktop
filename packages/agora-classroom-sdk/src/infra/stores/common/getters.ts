import { EduClassroomConfig, EduRoomTypeEnum } from 'agora-edu-core';
import { EduClassroomUIStore } from '.';

export class Getters {
  constructor(protected _classroomUIStore: EduClassroomUIStore) {}

  protected get classroomStore() {
    return this._classroomUIStore.classroomStore;
  }

  /**
   * 讲台显示/隐藏
   */
  get stageVisible() {
    const { flexProps } = this.classroomStore.roomStore;
    if (EduClassroomConfig.shared.sessionInfo.roomType === EduRoomTypeEnum.RoomSmallClass)
      return typeof flexProps.stage === 'undefined' ? true : !!flexProps?.stage;
    return false;
  }
}
