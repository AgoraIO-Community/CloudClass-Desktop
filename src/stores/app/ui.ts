import { EduRoomType } from '@/sdk/education/core/services/interface.d';
import { GlobalStorage } from '../../utils/custom-storage';
import { observable, action, computed } from 'mobx';
import { AppStore } from '.';
import { DialogMessage, DialogType } from '@/components/dialog';
import { platform } from '@/utils/platform';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';
interface NoticeMessage {
  type: string
  message: string
}


type RoomTypesList = {
  path: string,
  text: string,
  value: number
}


export class UIStore {

  static roomTypes: RoomTypesList[] = [
    {
      path: 'one-to-one',
      text: 'home.1v1',
      value: 0,
    },
    {
      path: 'small-class',
      text: 'home.mini_class',
      value: 1,
    },
    {
      path: 'big-class',
      text: 'home.large_class',
      value: 2,
    },
    // {
    //   path: 'breakout-class',
    //   text: 'home.super_mini_class',
    //   value: 3,
    // },
    // {
    //   path: 'middle-class',
    //   text: 'home.middle_class',
    //   value: 4,
    // },
  ]

  static languages: any[] = [
    {
      text: '中文', name: 'zh-CN',
    },
    {
      text: 'En', name: 'en'
    }
  ]

  @observable
  loading?: boolean = false;

  @observable
  boardLoading?: boolean = false;

  @observable
  uploading?: boolean = false;

  @observable
  converting?: boolean = false;

  @observable
  notice?: NoticeMessage = undefined

  @observable
  dialog?: DialogMessage = undefined

  @observable
  settingDialog: boolean = false

  @observable
  toastQueue: string[] = []

  @observable
  autoplayToast: boolean = false

  @observable
  lastSeqId: number = 0

  @observable
  curSeqId: number = 0

  @observable
  _language: string = '';

  @observable
  dialogs: DialogType[] = []

  @observable
  activeTab: string = 'chatroom'

  @observable
  cancel?: CallableFunction

  @observable
  menuVisible: boolean = false

  @observable
  nextLocation: any;
  
  @observable
  action: string = '';

  @action
  reset () {
    this.loading = false;
    this.boardLoading = false;
    this.uploading = false;
    this.converting = false;
    this.notice = undefined
    this.dialog = undefined
    this.settingDialog = false
    this.toastQueue  = []
    this.autoplayToast = false
    this.lastSeqId = 0
    this.curSeqId = 0
    this._language = ''
    this.dialogs = []
    this.activeTab = 'chatroom'
    this.cancel = undefined
    this.menuVisible = false
    this.action = ''
    this.nextLocation = null
  }

  appStore!: AppStore

  constructor(appStore: AppStore) {
    this.appStore = appStore
  }

  @action
  addToast(message: string) {
    this.toastQueue.push(message)
  }

  @action
  removeToast(message: string) {
    const idx = this.toastQueue.findIndex((it: any) => (it === message))
    if (idx !== -1) {
      this.toastQueue.splice(idx, 1)
    }
  }

  @action
  showAutoplayNotification() {
    this.autoplayToast = true
  }

  @action
  removeAutoplayNotification() {
    this.autoplayToast = false
  }

  get platform(): string {
    return platform;
  }

  get isElectron(): boolean {
    return this.platform === 'electron'
  }

  get isWeb(): boolean {
    return this.platform === 'web'
  }

  @action
  startLoading () {
    this.loading = true;
  }

  @action
  stopLoading() {
    this.loading = false;
  }

  @action
  startBoardLoading() {
    this.loading = false;
  }

  @action
  stopBoardLoading () {
    this.loading = true;
  }

  @action
  startConverting() {
    this.converting = true
  }
  
  @action
  stopConverting() {
    this.converting = false;
  }

  @action
  startUploading() {
    this.uploading = true
  }
  
  @action
  stopUploading() {
    this.uploading = false
  }

  @action
  showNotice (notice: NoticeMessage) {
    this.notice = notice
  }

  @action
  removeNotice () {
    this.notice = undefined
  }

  @action
  showDialog (dialog: DialogMessage) {
    this.addDialog(dialog)
  }

  @action
  addDialog (dialog: DialogMessage) {
    this.dialogs.push({
      dialog,
      id: this.dialogs.length,
    })
  }

  @action
  removeDialog (id: number) {
    const idx = this.dialogs.findIndex(it => it.id === id)
    if (idx !== -1) {
      this.dialogs.splice(idx, 1)
    }
  }

  get ipc() {
    return window.ipc
  }

  windowMinimum() {
    if (this.isElectron && this.ipc) {
      this.ipc.send('minimum')
    }
  }

  windowMaximum() {
    if (this.isElectron && this.ipc) {
      this.ipc.send('maximum')
    }
  }

  windowClose() {
    if (this.isElectron && this.ipc) {
      this.ipc.send('close')
    }
  }

  @computed
  get language(): string {
    return this._language;
  }

  @action
  setLanguage(language: string) {
    this._language = language
    GlobalStorage.setLanguage(this._language)
  }

  hasDialog(type: string) {
    return this.dialogs.find(it => it.dialog.type === type)
  }

  @action
  updateCurSeqId(v: number) {
    this.curSeqId = v
  }

  updateLastSeqId(v: number) {
    this.lastSeqId = v
  }

  @computed
  get showPagination (): boolean {
    if (this.appStore.roomStore.roomInfo.userRole === EduRoleTypeEnum.teacher) {
      return true
    }
    return false
  }

  @computed
  get showStudentApply(): boolean {
    return false
  }
  
  @computed
  get showScaler(): boolean {
    const userRole = this.appStore.roomStore.roomInfo.userRole
    if (userRole === EduRoleTypeEnum.teacher) {
      return true
    }
    return false
  }

  @computed
  get showFooterMenu(): boolean {
    const userRole = this.appStore.roomStore.roomInfo.userRole
    if (userRole === EduRoleTypeEnum.teacher) {
      return true
    }
    const roomType = this.appStore.roomStore.roomInfo.roomType
    if (userRole === EduRoleTypeEnum.student && `${roomType}` === `${EduRoomType.SceneTypeMiddleClass}`) {
      return true
    }
    return false
  }

  @computed
  get showApplyUserList(): boolean {
    const userRole = this.appStore.roomStore.roomInfo.userRole
    const roomType = this.appStore.roomStore.roomInfo.roomType
    if (`${roomType}` === `${EduRoomType.SceneTypeMiddleClass}`) {
      return true
    }
    return false
  }

  @computed
  get showTools(): boolean {
    const userRole = this.appStore.roomStore.roomInfo.userRole
    if (userRole === EduRoleTypeEnum.teacher) {
      return true
    }
    return false
  }

  @observable
  visibleShake: boolean = false
  
  @action
  showShakeHands() {
    this.visibleShake = true
  }

  @action
  hideShakeHands() {
    this.visibleShake = false
  }

  @action
  switchTab(tab: string) {
    this.activeTab = tab
  }

  @action
  toggleMenu() {
    this.menuVisible = !this.menuVisible
  }

  @action
  unblock() {
    if (this.cancel) {
      this.cancel()
      this.cancel = undefined
    }
  }

}