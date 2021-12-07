import { AGError, bound, Lodash } from 'agora-rte-sdk';
import { observable, action, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmDialogAction } from '../../../type';
import { EduErrorCenter } from '../../../utils/error';
import { transI18n } from './i18n';
import { getRootDimensions } from './layout/helper';
import { ToastFilter } from '../../../utils/toast-filter';

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
  type?: 'success' | 'error' | 'warning';
}

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

  @observable
  dialogQueue: DialogType[] = [];

  @observable
  toastQueue: ToastType[] = [];

  @observable
  classroomViewportSize: { width: number; height: number } = {
    width: 0,
    height: 0,
  };

  constructor() {
    EduErrorCenter.shared.on('error', (code: string, error: Error) => {
      if (ToastFilter.shouldBlockToast(error)) {
        return;
      }
      let emsg = error.message.length > 64 ? `${error.message.substr(0, 64)}...` : error.message;
      this.addToast(`Error [${code}]: ${emsg}`, 'error');
    });
  }

  @action.bound
  addToast(desc: string, type?: 'success' | 'error' | 'warning') {
    const id = uuidv4();
    this.toastQueue.push({ id, desc, type });
    if (this.toastQueue.length > 3) {
      this.toastQueue = this.toastQueue.splice(1, this.toastQueue.length);
    }
    return id;
  }

  @action.bound
  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter((item) => item.id != id);
    return id;
  }

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

    this.addDialog(DialogCategory.ErrorGeneric, {
      id,
      title,
      content: error.message,
      okBtnText: okBtnText ?? transI18n('toast.confirm'),
      onOK: () => {
        onOK && onOK();
        this.removeDialog(id);
      },
    });
  }

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
          if (props.onClose) props.onClose();
        },
      },
    });
    return id;
  }

  @action.bound
  removeDialog(id: string) {
    this.dialogQueue = this.dialogQueue.filter((item: DialogType) => item.id !== id);
  }

  /** Actions */
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

  @bound
  addWindowResizeEventListenerAndSetNavBarHeight(navBarHeight: number) {
    this._navBarHeight = navBarHeight;

    this._containerNode.addEventListener('resize', this.updateClassroomViewportSize);

    this.updateClassroomViewportSize();
  }

  @bound
  removeWindowResizeEventListener() {
    this._containerNode.removeEventListener('resize', this.updateClassroomViewportSize);
  }

  get navBarHeight() {
    return this._navBarHeight;
  }
}
