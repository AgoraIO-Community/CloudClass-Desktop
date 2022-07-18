import { EduRoleTypeEnum } from 'agora-edu-core';
import { action, autorun, computed, observable } from 'mobx';
import { AgoraCountdown } from '.';

export class PluginStore {
  constructor(private _widget: AgoraCountdown) {
    autorun(() => {
      if (!this.isController) {
        this.setShowSetting(false);
      }
    });
  }

  @observable
  number: number | null = 60;

  @observable
  showSetting = true;

  @action.bound
  setNumber(number: number | null) {
    this.number = number;
  }

  @action.bound
  setShowSetting(value: boolean) {
    this.showSetting = value;
  }

  @action.bound
  handleSetting(enabled: boolean) {
    this.setShowSetting(enabled);
  }

  /**
   * reset store
   */

  @action.bound
  resetStore() {
    this.setShowSetting(this.isController);
    this.number = 60;
  }

  @computed
  get maskEnable() {
    return this.isController ? !this.showSetting && this.isController : false;
  }

  /**
   * 获取时间差
   */
  @computed
  get getTimestampGap() {
    return this._widget.classroomStore.roomStore.clientServerTimeShift;
  }

  @computed
  get isController() {
    const { role } = this._widget.classroomConfig.sessionInfo;
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role);
  }
}
