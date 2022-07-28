import { AgoraEduSDK, WindowID } from '@/infra/api';
import { getEduErrorMessage, getErrorServCode } from '@/infra/utils/error';
import { sendToMainProcess } from '@/infra/utils/ipc';
import { ChannelType } from '@/infra/utils/ipc-channels';
import { AGError, AGRteErrorCode, bound, Injectable, Lodash, Log, Scheduler } from 'agora-rte-sdk';
import { action, observable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { transI18n } from '~ui-kit';
import { getRootDimensions } from './layout/helper';
import { ConfirmDialogAction, OrientationEnum } from './type';

export enum DialogCategory {
  CloudDriver,
  Roster,
  LectureRoster,
  KickOut,
  ErrorGeneric,
  Confirm,
  DeviceSetting,
  ScreenPicker,
  BreakoutRoom,
  Quit,
  ScreenShare,
  RemoteControlConfirm,
  StreamView,
  InvitePodium,
  InviteConfirm,
}

export interface ToastType {
  id: string;
  desc: string;
  type?: ToastTypeEnum;
}

export type ToastTypeEnum = 'success' | 'error' | 'warning';

export interface DialogType {
  id: string;
  category: DialogCategory;
  props?: unknown;
}

@Log.attach({ proxyMethods: false })
export class EduShareUIStore {
  protected logger!: Injectable.Logger;
  readonly classroomViewportClassName = 'classroom-viewport';
  readonly classroomViewportTransitionDuration = 300;
  readonly navHeight = 27;
  private _viewportAspectRatio = 9 / 16;
  private _classroomMinimumSize = { width: 1024, height: 576 };
  private _containerNode = window;
  private _matchMedia = window.matchMedia('(orientation: portrait)');
  private _resizeEventListenerAdded = false;

  /**
   * 教室UI布局完毕
   */
  @observable
  layoutReady = false;

  /**
   * 模态框列表
   */
  @observable
  dialogQueue: DialogType[] = [];

  /**
   * Toast 列表
   */
  @observable
  toastQueue: ToastType[] = [];

  /**
   * 视口尺寸信息
   */
  @observable
  classroomViewportSize: { width: number; height: number; h5Width?: number; h5Height?: number } = {
    width: 0,
    height: 0,
    h5Width: 1024,
    h5Height: 576,
  };

  @observable
  orientation: OrientationEnum = OrientationEnum.portrait;

  /**
   * 显示一条 Toast 信息
   * @param desc
   * @param type
   * @returns
   */
  @action.bound
  addToast(desc: string, type?: ToastTypeEnum) {
    const id = uuidv4();
    this.toastQueue.push({ id, desc, type });
    if (this.toastQueue.length > 3) {
      this.toastQueue = this.toastQueue.splice(1, this.toastQueue.length);
    }
    return id;
  }

  /**
   * 移除 Toast 信息
   * @param id
   * @returns
   */
  @action.bound
  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter((item) => item.id != id);
    return id;
  }

  /**
   * 显示错误提示模态框
   * @param error
   * @param opts
   */
  @action.bound
  addGenericErrorDialog(
    error: AGError,
    opts?: {
      onOK?: () => void;
      okBtnText?: string;
    },
  ) {
    //this should be called at ui store only
    const id = uuidv4();
    let title = '';

    if (error.codeList && error.codeList.length > 0) {
      const servCode = getErrorServCode(error);
      title = `Error ${error.codeList[error.codeList.length - 1]}${servCode ? `-${servCode}` : ''}`;
    } else {
      title = `Unknown Error`;
    }

    const { onOK, okBtnText } = opts || {};

    let message = error.message;

    if (
      error.codeList &&
      error.codeList.includes(AGRteErrorCode.RTE_ERR_RESTFUL_NETWORK_TIMEOUT_ERR)
    ) {
      message = transI18n('error.network_timeout');
    } else {
      message = getEduErrorMessage(error) || message;
    }

    this.addDialog(DialogCategory.ErrorGeneric, {
      id,
      title,
      content: message,
      okBtnText: okBtnText ?? transI18n('toast.confirm'),
      onOK: () => {
        onOK && onOK();
        this.removeDialog(id);
      },
    });
  }

  /**
   * 显示确认模态框
   * @param title
   * @param content
   * @param onOK
   * @param actions
   * @param onCancel
   */
  @action.bound
  addConfirmDialog(
    title: string,
    content: string,
    {
      onOK,
      actions,
      onCancel,
      btnText,
      timeout,
    }: {
      onOK?: () => void;
      actions?: ConfirmDialogAction[];
      onCancel?: () => void;
      btnText?: Record<ConfirmDialogAction, string>;
      timeout?: number;
    } = {},
  ) {
    const id = uuidv4();
    this.addDialog(DialogCategory.Confirm, {
      id,
      title,
      content,
      opts: {
        actions,
        btnText,
        onOk: () => {
          onOK && onOK();
          this.removeDialog(id);
        },
        onCancel: () => {
          onCancel && onCancel();
          this.removeDialog(id);
        },
      },
    });
    if (timeout) {
      Scheduler.shared.addDelayTask(() => {
        this.removeDialog(id);
      }, timeout);
    }
    return id;
  }

  /**
   * 显示模态框
   * @param category
   * @param props
   * @returns
   */
  @action.bound
  addDialog(category: DialogCategory, props?: any) {
    const id = props && props.id ? props.id : uuidv4();
    this.dialogQueue.push({
      id,
      category,
      props: {
        ...props,
        onClose: () => {
          this.removeDialog(id);
          if (props?.onClose) props.onClose();
        },
      },
    });
    return id;
  }

  /**
   * 移除模态框
   * @param id
   */
  @action.bound
  removeDialog(id: string) {
    this.dialogQueue = this.dialogQueue.filter((item: DialogType) => item.id !== id);
  }

  /** Actions */
  /**
   * 更新教室视口尺寸信息
   */
  @Lodash.debounced(500)
  updateClassroomViewportSize() {
    const { width, height } = getRootDimensions(this._containerNode);

    const aspectRatio = this._viewportAspectRatio;

    const curAspectRatio = height / width;

    const scopeSize = { height, width };

    if (curAspectRatio > aspectRatio) {
      // shrink height
      scopeSize.height = width * aspectRatio;
    } else if (curAspectRatio < aspectRatio) {
      // shrink width
      scopeSize.width = height / aspectRatio;
    }

    runInAction(() => {
      if (
        scopeSize.width >= this._classroomMinimumSize.width ||
        scopeSize.height >= this._classroomMinimumSize.height
      ) {
        this.classroomViewportSize = { width: scopeSize.width, height: scopeSize.height };
      } else {
        this.classroomViewportSize = {
          width: this._classroomMinimumSize.width,
          height: this._classroomMinimumSize.height,
        };
      }
      this.classroomViewportSize.h5Width = scopeSize.width;
      this.classroomViewportSize.h5Height = scopeSize.height;
    });
  }

  @action.bound
  handleOrientationchange() {
    // If there are matches, we're in portrait
    if (this._matchMedia.matches) {
      // Portrait orientation
      this.orientation = OrientationEnum.portrait;
    } else {
      // Landscape orientation
      this.orientation = OrientationEnum.landscape;
      this.updateClassroomViewportSize();
    }
  }

  /**
   设置 Resize 事件处理器
   */
  @bound
  addWindowResizeEventListener() {
    if (!this._resizeEventListenerAdded) {
      this._containerNode.addEventListener('resize', this.updateClassroomViewportSize);

      this.updateClassroomViewportSize();

      this._resizeEventListenerAdded = true;
    }
  }

  /**
   * 移除 Resize 事件处理器
   */
  @bound
  removeWindowResizeEventListener() {
    if (this._resizeEventListenerAdded) {
      this._containerNode.removeEventListener('resize', this.updateClassroomViewportSize);

      this._resizeEventListenerAdded = false;
    }
  }

  @bound
  addOrientationchange() {
    this._matchMedia.addListener(this.handleOrientationchange);
    this.handleOrientationchange();
  }

  @bound
  removeOrientationchange() {
    this._matchMedia.removeListener(this.handleOrientationchange);
  }

  @bound
  showWindow(windowID: WindowID) {
    sendToMainProcess(ChannelType.ShowBrowserWindow, windowID);
  }

  @bound
  hideWindow(windowID: WindowID) {
    sendToMainProcess(ChannelType.HideBrowserWindow, windowID);
  }

  @bound
  openWindow(
    windowID: WindowID,
    payload: {
      args?: Record<string, string | number | boolean>;
      options?: Record<string, string | number | boolean>;
    },
  ) {
    sendToMainProcess(
      ChannelType.OpenBrowserWindow,
      windowID,
      payload.args,
      payload.options,
      AgoraEduSDK.language,
    );
  }
  @bound
  moveWindowToTargetScreen(
    windowID: WindowID,
    screenId: string,
    options: Record<string, string | number | boolean>,
  ) {
    sendToMainProcess(ChannelType.MoveWindowToTargetScreen, windowID, screenId, options);
  }
  @bound
  closeWindow(windowID: WindowID) {
    sendToMainProcess(ChannelType.CloseBrowserWindow, windowID);
  }

  addViewportResizeObserver(callback: () => void) {
    const observer = new ResizeObserver(callback);

    const viewport = document.querySelector(`.${this.classroomViewportClassName}`);
    if (viewport) {
      observer.observe(viewport);
    }
    return observer;
  }

  @action.bound
  setLayoutReady(ready: boolean) {
    this.layoutReady = ready;
  }
}
