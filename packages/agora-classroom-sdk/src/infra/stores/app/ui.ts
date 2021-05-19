import { BehaviorSubject } from 'rxjs';
import { isEmpty } from 'lodash';
import { action, computed, observable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';


export type ToastType = {
    id: string,
    desc: string,
    type?: 'success' | 'error' | 'warning'
}
export type DialogType = {
    id: string,
    component: any,
    props?: any,
}


export class UIStore {

  /**
   * 语言列表
   */
  static languages: any[] = [
    {
      text: '中文', name: 'zh-CN',
    },
    {
      text: 'En', name: 'en'
    }
  ]
  /**
   * 是否为electron客户端
   */
  @computed
  get isElectron(): boolean {
    return window.isElectron
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
  chatCollapse: boolean = false

  @observable
  checked: boolean = false;

  @action.bound
  updateChecked(v: boolean) {
    this.checked =v
  }

  dialog$: BehaviorSubject<any>

  toast$: BehaviorSubject<any>

  constructor() {
    this.dialog$ = new BehaviorSubject<any>({})
    this.toast$ = new BehaviorSubject<any>({})
    // reaction(() => JSON.stringify([
    //   this.chatCollapse
    // ]) , (data: string) => {
    //   const [chatCollapse] = JSON.parse(data)
    //   if (!chatCollapse) {
    //     // 已经缩小的chat组件，点击后需要清空消息数
    //     this.appStore.roomStore.resetUnreadMessageCount()
    //   }
    // })
  }

  @action.bound
  resetStateQueue() {
    if (this.dialogQueue && !isEmpty(this.dialogQueue)) {
      this.dialogQueue = []
    }

    if (this.toastQueue && !isEmpty(this.toastQueue)) {
      this.toastQueue = []
    }
  }

  @action.bound
  fireToast(eventName: string, props?: any) {
    this.toast$.next({
      eventName,
      props,
    })
  }

  @action.bound
  addToast(desc: string, type?: 'success' | 'error' | 'warning') {
    const id = uuidv4()
    this.toastQueue.push({id, desc, type})
    return id
  }

  @action.bound
  removeToast(id: string) {
    this.toastQueue = this.toastQueue.filter(item => item.id != id);
    return id;
  }

  @action.bound
  fireDialog(eventName: string, props?: any) {
    console.log('fire dialog ', eventName, props)
    this.dialog$.next({
      eventName,
      props
    })
  }

  @action.bound
  addDialog(component: any, props?: any) {
    const id = (props && props.id) ? props.id : uuidv4()
    this.dialogQueue.push({id, component, props})
    return id
  }

  @action.bound
  removeDialog(id: string) {
    this.dialogQueue = this.dialogQueue.filter((item: DialogType) => item.id !== id)
  }

  @action.bound
  toggleChatMinimize() {
    this.chatCollapse = !this.chatCollapse
  }

  @observable
  visibleSetting: boolean = false

  @action.bound
  setVisibleSetting(v: boolean) { 
    this.visibleSetting = v
  }

  @action.bound
  reset() {
    this.loading = false
    this.boardLoading = false
    this.chatCollapse = false
    this.visibleSetting = false
    this.checked = false
    this.resetStateQueue()
  }

  @action.bound
  stopLoading() {
    this.loading = false
  }

  @action.bound
  startLoading () {
    this.loading = true
  }
}