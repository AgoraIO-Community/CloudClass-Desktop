import { EduClassroomConfig, EduRoleTypeEnum } from 'agora-edu-core';
import { action, computed, IReactionDisposer, Lambda, observable } from 'mobx';
import { EduUIStoreBase } from '../base';
import { transI18n } from 'agora-common-libs';
import { ToastApi } from '../../containers/toast';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
// import { ToastApi } from "@components/toast";

export class BoardUIStore extends EduUIStoreBase {
  protected _disposers: (IReactionDisposer | Lambda)[] = [];

  @observable
  isCopying = false;

  @observable
  isFullScreen = false;

  @observable
  isFoldStream=false;
  
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
  get boardContainerDimensions() {
    return {
      width: this.shareUIStore.classroomViewportSize.h5Width,
      height: this.shareUIStore.classroomViewportSize.h5Height,
    };
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
    return this.shareUIStore.isLandscape
      ? window.document.documentElement.clientWidth
      : window.document.documentElement.clientWidth;
  }

  @computed
  get boardContainerHeight() {
    return this.shareUIStore.isLandscape
      ? window.document.documentElement.clientHeight
      : this.boardContainerWidth * (714 / 1548);
  }
  onInstall() {
    const { role, userUuid } = EduClassroomConfig.shared.sessionInfo;

    if (role === EduRoleTypeEnum.student) {
      // only student
      this._disposers.push(
        computed(() => this.boardApi.grantedUsers).observe(async ({ newValue, oldValue }) => {
          const oldGranted = oldValue;
          const newGranted = newValue;
          if (newGranted.has(userUuid) && !oldGranted?.has(userUuid)) {
            ToastApi.open({
              persist: true,
              duration: 86400000,
              toastProps: {
                type: 'warn',
                icon: SvgIconEnum.FCR_HOST,
                iconColor: '#020065',
                content: transI18n('toast2.teacher.grant.permission2'),
                closable: true,
              },
            });
          }
          if (!newGranted.has(userUuid) && oldGranted?.has(userUuid)) {
            ToastApi.destroyAll();
            this.shareUIStore.addToast(transI18n('toast2.teacher.revoke.permission2'));
          }
        }),
      );
    }
  }

  
  @action.bound
  setIsFullScreen(value: boolean) {
    this.isFullScreen = value;
  }

  @action.bound
  setFoldStream(value: boolean) {
    this.isFoldStream = value;
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
