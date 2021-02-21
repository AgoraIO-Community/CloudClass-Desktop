import { EnumBoardState } from '@/sdk/education/core/services/interface.d';
import { UploadManager, PPTProgressListener } from '@/utils/upload-manager';
import { AppStore } from '@/stores/app';
import { observable, action, computed, runInAction } from 'mobx'
import { PPTProgressPhase } from '@/utils/upload-manager'
import { Room, PPTKind, ViewMode } from 'white-web-sdk'
import { BoardClient } from '@/components/netless-board/board-client';
import { get, isEmpty, omit } from 'lodash';
import { OSSConfig } from '@/utils/helper';
import { BizLogger } from '@/utils/biz-logger';
import OSS from 'ali-oss';
import uuidv4 from 'uuid/v4';
import { t } from '@/i18n';
import { EduUser, EduRoleType } from '@/sdk/education/interfaces/index.d';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

export const resolveFileInfo = (file: any) => {
  const fileName = encodeURI(file.name);
  const fileType = fileName.substring(fileName.length, fileName.lastIndexOf('.'));
  return {
    fileName,
    fileType
  }
}

const isDynamicPPT = (sceneState: any) => {
  const src = get(sceneState, 'ppt.src', 'staticConvert')
  if (src.match('dynamicConvert')) {
    console.log(' match dynamic convert return true')
    return true
  }
  console.log(' match dynamic convert return false')
  return false
}

export const demoOssConfig: OSSConfig = {
  "accessKeyId": `${REACT_APP_YOUR_OWN_OSS_BUCKET_KEY}`,
  "accessKeySecret": `${REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET}`,
  "bucket": `${REACT_APP_YOUR_OWN_OSS_BUCKET_NAME}`,
  // "region": process.env.REACT_APP_YOUR_OWN_OSS_BUCKET_REGION as string,
  "endpoint": `${REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE}`,
  "folder": `${REACT_APP_YOUR_OWN_OSS_BUCKET_FOLDER}`,
}

const pathName = (path: string): string => {
  const reg = /\/([^/]*)\//g;
  reg.exec(path);
  if (RegExp.$1 === 'aria') {
      return '';
  } else {
      return RegExp.$1;
  }
}

export interface SceneItem {
  file: {
    name: string
    type: string
  }
  path: string
  rootPath: string
}

enum FollowState {
  Follow = 1,
  Freedom = 0
}

export class BoardStore {

  static items: any = [
    {
      name: 'selector',
      text: t('tool.selector')
    },
    {
      name: 'pencil',
      text: t('tool.pencil')
    },
    {
      name: 'rectangle',
      text: t('tool.rectangle')
    },
    {
      name: 'ellipse',
      text: t('tool.ellipse')
    },
    {
      name: 'text',
      text: t('tool.text')
    },
    {
      name: 'eraser',
      text: t('tool.eraser')
    },
    {
      name: 'color_picker',
      text: t('tool.color_picker')
    },
    {
      name: 'add',
      text: t('tool.add')
    },
    {
      name: 'upload',
      text: t('tool.upload')
    },
    {
      name: 'hand_tool',
      text: t('tool.hand_tool')
    },
    {
      name: 'extension_tool',
      text: t('tool.extension_tool')
    }
  ]

  scenes: any[] = []

  @observable
  loading: boolean = false

  @observable
  converting: boolean = false

  @observable
  currentPage: number = 0

  @observable
  totalPage: number = 0

  @observable
  currentScene: any = '/init'

  @observable
  hasBoardPermission: number = 0

  @observable
  selector: string = '';

  @observable
  showFolder: boolean = false;

  resizeCallback!: () => void;

  @action
  closeFolder() {
    this.showFolder = false
  }

  @action
  openFolder() {
    this.showFolder = true
  }

  @observable
  lock: boolean = false

  @observable
  showUpload: boolean = false;

  @observable
  showExtension: boolean = false;

  @observable
  activeFooterItem: string = ''

  @observable
  uuid: string = '';

