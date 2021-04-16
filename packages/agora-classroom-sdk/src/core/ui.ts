import { ToastCategory } from '~ui-kit';
import { isEmpty } from 'lodash';
import { reaction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import {SceneStore} from './scene';

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

  
  get isElectron(): boolean {
    return false
  }

  
  language: string = 'zh'

  
  setLanguage(language: any) {
    this.language = language
  }

  showAutoplayNotification() {
    console.log('showAutoplayNotification')
  }

  
  loading: boolean = false

  
  boardLoading: boolean = false;

  
  dialogQueue: DialogType[] = [] 

  
  toastQueue: ToastType[] = []

  
  chatCollapse: boolean = false

  
  checked: boolean = false;

  sceneStore: SceneStore;

  unreadMessageCount: number = 0;

  resetUnreadMessageCount(){
    this.unreadMessageCount = 0
  }

  incrementUnreadMessageCount(){
    this.unreadMessageCount++
  }

  constructor(sceneStore: SceneStore) {
    this.sceneStore = sceneStore
    reaction(() => JSON.stringify([
      this.chatCollapse
    ]) , (data: string) => {
      const [chatCollapse] = JSON.parse(data)
      if (!chatCollapse) {
        // 已经缩小的chat组件，点击后需要清空消息数
        this.resetUnreadMessageCount()
      }
    })
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
    const id = (props && props.id) ? props.id : uuidv4()
    this.dialogQueue.push({id, component, props})
    return id
  }

  removeDialog(id: string) {
    this.dialogQueue = this.dialogQueue.filter((item: DialogType) => item.id !== id)
  }

  toggleChatMinimize() {
    this.chatCollapse = !this.chatCollapse
  }
  
  visibleSetting: boolean = false

  setVisibleSetting(v: boolean) { 
    this.visibleSetting = v
  }

  reset() {
    this.loading = false
    this.boardLoading = false
    this.chatCollapse = false
    this.visibleSetting = false
    this.checked = false
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