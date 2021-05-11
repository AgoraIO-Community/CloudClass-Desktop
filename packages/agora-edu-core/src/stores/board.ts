import { CursorTool } from '@netless/cursor-tool';
import { EduLogger, EduRoleTypeEnum, EduRoomType, EduUser, GenericErrorWrapper } from 'agora-rte-sdk';
import OSS from 'ali-oss';
import { cloneDeep, isEmpty, uniqBy } from 'lodash';
import { action, computed, observable, runInAction, reaction } from 'mobx';
import { ReactEventHandler } from 'react';
import { AnimationMode, ApplianceNames, MemberState, Room, SceneDefinition, ViewMode } from 'white-web-sdk';
import { ConvertedFile, CourseWareItem } from '../api/declare';
import { reportService } from '../services/report';
import { transDataToResource } from '../services/upload-service';
import { EduScenarioAppStore as EduScenarioAppStore } from './index';
import { DownloadFileStatus, StorageCourseWareItem } from '../types';
import { BoardClient } from '../utilities/board-client';
import { agoraCaches } from '../utilities/cache';
import { BizLogger,
  fetchNetlessImageByUrl,
  netlessInsertAudioOperation,
  netlessInsertImageOperation,
  netlessInsertVideoOperation,
  OSSConfig,
  transLineTool,
  transToolBar
} from '../utilities/kit';
import { ZoomController } from './zoom';

// TODO: 需要解耦，属于UI层的类型，场景SDK业务里不应该出现
export interface ToolItem {
  value: string;
  label: any;
  icon: any;
  isActive?: boolean;
  // render?: (tool: ToolItem) => ReactNode;
  component?: React.FC<{isActive: boolean, onClick: ReactEventHandler<any>}>
}


export type CustomizeGlobalState = {
  materialList: CourseWareItem[];
  dynamicTaskUuidList: any[];
  roomScenes: GlobalRoomScene;
  grantUsers: string[];
  follow: boolean;
  isFullScreen: boolean;
}

export type GlobalRoomScene = {
  [resourceUuid: string]: {
    contextPath: string,
    index: number,
    sceneName: string,
    scenePath: string,
    totalPage: string,
    resourceName: string,
    show: boolean,
  }
}

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

const transformConvertedListToScenes = (taskProgress: any) => {
  if (taskProgress && taskProgress.convertedFileList) {
    return taskProgress.convertedFileList.map((item: ConvertedFile, index: number) => ({
      name: `${index+1}`,
      componentCount: 1,
      ppt: {
        width: item.ppt.width,
        height: item.ppt.height,
        src: item.ppt.src,
      }
    }))
  }
  return []
}

const transformMaterialList = (item: CourseWareItem) => {
  return {
    ext: item.ext,
    resourceName: item.resourceName,
    resourceUuid: item.resourceUuid,
    scenes: transformConvertedListToScenes(item.taskProgress),
    size: item.size,
    taskProgress: item.taskProgress,
    taskUuid: item.taskUuid || "",
    updateTime: item.updateTime,
    url: item.url
  }
}

export enum BoardPencilSize {
  thin = 4,
  small = 8,
  normal = 12,
  large = 18
}

export enum BoardFrontSizeType {
  size12 = '12',
  size14 = '14',
  size18 = '18',
  size24 = '24',
  size26 = '26',
  size36 = '36',
  size48 = '48',
  size72 = '72',
}

export const resolveFileInfo = (file: any) => {
  const fileName = encodeURI(file.name);
  const fileType = fileName.substring(fileName.length, fileName.lastIndexOf('.'));
  return {
    fileName,
    fileType
  }
}