  @observable
  roomToken: string = '';

  @observable
  sceneItems: SceneItem[] = [];

  @observable
  activeScenePath: string = '/init'

  @observable
  ready: boolean = false

  @observable
  follow: number = 0

  @observable
  grantUsers: any[] = []

  @observable
  permission: number = 0

  menuTitle: string = '课件目录'

  @action
  changeScenePath(path: string) {
    this.activeScenePath = path
    if (this.online && this.room) {
      this.room.setScenePath(this.activeScenePath)
    }
  }

  appStore!: AppStore

  @observable
  _boardClient?: BoardClient = undefined

  @computed
  get boardClient(): BoardClient {
    return this._boardClient as BoardClient;
  }

  ossClient!: OSS

  @observable
  folder: string = ''

  constructor(appStore: AppStore) {
    this.appStore = appStore
    this._boardClient = undefined
    const ossConfig = this.appStore?.params?.config?.oss
    if (ossConfig) {
      this.ossClient = new OSS({
        "accessKeyId": `${ossConfig.accessKey}`,
        "accessKeySecret": `${ossConfig.secretKey}`,
        "bucket": `${ossConfig.bucketName}`,
        "endpoint": `${ossConfig.endpoint}`,
        "folder": `${ossConfig.folder}`,
      } as OSSConfig)
      this.folder = ossConfig.folder
    } else {
      this.ossClient = new OSS(demoOssConfig)
      this.folder = demoOssConfig.folder
    }
  }

  get room(): Room {
    return this.boardClient.room
  }

  get localUser(): EduUser {
    return this.appStore.roomStore.roomManager.localUser.user
  }

  get localUserUuid() {
    return this.appStore.userUuid
  }

  @action
  async fetchInit() {
    let {
      info
    } = await this.boardService.getBoardInfo()
    await this.join({
      uuid: info.boardId,
      roomToken: info.boardToken,
      // $el: dom,
      role: this.userRole,
      isWritable: true,
      disableDeviceInputs: true,
      disableCameraTransform: true,
      disableAutoResize: false
    })
    const grantUsers = get(this.room.state.globalState, 'grantUsers', [])
    const follow = get(this.room.state.globalState, 'follow', 0)
    this.grantUsers = grantUsers
    const boardUser = this.grantUsers.includes(this.localUserUuid)
    if (boardUser) {
      this._grantPermission = true
    }
    this.follow = follow
    // 默认只有老师不用禁止跟随
    if (this.userRole !== EduRoleTypeEnum.teacher) {
      if (this.boardClient.room && this.boardClient.room.isWritable) {
        if (this.follow === FollowState.Follow) {
          // await this.setWritable(true)
          this.room.setViewMode(ViewMode.Broadcaster)
          this.room.disableCameraTransform = true
          this.room.disableDeviceInputs = true
          this.lock = true
        }
        if (this.follow === FollowState.Freedom) {
          // await this.setWritable(true)
          this.room.setViewMode(ViewMode.Freedom)
          this.room.disableCameraTransform = false
          this.room.disableDeviceInputs = false
          this.lock = false
        }
      }
    } else {
      this.room.disableCameraTransform = false
    }

    if (this.hasPermission) {
      await this.setWritable(true)
    } else {
      await this.setWritable(this._grantPermission as boolean)
    }
    this.ready = true
  }

