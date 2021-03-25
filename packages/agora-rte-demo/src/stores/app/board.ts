import { GenericErrorWrapper } from 'agora-rte-sdk';
import { UploadManager, PPTProgressListener } from '@/utils/upload-manager';
import { AppStore } from '@/stores/app';
import { observable, action, computed, runInAction } from 'mobx'
import { PPTProgressPhase } from '@/utils/upload-manager'
import { Room, PPTKind, ViewMode, ApplianceNames, MemberState, AnimationMode, SceneDefinition } from 'white-web-sdk'
import { BoardClient } from '@/components/netless-board/board-client';
import { get, isEmpty, omit, uniqBy } from 'lodash';
import { OSSConfig } from '@/utils/helper';
import { BizLogger } from '@/utils/biz-logger';
import OSS from 'ali-oss';
import uuidv4 from 'uuid/v4';
import { t } from '@/i18n';
import { EduUser, EduRoleTypeEnum, EduLogger } from 'agora-rte-sdk';
import { EnumBoardState } from '@/modules/services/board-api';
import { CustomMenuItemType, IToolItem } from 'agora-aclass-ui-kit';
import {CursorTool} from '@netless/cursor-tool'
import { fetchPPT } from '@/modules/course-ware';
import { ConvertedFile, ConvertedFileList, CourseWareItem } from '@/edu-sdk';
import { agoraCaches } from '@/utils/web-download.file';
import fetchProgress from 'fetch-progress';
import { transDataToResource } from '@/services/upload-service';
import { fetchNetlessImageByUrl, netlessInsertAudioOperation, netlessInsertImageOperation, netlessInsertVideoOperation } from '@/utils/utils';
import { reportService } from '@/services/report-service';
import { createRef } from 'react';

const transformConvertedListToScenes = (taskProgress: any) => {
  if (taskProgress && taskProgress.convertedFileList) {
    return taskProgress.convertedFileList.map((item: ConvertedFile, index: number) => ({
      name: `${index+1}`,
      componentCount: 1,
      ppt: {
        width: item.width,
        height: item.height,
        src: item.conversionFileUrl
      }
    }))
  }
  return []
}

type MaterialItem = {
    ext: string,
    resourceName: string,
    resourceUuid: string,
    scenes: any[],
    size: number,
    taskProgress: any,
    taskUuid: string,
    updateTime: number,
    url: string,
}