export const demoOssConfig: OSSConfig = {
  "accessKeyId": `EDU-SDK-accessKeyId`,
  "accessKeySecret": `EDU-SDK-accessKeySecret`,
  "bucket": `EDU-SDK-bucket`,
  // "region": process.env.REACT_APP_YOUR_OWN_OSS_BUCKET_REGION as string,
  "endpoint": `EDU-SDK-endpoint`,
  "folder": `EDU-SDK-folder`,
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

export enum DownloadStatus {
  notCache,
  downloading,
  cached,
  failed,
}

export class BoardStore extends ZoomController {
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
  boardRegion: string = '';

  @action.bound
  closeFolder() {
    this.showFolder = false
  }

  @action.bound
  openFolder() {
    this.showFolder = true
  }

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
  follow: boolean = false

  @observable
  grantUsers: any[] = []

  @observable
  permission: number = 0

  menuTitle: string = '课件目录'

  @observable
  isFullScreen: boolean = false

  @observable
  enableStatus: string|boolean = 'disable'

  @observable
  downloading: boolean = false

  @action.bound
  changeScenePath(path: string) {
    this.activeScenePath = path
    if (this.online && this.room) {
      this.room.setScenePath(this.activeScenePath)
    }
  }

  appStore!: EduScenarioAppStore

  @observable
  _boardClient?: BoardClient = undefined

  @computed
  get boardClient(): BoardClient {
    return this._boardClient as BoardClient;
  }

  ossClient!: OSS

  @observable
  folder: string = ''

  constructor(appStore: EduScenarioAppStore) {
    super(0);
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
    this.scale = 0
    reaction(() => JSON.stringify({ready: this.ready, hasPermission: this.hasPermission, role: this.userRole}), (data: string) => {
      const {ready, hasPermission, role} = JSON.parse(data)
      if (ready) {
        if (role === EduRoleTypeEnum.student) {
          if (hasPermission) {
            this.room.setViewMode(ViewMode.Freedom)
          } else {
            this.room.setViewMode(ViewMode.Follower)
          }
        }
      }
    })
  }

  get room(): Room {
    return this.boardClient?.room as Room
  }

  get localUser(): EduUser {
    return this.appStore.roomStore.roomManager.localUser.user
  }

  @computed
  get activeSceneName(): string {
    return this.resourcesList[this.activeIndex]?.resourceUuid ?? ''
  }

  get localUserUuid() {
    return this.appStore.userUuid
  }

  @computed
  get boardPenIsActive() {
    return [
      'pen',
      'square',
      'circle',
      'line'
    ].includes(this.currentSelector)
  }

  @action.bound
  async init(info: {
    boardId: string,
    boardToken: string,
    boardRegion: string,
  }) {
      this.boardRegion = info.boardRegion
      await this.join({
        boardId: info.boardId,
        boardToken: info.boardToken,
        role: this.userRole,
        isWritable: true,
        disableDeviceInputs: true,
        disableCameraTransform: true,
        disableAutoResize: false
      })
      const grantUsers = this.globalState?.grantUsers ?? []
      const follow = this.globalState?.follow ?? false
      const isFullScreen = this.globalState?.isFullScreen ?? false 
      this.grantUsers = grantUsers
      const boardUser = this.checkUserPermission(this.localUserUuid)
      if (boardUser) {
        this._grantPermission = true
      }
      this.follow = follow
      this.isFullScreen = isFullScreen
      // 默认只有老师不用禁止跟随
      if (this.hasPermission) {
        await this.setWritable(true)
        // let bridge = this.room.getInvisiblePlugin(IframeBridge.kind)
        // if (!bridge) {
        //     bridge = await IframeBridge.insert({
        //         room: this.room, // room 实例
        //         url: "https://demo-h5.netless.group/dist2020/#/pag1",
        //         // url: "example.com", // iframe 的地址
        //         width: 1280, // 课件的宽, 单位 px
        //         height: 720, // 课件的高, 单位 px
        //         displaySceneDir: "/example" // 自定义 h5 课件绑定的 scene 目录，切换到其他目录，课件会自动隐藏，注意，此目录需要用户在白板中自行创建
        //     })
        // }
      } else {
        await this.setWritable(this._grantPermission as boolean)
      }
  }

  loadScene(data: any[]): SceneDefinition[] {
    return data.map((item: ConvertedFile, index: number) => ({
      name: `${index + 1}`,
      componentCount: 1,
      ppt: {
        width: item.ppt.width,
        height: item.ppt.height,
        src: item.ppt.src,
      }
    } as SceneDefinition))
  }


  @observable
  sceneList: any[] = []

  controller: any = undefined

  @observable
  _resourcesList: Resource[] = []

  @observable
  _boardItem: Resource = {
    file: {
      name: 'board',
      type: 'board',
    },
    currentPage: 0,
    totalPage: 1,
    taskUuid: '',
    resourceUuid: 'init',
    resourceName: 'init',
    scenePath: '/init',
    show: true
  }

  @computed
  get resourcesList(): Resource[] {
    return [this._boardItem].concat(this._resourcesList.filter((it: any) => it.show === true))
  }

  @action.bound
  changeSceneItem(resourceUuid: string) {
    let targetPath = resourceUuid
    if (resourceUuid === "/init" || resourceUuid === "/" || resourceUuid === "init") {
      targetPath = "init"
    } else {
      targetPath = `/${resourceUuid}`
    }

    const currentPage = this.resourcesList.find((item) => item.resourceUuid === resourceUuid)?.currentPage ?? 0
    const sceneIsChanged = targetPath !== this.room.state.sceneState.contextPath
    if (sceneIsChanged) {
      if (targetPath === "init") {
        if (currentPage === 0) {
          this.room.setScenePath(`/init`)
        } else {
          this.room.setScenePath(`/${currentPage}`)
        }
      } else {
        const targetResource = this.allResources.find((item => item.id === resourceUuid))
        if (targetResource) {
          const scenePath = targetResource!.scenes![currentPage].name
          this.room.setScenePath(`${targetPath}/${scenePath}`)
        }
      }
    }

    this.moveCamera()

    const sceneState = this.room.state.sceneState
    const path = this.getResourcePath(sceneState.contextPath)

    const courseWare = this.allResources.find((res: any) => res.name === name)
    if (courseWare) {
      this.room.setGlobalState({
        dynamicTaskUuidList: [
          {
            resourceName: path,
            taskUuid: courseWare.taskUuid,
            resourceUuid: courseWare.id,
          }
        ]
      })
    }
    this.resourceUuid = resourceUuid
  }

  // 更新白板
  @action.bound
  updateBoardSceneItems ({scenes, resourceUuid, resourceName, page, taskUuid}: any, setScene: boolean) {
    const sceneName = `/${resourceName}`
    const scenePath = `${sceneName}/${scenes[page].name}`

    this.room.setGlobalState({
      dynamicTaskUuidList: [
        {
          resourceName: resourceName,
          taskUuid: taskUuid,
          resourceUuid,
        }
      ]
    })
    if (setScene) {
      this.room.putScenes(sceneName, scenes)
      this.room.setScenePath(scenePath)
    }
  }

  findResourcePage (resourceName: string) {
    const resource = this.resourcesList.find((it: any) => it.resourceName === resourceName)
    if (resource) {
      return resource.currentPage
    }

    return 0
  }

  getResourcePath(str: string) {
    if (str === "/") return "/init"
    return str.split('/')[1]
  }

  @computed
  get activeIndex(): number {
    const idx = this.resourcesList.findIndex((it) => {
      if (it.resourceUuid === this.resourceUuid) return true
      return false
    })

    if (idx !== -1) return idx

    return 0
  }

  @action.bound
  closeMaterial(resourceUuid: string) {
    const currentSceneState = this.room.state.sceneState
    const roomScenes = (this.room.state.globalState as any).roomScenes
    const resourceName = roomScenes[resourceUuid]?.resourceName
    this.room.setGlobalState({
      roomScenes: {
        ...roomScenes,
        [`${resourceUuid}`]: {
          contextPath: currentSceneState.contextPath,
          index: currentSceneState.index,
          sceneName: currentSceneState.sceneName,
          scenePath: currentSceneState.scenePath,
          totalPage: currentSceneState.scenes.length,
          resourceName: resourceName,
          resourceUuid: resourceUuid,
          show: false,
        }
      }
    })
    // const resourceName = this.resourcesList.find((it: any) => it.resou)
    this.room.setScenePath('')
  }

  async autoFetchDynamicTask() {
    const currentSceneState = this.room.state.sceneState
    const resourceUuid = this.getResourcePath(currentSceneState.contextPath)
    const isRootDir = ["init", "/", "", "/init"].includes(resourceUuid)
    if (isRootDir) {
      const materialList = this.globalState?.materialList ?? []
      const pptItem = materialList.find((it) => it.resourceUuid === resourceUuid)
      if (pptItem) {
        await this.startDownload(pptItem.resourceUuid)
      }
    }
  }

  updatePageHistory() {
    const currentSceneState = this.room.state.sceneState
    const resourceUuid = this.getResourcePath(currentSceneState.contextPath)

    const roomScenes = this.globalState?.roomScenes ?? {}

    const resourceName = roomScenes[resourceUuid]?.resourceName ?? 'init'

    this.room.setGlobalState({
      currentSceneInfo: {
        contextPath: currentSceneState.contextPath,
        index: currentSceneState.index,
        sceneName: currentSceneState.sceneName,
        scenePath: currentSceneState.scenePath,
        totalPage: currentSceneState.scenes.length,
        resourceUuid: resourceUuid,
        resourceName: resourceName
      },
      roomScenes: {
        ...roomScenes,
        [`${resourceUuid}`]: {
          contextPath: currentSceneState.contextPath,
          index: currentSceneState.index,
          sceneName: currentSceneState.sceneName,
          scenePath: currentSceneState.scenePath,
          totalPage: currentSceneState.scenes.length,
          resourceUuid: resourceUuid,
          resourceName: resourceName,
          show: true,
        }
      }
    })
    const sceneState = this.room.state.sceneState
    const name = this.getResourcePath(sceneState.contextPath)
    
    const courseWare = this.courseWareList.find((item: any) => item.resourceName === name)
    if (courseWare) {
      this.updateBoardSceneItems({
        scenes: sceneState.scenes,
        resourceUuid: courseWare.resourceUuid,
        resourceName: name,
        page: sceneState.index,
        taskUuid: courseWare.taskUuid,
      }, false)
    }
    this.updatePagination()
  }

  @observable
  currentScenePath: string = ''

  @observable
  resourceUuid: string = 'init'

  updateLocalResourceList() {
    const globalState = this.globalState
    const roomScenes = globalState?.roomScenes ?? []
    if (!roomScenes) return
    const newList: any[] = []
    for (let resourceUuid of Object.keys(roomScenes)) {
      const resource = roomScenes[resourceUuid]
      if (!resourceUuid || resourceUuid === "init" || resourceUuid === "/init" || resourceUuid === "/") {
        this._boardItem = {
          file: {
            name: 'board',
            type: 'board',
          },
          currentPage: resource.index,
          totalPage: +resource.totalPage,
          scenePath: resource.scenePath,
          resourceUuid: 'init',
          taskUuid: '',
          show: true,
          resourceName: 'init',
        }
      } else {
        const rawResource = this.allResources.find((it) => it.id === resourceUuid)
        const taskUuid = rawResource ? rawResource!.taskUuid  : ''
        newList.push({
          file: {
            name: rawResource?.name!,
            type: 'ppt',
          },
          resourceUuid: resourceUuid,
          resourceName: rawResource?.name!,
          taskUuid,
          currentPage: resource.index,
          totalPage: resource.totalPage,
          scenePath: resource.scenePath,
          show: resource.show,
        })
      }
    }
    this._resourcesList = newList
  }

  updateLocalSceneState() {
    this.resourceUuid = this.getResourcePath(this.room.state.sceneState.contextPath)
  }

  updateCourseWareList() {
    const globalState = this.globalState
    this.courseWareList = globalState.dynamicTaskUuidList ?? []
    this._personalResources = globalState.materialList ?? []
  }

  @observable
  courseWareList: any[] = []


  findFirstPPT() {
    const list = this.appStore.params.config.courseWareList
    const ppt = list.find((it: any) => {})
  }

  // TODO: 首次进入房间加载整个动态ppt资源列表
  async fetchRoomScenes() {
    const firstCourseWare = this.appStore.params.config.courseWareList[0]
    if (!firstCourseWare) {
      return []
    }
    await this.startDownload(`${firstCourseWare.taskUuid}`)
    // const items = this.appStore.params.config.courseWareList
    if (firstCourseWare.convert && firstCourseWare.taskProgress && firstCourseWare.taskProgress!.convertedPercentage === 100) {
      const scenes = firstCourseWare.taskProgress!.convertedFileList
      const resourceName = `${firstCourseWare.resourceName}`
      const page = this.findResourcePage(resourceName)
      this.updateBoardSceneItems({
        scenes,
        resourceName,
        resourceUuid: firstCourseWare.resourceUuid,
        page,
        taskUuid: firstCourseWare.taskUuid
      }, true)
      return scenes
    }
  }

  // TODO: aclass board init
  @action.bound
  async join(info: {
    role: EduRoleTypeEnum,
    isWritable: boolean,
    boardId: string,
    boardToken: string,
    disableDeviceInputs: boolean,
    disableCameraTransform: boolean,
    disableAutoResize: boolean
  }) {
    // REPORT
    reportService.startTick('joinRoom', 'board', 'join')
    try {
      await this.aClassJoinBoard({
        uuid: info.boardId,
        roomToken: info.boardToken,
        role: this.userRole,
        isWritable: true,
        disableDeviceInputs: true,
        disableCameraTransform: true,
        disableAutoResize: false
      })
      reportService.reportElapse('joinRoom', 'board', {api:'join', result: true})
    } catch(e) {
      reportService.reportElapse('joinRoom', 'board', {api:'join', result: false, errCode: `${e.message}`})
      // throw the error to return the process
      throw e
    }
    // 默认只有老师不用禁止跟随
    if (this.userRole === EduRoleTypeEnum.teacher) {
      console.log('setView Mode', this.userRole)
      this.room.setViewMode(ViewMode.Broadcaster)
      this.room.disableCameraTransform = false
    } else {
      this.room.disableCameraTransform = true
    }

    if (this.online && this.room) {
      if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.appStore.roomInfo.userRole)) {
        await this.room.setWritable(true)
        this.room.disableDeviceInputs = false
      }
    }

    this.ready = true

    this.updateBoardState(this.room.state.globalState as CustomizeGlobalState)
    this.updateCourseWareList()

    this.pptAutoFullScreen()

    this.updateLocalResourceList()
    this.updateLocalSceneState()
    this.updatePageHistory()
    // this.updateSceneItems()
  }

  pptAutoFullScreen() {
    if (this.room && this.online) {
      const room = this.room
      const scene = room.state.sceneState.scenes[room.state.sceneState.index];
      if (scene && scene.ppt) {
        const width = scene.ppt.width;
        const height = scene.ppt.height;
        room.moveCameraToContain({
          originX: -width / 2,
          originY: -height / 2,
          width: width,
          height: height,
          animationMode: AnimationMode.Immediately,
        });
      }
      this.scale = this.room.state.zoomScale
    }
  }

  // @action.bound
  // setFollow(v: boolean) {
  //   this.follow = v

  //   const isTeacher = this.userRole === EduRoleTypeEnum.teacher

  //   if (isTeacher) {
  //     if (this.online && this.room) {
  //       if (this.follow === true) {
  //         this.appStore.uiStore.fireToast('toast.open_whiteboard_follow'))
  //         this.room.setViewMode(ViewMode.Broadcaster)
  //       } else {
  //         this.appStore.uiStore.fireToast('toast.close_whiteboard_follow'))
  //         this.room.setViewMode(ViewMode.Freedom)
  //       }
  //     }
  //   } else {
  //     if (this.online && this.room) {
  //       if (this.follow === true) {
  //         this.room.disableCameraTransform = true
  //         this.room.setViewMode(ViewMode.Follower)
  //         this.room.disableDeviceInputs = true
  //       } else {
  //         this.room.disableCameraTransform = false
  //         this.room.setViewMode(ViewMode.Freedom)
  //         this.room.disableDeviceInputs = false
  //       }
  //     }
  //   }
  // }

  @action.bound
  setGrantPermission(v: boolean) {
    this._grantPermission = v
    this.setWritable(v)
  }

  @action.bound
  setGrantUsers(args: any[]) {
    this.grantUsers = args
  }
  

  @action.bound
  async aClassJoinBoard(params: any) {
    const {role, ...data} = params
    const identity = [EduRoleTypeEnum.teacher/*, EduRoleTypeEnum.assistant*/].includes(role) ? 'host' : 'guest'
    this._boardClient = new BoardClient({identity, appIdentifier: this.appStore.params.config.agoraNetlessAppId})
    this.boardClient.on('onPhaseChanged', (state: any) => {
      if (state === 'disconnected') {
        this.online = false
      }
    })
    this.boardClient.on('onMemberStateChanged', (state: any) => {
    })
    this.boardClient.on('onRoomStateChanged', (state: any) => {
      if (state.globalState) {
        // 判断锁定白板
        this.isFullScreen = state.globalState?.isFullScreen ?? false
        this.updateBoardState(state.globalState)
      }
      if (state.broadcastState && state.broadcastState?.broadcasterId === undefined) {
        if (this.room) {
          this.room.scalePptToFit()
        }
      }
      if (state.memberState) {
        this.currentStrokeWidth = this.getCurrentStroke(state.memberState)
      }
      if (state.zoomScale) {
        runInAction(() => {
          this.scale = state.zoomScale
        })
      }
      if (state.sceneState) {
        this.updatePageHistory()
        this.autoFetchDynamicTask()
        this.moveCamera()
      }
      if (state.sceneState || state.globalState) {
        this.updateLocalResourceList()
        this.updateLocalSceneState()
      }
      if (state.globalState) {
        this.updateCourseWareList()
        // const followFlag = !!state.globalState.follow
        // // TODO: 监听follow的逻辑
        // if(this.roleIsTeacher) {
        //   if (followFlag) {
        //     this.boardClient.followMode(ViewMode.Broadcaster)
        //   } else {
        //     this.boardClient.followMode(ViewMode.Freedom)
        //   }
        // } else if (this.roleIsStudent) {
        //   if (followFlag) {
        //     this.boardClient.followMode(ViewMode.Follower)
        //   }
        // }
      }
    })
    BizLogger.info("[breakout board] join", data)
    const cursorAdapter = new CursorTool(); //新版鼠标追踪

    const region = this.boardRegion ?? undefined

    console.log('boardRegion : ', this.boardRegion, ' region ', region)
    // const region = regionMap[this.appStore.params.config.region!] ?? undefined

    await this.boardClient.join({
      ...data,
      cursorAdapter,
      userPayload: {
        userId: this.appStore.roomStore.roomInfo.userUuid,
        avatar: "",
        cursorName: this.appStore.roomStore.roomInfo.userName,
        disappearCursor: this.appStore.roomStore.isAssistant,
      },
      floatBar: true,
      isAssistant: this.appStore.roomStore.isAssistant,
      region,
      disableNewPencil: false,
    })
    cursorAdapter.setRoom(this.boardClient.room)
    this.strokeColor = {
      r: 252,
      g: 58,
      b: 63
    }
    this.room.setMemberState({
      currentApplianceName: ApplianceNames.selector,
      strokeColor: [this.strokeColor.r, this.strokeColor.g, this.strokeColor.b],
    })
    this.selector = 'selection'
    BizLogger.info("[breakout board] after join", data)
    this.online = true
    // this.updateSceneItems()
    this.room.bindHtmlElement(null)
  }

  @computed
  get roleIsTeacher(): boolean {
    return this.isTeacher()
  }

  @computed
  get roleIsStudent(): boolean {
    return this.isStudent()
  }

  isTeacher(): boolean {
    const isNeedShowBoardUser = [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant, EduRoleTypeEnum.invisible]
    if (isNeedShowBoardUser.includes(this.appStore.roomInfo.userRole)) {
      return true
    }
    return false
  }

  isStudent(): boolean {
    if (this.appStore.roomInfo.userRole === EduRoleTypeEnum.student) {
      return true
    }
    return false
  }


  syncLocalPersonalCourseWareList() {
    this.room.setGlobalState({
      materialList: this.internalResources.map(transformMaterialList)
    })
  }

  // reset board scenes
  resetBoardScenes() {
    // this.removeScenes('/', true)
    this.room.setGlobalState({
      currentSceneInfo: undefined,
      roomScenes: undefined
    })
    EduLogger.info("重置白板全局自定义业务分页状态")
  }

  @action.bound
  async leave() {
    if (this.boardClient && this.room) {
      await this.boardClient.destroy()
      this.room.bindHtmlElement(null)
      this.reset()
    }
  }

  @action.bound
  changeFooterMenu(itemName: string) {
    this.activeFooterItem = itemName
    const room = this.room
    if (!room || !room.isWritable) return
    switch(this.activeFooterItem) {
      case 'first_page': {
        this.changePage(0, true)
        return
      }
      case 'last_page': {
        this.changePage(this.totalPage-1, true)
        return
      }
      case 'next_page': {
        const scenes = this.room.state?.sceneState?.scenes ?? []
        const sceneIndex = this.room.state?.sceneState?.index ?? 0
        const isPPT = scenes[sceneIndex]?.ppt ?? false 
        if (isPPT) {
          this.room.pptNextStep()
          return
        }
        this.changePage(room.state.sceneState.index + 1)
        return
      }
      case 'prev_page' : {
        const scenes = this.room.state?.sceneState?.scenes ?? []
        const sceneIndex = this.room.state?.sceneState?.index ?? 0
        const isPPT = scenes[sceneIndex]?.ppt ?? false 
        if (isPPT) {
          this.room.pptPreviousStep()
          return
        }
        this.changePage(room.state.sceneState.index - 1)
        return
      }
    }
  }

  @computed
  get currentSelector(): string {
    return this.selector
  }


  @observable
  lineSelector: string = 'pen'

  @observable
  laserPoint: boolean = false

  @action.bound
  setLaserPoint() {
    if (this.room) {
      this.setTool('laser')
      this.room.setMemberState({
        currentApplianceName: ApplianceNames.laserPointer
      })
    }
  }

  @observable
  shape: string = 'pencil';

  @action.bound
  setTool(tool: string) {
    if (!this.room) return

    switch(tool) {
      case 'blank-page': {
        const room = this.room
        if (room.isWritable) {
          room.setScenePath('/init')
          const newIndex = room.state.sceneState.scenes.length
          room.putScenes("/", [{name: `${newIndex}`}], newIndex)
          room.setSceneIndex(newIndex)
        }
        return
      }
      case 'pen':
      case 'square':
      case 'circle':
      case 'line': 
      case 'selection': 
      case 'text':
      case 'hand':
      case 'eraser':
      case 'color':
      case ApplianceNames.pencil:
      case ApplianceNames.rectangle:
      case ApplianceNames.ellipse:
      case ApplianceNames.straight:
      case ApplianceNames.arrow:
      case ApplianceNames.selector:
      {
        const room = this.room
        if (room.isWritable) {
          const appliance = transToolBar[tool]
          if (appliance) {
            if (transLineTool[tool]) {
              this.lineSelector = transLineTool[tool]
            }
            this.room.setMemberState({
              currentApplianceName: appliance
            })
          }

          const selector: Record<any, string> = {
            [ApplianceNames.pencil]: 'pen',
            [ApplianceNames.rectangle]: 'square',
            [ApplianceNames.ellipse]: 'circle',
            [ApplianceNames.straight]: 'line',
            [ApplianceNames.arrow]: 'arrow',
            [ApplianceNames.selector]: 'selection'
          }

          if (selector[tool]) {
            this.selector = selector[tool]
          } else {
            this.selector = tool
          }
        }
        break
      }
      case 'cloud': {
        this.selector = tool
        break;
      }
      case 'register': {
        this.selector = tool
        break;
      }
      case 'student_list': {
        this.selector = tool
        break;
      }
      case 'laser': {
        this.selector = tool
        break;
      }
      case 'reset': {
        this.selector = ""
        break
      }
    }
  }

  @observable
  currentStrokeWidth: number = 0

  @action.bound
  changeStroke(value: any) {
    if (this.room) {
      this.room.setMemberState({
        strokeWidth: value,
      })
    }
  }

  rgbToHexColor(r: number, g: number, b: number): string {
    const computeToHex = (c: number): string => {
      const hex = c.toString(16)
      return hex.length == 1 ? `0${hex}` : hex;
    }

    return `#${computeToHex(r)}${computeToHex(g)}${computeToHex(b)}`
  }

  @action.bound
  changeHexColor(colorHex: string) {
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
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
  }


  @observable
  currentActiveToolItem: string = 'mouse' 
  // @computed
  // getCurrentActiveToolItem(state: ): string {
  //   return BoardStore.toolItems[0].itemName
  // }

  @computed
  get currentColor(): string {
    const {r, g, b} = this.strokeColor
    return this.rgbToHexColor(r, g, b)
  }

  @observable
  currentStroke: string = ''

  getCurrentStroke(memberState: MemberState) {
    return memberState.strokeWidth
  }

  @observable
  currentArrow: any = 'pen';

  getCurrentArrow(memberState: MemberState) {
    const mapping = {
      // [ApplianceNames.arrow]: 'arrow',
      [ApplianceNames.laserPointer]: 'laserPointer',
      [ApplianceNames.pencil]: 'pen',
      [ApplianceNames.straight]: 'line',
    }
    //@ts-ignore
    return mapping[memberState.currentApplianceName]
  }

  @observable
  currentFontSize: BoardFrontSizeType = BoardFrontSizeType.size12

  changeFontSize(size: BoardFrontSizeType) {
    const defaultSize = 12
    const mapping = {
      [BoardFrontSizeType.size12]: 12,
      [BoardFrontSizeType.size14]: 14,
      [BoardFrontSizeType.size18]: 18,
      [BoardFrontSizeType.size24]: 24,
      [BoardFrontSizeType.size26]: 26,
      [BoardFrontSizeType.size36]: 36,
      [BoardFrontSizeType.size48]: 48,
      [BoardFrontSizeType.size72]: 72,
    }
    if (this.room) {
      const value = mapping[size] || defaultSize
      this.room.setMemberState({
        textSize: value
      })
    }
  }

  getCurrentFontSize(memberState: MemberState): BoardFrontSizeType {
    const fontSize = memberState.textSize
    const mapping = {
      [12]: BoardFrontSizeType.size12,
      [14]: BoardFrontSizeType.size14,
      [18]: BoardFrontSizeType.size18,
      [24]: BoardFrontSizeType.size24,
      [26]: BoardFrontSizeType.size26,
      [36]: BoardFrontSizeType.size36,
      [48]: BoardFrontSizeType.size48,
      [72]: BoardFrontSizeType.size72,
    }

    //@ts-ignore
    const value = mapping[fontSize]
    if (value) {
      return value
    }

    return BoardFrontSizeType.size12
  }

  @action.bound
  updateScale(scale: number) {
    if (this.room && this.online) {
      this.room.moveCamera({scale})
    }
    this.scale = this.room.state.zoomScale
  }

  @computed 
  get loadingType (): string {
    if (!this._boardClient) return 'loading';
    if (this.converting) return 'converting';
    if (this.loading) return 'loading';
    return '';
  }

  @action.bound
  updatePen(value: any) {
    this.lineSelector = value
    this.room.setMemberState({
      currentApplianceName: transToolBar[value] as any
    })
  }

  changePage(idx: number, force?: boolean) {
    const room = this.room
    if (!room || !room.isWritable) return;
    const _idx = idx
    if (_idx < 0 || _idx >= this.totalPage) {
      BizLogger.warn(_idx < 0, _idx >= this.totalPage)
      return
    }
    if (force) {
      room.setSceneIndex(_idx);
      return
    }
    room.setSceneIndex(_idx);
  }


  @action.bound
  updateBoardState(globalState: CustomizeGlobalState) {
    // const follow = globalState?.follow ?? false
    // if (follow !== this.follow) {
    //   this.setFollow(follow)
    //   if (this.userRole === EduRoleTypeEnum.student) {
    //     if (this.follow) {
    //       this.appStore.uiStore.fireToast('toast.whiteboard_lock'))
    //     } else {
    //       this.appStore.uiStore.fireToast('toast.whiteboard_unlock'))
    //     }
    //   }
    // }

    this.grantUsers = globalState?.grantUsers ?? []
    const grantUsers = this.grantUsers
    if (grantUsers && Array.isArray(grantUsers)) {
      const hasPermission = grantUsers.includes(this.localUserUuid) ? true : false
      if (this.userRole === EduRoleTypeEnum.student && hasPermission !== this.hasPermission) {
        const notice = hasPermission ? 'toast.teacher_accept_whiteboard' : 'toast.teacher_cancel_whiteboard'
        this.appStore.uiStore.fireToast(notice)
      }
      this.setGrantUsers(grantUsers)
      if (this.userRole === EduRoleTypeEnum.student) {
        this.setGrantPermission(hasPermission)
      }
    }
  }

  @action.bound
  updatePagination() {
    const room = this.room
    if(this.online && room) {
      this.currentPage = room.state.sceneState.index + 1;
      this.totalPage = room.state.sceneState.scenes.length;
    }
  }

  @observable
  notices: any[] = []
  @observable
  uploadPhase: string = ''
  @observable
  convertPhase: string = ''
  @observable
  isCancel: boolean =false
  @observable
  uploadingPhase: string = '';
  @observable
  convertingPhase: string = '';
  @observable
  scale: number = 1

  @computed
  get zoomValue(): number {
    return Math.ceil(this.scale * 100)
  }

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

  @observable
  fileLoading: boolean = false
  @observable
  uploadingProgress: number = 0

  @observable
  allTools: any[] = []

  @action.bound
  installTools(tools: any[]) {
    this.allTools = tools
  }

  @computed
  get _tools() {
    const allTools = this.allTools
    const {userRole, roomType} = this.appStore.roomInfo
    if (roomType === EduRoomType.SceneType1v1) {
      const oneToOneTools = allTools.filter((item: ToolItem) => !['student_list', 'register'].includes(item.value))
      if ([EduRoleTypeEnum.assistant].includes(userRole)) {
        return oneToOneTools.filter((item: ToolItem) => !['blank-page', 'tools'].includes(item.value))
      }
      if ([EduRoleTypeEnum.invisible].includes(userRole)) {
        return oneToOneTools.filter((item: ToolItem) => !['blank-page', 'cloud', 'tools'].includes(item.value))  
      }
      if ([EduRoleTypeEnum.student].includes(userRole)) {
        if (this.hasPermission) {
          return oneToOneTools.filter((item: ToolItem) => !['cloud', 'tools'].includes(item.value))
        } else {
          return []
        }
      }
      return oneToOneTools
    }
    if (roomType === EduRoomType.SceneTypeBigClass) {
      const bigClassTools = allTools.filter((item: ToolItem) => !['register'].includes(item.value))
      if ([EduRoleTypeEnum.assistant].includes(userRole)) {
        return bigClassTools.filter((item: ToolItem) => !['blank-page', 'tools'].includes(item.value))
      }
      if ([EduRoleTypeEnum.invisible].includes(userRole)) {
        return bigClassTools.filter((item: ToolItem) => !['blank-page', 'cloud', 'tools'].includes(item.value))  
      }
      if ([EduRoleTypeEnum.student].includes(userRole)) {
        if (this.hasPermission) {
          return bigClassTools.filter((item: ToolItem) => !['cloud', 'tools'].includes(item.value))
        } else {
          return bigClassTools.filter((item: ToolItem) => item.value === 'student_list')
        }
      }
      return bigClassTools
    }
    if (roomType === EduRoomType.SceneTypeMiddleClass) {
      const midClassTools = allTools.filter((item: ToolItem) => !['student_list'].includes(item.value))
      if ([EduRoleTypeEnum.assistant].includes(userRole)) {
        return midClassTools.filter((item: ToolItem) => !['tools'].includes(item.value))
      }
      if ([EduRoleTypeEnum.invisible].includes(userRole)) {
        return midClassTools.filter((item: ToolItem) => !['blank-page', 'cloud', 'tools'].includes(item.value))
      }
      if ([EduRoleTypeEnum.student].includes(userRole)) {
        if (this.hasPermission) {
          return midClassTools.filter((item: ToolItem) => !['blank-page', 'cloud', 'tools'].includes(item.value))
        } else {
          return midClassTools.filter((item: ToolItem) => ['register'].includes(item.value))
        }
      }
      return midClassTools
    }
    return []
  }

  @computed
  get tools() {
    if (this._tools) {
      const isMenuItem = (value: string) => !['cloud', 'tools', 'register', 'student_list'].includes(value)
      return this._tools.map((item: ToolItem) => ({...item, hover: isMenuItem(item.value) ? this.ready : true}))
    }
    return []
  }

  @action.bound
  reset () {
    this.downloading = false
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    this.resizeObserver = null as any
    this.preloadingProgress = -1
    if (this.controller) {
      this.controller.abort()
      this.controller = undefined
    }
    this.activeMap = {}
    this._personalResources = []
    this._resourcesList = []
    this.courseWareList = []
    this.isFullScreen = false
    this.fileLoading = false
    this.uploadingProgress = 0
    this.folder = ''
    this.scenes = []
    this.sceneList = []
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
    this.follow = false
    this.grantUsers = []
    this._grantPermission = false
    this.ready = false

    this.notices = []
    this.uploadPhase = ''
    this.convertPhase = ''
    this.uploadingPhase = ''
    this.scale = 1  
    this.online = false;
    this.showColorPicker = false
    this.strokeColor = {
      r: 0,
      g: 0,
      b: 0
    }

    this.currentFontSize = BoardFrontSizeType.size12
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

      if (this.userRole === EduRoleTypeEnum.student) {
        if (this.room.isWritable) {
          this.room.setMemberState({
            currentApplianceName: ApplianceNames.selector
          })
          this.selector = 'selection'
        }
      }
      this.room.disableDeviceInputs = !v
    }
  }

  @action.bound
  async grantUserPermission(userUuid: string) {
    if (this.boardClient) {
      this.boardClient.grantPermission(userUuid)
    }
    // await this.boardService.updateBoardUserState(userUuid, EnumBoardState.grantPermission)
  }

  @action.bound
  async revokeUserPermission(userUuid: string) {
    if (this.boardClient) {
      this.boardClient.revokePermission(userUuid)
    }
    // await this.boardService.updateBoardUserState(userUuid, EnumBoardState.revokePermission)
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
    if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.userRole)) {
      return true
    }
    return this._grantPermission as boolean
  }

  checkUserPermission(userUuid: string): boolean {
    return this.grantUsers.includes(userUuid)
  }

  @action.bound
  async grantBoardPermission(userUuid: string) {
    try {
      this.boardClient.grantPermission(userUuid)
      this.appStore.uiStore.fireToast(`toast.granted_board_success`)
    } catch (err) {
      this.appStore.uiStore.fireToast('toast.failed_to_authorize_whiteboard', {reason: `${err.message}`})
    }
  }

  @action.bound
  async revokeBoardPermission(userUuid: string) {
    try {
      this.boardClient.revokePermission(userUuid)
      this.appStore.uiStore.fireToast(`toast.revoke_board_success`)
    } catch (err) {
      this.appStore.uiStore.fireToast('toast.failed_to_deauthorize_whiteboard', {reason: `${err.message}`})
    }
  }

  @observable
  resizeObserver!: ResizeObserver 

  @action.bound
  mount(dom: any) {
    BizLogger.info("mounted", dom, this.boardClient && this.boardClient.room)
    if (this.boardClient && this.boardClient.room) {
      this.boardClient.room.bindHtmlElement(dom)
      this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        if (this.online && this.room) {
          this.room.moveCamera({centerX: 0, centerY: 0});
          this.moveCamera()
          this.room.refreshViewSize();
        }
      })
      this.resizeObserver.observe(dom)
    }
  }

  @action.bound
  unmount() {
    if (this.boardClient && this.boardClient.room) {
      this.boardClient.room.bindHtmlElement(null)
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null as any
    }
  }

  @action.bound
  hideExtension() {
    this.showExtension = false
  }

  @action.bound
  setZoomScale(operation: string) {
    if (operation === 'out') {
      const scale = this.moveRuleIndex(-1, this.scale)
      this.updateScale(scale)
    } else {
      const scale = this.moveRuleIndex(1, this.scale)
      this.updateScale(scale)
    }
  }

  @action.bound
  zoomBoard(type: string) {
    // 白板全屏
    if (this.userRole === EduRoleTypeEnum.teacher) {
      this.setFullScreen(type === 'fullscreen')
    }
    if (type === 'fullscreen') {
      this.isFullScreen = true
      return
    }

    // 白板退出全屏
    if (type === 'fullscreenExit') {
      this.isFullScreen = false
      return
    }
  }

  @action.bound
  setFullScreen(type:boolean){
    this.room.setGlobalState({
      isFullScreen: type
    })
  }

  @observable
  preloading: boolean = false

  @observable
  preloadingProgress: number = -1

  @computed
  get isLoading() {
    if (!this.ready) {
      return 'preparing'
    }
    if (this.preloading) {
      return true
    }
  }


  @computed
  get loadingStatus() {
    if (!this.ready) {
      return "whiteboard.loading"
    }
    if (this.preloadingProgress !== -1) {
      // return "whiteboard.downloading", {reason: this.preloadingProgress})
    }

    return ''
  }

  get globalState() {
    return this.room.state.globalState as CustomizeGlobalState
  }

  @action.bound
  async removeMaterialList(resourceUuids: string[]) {
    try {
      const res = await this.appStore.uploadService.removeMaterials({
        resourceUuids: resourceUuids,
        roomUuid: this.appStore.roomInfo.roomUuid,
        userUuid: this.appStore.roomInfo.userUuid,
      })
      const materialList = this.globalState?.materialList ?? []
      const newList = materialList.filter((e: any) => !resourceUuids.includes(e.resourceUuid))
      const newRoomScenes = this.globalState?.roomScenes ?? []
      let includeRoomScenes = false
      for (const key of resourceUuids) {
        includeRoomScenes = true
        //@ts-ignore
        delete newRoomScenes[key]
      }
      this.room.setGlobalState({
        materialList: newList,
        roomScenes: {
          ...newRoomScenes,
        }
      })
      if (includeRoomScenes) {
        this.room.setScenePath('')
      }
      this._personalResources = this._personalResources.filter((e => !resourceUuids.includes(e.resourceUuid)))
      EduLogger.info("remove removeMaterialList success", res)
    } catch (err) {
      throw err
    }
  }

  @action.bound
  async putCourseResource(resourceUuid: string) {
    const resource: any = this.allResources.find((it: any) => it.id === resourceUuid)
    if (resource) {
      const scenes = resource.scenes
      this.updateBoardSceneItems({
        scenes,
        resourceName: resource.name,
        resourceUuid: resource.id,
        page: 0,
        taskUuid: resource.taskUuid,
      }, false)

      const roomScenes = (this.room.state.globalState as any).roomScenes
      this.room.setGlobalState({
        roomScenes: {
          ...roomScenes,
          [`${resourceUuid}`]: {
            contextPath: `/${resource.id}/`,
            index: 0,
            sceneName: resource.scenes[0].name,
            scenePath: `/${resource.id}/${resource.scenes[0].name}`,
            totalPage: scenes.length,
            resourceName: resource.name,
            resourceUuid: resourceUuid,
            show: true,
          }
        }
      })
      this.room.putScenes(`/${resource.id}`, resource.scenes)
      this.room.setScenePath(`/${resource.id}/${resource.scenes[0].name}`)
    }
  }

  @action.bound
  async putImage(url: string) {
    const imageInfo = await fetchNetlessImageByUrl(url)
    await netlessInsertImageOperation(this.room, {
      uuid: imageInfo.uuid,
      file: imageInfo.file,
      url: imageInfo.url,
      width: imageInfo.width,
      height: imageInfo.height,
      //@ts-ignore
      coordinateX: this.room.divElement.clientHeight / 2,
      //@ts-ignore
      coordinateY: this.room.divElement.clientWidth / 2,
    })
  }

  @action.bound
  async putAV(url: string, type: string) {
    console.log("open media ", url, " type", type)
    if (type === 'video') {
      netlessInsertVideoOperation(this.room, {
        url: url,
        originX: 0,
        originY: 0,
        width: 480,
        height: 270,
      })
    }
    if (type === 'audio') {
      netlessInsertAudioOperation(this.room, {
        url: url,
        originX: 0,
        originY: 0,
        width: 480,
        height: 86,
      })
    }
  }

  @action.bound
  async putSceneByResourceUuid(uuid: string) {
    try {
      const resource: any = this.allResources.find((resource: any) => resource.id === uuid)
      if (!resource) {
        console.log('未找到uuid相关的课件', uuid)
      }
      const putCourseFileType = ["ppt", "word","pdf"]
      if (putCourseFileType.includes(resource.type)) {
        await this.putCourseResource(uuid)
      }
      if (["video", "audio"].includes(resource.type)) {
        await this.putAV(resource.url, resource.type)
      }  
      if (["image"].includes(resource.type)) {
        await this.putImage(resource.url)
      }
    } catch (err) {
      throw err
    }
  }

  @action.bound
  async getFileInQueryMaterial(fileName: string) {
    return await this.appStore.uploadService.getFileInQueryMaterial({
      roomUuid: this.appStore.roomInfo.roomUuid,
      resourceName:fileName
    })
  }

  @action.bound
  async handleUpload(payload: any) {    
    try {
      this.fileLoading = true
      // TODO: need handleUpload return type
      let res = await this.appStore.uploadService.handleUpload({
        ...payload,
        roomUuid: this.appStore.roomInfo.roomUuid,
        userUuid: this.appStore.roomInfo.userUuid,
        onProgress: (evt: any) => {
          payload.onProgress(evt);
        },
      })

      if (this.isCancel) {
        return
      }
      const materialList = this.globalState?.materialList ?? []
      this.room.setGlobalState({
        materialList: uniqBy(materialList.concat([{
          ...res,
        } as CourseWareItem]), 'resourceUuid')
      })
      this.fileLoading = false
    } catch (err) {
      console.error(err)
      this.fileLoading = false
    }
  }

  @action.bound
  async cancelUpload() {
    await this.appStore.uploadService.cancelFileUpload()
  }

  @action.bound
  clearScene() {
    this.room.cleanCurrentScene()
  }

  @action.bound
  moveCamera() {
    if (!isEmpty(this.room.state.sceneState.scenes) && this.room.state.sceneState.scenes[0].ppt) {
      this.room.scalePptToFit()
    } else {
      this.room.moveCamera({
        centerX: 0,
        centerY: 0,
        scale: 1,
      })
    }
  }

  @computed
  get publicResources() {
    return this.appStore.params.config.courseWareList.map(transDataToResource)
  }

  @computed
  get internalResources(): CourseWareItem[] {
    return this.appStore.params.config.personalCourseWareList ?? []
  }

  @observable
  _personalResources: CourseWareItem[] = []

  @computed
  get personalResources() {
    return this._personalResources.map(transDataToResource)
  }

  @computed
  get allResources() {
    return this.publicResources.concat(this.personalResources)
  }

  @computed
  get totalProgress(): number {
    return +(this.courseWareList.filter((e => this.progressMap[e.taskUuid] && this.progressMap[e.taskUuid] === 100)).length  / this.courseWareList.length).toFixed(2) * 100
  }

  @observable
  progressMap: Record<string, number> = {}

  async destroy () {
    this.progressMap = {}
  }

  @observable
  downloadList: StorageCourseWareItem[] = []

  // @computed
  // get downloadList(): StorageCourseWareItem[] {
  //   return this._downloadList.map((item: StorageCourseWareItem) => ({
  //     ...item,
  //     progress: get(this.progressMap, `${item.taskUuid}`, 0) / 100
  //   }))
  // }

  @action.bound
  async refreshState() {
    const newCourseWareList: any = [...this.allResources]
    for (let i = 0; i < newCourseWareList.length; i++) {
      const item = newCourseWareList[i]
      const res = await agoraCaches.hasTaskUUID(item.taskUuid)
      item.progress = res === true ? 100 : 0
      this.progressMap[item.taskUuid] = item.progress
      item.status = res === true ? DownloadFileStatus.Cached : DownloadFileStatus.NotCached
    }
    this.downloadList = newCourseWareList
  }

  @action.bound
  updateDownloadById (taskUuid: string, props: Partial<StorageCourseWareItem>) {
    const list = this.downloadList
    const idx = list.findIndex((item: StorageCourseWareItem) => item.taskUuid === taskUuid)
    const item = list[idx]
    Object.assign(item, props)
    const newList = cloneDeep(list)
    this.downloadList = newList
  }

  @action.bound
  async internalDownload(taskUuid: string) {
    const isCached = await agoraCaches.hasTaskUUID(taskUuid)
    if (isCached) {
      EduLogger.info(`文件已缓存.... taskUuid: ${taskUuid}`)
      return
    }
    try {
      EduLogger.info(`正在下载中.... taskUuid: ${taskUuid}`)
      this.updateDownloadById(taskUuid, {
        download: true
      })
      await agoraCaches.startDownload(taskUuid, (progress: number, controller: any) => {
        const newProgress = this.progressMap[taskUuid] ?? 0
        if (progress >= newProgress) {
          const info: any = {
            progress,
          }
          if (info.progress === 100) {
            Object.assign(info, {
              download: true
            })
          }

          this.updateDownloadById(taskUuid, info)
          this.progressMap[taskUuid] = progress
        }
        this.controller = controller
      })
      EduLogger.info(`下载完成.... taskUuid: ${taskUuid}`)
    } catch (err) {
      EduLogger.info(`下载失败.... taskUuid: ${taskUuid}, ${err}`)
    }
  }

  @action.bound
  async startDownload(taskUuid: string) {
    try {
      await this.internalDownload(taskUuid)
      await this.refreshState()
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  // TODO: need handle service worker request abort
  @action.bound
  async cancelDownload(taskUuid: string) {
    try {
      if (this.controller) {
        this.controller.abort()
        this.controller = undefined
        this.updateDownloadById(taskUuid, {
          download: false,
          progress: 0
        })
      }
      await this.refreshState()
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  @action.bound
  async deleteSingle(taskUuid: string) {
    try {
      await agoraCaches.deleteTaskUUID(taskUuid)
      await this.refreshState()
      EduLogger.info(`删除完成.... taskUuid: ${taskUuid}`)
    } catch (err) {
      EduLogger.info(`删除失败.... taskUuid: ${taskUuid}`)
    }
  }

  @action.bound
  async deleteAllCache() {
    try {
      await agoraCaches.clearAllCache()
      await this.refreshState()
      EduLogger.info('删除全部缓存完成....')
    } catch (err) {
      EduLogger.info(`删除全部缓存失败....: ${err}`)
    }
  }

  @action.bound
  async downloadAll() {
    try {
      const courseItem = this.courseWareList
      for (let i = 0; i < courseItem.length; i++) {
        await this.startDownload(courseItem[i].taskUuid)
      }
      await this.refreshState()
      EduLogger.info(`全部下载成功....`)
    } catch (err) {
      EduLogger.info(`全部下载失败....: ${err}`)
    }
  }

  @observable
  activeMap: Record<string, boolean> = {}
}

export type HandleUploadType = {
  file: File,
  resourceName: string,
  onProgress: (evt: any) => any,
}