  @action
  async init(info: {
    boardId: string,
    boardToken: string
  }) {
      await this.join({
        uuid: info.boardId,
        roomToken: info.boardToken,
        // $el: dom,
        role: this.userRole,
        isWritable: true,
        disableDeviceInputs: true,
        disableCameraTransform: true,
        disableAutoResize: false
      })
      const grantUsers = get(this.room.state.globalState, 'grantUsers', [])
      const follow = get(this.room.state.globalState, 'follow', 0)
      this.grantUsers = grantUsers
      const boardUser = this.grantUsers.includes(this.localUserUuid)
      if (boardUser) {
        this._grantPermission = true
      }
      this.follow = follow
      // 默认只有老师不用禁止跟随
      if (this.userRole !== EduRoleTypeEnum.teacher) {
        if (this.boardClient.room && this.boardClient.room.isWritable) {
          if (this.follow === FollowState.Follow) {
            // await this.setWritable(true)
            this.room.setViewMode(ViewMode.Broadcaster)
            this.room.disableCameraTransform = true
            this.room.disableDeviceInputs = true
            this.lock = true
          }
          if (this.follow === FollowState.Freedom) {
            // await this.setWritable(true)
            this.room.setViewMode(ViewMode.Freedom)
            this.room.disableCameraTransform = false
            this.room.disableDeviceInputs = false
            this.lock = false
          }
        }
      } else {
        this.room.disableCameraTransform = false
      }

      if (this.hasPermission) {
        await this.setWritable(true)
      } else {
        await this.setWritable(this._grantPermission as boolean)
      }
      this.ready = true
  }

  @action
  setFollow(v: number) {
    this.follow = v

    if (this.follow === FollowState.Follow) {
      this.lock = true
    } else {
      this.lock = false
    }

    const isTeacher = this.userRole === EduRoleTypeEnum.teacher

    if (isTeacher) {
      if (this.online && this.room) {
        if (this.follow === FollowState.Follow) {
          this.appStore.uiStore.addToast(t('toast.open_whiteboard_follow'))
          this.room.setViewMode(ViewMode.Broadcaster)
        } else {
          this.appStore.uiStore.addToast(t('toast.close_whiteboard_follow'))
          this.room.setViewMode(ViewMode.Freedom)
        }
      }
    } else {
      if (this.online && this.room) {
        if (this.follow === FollowState.Follow) {
          this.room.disableCameraTransform = true
          this.room.setViewMode(ViewMode.Follower)
          this.room.disableDeviceInputs = true
        } else {
          this.room.disableCameraTransform = false
          this.room.setViewMode(ViewMode.Freedom)
          this.room.disableDeviceInputs = false
        }
      }
    }
  }

  @action
  setGrantPermission(v: boolean) {
    this._grantPermission = v
    this.setWritable(v)
  }

  @action
  setGrantUsers(args: any[]) {
    this.grantUsers = args
  }

  @action
  async join(params: any) {
    const {role, ...data} = params
    const identity = role === EduRoleTypeEnum.teacher ? 'host' : 'guest'
    this._boardClient = new BoardClient({identity, appIdentifier: this.appStore.params.config.agoraNetlessAppId})
    this.boardClient.on('onPhaseChanged', (state: any) => {
      if (state === 'disconnected') {
        this.online = false
      }
    })
    this.boardClient.on('onRoomStateChanged', (state: any) => {
      if (state.zoomScale) {
        runInAction(() => {
          this.scale = state.zoomScale
        })
      }
      if (state.sceneState || state.globalState) {
        this.updateSceneItems()
      }
      if (state.globalState) {
        this.updateBoardState()
      }
    })
    BizLogger.info("[breakout board] join", data)
    await this.boardClient.join(data)
    BizLogger.info("[breakout board] after join", data)
    this.online = true
    // this.updateSceneItems()
    this.room.bindHtmlElement(null)
    const resizeCallback = () => {
      if (this.online && this.room && this.room.isWritable) {
        this.room.moveCamera({centerX: 0, centerY: 0});
        this.room.refreshViewSize();
      }
    }
    this.resizeCallback = resizeCallback
    window.addEventListener('resize', this.resizeCallback)
    this.updateSceneItems()
  }

  @action
  async leave() {
    if (this.boardClient && this.room) {
      window.removeEventListener('resize', this.resizeCallback)
      await this.boardClient.destroy()
      this.room.bindHtmlElement(null)
      this.reset()
    }
  }

  @action
  changeFooterMenu(itemName: string) {
    this.activeFooterItem = itemName
    const room = this.room
    if (!room || !room.isWritable) return
    this.changePage()
  }

