import { SceneStore } from "~core";

export abstract class BaseDialogUIKitStore<T> {

  sceneStore: SceneStore

  attributes: T

  private dialogId: string = ''
  constructor(sceneStore: SceneStore, attributes: T) {
    this.sceneStore = sceneStore
    this.attributes = attributes
  }

  updateId(id: string) {
    this.dialogId = id
  }

  removeDialog () {
    this.sceneStore.uiStore.removeDialog(this.dialogId)
  }

  abstract onConfirm(): Promise<unknown>;
  abstract onCancel(): Promise<unknown>;
}

type StudentInfo = {
  userUuid: string;
  roomUuid: string;
}

export abstract class KickDialogUIKitStore extends BaseDialogUIKitStore<StudentInfo> {
  constructor(sceneStore: SceneStore, attributes: StudentInfo) {
    super(sceneStore, attributes);
  }
}