import { EduRoomType } from '@/sdk/education/core/services/interface.d';
import { GlobalStorage } from '../../utils/custom-storage';
import { observable, action, computed } from 'mobx';
import { DialogMessage, DialogType } from '@/components/dialog';
import { platform } from '@/utils/platform';

interface NoticeMessage {
  type: string
  message: string
}


export class ReplayUIStore {

  static roomTypes: any[] = [
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
    {
      path: 'breakout-class',
      text: 'home.super_mini_class',
      value: 3,
    },
    {
      path: 'middle-class',
      text: 'home.middle_class',
      value: 4,
    },
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
  notice?: NoticeMessage

  @observable
  dialog?: DialogMessage

  @observable
  settingDialog: boolean = false

  @observable
  toastQueue: string[] = []

  @observable
  autoplayToast: boolean = false

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

  constructor() {
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
  reset () {
    this.settingDialog = false
    this.loading = false;
    this.uploading = false;
    this.boardLoading = false;
    this.converting = false;
    this.notice = undefined;
    this.dialog = undefined;
    this.toastQueue = []
    this.autoplayToast = false
    this.dialogs = []
    this.menuVisible = false
    this.activeTab = 'chatroom'
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
    this.dialogs.push({dialog, id: this.dialogs.length})
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

  hasDialog(type: string) {
    return this.dialogs.find(it => it.dialog.type === type)
  }

  @observable
  dialogs: DialogType[] = []
  
  @observable
  curSeqId: number = 0

  @observable
  visibleShake: boolean = false

  @observable
  lastSeqId: number = 0

  @observable
  activeTab: string = 'chatroom'

  @observable
  menuVisible: boolean = false

  @observable
  cancel?: CallableFunction

  @observable
  action: any

  @observable
  nextLocation: any

  @action
  updateCurSeqId(v: number) {
    this.curSeqId = v
  }

  updateLastSeqId(v: number) {
    this.lastSeqId = v
  }
  
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