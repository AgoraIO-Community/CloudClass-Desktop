import { observable } from 'mobx';
import { AgoraEduCourseWare } from './../../edu-sdk/index';

export enum DiskLifeStateEnum {
  default = 0,
  init = 1,
  destroyed = 1,
}

export class DiskAppStore {

  @observable
  courseWareList: AgoraEduCourseWare[] = []

  status: DiskLifeStateEnum = DiskLifeStateEnum.default

  constructor(courseWareList: any) {
  }

  init(params: any) {
    this.courseWareList = params.courseWareList
    this.status = DiskLifeStateEnum.init
  }

  reset() {
    this.courseWareList = []
    this.status = DiskLifeStateEnum.destroyed
  }

  destroy() {
    this.reset()
  }
}

export const diskAppStore = new DiskAppStore([])