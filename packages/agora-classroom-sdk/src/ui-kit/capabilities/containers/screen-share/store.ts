import { EduStream } from 'agora-rte-sdk';
import { BaseStore } from '~capabilities/stores/base';
import { UIKitBaseModule } from '~capabilities/types';
import { EduMediaStream, SceneStore } from '~core';

type WindowId = string | number;
type WindowTitle = string | number;

interface WindowItem {
  id?: WindowId;
  title?: WindowTitle;
  image?: string;
}

export type ScreenShareModel = {
  nativeScreenShareItems: WindowItem[];
  subTitle: string;
  screenShareStream?: EduMediaStream;
  screenEduStream?: EduStream;
}

export const model: ScreenShareModel = {
  nativeScreenShareItems: [],
  subTitle: '',
  screenEduStream: undefined,
  screenShareStream: undefined,
}

export interface ScreenShareTraits {
  setWindow(id: string): unknown
}


export abstract class ScreenShareUIKitStore
  extends BaseStore<ScreenShareModel>
  implements UIKitBaseModule<ScreenShareModel, ScreenShareTraits> {
  get subTitle() {
    return this.attributes.subTitle
  }
  get nativeScreenShareItems() {
    return this.attributes.nativeScreenShareItems
  }

  get screenEduStream() {
    return this.attributes.screenEduStream;
  }

  get screenShareStream() {
    return this.attributes.screenShareStream;
  }

  abstract setWindow(windowId: string): Promise<unknown>;

  abstract startOrStopSharing(): Promise<unknown>
}

export class ScreenShareStore extends ScreenShareUIKitStore {

  static createFactory(sceneStore: SceneStore, payload?: ScreenShareModel) {
    const store = new ScreenShareStore(payload ?? model)
    store.bind(sceneStore)
    return store
  }

  constructor(payload: ScreenShareModel = model) {
    super(payload)
  }

  async setWindow(windowId: string) {
  }

  async startOrStopSharing() {
    await this.sceneStore.startOrStopSharing()
  }

  onCancel() {

  }
}
