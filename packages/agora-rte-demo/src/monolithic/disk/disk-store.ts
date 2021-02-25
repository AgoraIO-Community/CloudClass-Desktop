import { GenericErrorWrapper } from 'agora-rte-sdk';

import { EduLogger, EduManager, AgoraWebRtcWrapper, AgoraElectronRTCWrapper } from 'agora-rte-sdk'
import fetchProgress from "fetch-progress"
import { get, isEmpty, omit, uniqBy } from 'lodash';
import { isElectron } from '@/utils/platform';


import { observable } from 'mobx';
import { AgoraEduCourseWare } from './../../edu-sdk/index';
import { agoraCaches } from '@/utils/web-download.file';
import { DownloadStatus } from '@/stores/app/board';

export enum DiskLifeStateEnum {
  default = 0,
  init = 1,
  destroyed = 1,
}

export enum downloadStatus {
  notCache = 'notCache',
  downloading = 'downloading',
  cached = 'cached',
}

export class DiskAppStore {

  eduManager!: EduManager

  @observable
  courseWareList: AgoraEduCourseWare[] = []

  // @observable
  // preloadingProgress: number = -1
  // fileProgress: { [fileId: string]: number }

  @observable
  downloading: boolean = false

  status: DiskLifeStateEnum = DiskLifeStateEnum.default

  constructor(courseWareList: any) {
  }

  init(params: any) {
    this.courseWareList = params.courseWareList
    this.status = DiskLifeStateEnum.init
  }

  reset() {
    // all observable reset
    this.courseWareList = []
    // this.preloadingProgress = -1
    this.status = DiskLifeStateEnum.destroyed
  }

  destroy() {
    this.reset()
  }
  
  tempDownloadList = [
    {
      calories: '100',
      resourceUuid: '93b61ab070ec11eb8122cf10b9ec91f7',
      resourceName: '12312312312dsfjdskf',
      type: 'ppt',
      fat: `${Date.now()}`,
      status: 'notCache',
      progress: 0,
    },
  ]

  async checkDownloadList(downloadList: any) { 
    const pList = downloadList.map((item: any) => {
      return agoraCaches.hasTaskUUID(item.resourceUuid);
    })

    const tmp = await Promise.all(pList);

    tmp.forEach((res: any, index: number) => {
      const item = downloadList[index]
      if (res) {
        item.status = downloadStatus.cached
      } else {
        item.status = downloadStatus.notCache
      }
    })
    return downloadList
  }

  static downloadCallback = {}

  registerTaskCallback(uuid: string, onProgress: (progress: number) => void, onComplete: () => void) {
    DiskAppStore.downloadCallback[uuid] = {
      onProgress,
      onComplete,
    }
  }

  static async startDownload(taskUuid: string, onProgressCallback?: (progress: number) => void, onComplete?: () => void) {
    const isCached = await agoraCaches.hasTaskUUID(taskUuid)
    if (isCached) {
      EduLogger.info(`文件已缓存.... taskUuid: ${taskUuid}`)
      return
    }
    try {
      EduLogger.info(`正在下载中.... taskUuid: ${taskUuid}`)
      if (!isElectron) {
        await agoraCaches.startDownload(taskUuid, (progress: number, _) => {
          // onProgressCallback && onProgressCallback(progress)
          DiskAppStore.downloadCallback[taskUuid].onProgress(progress)
        })
      } else {
        const controller = new AbortController();
        const resourcesHost = "convertcdn.netless.link";
        const signal = controller.signal;
        const zipUrl = `https://${resourcesHost}/dynamicConvert/${taskUuid}.zip`;
        const res = await fetch(zipUrl, {
            method: "get",
            signal: signal,
        }).then(fetchProgress({
            onProgress: (progress: any) => {
              if (progress.hasOwnProperty('percentage')) {
                DiskAppStore.downloadCallback[taskUuid].onProgress(progress)
              }
            },
        }));
        if (res.status !== 200) {
          throw GenericErrorWrapper({
            code: res.status,
            message: `download task ${JSON.stringify(taskUuid)} failed with status ${res.status}`
          })
        }
      }
      EduLogger.info(`下载完成.... taskUuid: ${taskUuid}`)
      DiskAppStore.downloadCallback[taskUuid].onComplete()
    } catch (err) {
      EduLogger.info(`下载失败.... taskUuid: ${taskUuid}, ${err}`)
    }
  }

  async deleteSingle(taskUuid: string) {
    try {
      agoraCaches.deleteTaskUUID(taskUuid)
      EduLogger.info(`删除完成.... taskUuid: ${taskUuid}`)
    } catch (err) {
      EduLogger.info(`删除失败.... taskUuid: ${taskUuid}`)
    }
  }

  async deleteAllCache() {
    try {
      await agoraCaches.clearAllCache()
      EduLogger.info('删除全部缓存完成....')
    } catch (err) {
      EduLogger.info(`删除全部缓存失败....: ${err}`)
    }
  }

  async downloadAll(list: any) {
    try {
      let promiseList: any = []
      list.forEach((e: any) => {
        promiseList.push(DiskAppStore.startDownload(e.resourceUuid))
      })
      Promise.all(promiseList)
      EduLogger.info(`全部下载成功....`)
    } catch (err) {
      EduLogger.info(`全部下载失败....: ${err}`)
    }
  }
}

export const diskAppStore = new DiskAppStore([])