  @action
  setTool(tool: string) {
    this.selector = tool
    if (this.selector === 'upload') {
      this.showUpload = true
    }
    else if (this.showUpload) {
      this.showUpload = false
    }

    if (this.selector === 'color_picker') {
      this.showColorPicker = true
    } else if (this.showColorPicker) {
      this.showColorPicker = false
    }

    if (this.selector === 'extension_tool') {
      this.showExtension = true
    } else if (this.showExtension) {
      this.showExtension = false
    }

    if (!this.room || !this.room.isWritable) return

    switch(this.selector) {
      case 'eraser':
      case 'ellipse':
      case 'rectangle':
      case 'pencil':
      case 'text':
      case 'selector': {
        this.room.handToolActive = false
        this.room.setMemberState({
          currentApplianceName: this.selector as any
        });
        break;
      }
      case 'color_picker': {
        this.room.setMemberState({
          currentApplianceName: "selector" as any,
        });
        break;
      }
      case 'hand_tool': {
        if (true) {
          this.room.setMemberState({
            currentApplianceName: "hand" as any
          })
        }
        break;
      }
      case 'extension_tool': {
        // 点击扩展执行
        
        break;
      }
      case 'add': {
        const room = this.room
        const newIndex = room.state.sceneState.index + 1
        const scenePath = room.state.sceneState.scenePath
        const currentPath = `/${pathName(scenePath)}`
        if (room.isWritable) {
          room.putScenes("/", [{}], newIndex)
          // room.putScenes(currentPath, [{}], newIndex)
          room.setSceneIndex(newIndex)
        }
        break;
      }
      default:
        this.room.handToolActive = false
        this.room.setMemberState({
          currentApplianceName: "selector" as any,
        })
        break;
    }
  }

  @action
  changeColor(color: any) {
    const {rgb} = color;
    const {r, g, b} = rgb;
    if (this.room) {
      this.room.setMemberState({
        strokeColor: [r, g, b]
      })
      const [r1, g1, b1] = this.room.state.memberState.strokeColor
      this.strokeColor = {
        r: r1,
        g: g1,
        b: b1
      }
    }
    // this.strokeColor = {
    //   r,
    //   g,
    //   b
    // }
  }

  @action
  updateScale(scale: number) {
    if (this.room && this.online) {
      this.room.moveCamera({scale})
    }
    this.scale = scale
  }

  @action
  async toggleLockBoard() {
    if (this.boardClient && this.room) {
      if (this.follow) {
        this.boardClient.cancelFollow()
        this.room.setViewMode(ViewMode.Freedom)
      } else {
        this.boardClient.startFollow()
        this.room.setViewMode(ViewMode.Broadcaster)
      }
    }
  }

  handleProgress (phase: PPTProgressPhase, percent: number) { 
    if (phase === PPTProgressPhase.Uploading) {
      if (percent < 1) {
        runInAction(() => {
          if (this.uploadingPhase !== 'uploading'){
            this.uploadingPhase = 'uploading'
          }
        })
      } else {
        runInAction(() => {
          this.uploadingPhase = 'upload_finished'
        })
      }
      return;
    }

    if (phase === PPTProgressPhase.Converting) {
      if (percent < 1) {
        runInAction(() => {
          if (this.convertingPhase !== 'converting') {
            this.convertingPhase = 'uploading'
          }
        })
      } else {
        this.convertingPhase = 'converting_done'
      }
      return;
    }
  }

  @action
  handleSuccess() {
    if (this.uploadingPhase) {
      this.uploadingPhase = ''
    }
    if (this.convertingPhase) {
      this.convertingPhase = ''
    }
  }

  @action
  handleFailure() {
    if (this.uploadingPhase === 'uploading') {
      this.uploadingPhase = 'upload_failure'
    }
    if (this.convertingPhase == 'converting') {
      this.convertingPhase = 'upload_failure'
    }
  }

