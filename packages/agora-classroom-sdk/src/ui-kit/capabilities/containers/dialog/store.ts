import { AppStore as CoreAppStore } from "~core";

export abstract class BaseDialogUIKitStore<T> {

  appStore: CoreAppStore

  attributes: T

  private dialogId: string = ''
  constructor(appStore: CoreAppStore, attributes: T) {
    this.appStore = appStore
    this.attributes = attributes
  }

  updateId(id: string) {
    this.dialogId = id
  }

  removeDialog () {
    this.appStore.uiStore.removeDialog(this.dialogId)
  }

  abstract onConfirm(): Promise<unknown>;
  abstract onCancel(): Promise<unknown>;
}

type StudentInfo = {
  userUuid: string;
  roomUuid: string;
}

export abstract class KickDialogUIKitStore extends BaseDialogUIKitStore<StudentInfo> {
  constructor(appStore: CoreAppStore, attributes: StudentInfo) {
    super(appStore, attributes);
  }
}