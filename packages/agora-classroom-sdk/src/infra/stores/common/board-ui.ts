import { isSupportedImageType } from '@/infra/utils';
import { AgoraEduClassroomUIEvent, EduEventUICenter } from '@/infra/utils/event-center';
import {
  AGEduErrorCode,
  AgoraEduClassroomEvent,
  EduClassroomConfig,
  EduEventCenter,
  EduRoleTypeEnum,
  getImageSize,
} from 'agora-edu-core';
import { AGErrorWrapper, bound } from 'agora-rte-sdk';
import { action, computed, IReactionDisposer, Lambda, observable, runInAction } from 'mobx';
import { EduUIStoreBase } from './base';
import { conversionOption, extractFileExt, fileExt2ContentType } from './cloud-drive/helper';

export class BoardUIStore extends EduUIStoreBase {
  protected _disposers: (IReactionDisposer | Lambda)[] = [];
  protected get uiOverrides() {
    return {
      ...super.uiOverrides,
      heightRatio: 1,
    };
  }

  /**
   * 白板容器高度
   * @returns
   */
  @computed
  get boardAreaHeight() {
    const viewportHeight =
      this.shareUIStore.classroomViewportSize.height - this.shareUIStore.navHeight;

    const heightRatio = this.getters.stageVisible ? this.uiOverrides.heightRatio : 1;

    const height = heightRatio * viewportHeight;

    return height;
  }

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

  onInstall() {
    const { role, userUuid } = EduClassroomConfig.shared.sessionInfo;
    if (role === EduRoleTypeEnum.student) {
      // only student
      this._disposers.push(
        computed(() => this.boardApi.grantedUsers).observe(async ({ newValue, oldValue }) => {
          const oldGranted = oldValue;
          const newGranted = newValue;

          if (newGranted.has(userUuid) && !oldGranted?.has(userUuid)) {
            EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.TeacherGrantPermission);
          }
          if (!newGranted.has(userUuid) && oldGranted?.has(userUuid)) {
            EduEventCenter.shared.emitClasroomEvents(
              AgoraEduClassroomEvent.TeacherRevokePermission,
            );
          }
        }),
      );
    }
    EduEventUICenter.shared.onClassroomUIEvents(this._handleUIEvents);
  }

  @bound
  private _handleUIEvents(e: AgoraEduClassroomUIEvent, ...args: any) {
    switch (e) {
      case AgoraEduClassroomUIEvent.dragFileOverBoard:
        this.handleDragOver(args[0]);
        break;
      case AgoraEduClassroomUIEvent.dropFileOnBoard:
        this.hanldeDrop(args[0]);
        break;
    }
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
  async hanldeDrop(event: React.DragEvent<HTMLDivElement>) {
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

            const { uploadPersonalResource, calcResourceUuid } =
              this.classroomStore.cloudDriveStore;

            const resourceUuid = await calcResourceUuid(file);

            const size = await getImageSize(file);

            let ext = extractFileExt(file.name);
            if (!ext) {
              return this.shareUIStore.addGenericErrorDialog(
                AGErrorWrapper(
                  AGEduErrorCode.EDU_ERR_UPLOAD_FAILED_NO_FILE_EXT,
                  new Error(`no file ext`),
                ),
              );
            }

            ext = ext.toLowerCase();

            const contentType = fileExt2ContentType(ext);
            const conversion = conversionOption(ext);

            const resourceInfo = await uploadPersonalResource(
              file,
              resourceUuid,
              ext,
              contentType,
              conversion,
            );

            if (resourceInfo?.url) {
              const rect = (event.target as HTMLDivElement).getBoundingClientRect();
              const rx = event.clientX - rect.left;
              const ry = event.clientY - rect.top;
              this.boardApi.putImageResource(resourceInfo.url, {
                x: rx,
                y: ry,
                width: size.width,
                height: size.height,
              });
            }

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
  }

  onDestroy() {
    EduEventUICenter.shared.offClassroomUIEvents(this._handleUIEvents);
    this._disposers.forEach((d) => d());
    this._disposers = [];
  }
}
