import { GlobalStorage } from '@/utils/custom-storage';
import { observable, action, computed } from 'mobx';
import { AppStore } from '.';
import { platform } from '@/utils/platform';
import { EduRoleTypeEnum, EduRoomType } from 'agora-rte-sdk';
import { getLanguage } from '@/i18n';
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
    // {
    //   path: '/classroom/one-to-one',
    //   text: 'home.1v1',
    //   value: 0,
    // },
    // {
    //   path: '/classroom/small-class',
    //   text: 'home.mini_class',
    //   value: 1,
    // },
    // {
    //   path: '/classroom/big-class',
    //   text: 'home.large_class',
    //   value: 2,
    // },
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
    {
      path: '/acadsoc/one-to-one',
      text: 'home.aClass_class',
      value: 0
    }
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
  dialog?: any = undefined

  @observable
  settingDialog: boolean = false

  @observable
  toastQueue: string[] = []

  @observable
  acadsocToastQueue: string[] = []

  @observable
  brushToastQueue: {ts:number, enabled:boolean}[] = []

  @observable
  autoplayToast: boolean = false

  @observable
  lastSeqId: number = 0

  @observable
  curSeqId: number = 0

  @observable
  _language: string = getLanguage();

  @observable
  dialogs: any[] = []

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

  @observable
  courseReplacerVisible: boolean = false

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
    this.acadsocToastQueue = []
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
    this.aclassVisible = false
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
  addAcadsocToast(message: string) {
    this.acadsocToastQueue.push(message)
  }

  @action
  removeAcadsocToast(message: string) {
    const idx = this.acadsocToastQueue.findIndex((it: any) => (it === message))
    if (idx !== -1) {
      this.acadsocToastQueue.splice(idx, 1)
    }
  }

  @action
  setCourseReplacerVisible(visible: boolean) {
    this.courseReplacerVisible = visible
  }

  @action
  addBrushToast(ts: number, enabled: boolean) {
    this.brushToastQueue.push({ts, enabled})
  }

  @action
  removeBrushToast(ts: number) {
    this.brushToastQueue = this.brushToastQueue.filter(item => ts === item.ts)
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
  showDialog (dialog: any) {
   this.addDialog(dialog)
  }

  @action
  addDialog (dialog: any) {
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
    const { userRole } = this.appStore.acadsocStore.roomInfo
    if (userRole !== EduRoleTypeEnum.student) {
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
    const userRole = this.appStore.acadsocStore.roomInfo.userRole
    if (userRole !== EduRoleTypeEnum.student) {
      return true
    }
    return false
  }

  @computed
  get showFooterMenu(): boolean {
    const userRole = this.appStore.acadsocStore.roomInfo.userRole
    if (userRole !== EduRoleTypeEnum.student) {
      return true
    }
    const roomType = this.appStore.acadsocStore.roomInfo.roomType
    if (userRole === EduRoleTypeEnum.student && `${roomType}` === `${EduRoomType.SceneTypeMiddleClass}`) {
      return true
    }
    return false
  }

  @computed
  get showApplyUserList(): boolean {
    const userRole = this.appStore.acadsocStore.roomInfo.userRole
    const roomType = this.appStore.acadsocStore.roomInfo.roomType
    if (`${roomType}` === `${EduRoomType.SceneTypeMiddleClass}`) {
      return true
    }
    return false
  }

  @computed
  get showTools(): boolean {
    const userRole = this.appStore.acadsocStore.roomInfo.userRole
    if (userRole !== EduRoleTypeEnum.student) {
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

  @observable
  aclassVisible: boolean = false

  showMediaSetting() {
    // this.appStore.pretestStore.init({video: true, audio: true})
    this.aclassVisible = true
  }

  hideMediaSetting() {
    // this.appStore.pretestStore.closeTestCamera()
    // this.appStore.pretestStore.closeTestMicrophone()
    this.aclassVisible = false
  }

}