import { isElectron } from './../../utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { GlobalStorage } from '@/utils/utils';
import { observable, action, computed } from 'mobx';
import { AppStore } from '.';
import { platform } from '@/utils/utils';
import { EduRoleTypeEnum, EduRoomType } from 'agora-rte-sdk';
import { getLanguage, t } from '@/i18n';
import { isEmpty } from 'lodash';
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
  desc: string
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
  chatMinimize: boolean = false

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

  addToast(desc: string) {
    const id = uuidv4()
    this.toastQueue.push({id, desc})
    return id
  }

  removeToast(id: string) {
    const idx = this.toastQueue.findIndex((item: ToastType) => item.id !== id)
    this.toastQueue.splice(idx, 1)
    return id;
  }

  addDialog(component: any, props?: any) {
    const id = uuidv4()
    this.dialogQueue.push({id, component, props})
    return id
  }

  removeDialog(id: string) {
    const idx = this.dialogQueue.findIndex((item: DialogType) => item.id !== id)
    this.dialogQueue.splice(idx, 1)
    return id;
  }

  toggleChatMinimize() {
    this.chatMinimize = !this.chatMinimize
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
    this.chatMinimize = false
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