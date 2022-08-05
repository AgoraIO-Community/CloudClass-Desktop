import { EduRoleTypeEnum } from 'agora-edu-core';
import { Lodash } from 'agora-rte-sdk';
import { action, autorun, computed, observable, reaction, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { AgoraSelector } from '.';

const answerConfine = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const maxOptionsLength = answerConfine.length; // 最大选项长度
const minOptionsLength = 2; // 最小选项长度

type answerState = 0 | 1 | 2; // 0 答题结束 1 答题中 2 本地状态只为有控制权限提供

export class PluginStore {
  clock: string = '';

  constructor(private _widget: AgoraSelector) {
    autorun(() => {
      const { extra } = _widget.roomProperties;
      typeof extra?.answerState !== 'undefined' && this.setAnswerState(extra.answerState);
      runInAction(() => {
        typeof extra?.items !== 'undefined' && (this.answerList = extra.items);
      });
    });

    autorun(() => {
      const { selectedItems } = _widget.userProperties;
      typeof selectedItems !== 'undefined' && this.setSelectedAnswers(selectedItems);
    });

    reaction(
      () => this._widget.roomProperties,
      () => {
        const { extra } = _widget.roomProperties;
        if (this.isTeacherType && extra?.answerState) {
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
    const { extra } = this._widget.roomProperties;
    const { popupQuizId } = this._widget.userProperties;
    if (extra?.popupQuizId === popupQuizId) {
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
    const { x, y } = this._widget.track.ratioVal.ratioPosition;
    const body = {
      correctItems: this.selectedAnswers,
      items: this.answerList,
      position: { xaxis: x, yaxis: y },
    };
    const roomId = this._widget.classroomStore.connectionStore.sceneId;
    this._widget.classroomStore.api.startAnswer(roomId, body);
  }

  @action.bound
  handleStop() {
    const { extra } = this._widget.roomProperties;
    const roomId = this._widget.classroomStore.connectionStore.sceneId;
    this._widget.classroomStore.api.stopAnswer(roomId, extra.popupQuizId);
  }

  @action.bound
  handleSubmitAnswer() {
    if (this.isAnswered && !this.localOptionPermission) {
      this.localOptionPermission = true;
    } else {
      const { userUuid } = this._widget.classroomConfig.sessionInfo;
      const { extra } = this._widget.roomProperties;
      const popupQuizId = extra.popupQuizId;
      const selectedItems = this.selectedAnswers.sort();
      const roomId = this._widget.classroomStore.connectionStore.sceneId;
      this._widget.classroomStore.api.submitAnswer(roomId, popupQuizId, userUuid, {
        selectedItems,
      });
      this._widget.updateWidgetProperties({ extra: { ts: Date.now() } });
      this.localOptionPermission = false;
    }
  }

  getAnswerList = (nextId: number, count: number) => {
    const { extra } = this._widget.roomProperties;
    const roomId = this._widget.classroomStore.connectionStore.sceneId;
    return this._widget.classroomStore.api.getAnswerList(roomId, extra.popupQuizId, {
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
      this._widget.classroomStore.roomStore.sendRewards(args);
    }
  }

  /**
   * 获取时间差
   */
  @computed
  get getTimestampGap() {
    return this._widget.classroomStore.roomStore.clientServerTimeShift;
  }

  @computed
  get receiveQuestionTime() {
    const { extra } = this._widget.roomProperties;
    return extra?.receiveQuestionTime;
  }

  @computed
  get getCurrentServerTime() {
    return Date.now() + this.getTimestampGap;
  }

  @computed
  get isController() {
    const { role } = this._widget.classroomConfig.sessionInfo;
    return role === EduRoleTypeEnum.teacher || role === EduRoleTypeEnum.assistant;
  }

  @computed
  get isTeacherType() {
    const { role } = this._widget.classroomConfig.sessionInfo;

    return [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant, EduRoleTypeEnum.observer].includes(
      role,
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
    const { extra } = this._widget.roomProperties;
    return (
      (this.answerState === 2 && this.isTeacherType) ||
      (extra?.answerState === 1 && !this.isTeacherType)
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
    const { role } = this._widget.classroomConfig.sessionInfo;
    return (
      [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(role) &&
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
    const { role } = this._widget.classroomConfig.sessionInfo;
    return this.answerState === 1 && !this.isTeacherType && role !== EduRoleTypeEnum.invisible;
  }

  @computed
  get isAnswered() {
    const { extra } = this._widget.roomProperties;
    const { popupQuizId } = this._widget.userProperties;
    return extra?.popupQuizId === popupQuizId && extra?.popupQuizId;
  }

  @computed
  get answeredNumber() {
    const { extra } = this._widget.roomProperties;
    return `${extra?.selectedCount || 0}/${extra?.totalCount || 0}`;
  }

  @computed
  get currentAnalysis() {
    const { extra } = this._widget.roomProperties;
    return `${Math.floor((extra?.averageAccuracy || 0) * 100)}%`;
  }

  @computed
  get currentAnswer() {
    const { extra } = this._widget.roomProperties;
    return extra?.correctItems || [];
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
    const { extra } = this._widget.roomProperties;
    return extra?.receiveQuestionTime;
  }

  @computed
  get myAnswer() {
    const { selectedItems } = this._widget.userProperties;
    return selectedItems;
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
