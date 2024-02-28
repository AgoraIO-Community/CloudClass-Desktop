import { EduClassroomConfig, EduRoleTypeEnum } from 'agora-edu-core';
import { action, computed, IReactionDisposer, Lambda, observable } from 'mobx';
import { EduUIStoreBase } from '../base';
import { transI18n } from 'agora-common-libs';

export class BoardUIStore extends EduUIStoreBase {
  protected _disposers: (IReactionDisposer | Lambda)[] = [];

  @observable
  isCopying = false;

  get isTeacherOrAssistant() {
    const role = EduClassroomConfig.shared.sessionInfo.role;
    const isTeacherOrAssistant = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
      role,
    );
    return isTeacherOrAssistant;
  }

  @computed
  get grantedUsers() {
    return this.boardApi.grantedUsers;
  }

  @computed
  get isGrantedBoard() {
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    return this.grantedUsers.has(userUuid);
  }

  @computed
  get undoSteps() {
    return this.boardApi.undoSteps;
  }

  @computed
  get redoSteps() {
    return this.boardApi.redoSteps;
  }

  @computed
  get currentSceneIndex() {
    return this.boardApi.pageIndex;
  }

  @computed
  get scenesCount() {
    return this.boardApi.pageCount;
  }

  @computed
  get mounted() {
    return this.boardApi.mounted;
  }
  @computed
  get iconZoomVisibleCls() {
    return this.shareUIStore.orientation === 'portrait' ? 'fcr-hidden' : '';
  }

  @computed
  get whiteboardContainerCls() {
    return this.shareUIStore.orientation !== 'portrait' ? 'fcr-flex-1' : '';
  }

  @computed
  get boardContainerWidth() {
    return this.shareUIStore.isLandscape ? window.innerWidth : window.innerWidth;
  }

  @computed
  get boardContainerHeight() {
    return this.boardContainerWidth * (714 / 1548);
  }
  onInstall() {
    const { role, userUuid } = EduClassroomConfig.shared.sessionInfo;

    // if (role === EduRoleTypeEnum.student) {
    //   // only student
    //   this._disposers.push(
    //     computed(() => this.boardApi.grantedUsers).observe(async ({ newValue, oldValue }) => {
    //       const oldGranted = oldValue;
    //       const newGranted = newValue;
    //       const isInGroup = this.classroomStore.groupStore.groupUuidByUserUuid.get(userUuid);
    //       if (newGranted.has(userUuid) && !oldGranted?.has(userUuid)) {
    //         this.shareUIStore.addToast(transI18n('toast2.teacher.grant.permission'));
    //       }
    //       if (!newGranted.has(userUuid) && oldGranted?.has(userUuid)) {
    //         this.shareUIStore.addToast(transI18n('toast2.teacher.revoke.permission'));
    //       }
    //     }),
    //   );
    // }
  }

  @action.bound
  addMainViewScene() {
    this.boardApi.addPage();
  }

  @action.bound
  toPreMainViewScene() {
    this.boardApi.gotoPage(-1);
  }

  @action.bound
  toNextMainViewScene() {
    this.boardApi.gotoPage(1);
  }

  @action.bound
  setDelay(delay: number) {
    this.boardApi.setDelay(delay);
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
