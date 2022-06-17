import { action, computed, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { AGError, bound } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import {
  EduClassroomConfig,
  EduClassroomStore,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  WhiteboardState,
} from 'agora-edu-core';
import { EduShareUIStore } from './share-ui';
import { BUILTIN_WIDGETS } from './widget-ui';
import { isSupportedImageType } from '@/infra/utils';

export class BoardUIStore extends EduUIStoreBase {
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
      aspectRatio: 9 / 16,
    };
  }

  private _collectorContainer: HTMLElement | undefined = undefined;

  protected _disposers: IReactionDisposer[] = [];

  @observable
  isCopying = false;

  onInstall() {
    this._disposers.push(
      reaction(
        () => this.grantedUsers,
        (grantUsers) => {
          this.classroomStore.boardStore.setGrantedUsers(grantUsers);
        },
      ),
    );
  }

  get isTeacherOrAssistant() {
    const role = EduClassroomConfig.shared.sessionInfo.role;
    const isTeacherOrAssistant = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
      role,
    );
    return isTeacherOrAssistant;
  }
  // computed

  @computed
  get grantedUsers() {
    const boardWidgetProps = this.classroomStore.widgetStore.widgetPropsMap[
      BUILTIN_WIDGETS.boardWidget
    ] as {
      extra: { grantedUsers: string[] };
    };

    const grantedUsers = boardWidgetProps?.extra?.grantedUsers || {};

    return new Set(Object.keys(grantedUsers).filter((k) => grantedUsers[k]));
  }

  @computed
  get isGrantedBoard() {
    const { userUuid } = EduClassroomConfig.shared.sessionInfo;
    return this.grantedUsers.has(userUuid);
  }

  @computed
  get undoSteps() {
    return this.classroomStore.boardStore.undoSteps;
  }

  @computed
  get redoSteps() {
    return this.classroomStore.boardStore.redoSteps;
  }

  /**
   * 白板准备好挂载到 DOM
   * @returns
   */
  @computed
  get readyToMount() {
    return this.classroomStore.boardStore.ready;
  }

  /**
   * 白板连接中断
   * @returns
   */
  @computed
  get connectionLost() {
    return this.readyToMount && this.classroomStore.boardStore.state === WhiteboardState.Idle;
  }

  @computed
  get currentSceneIndex() {
    return this.classroomStore.boardStore.currentSceneIndex;
  }

  @computed
  get scenesCount() {
    return this.classroomStore.boardStore.scenesCount;
  }

  /**
   * 白板高度
   * @returns
   */
  get boardHeight() {
    const { roomType } = EduClassroomConfig.shared.sessionInfo;
    const viewportHeight = this.shareUIStore.classroomViewportSize.height;
    const height = this.uiOverrides.heightRatio * viewportHeight;
    if (roomType === EduRoomTypeEnum.Room1v1Class) {
      return height - this.shareUIStore.navBarHeight;
    }

    return height;
  }

  /**
   * 设置白板课件最小化 DOM
   */
  set collectorContainer(collectorContainer: HTMLElement) {
    this._collectorContainer = collectorContainer;
  }

  constructor(store: EduClassroomStore, shareUIStore: EduShareUIStore) {
    super(store, shareUIStore);
  }

  /**
   * 重连白板
   */
  @bound
  async rejoinWhiteboard() {
    try {
      await this.classroomStore.connectionStore.leaveWhiteboard();
      await this.classroomStore.connectionStore.joinWhiteboard();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 连接白板
   */
  @bound
  async joinWhiteboard() {
    try {
      await this.classroomStore.connectionStore.joinWhiteboard();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 断开白板
   */
  @bound
  async leaveWhiteboard() {
    try {
      await this.classroomStore.connectionStore.leaveWhiteboard();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 白板挂载到 DOM
   * @param dom
   */
  @bound
  async mount(dom: HTMLDivElement) {
    try {
      const options = this._collectorContainer
        ? {
            containerSizeRatio: this.uiOverrides.aspectRatio,
            collectorContainer: this._collectorContainer,
          }
        : { containerSizeRatio: this.uiOverrides.aspectRatio };
      await this.classroomStore.boardStore.mount(dom, options);
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 白板卸载，销毁白板实例
   */
  @bound
  async unmount() {
    try {
      await this.classroomStore.boardStore.unmount();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @action.bound
  addMainViewScene() {
    try {
      this.classroomStore.boardStore.addMainViewScene();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @action.bound
  toPreMainViewScene() {
    try {
      this.classroomStore.boardStore.toPreMainViewScene();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @action.bound
  toNextMainViewScene() {
    try {
      this.classroomStore.boardStore.toNextMainViewScene();
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * for teacher and assistent only
   *
   * @param event
   */
  @action.bound
  handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher ||
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.assistant
    ) {
      const file = event.dataTransfer.files[0];
      if (file && isSupportedImageType(file)) {
        event.dataTransfer.dropEffect = 'copy';
      }
    }
  }

  /**
   * for teacher and assistent only
   * @param event
   */
  @action.bound
  hanldeDropImage = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher ||
      EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.assistant
    ) {
      try {
        const file = event.dataTransfer.files[0];
        if (file) {
          if (isSupportedImageType(file)) {
            runInAction(() => {
              this.isCopying = true;
            });

            const rect = (event.target as HTMLDivElement).getBoundingClientRect();
            const rx = event.clientX - rect.left;
            const ry = event.clientY - rect.top;
            const { x, y } = this.classroomStore.boardStore.convertToPointInWorld({ x: rx, y: ry });
            await this.classroomStore.boardStore.dropImage(file, x, y);
            runInAction(() => {
              this.isCopying = false;
            });
          }
        }
      } catch (e) {
        runInAction(() => {
          this.isCopying = false;
        });
      }
    }
  };

  onDestroy() {
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
