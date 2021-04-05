import { ToastCategory } from 'agora-scenario-ui-kit';
import { isEmpty } from 'lodash';
import { action, computed, observable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { AppStore } from '.';


interface NoticeMessage {
  type: string
  message: string
}


type RoomTypesList = {
  path: string,
  text: string,
  value: number
}


export type DialogType = {
  id: string,
  component: any,
  props?: any,
}

export type ToastType = {
  id: string,
  desc: string,
  type?: ToastCategory
}
export class UIStore {

  static languages: any[] = [
    {
      text: '中文', name: 'zh-CN',
    },
    {
      text: 'En', name: 'en'
    }
  ]

  @computed
  get isElectron(): boolean {
    return false
  }

  @observable
  language: string = 'zh'

  @observable
  setLanguage(language: any) {
    this.language = language
  }

  showAutoplayNotification() {
    console.log('showAutoplayNotification')
  }

  @observable
  loading: boolean = false

  @observable
  boardLoading: boolean = false;

  @observable
  dialogQueue: DialogType[] = [] 

  @observable
  toastQueue: ToastType[] = []

  @observable
  chatCollapse: boolean = true

  appStore: AppStore;

  constructor(appStore: AppStore) {
    this.appStore = appStore
  }

  resetStateQueue() {
    if (this.dialogQueue && !isEmpty(this.dialogQueue)) {
      this.dialogQueue = []
    }

    if (this.toastQueue && !isEmpty(this.toastQueue)) {
      this.toastQueue = []
    }
  }

  addToast(desc: string, type?: ToastCategory) {
    const id = uuidv4()
    this.toastQueue.push({id, desc, type})
    return id
  }

  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter(item => item.id != id);
    return id;
  }

  addDialog(component: any, props?: any) {
    const id = uuidv4()
    this.dialogQueue.push({id, component, props})
    return id
  }

  removeDialog(id: string) {
    this.dialogQueue = this.dialogQueue.filter((item: DialogType) => item.id !== id)
  }

  toggleChatMinimize() {
    this.chatCollapse = !this.chatCollapse
  }

  @observable
  visibleSetting: boolean = false

  setVisibleSetting(v: boolean) { 
    this.visibleSetting = v
  }

  @action.bound
  reset() {
    this.loading = false
    this.boardLoading = false
    this.chatCollapse = false
    this.visibleSetting = false
    this.resetStateQueue()
  }

  updateCurSeqId(id: number) {

  }

  updateLastSeqId(id: number) {

  }

  stopLoading() {
    this.loading = false
  }

  startLoading () {
    this.loading = true
  }
}