  @computed 
  get loadingType (): string {
    if (!this._boardClient) return 'loading';
    if (this.converting) return 'converting';
    if (this.loading) return 'loading';
    return '';
  }

  changePage() {
    const room = this.room
    if (!room || !room.isWritable) return;

    switch(this.activeFooterItem) {
      case 'first_page': {
        room.setSceneIndex(0)
        this.updateSceneItems()
        return
      }
      case 'last_page': {
        room.setSceneIndex(this.totalPage-1)
        this.updateSceneItems()
        return
      }
      case 'next_page': {
        room.pptNextStep()
        this.updateSceneItems()
        return
      }
      case 'prev_page' : {
        room.pptPreviousStep()
        this.updateSceneItems()
        return
      }
    }
  }

  @action
  addScenes(path: string, ppt: any) {

  }

  @action
  removeScenes(path: string, isMainScene: boolean) {
    const room = this.room
    if (this.online && room) {
      room.removeScenes(path)
      const roomGlobalState: Record<string, any> = room.state.globalState
      const sceneMap = roomGlobalState['sceneMap'];
      const newSceneMap = omit(sceneMap, [`${path}`])
      if (isMainScene) {
        room.setGlobalState({
          sceneMap: ''
        })
      } else {
        room.setGlobalState({
          sceneMap: newSceneMap
        })
      }
      this.updateSceneItems()
    }
  }

  getNameByScenePath(scenePath: string) {
    const room = this.room
    const sceneMap = get(room, `state.globalState.sceneMap`, {})
    return get(sceneMap, scenePath, 'default name')
  }

  @action
  updateBoardState() {
    const follow = get(this.room.state.globalState, 'follow', 0)
    if (follow !== this.follow) {
      this.setFollow(follow)
      // this.follow = follow
      if (this.userRole === EduRoleTypeEnum.student) {
        if (this.follow) {
          this.appStore.uiStore.addToast(t('toast.whiteboard_lock'))
        } else {
          this.appStore.uiStore.addToast(t('toast.whiteboard_unlock'))
        }
      }
    }

    this.grantUsers = get(this.room.state.globalState, 'grantUsers', [])
    const grantUsers = this.grantUsers
    if (grantUsers && Array.isArray(grantUsers)) {
      const hasPermission = grantUsers.includes(this.localUserUuid) || this.roomType === 0 ? true : false
      if (this.userRole === EduRoleTypeEnum.student && hasPermission !== this.hasPermission) {
        const notice = hasPermission ? 'toast.teacher_accept_whiteboard' : 'toast.teacher_cancel_whiteboard'
        this.appStore.uiStore.addToast(t(notice))
      }
      this.setGrantUsers(grantUsers)
      if (this.userRole === EduRoleTypeEnum.student) {
        this.setGrantPermission(hasPermission)
      }
    }
  }

  @action
  updateSceneItems() {
    const room = this.room

    const path = room.state.sceneState.scenePath;
    const ppt = room.state.sceneState.scenes[0].ppt;

    const type = isEmpty(ppt) ? 'static' : 'dynamic';

    // if (type !== 'dynamic') {
    //   this.state = {
    //     ...this.state,
    //     currentHeight: 0,
    //     currentWidth: 0
    //   }
    // } else {
    //   this.state = {
    //     ...this.state,
    //     currentHeight: get(ppt, 'height', 0),
    //     currentWidth: get(ppt, 'width', 0)
    //   }
    // }

    const entriesScenes = room ? room.entireScenes() : {};

    const paths = Object.keys(entriesScenes);

    let scenes: any[] = [];
    for (let dirPath of paths) {
      const sceneInfo = {
        path: dirPath,
        file: {
          name: this.getNameByScenePath(dirPath),
          type: 'whiteboard'
        },
        type: 'static',
        rootPath: '',
      }
      if (entriesScenes[dirPath]) {
        sceneInfo.rootPath = ['/', '/init'].indexOf(dirPath) !== -1 ? '/init' : `${dirPath}/${entriesScenes[dirPath][0].name}`
        sceneInfo.type = entriesScenes[dirPath][0].ppt ? 'dynamic' : 'static'
        if (sceneInfo.type === 'dynamic') {
          sceneInfo.file.type = 'ppt';
        }
      }
      scenes.push(sceneInfo);
    }

    const _dirPath = pathName(path);
    const currentScenePath = _dirPath === '' ? '/' : `/${_dirPath}`;

    const _dirs: any[] = [];
    scenes.forEach((it: any) => {
      _dirs.push({
        path: it.path,
        rootPath: it.rootPath,
        file: it.file
      });
    });

    this.currentScene = currentScenePath
    this.sceneItems = scenes
    this.updatePagination()
  }

