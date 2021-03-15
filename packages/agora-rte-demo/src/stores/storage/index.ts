import { GlobalStorage } from './../../utils/custom-storage';
import { agoraCaches, ProgressData } from '@/utils/web-download.file';
import { ClassRoomAbstractStore, controller } from "@/edu-sdk/controller";
import { computed, observable, reaction } from "mobx";
import { CourseWareItem, CourseWareList, LanguageEnum } from '@/edu-sdk';
import { EduLogger, GenericErrorWrapper } from 'agora-rte-sdk';
import fetchProgress from '@netless/fetch-progress';

export enum DownloadFileStatus {
  Cached = "cached",
  Downloading = "downloading",
  NotCached = "NotCached"
}

//@ts-ignore
window.agoraCaches = agoraCaches

const transformStorageCourseWares = (item: CourseWareItem): StorageCourseWareItem => {
  return {
    calories: `${item.size}`,
    fat: `${Date.now()}`,
    resourceUuid: item.resourceUuid,
    resourceName: item.resourceName,
    taskUuid: item.taskUuid!,
    status: DownloadFileStatus.NotCached,
    progress: 0,
    type: item.ext
  }
}

export type StorageFileType = string

export type StorageCourseWareItem = {
  calories: string,
  fat: string,
  progress: number,
  resourceName: string,
  resourceUuid: string,
  taskUuid: string,
  status: DownloadFileStatus,
  type: StorageFileType
}

export type DownloadListWareItem = {
  fileName: string,
  uuid: string,
  size: string,
  type: StorageFileType
}


export type StorageStoreInitializeParams = {
  courseWareList: CourseWareItem[],
  language: LanguageEnum
}

export type CourseStorageType = CourseWareItem & {
  status: DownloadFileStatus,
  progress: number,
}

export class StorageStore implements ClassRoomAbstractStore {

  @observable
  _courseWareList: StorageCourseWareItem[] = []

  @observable
  progressMap: Record<string, number> = {}

  @observable
  language: LanguageEnum

  constructor(params: StorageStoreInitializeParams) {
    reaction(() => this.language, (language: string) => {
      const lang = language.match(/zh/) ? 'zh' : 'en'
      GlobalStorage.setLanguage(lang)
    })

    this._courseWareList = params.courseWareList.map(transformStorageCourseWares)
    this._courseWareList.forEach((item: StorageCourseWareItem) => {
      this.progressMap[item.resourceUuid] = item.progress
    })
    this.language = params.language
  }

  async refreshState() {
    const newCourseWareList = [...this._courseWareList]
    for (let i = 0; i < newCourseWareList.length; i++) {
      const item = newCourseWareList[i]
      if (item) {
        const res = await agoraCaches.hasTaskUUID(item.taskUuid)
        item.progress = res === true ? 100 : 0
        this.progressMap[item.taskUuid] = item.progress
        item.status = res === true ? DownloadFileStatus.Cached : DownloadFileStatus.NotCached
      }
    }
    this._courseWareList = newCourseWareList
  }

  @computed
  get courseWareList(): StorageCourseWareItem[] {
    return this._courseWareList
  }

  @computed
  get downloadedList(): any[] {
    return this.courseWareList.filter((it: any) => it.status === DownloadFileStatus.Cached)
  }

  @computed
  get notDownloadedList(): any[] {
    return this.courseWareList.filter((it: any) => it.status === DownloadFileStatus.NotCached)
  }

  @computed
  get totalProgress(): number {
    return +(this.courseWareList.filter((e => this.progressMap[e.taskUuid] && this.progressMap[e.taskUuid] === 100)).length  / this.courseWareList.length).toFixed(2) * 100
  }

  async destroy () {
    this._courseWareList = []
    this.progressMap = {}
  }

  async destroyDisk() {
    await controller.storageController.destroy()
  }

  @observable
  downloading: boolean = false

  async checkDownloadList(downloadList: any) { 
    const pList = downloadList.map((item: any) => {
      return agoraCaches.hasTaskUUID(item.taskUuid);
    })

    const tmp = await Promise.all(pList);

    tmp.forEach((res: any, index: number) => {
      const item = downloadList[index]
      if (res) {
        item.status = DownloadFileStatus.Cached
      } else {
        item.status = DownloadFileStatus.NotCached
      }
    })
    return downloadList
  }


  static get isNative() {
    if (window.agoraBridge || window.isElectron) {
      return true
    }
    return false
  }

  async internalDownload(taskUuid: string) {
    const isCached = await agoraCaches.hasTaskUUID(taskUuid)
    if (isCached) {
      EduLogger.info(`文件已缓存.... taskUuid: ${taskUuid}`)
      return
    }
    try {
      EduLogger.info(`正在下载中.... taskUuid: ${taskUuid}`)
      await agoraCaches.startDownload(taskUuid, (progress: number, _) => {
        this.progressMap[taskUuid] = progress
      })
      EduLogger.info(`下载完成.... taskUuid: ${taskUuid}`)
    } catch (err) {
      EduLogger.info(`下载失败.... taskUuid: ${taskUuid}, ${err}`)
    }
  }

  async startDownload(taskUuid: string) {
    try {
      await this.internalDownload(taskUuid)
      await this.refreshState()
    } catch (err) {
      throw GenericErrorWrapper(err)
    }
  }

  async deleteSingle(taskUuid: string) {
    try {
      await agoraCaches.deleteTaskUUID(taskUuid)
      await this.refreshState()
      EduLogger.info(`删除完成.... taskUuid: ${taskUuid}`)
    } catch (err) {
      EduLogger.info(`删除失败.... taskUuid: ${taskUuid}`)
    }
  }

  async deleteAllCache() {
    try {
      await agoraCaches.clearAllCache()
      await this.refreshState()
      EduLogger.info('删除全部缓存完成....')
    } catch (err) {
      EduLogger.info(`删除全部缓存失败....: ${err}`)
    }
  }

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
}