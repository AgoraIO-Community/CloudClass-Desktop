import {
  ExtensionController,
  EduRoleTypeEnum,
  ExtensionStoreEach as ExtensionStore,
} from 'agora-edu-core';
import { Lodash } from 'agora-rte-sdk';
import { action, autorun, computed, observable, reaction, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

const answerConfine = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const maxOptionsLength = answerConfine.length; // 最大选项长度
const minOptionsLength = 2; // 最小选项长度

type answerState = 0 | 1 | 2; // 0 答题结束 1 答题中 2 本地状态只为有控制权限提供

export class PluginStore {
  controller!: ExtensionController;
  context!: ExtensionStore;
  clock: string = '';

  constructor(controller: ExtensionController, context: ExtensionStore) {
    this.context = context;
    this.controller = controller;

    autorun(() => {
      typeof this.context.roomProperties.extra?.answerState !== 'undefined' &&
        this.setAnswerState(this.context.roomProperties.extra.answerState);
      typeof this.context.userProperties.selectedItems !== 'undefined' &&
        this.setSelectedAnswers(this.context.userProperties.selectedItems);
      runInAction(() => {
        typeof this.context.roomProperties.extra?.items !== 'undefined' &&
          (this.answerList = this.context.roomProperties.extra.items);
      });
    });

    reaction(
      () => this.context.roomProperties,
      () => {
        if (this.isTeacherType && this.context.roomProperties.extra?.answerState) {
          this.fetchList();
        }
      },
    );
  }

  @observable
  answerState: answerState = 2;

  @observable
  answerList: string[] = ['A', 'B', 'C', 'D'];

  @observable
  selectedAnswers: string[] = [];

  @observable
  visibleSubmitBtn: boolean = false; // for student

  @observable
  localOptionPermission: boolean = false;

  @action.bound
  addOption() {
    const currentAnwserLen = this.answerList.length;
    this.answerList = answerConfine.slice(0, currentAnwserLen + 1);
  }

  @action.bound
  reduceOption() {
    const currentAnwserLen = this.answerList.length;
    const value = this.answerList[currentAnwserLen - 1];
    this.answerList = this.answerList.slice(0, currentAnwserLen - 1);
    this.selectedAnswers = this.selectedAnswers.filter((answer: string) => answer !== value);
  }

  @action.bound
  setSelectedAnswers(value: string[]) {
    if (
      this.context.roomProperties?.extra?.popupQuizId === this.context.userProperties.popupQuizId
    ) {
      this.selectedAnswers = value;
    } else {
      this.selectedAnswers = [];
    }
  }

  @action.bound
  setAnswerState(state: answerState) {
    this.answerState = state;
  }

  @action.bound
  handleOptionClick(value: string) {
    const target = this.selectedAnswers.find((answer: string) => answer === value);
    if (target) {
      this.selectedAnswers = this.selectedAnswers.filter((answer: string) => answer !== value);
    } else {
      this.selectedAnswers.push(value);
    }
  }

  @action.bound
  handleStart() {
    let body = {
      correctItems: this.selectedAnswers,
      items: this.answerList,
    };
    this.controller.startAnswer(body);
  }

  @action.bound
  handleStop() {
    this.controller.stopAnswer(this.context.roomProperties.extra.popupQuizId);
  }

  @action.bound
  handleSubmitAnswer() {
    if (this.isAnswered && !this.localOptionPermission) {
      this.localOptionPermission = true;
    } else {
      const userUuid = this.context.context.localUserInfo.userUuid;
      const popupQuizId = this.context.roomProperties.extra.popupQuizId;
      const selectedItems = this.selectedAnswers.sort();
      this.controller.submitAnswer(popupQuizId, userUuid, { selectedItems });
      this.localOptionPermission = false;
    }
  }

  getAnswerList = (nextId: number, count: number) => {
    return this.controller.getAnswerList(this.context.roomProperties.extra.popupQuizId, {
      nextId,
      count,
    });
  };

  @action.bound
  handleRestart() {
    this.resetStore();
  }

  @action.bound
  resetStore() {
    this.answerState = 2;
    this.answerList = ['A', 'B', 'C', 'D'];
    this.selectedAnswers = [];
    this.localOptionPermission = false;
  }

  @action.bound
  async sendAward(type: 'winner' | 'all') {
    const res = await this.getAnswerList(0, 10000);

    const students = res.data.list as { isCorrect: boolean; ownerUserUuid: string }[];

    if (!students.length) {
      return;
    }

    let args: { userUuid: string; changeReward: number }[] = [];

    if (type === 'winner') {
      args = students
        .filter(({ isCorrect }) => isCorrect)
        .map(({ ownerUserUuid }) => {
          return { userUuid: ownerUserUuid, changeReward: 1 };
        });
    } else {
      args = students.map(({ ownerUserUuid }) => {
        return { userUuid: ownerUserUuid, changeReward: 1 };
      });
    }

    if (args.length > 0) {
      this.controller.sendRewards(args);
    }
  }

  /**
   * 获取时间差
   */
  @computed
  get getTimestampGap() {
    return this.context.context.methods.getTimestampGap();
  }

  @computed
  get receiveQuestionTime() {
    return this.context.roomProperties.extra?.receiveQuestionTime;
  }

  @computed
  get getCurrentServerTime() {
    return Date.now() + this.getTimestampGap;
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
    return this.answerList.length >= maxOptionsLength
      ? 'answer-btn visibility-hidden'
      : 'answer-btn visibility-visible';
  }

  @computed
  get reduceBtnCls() {
    return this.answerList.length > minOptionsLength
      ? 'answer-btn visibility-visible'
      : 'answer-btn visibility-hidden';
  }

  @computed
  get isInitinalSection() {
    return this.answerState === 2 && this.isTeacherType;
  }

  @computed
  get isShowSelectionSection() {
    return (
      (this.answerState === 2 && this.isTeacherType) ||
      (this.context.roomProperties.extra?.answerState === 1 && !this.isTeacherType)
    );
  }

  @computed
  get isShowResultSection() {
    // 1.当前有控制权限并处于答题阶段
    // 2.没有控制权限，并且有popupQuizId代表已经答过题
    // 3.已经结束答题
    if (this.answerState === 1 && this.isTeacherType) {
      return true;
    } else if (!this.isTeacherType && this.answerState === 0) {
      return true;
    } else if (this.answerState === 0) {
      return true;
    }
    return false;
  }

  @computed
  get isShowAwardButton() {
    return (
      [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
        this.context.context.localUserInfo.roleType,
      ) &&
      this.isShowResultSection &&
      this.answerState === 0
    );
  }

  @computed
  get submitDisabled() {
    return !this.selectedAnswers.length;
  }

  /**
   * for students
   */
  @computed
  get isShowAnswerBtn() {
    return (
      this.answerState === 1 &&
      !this.isTeacherType &&
      this.context.context.localUserInfo.roleType !== EduRoleTypeEnum.invisible
    );
  }

  @computed
  get isAnswered() {
    return (
      this.context.roomProperties.extra?.popupQuizId === this.context.userProperties?.popupQuizId &&
      this.context.roomProperties.extra?.popupQuizId
    );
  }

  @computed
  get answeredNumber() {
    return `${this.context.roomProperties.extra?.selectedCount || 0}/${
      this.context.roomProperties.extra?.totalCount || 0
    }`;
  }

  @computed
  get currentAnalysis() {
    return `${Math.floor((this.context.roomProperties.extra?.averageAccuracy || 0) * 100)}%`;
  }

  @computed
  get currentAnswer() {
    return this.context.roomProperties.extra?.correctItems || [];
  }

  @computed
  get optionPermissions() {
    let cls = '';
    if (!this.isTeacherType && this.isAnswered && !this.localOptionPermission) {
      cls = 'not-allowed';
    }
    return cls;
  }

  @computed
  get isShowResultDetail() {
    return this.isTeacherType && this.answerState !== 2;
  }

  @computed
  get startTime() {
    return this.context.roomProperties.extra?.receiveQuestionTime;
  }

  @computed
  get myAnswer() {
    return this.context.userProperties?.selectedItems;
  }

  isSelectedAnswer = computedFn((value: string): boolean => {
    return this.selectedAnswers.some((answer: string) => answer === value);
  });

  @observable
  rslist: any[] = [];

  private _nextId = 0;

  private _extractPerson(arr: any) {
    var tempMap = new Map();
    arr.forEach((value: any) => {
      tempMap.set(value.ownerUserUuid, value);
    });
    return [...tempMap.values()];
  }

  @Lodash.throttled(1000)
  async fetchList() {
    try {
      const res = await this.getAnswerList(0, 100);
      const resultData = res.data;
      const list = this._extractPerson([...this.rslist, ...resultData.list]);

      this.setList(list);

      this._nextId = resultData.nextId;
    } catch (e) {
      console.error(e);
    }
  }

  @action.bound
  setList(list: any[]) {
    this.rslist = list;
  }
}