  @action
  updatePagination() {
    const room = this.room
    if(this.online && room) {
      this.currentPage = room.state.sceneState.index + 1;
      this.totalPage = room.state.sceneState.scenes.length;
    }
  }

  @action
  updateConvertPhase(v: string) {
    this.convertPhase = v
    if (this.convertPhase === 'converting') {
      this.converting = true
    } else {
      this.converting = false
    }
    if (this.uploadPhase === 'convert_success') {
      this.addNotice({
        title: t('room.convert_success'),
        type: 'ok'
      })
    }

    if (this.uploadPhase === 'convert_failure') {
      this.addNotice({
        title: t('room.convert_failure'),
        type: 'error'
      })
    }
  }

  @action
  updateUploadPhase(v: string) {
    this.uploadPhase = v
    if (this.uploadPhase === 'uploading') {
      this.loading = true
    } else {
      this.loading = false
    }
    if (this.uploadPhase === 'upload_success') {
      this.addNotice({
        title: t('room.upload_success'),
        type: 'ok'
      })
    }

    if (this.uploadPhase === 'upload_failure') {
      this.addNotice({
        title: t('room.upload_failure'),
        type: 'error'
      })
    }
  }
  
  @action
  async uploadDynamicPPT(file: any) {
    if (file && this.online) {
      try {
        const room = this.room
        const uploadManager = new UploadManager(this.ossClient, room);
        const pptConverter = this.boardClient.client.pptConverter(room.roomToken)
        const onProgress: PPTProgressListener = (phase: PPTProgressPhase, percent: number) => {
          if (phase === PPTProgressPhase.Uploading) {
            if (percent < 1) {
              this.uploadPhase !== 'uploading' && this.updateUploadPhase('uploading');
            } else {
              this.updateUploadPhase('upload_success');
            }
          }
  
          if (phase === PPTProgressPhase.Converting) {
            if (percent < 1) {
              this.convertPhase !== 'converting' && this.updateConvertPhase('converting');
            } else {
              this.updateConvertPhase('convert_success');
            }
          }
        }
        await uploadManager.convertFile(
          file,
          pptConverter,
          PPTKind.Dynamic,
          this.folder,
          room.uuid,
          onProgress);
      } catch (err) {
        if (this.uploadPhase === 'uploading') {
          this.updateUploadPhase('upload_failure')
        }
        if (this.convertPhase === 'converting') {
          this.updateConvertPhase('convert_failure')
        }
        BizLogger.warn(err)
      }
    }
  }

  @action
  async uploadStaticFile(file: any) {
    try {
      if (file && this.online) {
        const room = this.room
        const uploadManager = new UploadManager(this.ossClient, room);
        const pptConverter = this.boardClient.client.pptConverter(room.roomToken)
        const onProgress: PPTProgressListener = (phase: PPTProgressPhase, percent: number) => {
          if (phase === PPTProgressPhase.Uploading) {
            if (percent < 1) {
              this.uploadPhase !== 'uploading' && this.updateUploadPhase('uploading');
            } else {
              this.updateUploadPhase('upload_success');
            }
          }
  
          if (phase === PPTProgressPhase.Converting) {
            if (percent < 1) {
              this.convertPhase !== 'converting' && this.updateConvertPhase('converting');
            } else {
              this.updateConvertPhase('convert_success');
            }
          }
        }
        await uploadManager.convertFile(
          file,
          pptConverter,
          PPTKind.Static,
          this.folder,
          room.uuid,
          onProgress);
      }
    } catch (err) {
      if (this.uploadPhase === 'uploading') {
        this.updateUploadPhase('upload_failure')
      }
      if (this.convertPhase === 'converting') {
        this.updateConvertPhase('convert_failure')
      }
      BizLogger.warn(err)
    }
  }

