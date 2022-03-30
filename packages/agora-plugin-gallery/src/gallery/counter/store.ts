import {
  ExtensionController,
  EduRoleTypeEnum,
  ExtensionStoreEach as ExtensionStore,
} from 'agora-edu-core';
import { action, autorun, computed, observable } from 'mobx';
import { COUNTDOWN } from '../../constants';

export class PluginStore {
  controller!: ExtensionController;
  context!: ExtensionStore;

  constructor(controller: ExtensionController, context: ExtensionStore) {
    this.context = context;
    this.controller = controller;

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
  handleSetting(enabled: boolean, data?: object) {
    this.setShowSetting(enabled);
    data && this.context.context.methods.setActive(COUNTDOWN, data);
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
    return this.context.context.methods.getTimestampGap();
  }

  @computed
  get isController() {
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
      this.context.context.localUserInfo.roleType,
    );
  }
}