const transformMaterialItem = (item: CourseWareItem): MaterialItem => {
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

interface CacheInfo {
  progress: number,
  downloading: boolean,
  cached: boolean,
  skip: boolean
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

export enum DownloadStatus {
  notCache,
  downloading,
  cached,
  failed,
}

export class BoardStore {

  toolItems: IToolItem[] = [
  {
    itemName: 'mouse',
    toolTip: true,
    iconTooltipText: t('tool.selector'),
  },
  {
    itemName: 'pencil',
    toolTip: true,
    popoverType: 'drawer',
    iconTooltipText: t('tool.pencil'),
  },
  {
    itemName: 'text',
    toolTip: true,
    popoverType: 'font',
    iconTooltipText: t('tool.text'),
  },
  {
    itemName: 'rectangle',
    toolTip: true,
    popoverType: 'stroke',
    iconTooltipText: t('tool.rectangle'),
  },
  {
    itemName: 'elliptic',
    toolTip: true,
    popoverType: 'stroke',
    iconTooltipText: t('tool.ellipse'),
  },
  {
    itemName: 'eraser',
    toolTip: true,
    iconTooltipText: t('tool.eraser'),
  },
  // {
  //   itemName: 'palette',
  //   toolTip: true,
  //   popoverType: 'color',
  //   iconTooltipText: t('tool.color_picker'),
  // },
  {
    itemName: 'new-page',
    toolTip: true,
    iconTooltipText: t('tool.add'),
  },
  {
    itemName: 'move',
    toolTip: true,
    iconTooltipText: t('tool.hand_tool'),
  },
  {
    itemName: 'clear',
    toolTip: true,
    iconTooltipText: t('tool.clear'),
  },
  {
    itemName: 'disk',
    toolTip: true,
    iconTooltipText: t('tool.disk'),
  },
]

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

  @observable
  localFullScreen: boolean = false

  updateFullScreen(screen: boolean = false) {
    // if (this.userRole === EduRoleTypeEnum.teacher || screen) {
      this.localFullScreen = screen
    // }
  }

  @computed
  get isFullScreen(): boolean {
    return this.localFullScreen
  }

  @observable
  enableStatus: string|boolean = 'disable'

  @observable
  downloading: boolean = false

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
    return this.appStore.acadsocStore.roomManager.localUser.user
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
    const globalState = this.room.state.globalState as any
    this.grantUsers = grantUsers
    const boardUser = this.grantUsers.includes(this.localUserUuid)
    if (boardUser) {
      this._grantPermission = true
    }
    this.follow = follow
    this.updateFullScreen(globalState.isFullScreen)
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
      const isFullScreen = get(this.room.state.globalState, 'isFullScreen', false)
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

  async preloadCourseWare() {

  }

  checkShouldInitScene() {
    if (this.isTeacher() && !this.teacherLogged()) {
      return true
    }
    if (this.isStudent() && !this.studentLogged()) {
      return false
    }
    return false
  }

  loadScene(data: any[]): SceneDefinition[] {
    return data.map((item: ConvertedFile, index: number) => ({
      name: `${index + 1}`,
      componentCount: 1,
      ppt: {
        width: item.width,
        height: item.height,
        src: item.conversionFileUrl,
      }
    } as SceneDefinition))
  }


  @observable
  sceneList: any[] = []

  controller: any = undefined

  @observable
  cacheMap = new Map<string, CacheInfo>()

  cancelDownloading() {
    if (this.controller) {
      this.controller.abort()
      this.controller = undefined
      this.downloading = false
      this.cacheMap.delete(this.currentTaskUuid)
      this.preloadingProgress = -1
    }
  }

  async startDownload(taskUuid: string) {
    try {
      this.currentTaskUuid = taskUuid
      const cacheInfo = this.cacheMap.get(taskUuid)
      if (cacheInfo && cacheInfo.downloading) {
        return
      }

      this.cacheMap.set(taskUuid, {
        progress: 0,
        cached: false,
        skip: false,
        downloading: true
      })

      // this.cancelDownloading()
      // if (cancelDownloading)
      this.downloading = true
      EduLogger.info(`正在下载中.... taskUuid: ${taskUuid}`)
      await agoraCaches.startDownload(taskUuid, (progress: number, controller: any) => {
        this.preloadingProgress = progress
        this.controller = controller
        const cacheInfo = this.cacheMap.get(taskUuid)

        const currentProgress = get(cacheInfo, 'progress', 0)
        const skip = get(cacheInfo, 'skip', false)
        if (skip) {
          return
        }

        const newProgress = Math.max(currentProgress, progress)

        this.cacheMap.set(taskUuid, {
          progress: newProgress,
          cached: newProgress === 100,
          skip: false,
          downloading: true
        })
      })
      EduLogger.info(`下载完成.... taskUuid: ${taskUuid}`)
      this.downloading = false
    } catch (err) {
      EduLogger.info(`下载失败.... taskUuid: ${taskUuid}`)
      this.downloading = false
    }
  }

  async startNativeDownload(taskUuid: string) {

  }

  @observable
  _resourcesList: any[] = []

  @observable
  _boardItem: any = {
    file: {
      name: t('aclass.board_name'),
      type: 'board',
    },
    currentPage: 0,
    totalPage: 1,
    resourceName: 'init',
    scenePath: '/init'
  }

  @computed
  get resourcesList(): any[] {
    return [this._boardItem].concat(this._resourcesList.filter((it: any) => it.show === true))
  }

  changeSceneItem(resourceName: string, currentPage: number) {
    let targetPath = resourceName
    if (resourceName === "/init" || resourceName === "/" || resourceName === "init") {
      targetPath = "/"
    } else {
      targetPath = `/${resourceName}`
    }

    const sceneIsChanged = targetPath !== this.room.state.sceneState.contextPath
    if (sceneIsChanged) {
      if (targetPath === "/") {
        if (currentPage === 0) {
          this.room.setScenePath(`/init`)
        } else {
          this.room.setScenePath(`/${currentPage}`)
        }
      } else {
        const targetResource = this.allResources.find((item => item.name === resourceName))
        if (targetResource) {
          const scenePath = targetResource!.scenes![currentPage].name
          this.room.setScenePath(`${targetPath}/${scenePath}`)
        }
      }
    }

    this.moveCamera()

    const sceneState = this.room.state.sceneState
    const name = this.getResourceName(sceneState.contextPath)

    const courseWare = this.allResources.find((res: any) => res.name === name)
    if (courseWare) {
      this.room.setGlobalState({
        dynamicTaskUuidList: [
          {
            resourceName: name,
            taskUuid: courseWare.taskUuid,
            resourceUuid: courseWare.id,
          }
        ]
      })
    }
    this.resourceName = resourceName
  }

  // 更新白板
  updateBoardSceneItems ({scenes, resourceUuid, resourceName, page, taskUuid}: any, setScene: boolean) {
    const sceneName = `/${resourceName}`
    const scenePath = `${sceneName}/${scenes[page].name}`
    // const dynamicTaskUuidList = get(this.room.state.globalState, 'dynamicTaskUuidList', [])

    // const dynamicTaskUuidItem = uniqBy([{
    //   resourceName: resourceName,
    //   taskUuid: taskUuid,
    //   resourceUuid,
    // }].concat(dynamicTaskUuidList), 'resourceUuid')

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

  getResourceName(str: string) {
    if (str === "/") return "/init"
    return str.split('/')[1]
  }

  @computed
  get activeIndex(): number {
    const idx = this.resourcesList.findIndex((it: any) => {
      if (it.resourceName === this.resourceName) return true
      return false
    })

    if (idx !== -1) return idx

    return 0
  }

  closeMaterial(resourceName: string) {
    const currentSceneState = this.room.state.sceneState
    const roomScenes = (this.room.state.globalState as any).roomScenes
    this.room.setGlobalState({
      roomScenes: {
        ...roomScenes,
        [`${resourceName}`]: {
          contextPath: currentSceneState.contextPath,
          index: currentSceneState.index,
          sceneName: currentSceneState.sceneName,
          scenePath: currentSceneState.scenePath,
          totalPage: currentSceneState.scenes.length,
          resourceName: resourceName,
          show: false,
        }
      }
    })
    // const resourceName = this.resourcesList.find((it: any) => it.resou)
    this.room.setScenePath('')
  }

  async autoFetchDynamicTask() {
    const currentSceneState = this.room.state.sceneState
    const resourceName = this.getResourceName(currentSceneState.contextPath)
    const globalState = this.room.state.globalState as any
    const materialList = get(globalState, 'materialList', []) as MaterialItem[]
    const isRootDir = ["init", "/", "", "/init"].includes(resourceName)
    if (!isRootDir) {
      const item = materialList.find((item: MaterialItem) => item.resourceName === resourceName)
      if (item && item.taskUuid) {
        await this.startDownload(item.taskUuid)
      }
    }
  }

  updatePageHistory() {
    const currentSceneState = this.room.state.sceneState
    const resourceName = this.getResourceName(currentSceneState.contextPath)

    const roomScenes = (this.room.state.globalState as any).roomScenes

    this.room.setGlobalState({
      currentSceneInfo: {
        contextPath: currentSceneState.contextPath,
        index: currentSceneState.index,
        sceneName: currentSceneState.sceneName,
        scenePath: currentSceneState.scenePath,
        totalPage: currentSceneState.scenes.length,
        resourceName: resourceName,
      },
      roomScenes: {
        ...roomScenes,
        [`${resourceName}`]: {
          contextPath: currentSceneState.contextPath,
          index: currentSceneState.index,
          sceneName: currentSceneState.sceneName,
          scenePath: currentSceneState.scenePath,
          totalPage: currentSceneState.scenes.length,
          resourceName: resourceName,
          show: true,
        }
      }
    })
    const sceneState = this.room.state.sceneState
    const name = this.getResourceName(sceneState.contextPath)
    
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
  }

  @observable
  currentScenePath: string = ''

  @observable
  resourceName: string = '/'

  updateLocalResourceList() {
    const globalState: any = this.room.state.globalState
    const roomScenes = globalState.roomScenes
    if (!roomScenes) return
    const newList = []
    for (let resourceName of Object.keys(roomScenes)) {
      const resource = roomScenes[resourceName]
      if (!resourceName || resourceName === "init" || resourceName === "/init" || resourceName === "/") {
        this._boardItem = {
          file: {
            name: t('aclass.board_name'),
            type: 'board',
          },
          currentPage: resource.index,
          totalPage: resource.totalPage,
          scenePath: resource.scenePath,
          resourceName: 'init',
        }
      } else {
        // TODO: 需要调整, 不用resourceName
        const rawResource = this.allResources.find((it: any) => it.name === resourceName)
        const taskUuid = rawResource ? rawResource!.taskUuid  : ''
        newList.push({
          file: {
            name: resourceName,
            type: 'ppt',
          },
          resourceName: resourceName,
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
    this.resourceName = this.getResourceName(this.room.state.sceneState.contextPath)
  }

  updateCourseWareList() {
    this.courseWareList = get(this, 'room.state.globalState.dynamicTaskUuidList', [])
    this._personalResources = get(this, 'room.state.globalState.materialList', [])
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

  async refreshState() {
    const courseWareList = this.allResources.filter((item) => item.taskUuid)
    for (let i = 0; i < courseWareList.length; i++) {
      const item = courseWareList[i]
      if (item) {
        const res = await agoraCaches.hasTaskUUID(item.taskUuid)
        const cacheInfo = this.cacheMap.get(item.taskUuid)
        const skip = get(cacheInfo, 'skip', false)
        this.cacheMap.set(item.taskUuid, {
          progress: res === true ? 100 : 0,
          cached: res,
          skip: skip,
          downloading: false
        })
      }
    }
  }

  // TODO: aclass board init
  @action
  async aClassInit(info: {
    boardId: string,
    boardToken: string
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
      await this.refreshState()
      reportService.reportElapse('joinRoom', 'board', {api:'join', result: true})
    } catch(e) {
      reportService.reportElapse('joinRoom', 'board', {api:'join', result: false, errCode: `${e.message}`})
      // throw the error to return the process
      throw e
    }
    // 默认只有老师不用禁止跟随
    if (this.userRole === EduRoleTypeEnum.teacher) {
      this.room.setViewMode(ViewMode.Broadcaster)
      this.room.disableCameraTransform = false
    } else {
      this.room.disableCameraTransform = true
    }

    if (this.online && this.room) {
      await this.room.setWritable(true)
      if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(this.appStore.roomInfo.userRole)) {
        this.room.disableDeviceInputs = false
      }
      if ([EduRoleTypeEnum.student, EduRoleTypeEnum.invisible].includes(this.appStore.roomInfo.userRole)) {
        if (this.lockBoard) {
          this.room.disableDeviceInputs = true
          this.room.disableCameraTransform = true
        } else {
          this.room.disableDeviceInputs = false
          this.room.disableCameraTransform = false
        }
      }
    }

    this.ready = true

    // 老师
    if (this.userRole === EduRoleTypeEnum.teacher) {
      // 判断第一次登陆
      if (!this.teacherLogged()) {
        this.teacherFirstJoin()
        EduLogger.info("老师第一次加入白板")
        await this.fetchRoomScenes()
      } else {
        EduLogger.info("老师再次加入白板")
      }
    }
    // 学生
    if (this.isStudent()) {
      // 判断第一次登陆
      if (!this.studentLogged()) {
        EduLogger.info("学生第一次加入白板")
        this.studentFirstJoin()
        await this.fetchRoomScenes()
      } else {
        EduLogger.info("学生再次加入白板")
      }
    }
    if (!this.lockBoard) {
      EduLogger.info("白板尚未锁定")
    } else {
      EduLogger.info("白板已经锁定")
    }

    this.updateLocalResourceList()
    this.updateLocalSceneState()
    this.updateSceneItems()
    this.updateCourseWareList()

    this.autoFetchDynamicTask()
    this.pptAutoFullScreen()
    this.moveCamera()
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


  getCurrentLock(state: any) {
    const follow = get(state, 'globalState.follow', false)
    const granted = get(state, 'globalState.granted', true)
    if (follow === true && granted === false) {
      return true
    }
    if (follow === false && granted === true) {
      return false
    }
  }
  

  @action
  async aClassJoinBoard(params: any) {
    const {role, ...data} = params
    const identity = role === EduRoleTypeEnum.teacher ? 'host' : 'guest'
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
        this.lockBoard = this.getCurrentLock(state) as any
        this.updateFullScreen(state.globalState.isFullScreen)
        if ([EduRoleTypeEnum.student, EduRoleTypeEnum.teacher].includes(this.appStore.roomInfo.userRole) && !this.loading) {
          this.enableStatus = get(state, 'globalState.granted', 'disable')
          // if student, set tool to pencil when auth to use whiteboard
          if([EduRoleTypeEnum.student].includes(this.appStore.roomInfo.userRole) && this.enableStatus){
            this.setTool('pencil')
            this.currentActiveToolItem = 'pencil'
          }
        }
        if ([EduRoleTypeEnum.student, EduRoleTypeEnum.invisible].includes(this.appStore.roomInfo.userRole)) {
          if (this.lockBoard) {
            this.room.disableDeviceInputs = true
            this.room.disableCameraTransform = true
          } else {
            this.room.disableDeviceInputs = false
            this.room.disableCameraTransform = false
          }
        }
      }
      if (state.broadcastState && state.broadcastState?.broadcasterId === undefined) {
        if (this.room) {
          this.room.scalePptToFit()
        }
      }
      if (state.memberState) {
        this.currentStroke = this.getCurrentStroke(state.memberState)
        this.currentArrow = this.getCurrentArrow(state.memberState)
        this.currentFontSize = this.getCurrentFontSize(state.memberState)
      }
      if (state.zoomScale) {
        runInAction(() => {
          this.scale = state.zoomScale
        })
      }
      if (state.sceneState) {
        this.updatePageHistory()
        this.autoFetchDynamicTask()
      }
      if (state.sceneState || state.globalState) {
        this.updateLocalResourceList()
        this.updateLocalSceneState()
        this.updateSceneItems()
      }
      if (state.globalState) {
        this.updateCourseWareList()
      }
    })
    BizLogger.info("[breakout board] join", data)
    const cursorAdapter = new CursorTool(); //新版鼠标追踪
    await this.boardClient.join({
      ...data,
      cursorAdapter,
      userPayload: {
        userId: this.appStore.acadsocStore.roomInfo.userUuid,
        avatar: "",
        cursorName: this.appStore.acadsocStore.roomInfo.userName,
      },
      isAssistant: this.appStore.acadsocStore.isAssistant,
      disableNewPencil: true
    })
    cursorAdapter.setRoom(this.boardClient.room)
    this.strokeColor = {
      r: 252,
      g: 58,
      b: 63
    }
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

    this.lockBoard = this.getCurrentLock(this.room.state) as any
  }

  @computed
  get roleIsTeacher(): boolean {
    return this.isTeacher()
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
    this.boardClient.on('onMemberStateChanged', (state: any) => {
    })
    this.boardClient.on('onRoomStateChanged', (state: any) => {
      if (state.broadcastState?.broadcasterId === undefined) {
        if (this.room) {
          this.room.scalePptToFit()
        }
      }
      if (state.memberState) {
        this.currentStroke = this.getCurrentStroke(state.memberState)
        this.currentArrow = this.getCurrentArrow(state.memberState)
        this.currentFontSize = this.getCurrentFontSize(state.memberState)
      }
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
    const cursorAdapter = new CursorTool(); //新版鼠标追踪
    await this.boardClient.join({
      ...data,
      cursorAdapter,
      userPayload: {
        userId: this.appStore.acadsocStore.roomInfo.userUuid,
        avatar: ""
      }
    })
    this.strokeColor = {
      r: 252,
      g: 58,
      b: 63
    }
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

    this.lockBoard = this.getCurrentLock(this.room.state) as any
    if (this.appStore.userRole === EduRoleTypeEnum.student) {
      this.room.disableDeviceInputs = this.lockBoard
    }
  }

  // lock阿卡索的白板
  lockAClassBoard() {
    this.room.setGlobalState({
      follow: true,
      granted: false,
    })
  }

  // unlock阿卡索的白板
  unlockAClassBoard() {
    this.room.setGlobalState({
      follow: false,
      granted: true,
    })
  }

  syncLocalPersonalCourseWareList() {
    this.room.setGlobalState({
      materialList: this.internalResources.map(transformMaterialItem)
    })
  }

  teacherFirstJoin() {
    this.resetBoardScenes()
    this.enroll()
    this.lockAClassBoard()
    this.syncLocalPersonalCourseWareList()
  }

  studentFirstJoin() {
    // this.resetBoardScenes()
    this.studentEnroll()
  }

  resetBoardScenes() {
    this.removeScenes('/', true)
    this.room.setGlobalState({
      currentSceneInfo: undefined,
      roomScenes: undefined
    })
    EduLogger.info("重置白板全局自定义业务分页状态")
  }

  enroll() {
    this.room.setGlobalState({
      teacherFirstLogin: true
    })
  }

  studentEnroll() {
    this.room.setGlobalState({
      studentFirstLogin: true
    })
  }

  teacherLogged(): boolean {
    const teacherFirstLogin = get(this, 'room.state.globalState.teacherFirstLogin', -1)
    if (teacherFirstLogin === -1) {
      return false
    }
    return teacherFirstLogin
  }

  studentLogged(): boolean {
    const studentFirstLogin = get(this, 'room.state.globalState.studentFirstLogin', -1)
    if (studentFirstLogin === -1) {
      return false
    }
    return studentFirstLogin
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
        const scenes = get(this.room.state, 'sceneState.scenes', [])
        const sceneIndex = get(this.room.state, 'sceneState.index', 0)
        const currentScene = scenes[sceneIndex]
        const isPPT = get(currentScene, 'ppt', false)
        if (isPPT) {
          this.room.pptNextStep()
          return
        }
        this.changePage(room.state.sceneState.index + 1)
        return
      }
      case 'prev_page' : {
        const scenes = get(this.room.state, 'sceneState.scenes', [])
        const sceneIndex = get(this.room.state, 'sceneState.index', 0)
        const currentScene = scenes[sceneIndex]
        const isPPT = get(currentScene, 'ppt', false)
        if (isPPT) {
          this.room.pptPreviousStep()
          return
        }
        this.changePage(room.state.sceneState.index - 1)
        return
      }
    }
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
        if (room.isWritable) {
          room.setScenePath('/init')
          const newIndex = room.state.sceneState.scenes.length
          room.putScenes("/", [{name: `${newIndex}`}], newIndex)
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
  changeStroke(value: CustomMenuItemType) {
    if (this.room) {
      const mapping = {
        [CustomMenuItemType.Thin]: 4,
        [CustomMenuItemType.Small]: 8,
        [CustomMenuItemType.Normal]: 12,
        [CustomMenuItemType.Large]: 18,
      }
      this.room.setMemberState({
        strokeWidth: mapping[value],
      })
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
  }

  rgbToHexColor(r: number, g: number, b: number): string {
    const computeToHex = (c: number): string => {
      const hex = c.toString(16)
      return hex.length == 1 ? `0${hex}` : hex;
    }

    return `#${computeToHex(r)}${computeToHex(g)}${computeToHex(b)}`
  }

  @action
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
    if (this.room) {
      const {r, g, b} = this.strokeColor
      return this.rgbToHexColor(r, g, b)
    }
    return this.rgbToHexColor(255, 255, 255)
  }

  @observable
  currentStroke: CustomMenuItemType = CustomMenuItemType.Normal;

  getCurrentStroke(memberState: MemberState): CustomMenuItemType {
    const mapping = {
      [4]: CustomMenuItemType.Thin,
      [8]: CustomMenuItemType.Small,
      [12]: CustomMenuItemType.Normal,
      [18]: CustomMenuItemType.Large,
    }
    const value = mapping[memberState.strokeWidth]
    if (value) {
      return value
    }
    return CustomMenuItemType.Normal
  }

  @observable
  currentArrow: CustomMenuItemType = CustomMenuItemType.Arrow;

  getCurrentArrow(memberState: MemberState): CustomMenuItemType {
    const mapping = {
      [ApplianceNames.arrow]: CustomMenuItemType.Arrow,
      [ApplianceNames.laserPointer]: CustomMenuItemType.Laser,
      [ApplianceNames.pencil]: CustomMenuItemType.Mark,
      [ApplianceNames.straight]: CustomMenuItemType.Pen,
    }
    return mapping[memberState.currentApplianceName]
    // return CustomMenuItemType.Mark
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

    const value = mapping[fontSize]
    if (value) {
      return value
    }

    return BoardFrontSizeType.size12
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


  @action
  changeArrow(type: CustomMenuItemType) {
    if (this.room) {
      const mapping = {
        [CustomMenuItemType.Arrow]: ApplianceNames.arrow,
        [CustomMenuItemType.Mark]: ApplianceNames.pencil,
        [CustomMenuItemType.Laser]: ApplianceNames.laserPointer,
        [CustomMenuItemType.Pen]: ApplianceNames.straight,
      }
      const value = mapping[type]
      this.room.setMemberState({
        currentApplianceName: value
      })
    }
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
      this.updateSceneItems()
      return
    }
    if (this.sceneType === 'dynamic') {
      if (_idx > this.currentPage) {
        room.pptNextStep();
      } else {
        room.pptPreviousStep();
      }
    } else {
      room.setSceneIndex(_idx);
    }
    this.updateSceneItems()
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
  isCancel: boolean =false
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

  @observable
  fileLoading: boolean = false
  @observable
  uploadingProgress: number = 0

  @action
  reset () {
    this.downloading = false
    this.openDisk = false
    this.preloadingProgress = -1
    if (this.controller) {
      this.controller.abort()
      this.controller = undefined
    }
    this.cacheMap = new Map<string, CacheInfo>()
    // this.publicResources = []
    this._personalResources = []
    this._resourcesList = []
    this.courseWareList = []
    this.localFullScreen = false
    this.fileLoading = false
    this.uploadingProgress = 0
    this.folder = ''
    this.lockBoard = true
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

    this.currentStroke = CustomMenuItemType.Normal
    this.currentArrow = CustomMenuItemType.Mark
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

  @observable
  lockBoard: boolean = true

  @computed
  get aClassHasPermission(): boolean {
    // 老师默认可以操作白板
    if (this.userRole === EduRoleTypeEnum.teacher || this.userRole === EduRoleTypeEnum.assistant || this.userRole === EduRoleTypeEnum.invisible) {
      return true
    }
    if (this.lockBoard) {
      return false
    }
    return true
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

  @observable
  sss = '123'

  @action
  zoomBoard(type: string) {
    console.log('zoomBoard ', type)
    // 白板全屏
    if (this.userRole === EduRoleTypeEnum.teacher) {
      this.setFullScreen(type === 'fullscreen')
      if (type === 'fullscreen') {
        this.updateFullScreen(true)
        return
      }
      
      if (type === 'fullscreenExit') {
        this.updateFullScreen(false)
        return
      }
    } else {
      const globalState = this.room.state.globalState as any
      if (!globalState.isFullScreen) {
        if (type === 'fullscreen') {
          this.updateFullScreen(true)
          return
        }
        
        if (type === 'fullscreenExit') {
          this.updateFullScreen(false)
          return
        }
      }
    }
  }

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
    return this.loadingStatus
  }

  @observable
  currentTaskUuid: string = ''

  
  skipTask() {
    const taskUuid = this.currentTaskUuid
    if (taskUuid) {
      const cacheInfo = this.cacheMap.get(taskUuid)
      if (cacheInfo) {
        cacheInfo.skip = true
        this.cacheMap.set(taskUuid, cacheInfo)
      }
    }
  }

  @computed
  get loadingStatus() {
    if (!this.ready) {
      return {
        type: 'preparing',
        text: t("whiteboard.loading")
      }
    }

    if (this.currentTaskUuid) {
      const cacheInfo = this.cacheMap.get(this.currentTaskUuid)
      if (cacheInfo && cacheInfo.skip !== true && (!cacheInfo.cached || cacheInfo.progress !== 100)) {
        let progress = get(cacheInfo, 'progress', 0)
        console.log(progress)
        return {
          type: 'downloading',
          text: t("whiteboard.downloading", {reason: progress})
        }
      }
    }

    return ''
  }


  toggleAClassLockBoard() {
    if (this.lockBoard) {
      this.unlockAClassBoard()
    } else {
      this.lockAClassBoard()
    }
  }

  async removeMaterialList(resourceUuids: any[]) {
    try {
      const res = await this.appStore.uploadService.removeMaterials({
        resourceUuids: resourceUuids,
        roomUuid: this.appStore.roomInfo.roomUuid,
        userUuid: this.appStore.roomInfo.userUuid,
      })
      const globalState = this.room.state.globalState as any
      const materialList = get(globalState, 'materialList', [])
      // const resourceUuids = this
      const newList = materialList.filter((e: any) => !resourceUuids.includes(e.resourceUuid))
      this.room.setGlobalState({
        materialList: newList
      })
      this._personalResources = this._personalResources.filter((e => !resourceUuids.includes(e.resourceUuid)))
      EduLogger.info("remove removeMaterialList success", res)
    } catch (err) {
      throw err
    }
  }

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
      this.room.putScenes(`/${resource.name}`, resource.scenes)
      this.room.setScenePath(`/${resource.name}/${resource.scenes[0].name}`)
    }
  }

  async putImage(url: string) {
    const imageInfo = await fetchNetlessImageByUrl(url)
    console.log("imageInfo", imageInfo)
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

  async putSceneByResourceUuid(uuid: string) {
    try {
      const resource: any = this.allResources.find((resource: any) => resource.id === uuid)
      if (!resource) {
        console.log('未找到uuid相关的课件', uuid)
      }
      console.log("putSceneByResourceUuid resource ", " uuid ", uuid, " url ", resource.url, " type", resource.type)
      const putCourseFileType = ["ppt", "word","pdf"]
      if (putCourseFileType.includes(resource.type)) {
        await this.putCourseResource(uuid)
        console.log(`打开文件成功,文件类型${resource.type}`)
      }
      if (["video", "audio"].includes(resource.type)) {
        await this.putAV(resource.url, resource.type)
        console.log("打开音视频成功")
      }  
      if (["pic"].includes(resource.type)) {
        await this.putImage(resource.url)
        console.log("打开图片成功")
      }
    } catch (err) {
      throw err
    }
  }

  async getFileInQueryMateria(fileName: string) {
    return await this.appStore.uploadService.getFileInQueryMateria({
      roomUuid: this.appStore.roomInfo.roomUuid,
      resourceName:fileName
    })
  }

  async handleUpload(payload: any) {    
    try {
      this.fileLoading = true
      let res =await this.appStore.uploadService.handleUpload({
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
      const globalState = this.room.state.globalState as any
      const materialList = get(globalState, 'materialList', [])
      this.room.setGlobalState({
        materialList: uniqBy(materialList.concat([{
          ...res
        }]), 'resourceUuid')
      })
      this.fileLoading = false
    } catch (err) {
      console.error(err)
      this.fileLoading = false
    }
  }

  async cancelUpload() {
    await this.appStore.uploadService.cancelFileUpload()
  }
  clearScene() {
    this.room.cleanCurrentScene()
  }

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

  @observable
  openDisk: boolean = false
  
  setOpenDisk() {
    this.openDisk = !this.openDisk
  }
}

export type HandleUploadType = {
  file: File,
  resourceName: string,
  onProgress: (evt: any) => any,
}