  @action
  async uploadAudioVideo(file: any) {
    if (file && this.online) {
      const room = this.room
      const uploadManager = new UploadManager(this.ossClient, room);
      try {
        const {fileName, fileType} = resolveFileInfo(file);
        const path = `/${this.folder}`
        const uuid = uuidv4();
        const onProgress: PPTProgressListener = (phase: PPTProgressPhase, percent: number) => {
          if (phase === PPTProgressPhase.Uploading) {
            if (percent < 1) {
              this.uploadPhase !== 'uploading' && this.updateUploadPhase('uploading');
            } else {
              this.updateUploadPhase('upload_success');
            }
          }
  
          if (phase === PPTProgressPhase.Converting) {
            if (percent < 1) {
              this.convertPhase !== 'converting' && this.updateConvertPhase('converting');
            } else {
              this.updateConvertPhase('convert_success');
            }
          }
        }
        const res = await uploadManager.addFile(`${path}/video-${fileName}${uuid}`, file,
          onProgress
        );
        const isHttps = res.indexOf("https") !== -1;
        let url;
        if (isHttps) {
          url = res;
        } else {
          url = res.replace("http", "https");
        }
        const type = fileType.split(".")[1];
        if (url && this.online && room) {
          if (type.toLowerCase() === 'mp4') {
            const res = room.insertPlugin('video', {
              originX: 0,
              originY: 0,
              width: 480,
              height: 270,
              attributes: {
                pluginVideoUrl: url,
                isNavigationDisable: false
              },
            });
          }
          if (type.toLowerCase() === 'mp3') {
            const res = room.insertPlugin('audio', {
              originX: 0,
              originY: 0,
              width: 480,
              height: 86,
              attributes: {
                pluginAudioUrl: url,
                isNavigationDisable: false
              },
            });
          }
          return;
        }
      } catch(err) {
        if (this.uploadPhase === 'uploading') {
          this.updateUploadPhase('upload_failure')
        }
        if (this.convertPhase === 'converting') {
          this.updateConvertPhase('convert_failure')
        }
        BizLogger.warn(err)
      }
    }
  }

  @action
  async uploadImage(file: any, dom: HTMLDivElement | null = null) {
    if (this.online && file) {
      const room = this.room
      const uploadFileArray: File[] = [];
      uploadFileArray.push(file);
      const onProgress: PPTProgressListener = (phase: PPTProgressPhase, percent: number) => {
        if (phase === PPTProgressPhase.Uploading) {
          if (percent < 1) {
            this.uploadPhase !== 'uploading' && this.updateUploadPhase('uploading');
          } else {
            this.updateUploadPhase('upload_success');
          }
        }

        if (phase === PPTProgressPhase.Converting) {
          if (percent < 1) {
            this.convertPhase !== 'converting' && this.updateConvertPhase('converting');
          } else {
            this.updateConvertPhase('convert_success');
          }
        }
      }
      try {
        const uploadManager = new UploadManager(this.ossClient, room);
        if (dom) {
          const { clientWidth, clientHeight } = dom;
          await uploadManager.uploadImageFiles(this.folder, uploadFileArray, clientWidth / 2, clientHeight / 2, onProgress);
        } else {
          const clientWidth = window.innerWidth;
          const clientHeight = window.innerHeight;
          await uploadManager.uploadImageFiles(this.folder, uploadFileArray, clientWidth / 2, clientHeight / 2, onProgress);
        }
      } catch (err) {
        if (this.uploadPhase === 'uploading') {
          this.updateUploadPhase('upload_failure')
        }
        if (this.convertPhase === 'converting') {
          this.updateConvertPhase('convert_failure')
        }
        BizLogger.warn(err)
      }
    }
  }

