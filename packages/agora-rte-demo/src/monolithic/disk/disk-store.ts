import { GenericErrorWrapper } from 'agora-rte-sdk';

import { EduLogger, EduManager, AgoraWebRtcWrapper, AgoraElectronRTCWrapper } from 'agora-rte-sdk'
import fetchProgress from "fetch-progress"
import { get, isEmpty, omit, uniqBy } from 'lodash';
import { isElectron } from '@/utils/platform';


import { observable } from 'mobx';
import { AgoraEduCourseWare } from './../../edu-sdk/index';
import { agoraCaches } from '@/utils/web-download.file';

export enum DiskLifeStateEnum {
  default = 0,
  init = 1,
  destroyed = 1,
}

export class DiskAppStore {

  eduManager!: EduManager

  @observable
  courseWareList: AgoraEduCourseWare[] = []

  @observable
  preloadingProgress: number = -1

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
    this.preloadingProgress = -1
    this.status = DiskLifeStateEnum.destroyed
  }

  destroy() {
    this.reset()
  }

  async startDownload(taskUuid: string) {
    // const isWeb = this.isElectron ? false : true
    try {
      this.downloading = true
      EduLogger.info(`正在下载中.... taskUuid: ${taskUuid}`)
      if (!isElectron) {
        await agoraCaches.startDownload(taskUuid, (progress: number, _) => {
          this.preloadingProgress = progress
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
                this.preloadingProgress = get(progress, 'percentage')
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
      this.downloading = false
    } catch (err) {
      EduLogger.info(`下载失败.... taskUuid: ${taskUuid}`)
      this.downloading = false
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
      agoraCaches.clearAllCache()
      EduLogger.info('删除全部缓存完成....')
    } catch (err) {
      EduLogger.info(`删除全部缓存失败....: ${err}`)
    }
  }

  async downloadAll(list: string[]) {
    try {
      let promiseList: any = []
      list.forEach((e) => { promiseList.push(this.startDownload(e))})
      Promise.all(promiseList)
      EduLogger.info(`全部下载成功....`)
    } catch (err) {
      EduLogger.info(`全部下载失败....: ${err}`)
    }
  }
}

export const diskAppStore = new DiskAppStore([])