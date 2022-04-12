import {
  ExtensionController,
  EduRoleTypeEnum,
  ExtensionStoreEach as ExtensionStore,
} from 'agora-edu-core';
import { Toast } from '~ui-kit';
import { action, autorun, computed, observable, runInAction } from 'mobx';

// 2 为老师或者助教出题阶段 只可老师或者助教可见
// 1 为中间答题阶段，不同为老师或者助教和学生的权限问题
// 0 为最后结果展示阶段

type stagePanel = 0 | 1 | 2;

type optionType = 'radio' | 'checkbox';

const maxOptionCount = 5;

export class PluginStore {
  controller!: ExtensionController;
  context!: ExtensionStore;

  constructor(controller: ExtensionController, context: ExtensionStore) {
    this.context = context;
    this.controller = controller;

    autorun(() => {
      typeof this.context.roomProperties.extra?.pollState !== 'undefined' &&
        this.setStagePanel(this.context.roomProperties.extra.pollState);
      typeof this.context.roomProperties.extra?.pollTitle !== 'undefined' &&
        this.setTitle(this.context.roomProperties.extra.pollTitle);
      this.context.roomProperties.extra?.mode && this.setType(this.getTypeByMode);
      runInAction(() => {
        typeof this.context.roomProperties.extra?.pollItems !== 'undefined' &&
          (this.options = this.context.roomProperties.extra.pollItems);
      });
    });
  }

  @observable
  stagePanel: stagePanel = 2;

  @observable
  title: string = ''; // 题干

  @observable
  options: string[] = ['', ''];

  @observable
  selectedOptions: string[] = [];

  @observable
  type: optionType = 'radio';

  @action.bound
  setTitle(title: string) {
    this.title = title;
  }

  @action.bound
  setType(type: optionType) {
    this.type = type;
  }

  @action.bound
  addOption(text: string = '') {
    this.options = [...this.options, text];
  }
  @action.bound
  reduceOption() {
    this.options.splice(this.options.length - 1, 1);
  }

  @action.bound
  changeOptions(index: number, value: string) {
    this.options[index] = value;
  }

  @action.bound
  handleStartVote() {
    let body = {
      mode: this.type === 'radio' ? 1 : 2,
      pollItems: this.options,
      pollTitle: this.title,
    };
    this.controller.startPolling(body);
  }
  /**
   * 投票
   */
  @action.bound
  handleSubmitVote() {
    const userUuid = this.context.context.localUserInfo.userUuid;
    const selectedIndexs = this.selectedIndexs;
    return new Promise((resolve, reject) => {
      this.controller
        .submitResult(this.context.roomProperties.extra.pollId, userUuid, {
          selectIndex: selectedIndexs,
        })
        .then((res) => {
          const data = res.data;
          this.context.setUserProperties({ pollId: data?.pollId });
          resolve(data);
        })
        .catch((e) => {
          Toast.show({
            type: 'error',
            text: JSON.stringify(e),
            closeToast: () => {},
          });
          reject(e);
        });
    });
  }

  /**
   * 结束投票
   */

  @action.bound
  handleStopVote() {
    this.controller.stopPolling(this.context.roomProperties.extra.pollId);
  }

  @action.bound
  setStagePanel(state: stagePanel) {
    this.stagePanel = state;
  }

  @action.bound
  hanldeSelectedOptions(e: any) {
    const checked = e.target.checked,
      value = e.target.value;
    if (this.type === 'radio') {
      checked ? (this.selectedOptions[0] = value) : (this.selectedOptions = []);
    } else if (this.type === 'checkbox') {
      this.selectedOptions = checked
        ? [...this.selectedOptions, value]
        : this.selectedOptions.filter((option: string) => option !== value);
    }
  }

  @action.bound
  resetStore() {
    this.stagePanel = 2;
    this.title = '';
    this.options = ['', ''];
    this.selectedOptions = [];
    this.type = 'radio';
  }
  /**
   * 获取时间差
   */
  @computed
  get getTimestampGap() {
    return this.context.context.methods.getTimestampGap();
  }

  @computed
  get getTypeByMode() {
    let mode = 'radio';
    if (this.context.roomProperties.extra?.mode) {
      mode = this.context.roomProperties.extra.mode === 1 ? 'radio' : 'checkbox';
    }
    return mode as optionType;
  }

  @computed
  get isController() {
    return (
      this.context.context.localUserInfo.roleType === EduRoleTypeEnum.teacher ||
      this.context.context.localUserInfo.roleType === EduRoleTypeEnum.assistant
    );
  }

  @computed
  get isTeacherType() {
    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant, EduRoleTypeEnum.observer].includes(
      this.context.context.localUserInfo.roleType,
    );
  }

  @computed
  get addBtnCls() {
    return this.options.length >= maxOptionCount ? 'visibility-hidden' : 'visibility-visible';
  }

  @computed
  get reduceBtnCls() {
    return this.options.length > 2 ? 'visibility-visible' : 'visibility-hidden';
  }

  @computed
  get submitDisabled() {
    return (
      !this.title ||
      this.options.some((value: string) => !value) ||
      new Set(this.options).size !== this.options.length
    );
  }

  @computed
  get pollingResult() {
    return this.context.roomProperties.extra?.pollDetails;
  }

  @computed
  get selectedIndexs() {
    return this.selectedOptions.map((selectedOption: string) =>
      this.options.findIndex((option) => option === selectedOption),
    );
  }

  @computed
  get isShowResultSection() {
    // 1.当前有控制权限并处于答题阶段
    // 2.已经结束答题
    if (this.stagePanel === 1 && this.isController) {
      return true;
    } else if (this.stagePanel === 1 && this.context.userProperties?.pollId) {
      return true;
    } else if (this.stagePanel === 0) {
      return true;
    }
    return false;
  }

  @computed
  get isInitinalStage() {
    return this.stagePanel === 2 && this.isTeacherType;
  }

  /**
   * for students
   */
  @computed
  get isShowVote() {
    return !this.isShowResultSection && this.stagePanel === 1 && !this.isTeacherType;
  }

  @computed
  get isShowVoteBtn() {
    return (
      this.isShowVote && this.context.context.localUserInfo.roleType !== EduRoleTypeEnum.invisible
    );
  }

  @computed
  get visibleVote() {
    return this.isShowVote && this.context.userProperties?.pollId;
  }
}
