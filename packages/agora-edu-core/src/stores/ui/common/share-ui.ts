import { AGError, bound, Lodash } from 'agora-rte-sdk';
import { observable, action, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmDialogAction, orientationEnum } from '../../../type';
import { EduErrorCenter } from '../../../utils/error';
import { transI18n } from './i18n';
import { getRootDimensions } from './layout/helper';
import { ToastFilter } from '../../../utils/toast-filter';
import { AGRteErrorCode } from 'agora-rte-sdk';

export enum DialogCategory {
  CloudDriver,
  Roster,
  KickOut,
  ErrorGeneric,
  Confirm,
  DeviceSetting,
  ScreenPicker,
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
  props?: any;
}

export class EduShareUIStore {
  private _aspectRatio = 9 / 16;
  private _classroomMinimumSize = { width: 1024, height: 576 };
  private _containerNode = window;
  private _navBarHeight = 0;
  private _matchMedia = window.matchMedia('(orientation: portrait)');

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
  classroomViewportSize = {
    width: 0,
    height: 0,
  };

  @observable
  orientation: orientationEnum = orientationEnum.portrait;

  constructor() {
    EduErrorCenter.shared.on('error', (code: string, error: Error) => {
      if (ToastFilter.shouldBlockToast(error)) {
        return;
      }
      let emsg = error.message.length > 64 ? `${error.message.substr(0, 64)}...` : error.message;
      this.addToast(`Error [${code}]: ${emsg}`, 'error');
    });
  }

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
      title = `Error ${error.codeList[error.codeList.length - 1]}`;
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
    onOK?: () => void,
    actions?: ConfirmDialogAction[],
    onCancel?: () => void,
  ) {
    const id = uuidv4();
    this.addDialog(DialogCategory.Confirm, {
      id,
      title,
      content,
      opts: {
        actions,
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

    const aspectRatio = this._aspectRatio;

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
    });
  }

  @action.bound
  handleOrientationchange() {
    // If there are matches, we're in portrait
    if (this._matchMedia.matches) {
      // Portrait orientation
      this.orientation = orientationEnum.portrait;
    } else {
      // Landscape orientation
      this.orientation = orientationEnum.landscape;
    }
  }

  /**
   * 设置导航栏高度，设置 Resize 事件处理器
   * @param navBarHeight
   */
  @bound
  addWindowResizeEventListenerAndSetNavBarHeight(navBarHeight: number) {
    this._navBarHeight = navBarHeight;

    this._containerNode.addEventListener('resize', this.updateClassroomViewportSize);

    this.updateClassroomViewportSize();
  }

  /**
   * 移除 Resize 事件处理器
   */
  @bound
  removeWindowResizeEventListener() {
    this._containerNode.removeEventListener('resize', this.updateClassroomViewportSize);
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

  /**
   * 顶部导航栏高度
   * @returns
   */
  get navBarHeight() {
    return this._navBarHeight;
  }
}