  @action
  addNotice(it: any) {
    this.notices.push({
      title: it.title,
      type: it.type
    })
  }

  @action
  removeNotice(it: any) {
    const idx = this.notices.findIndex((t: any) => t.title === it.title)
    if (idx !== -1) {
      this.notices.splice(idx, 1)
    }
  }

  @observable
  notices: any[] = []
  @observable
  uploadPhase: string = ''
  @observable
  convertPhase: string = ''
  @observable
  sceneType: string = ''
  @observable
  uploadingPhase: string = '';
  @observable
  convertingPhase: string = '';
  @observable
  scale: number = 1

  @observable
  online: boolean = false;

  @observable
  showColorPicker: boolean = false

  @observable
  strokeColor: any = {
    r: 0,
    g: 0,
    b: 0
  }

  @observable
  _grantPermission?: boolean = false

  @action
  reset () {
    this.folder = ''
    this.scenes = []
    this.currentPage = 0
    this.totalPage = 0
    this.currentScene = '/init'
    this.hasBoardPermission = 0
    this.selector = ''
    this.converting = false
    this.loading = false
    this.uploadPhase = ''
    this.convertingPhase = ''
    this.permission = 0
    this.follow = 0
    this.grantUsers = []
    this._grantPermission = false
    this.ready = false

    this.notices = []
    this.uploadPhase = ''
    this.convertPhase = ''
    this.sceneType = ''
    this.uploadingPhase = ''
    this.scale = 1  
    this.online = false;
    this.showColorPicker = false
    this.strokeColor = {
      r: 0,
      g: 0,
      b: 0
    }
  }

  roomIsWritable(room: Room): boolean {
    if (room) {
      return room.isWritable
    }
    return false
  }

  async setWritable(v: boolean) {
    if (this.online && this.room) {
      await this.room.setWritable(v)

      if (this.lock) return
      this.room.disableDeviceInputs = !v
    }
  }

  @action
  async grantUserPermission(userUuid: string) {
    await this.boardService.updateBoardUserState(userUuid, EnumBoardState.grantPermission)
  }

  @action
  async revokeUserPermission(userUuid: string) {
    await this.boardService.updateBoardUserState(userUuid, EnumBoardState.revokePermission)
  }

  get userRole () {
    return this.appStore.userRole
  }

  get roomType (): number {
    return this.appStore.roomType
  }

  get boardService() {
    return this.appStore.boardService
  }

  @computed
  get hasPermission(): boolean {
    if (this.userRole === EduRoleTypeEnum.teacher || this.roomType === 0) {
      return true
    }
    return this._grantPermission as boolean
  }

  checkUserPermission(userUuid: string): boolean {
    return this.grantUsers.includes(userUuid)
  }

  @action
  async grantBoardPermission(userUuid: string) {
    try {
      this.boardClient.grantPermission(userUuid)
      this.appStore.uiStore.addToast(`授权白板成功`)
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_authorize_whiteboard') + `${err.message}`)
    }
  }

  @action
  async revokeBoardPermission(userUuid: string) {
    try {
      this.boardClient.revokePermission(userUuid)
      this.appStore.uiStore.addToast(`取消授权白板成功`)
    } catch (err) {
      this.appStore.uiStore.addToast(t('toast.failed_to_deauthorize_whiteboard') + `${err.message}`)
    }
  }

  mount(dom: any) {
    BizLogger.info("mounted", dom, this.boardClient && this.boardClient.room)
    if (this.boardClient && this.boardClient.room) {
      this.boardClient.room.bindHtmlElement(dom)
    }
  }

  unmount() {
    if (this.boardClient && this.boardClient.room) {
      this.boardClient.room.bindHtmlElement(null)
    }
  }

  @action
  hideExtension() {
    this.showExtension = false
  }
}