import { AppStore as CoreAppStore } from '~core';
import { ZoomItemType } from '~ui-kit';
import { UIKitBaseModule } from '~capabilities/types';
import { BaseStore } from '../../stores/base';
import { ToolItem } from '~ui-kit';

export type Resource = {
  file: {
    name: string,
    type: string,
  },
  resourceName: string,
  resourceUuid: string,
  taskUuid: string,
  currentPage: number,
  totalPage: number,
  scenePath: string,
  show: boolean,
}

export type WhiteBoardModel = {
  zoomValue: number,
  currentPage: number,
  totalPage: number,
  items: ToolItem[],
  isFullScreen: boolean,
  tabList: Resource[],
  ready: boolean,
  currentSelector: string,
  activeMap: Record<string, boolean>,
  showTab: boolean,
  showToolBar: boolean,
  showZoomControl: boolean,
}

export const model: WhiteBoardModel = {
  zoomValue: 0,
  currentPage: 0,
  totalPage: 0,
  items: [],
  isFullScreen: false,
  tabList: [],
  ready: false,
  currentSelector: 'selector',
  activeMap: {},
  showTab: false,
  showToolBar: false,
  showZoomControl: false,
}

export interface WhiteBoardModelTraits {
  handleZoomControllerChange(type: ZoomItemType): unknown;
  mount(dom: HTMLElement | null): void;
  unmount(): void;
}

type ChatUIKitModule = UIKitBaseModule<WhiteBoardModel, WhiteBoardModelTraits>

export abstract class WhiteboardUIKitStore extends BaseStore<WhiteBoardModel> implements ChatUIKitModule {  
  get zoomValue() {
    return this.attributes.zoomValue
  }
  get currentPage() {
    return this.attributes.currentPage
  }
  get totalPage() {
    return this.attributes.totalPage
  }
  get items() {
    return this.attributes.items
  }
  get isFullScreen() {
    return this.attributes.isFullScreen
  }
  get tabList() {
    return this.attributes.tabList
  }
  get ready() {
    return this.attributes.ready
  }
  get currentSelector() {
    return this.attributes.currentSelector
  }
  get activeMap() {
    return this.attributes.activeMap
  }
  get showTab() {
    return this.attributes.showTab
  }
  get showToolBar() {
    return this.attributes.showToolBar
  }
  get showZoomControl() {
    return this.attributes.showZoomControl
  }

  abstract handleZoomControllerChange(type: ZoomItemType): unknown;
  abstract mount(dom: HTMLElement | null): void;
  abstract unmount(): void;
}

export class WhiteboardStore extends WhiteboardUIKitStore {

  static createFactory(appStore: CoreAppStore) {
    const store = new WhiteboardStore(model)
    store.bind(appStore)
    return store
  }

  handleZoomControllerChange(type: ZoomItemType) {
    if (this.appStore) {
      this.appStore.boardStore
    }
  }
  
  mount(dom: HTMLElement | null): void {
    if (dom) {
      this.appStore.boardStore.mount(dom)      
    }
  }

  unmount(): void {
    this.appStore.boardStore.unmount()
  }

}