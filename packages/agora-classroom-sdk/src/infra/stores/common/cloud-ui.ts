import { action, computed, observable, reaction, runInAction } from 'mobx';
import { AGError, bound } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import {
  AGEduErrorCode,
  CloudDriveCourseResource,
  CloudDrivePagingOption,
  CloudDriveResource,
} from 'agora-edu-core';
import { transI18n } from './i18n';

interface UploadItem {
  iconType?: string;
  fileName?: string;
  fileSize?: string;
  currentProgress?: number;
  uploadComplete?: boolean;
}

let _lastFetchPersonalResourcesOptions: CloudDrivePagingOption;

export class CloudUIStore extends EduUIStoreBase {
  readonly pageSize: number = 8;
  onInstall() {
    reaction(
      () => this.currentPersonalResPage,
      (currentPage) => {
        const { fetchPersonalResources } = this.classroomStore.cloudDriveStore;
        fetchPersonalResources({
          pageNo: currentPage,
          pageSize: this.pageSize,
        });
      },
    );
    reaction(
      () => this.personalResourcesList,
      (personalResourcesList) => {
        if (personalResourcesList.length) {
          const hasConverting = personalResourcesList.some(
            (item) =>
              item?.resource instanceof CloudDriveCourseResource &&
              item?.resource?.taskProgress?.status === 'Converting',
          );
          if (hasConverting) {
            this.fetchPersonalResources({
              pageNo: this.currentPersonalResPage,
              pageSize: this.pageSize,
            });
          }
        }
      },
      {
        delay: 1500,
      },
    );
  }

  /**
   * 根据类型返回扩展名
   * @param name
   * @returns
   */
  fileNameToType(name: string): string {
    if (name.match(/ppt|pptx|pptx/i)) {
      return 'ppt';
    }
    if (name.match(/doc|docx/i)) {
      return 'word';
    }
    if (name.match(/xls|xlsx/i)) {
      return 'excel';
    }
    if (name.match(/mp4/i)) {
      return 'video';
    }
    if (name.match(/mp3/i)) {
      return 'audio';
    }
    if (name.match(/gif|png|jpeg|jpg|bmp/i)) {
      return 'image';
    }
    if (name.match(/pdf/i)) {
      return 'pdf';
    }
    if (name.match(/h5/i)) {
      return 'h5';
    }
    return 'unknown';
  }

  /**
   * 文件大小信息格式化
   * @param fileByteSize
   * @param decimalPoint
   * @returns
   */
  formatFileSize(fileByteSize: number, decimalPoint?: number) {
    const bytes = +fileByteSize;
    if (bytes === 0) return '- -';
    const k = 1000;
    const dm = decimalPoint || 2;
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + units[i];
  }

  /**
   * 查询个人资源列表
   * @param options
   * @returns
   */
  @bound
  async fetchPersonalResources(options: CloudDrivePagingOption) {
    try {
      const data = await this.classroomStore.cloudDriveStore.fetchPersonalResources(options);
      _lastFetchPersonalResourcesOptions = options;
      return data;
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 上传文件至个人资源
   * @param file
   * @returns
   */
  @bound
  async uploadPersonalResource(file: File) {
    try {
      const data = await this.classroomStore.cloudDriveStore.uploadPersonalResource(file);
      return data;
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  /**
   * 打开课件
   * @param resource
   */
  @bound
  async openResource(resource: CloudDriveResource) {
    try {
      const openedFlag = await this.classroomStore.boardStore.openResource(resource);
      openedFlag && this.shareUIStore.addToast(transI18n('edu_error.600074'), 'success')
    } catch (e) {
      const error = e as AGError;
      // this.shareUIStore.addGenericErrorDialog(e as AGError);
      if (error.codeList && error.codeList.length) {
        const code = error.codeList[error.codeList.length - 1];
        if (
          code == AGEduErrorCode.EDU_ERR_CLOUD_RESOURCE_CONVERSION_CONVERTING &&
          _lastFetchPersonalResourcesOptions
        ) {
          this.fetchPersonalResources(_lastFetchPersonalResourcesOptions);
        }
      }
    }
  }

  /**
   * 公共资源
   * @returns
   */
  get publicResources() {
    return this.classroomStore.cloudDriveStore.publicResources;
  }

  //  ---------  observable ---------------
  /**
   * 个人资源左侧选项框状态
   */
  @observable
  personalResourcesCheckSet: Set<string> = new Set();

  /**
   * 个人资源页码
   */
  @observable
  currentPersonalResPage = 1;

  /**
   * 个人资源全选
   */
  @observable
  isPersonalResSelectedAll = false;

  // ------------- computed ---------------
  /**
   * 云盘资源列表
   */
  @computed
  get personalResources() {
    return this.classroomStore.cloudDriveStore.personalResources;
  }

  /**
   * 个人云盘资源数
   */
  @computed
  get personalResourcesTotalNum() {
    return this.classroomStore.cloudDriveStore.personalResourcesTotalNum;
  }

  /**
   * 云盘资源列表（左侧选择框使用）
   * @returns
   */
  @computed
  get personalResourcesList() {
    const { personalResourceUuidByPage } = this.classroomStore.cloudDriveStore;
    const uuids = personalResourceUuidByPage.get(this.currentPersonalResPage) || [];
    const arr = [];
    for (const uuid of uuids) {
      const res = this.personalResources.get(uuid);
      if (res) {
        arr.push({
          resource: res,
          checked: this.isPersonalResSelectedAll || this.personalResourcesCheckSet.has(uuid),
        });
      }
    }
    return arr;
  }

  /**
   * 是否有选中资源文件
   * @returns
   */
  @computed
  get hasSelectedPersonalRes() {
    if (this.isPersonalResSelectedAll) {
      return true;
    }
    return [...this.personalResources].some(([uuid]: [string, CloudDriveResource]) => {
      return !!this.personalResourcesCheckSet.has(uuid);
    });
  }

  /**
   * 资源上传进度
   * @returns
   */
  @computed
  get uploadingProgresses(): UploadItem[] {
    const { uploadProgress } = this.classroomStore.cloudDriveStore;
    const arr = [];
    for (const item of uploadProgress.values()) {
      const { resourceName, size, progress } = item;
      if (progress !== 1) {
        const progressValue = Math.floor(progress * 100);
        arr.push({
          iconType: this.fileNameToType(resourceName),
          fileName: resourceName,
          uploadComplete: false,
          fileSize: this.formatFileSize(size),
          currentProgress: progressValue,
        });
      }
    }
    return arr;
  }

  // ------------- action -----------------
  /**
   * 勾选资源文件
   * @param resourceUuid
   * @param val
   */
  @action
  setPersonalResourceSelected = (resourceUuid: string, val: boolean) => {
    if (val) {
      this.personalResourcesCheckSet.add(resourceUuid);
    } else {
      this.personalResourcesCheckSet.delete(resourceUuid);
    }
    this.isPersonalResSelectedAll =
      this.personalResourcesCheckSet.size === this.personalResources.size;
  };

  /**
   * 资源列表全选
   * @param val
   */
  @action
  setAllPersonalResourceSelected = (val: boolean) => {
    const set = new Set<string>();
    if (val) {
      this.personalResources.forEach((item) => {
        set.add(item.resourceUuid);
      });
    }
    this.isPersonalResSelectedAll = val;
    this.personalResourcesCheckSet = set;
  };

  /**
   * 设置资源列表页码
   * @param num
   */
  @action
  setPersonalResCurrentPage = (num: number) => {
    this.currentPersonalResPage = num;
  };

  /**
   * 删除个人资源
   * @returns
   */
  @action
  removePersonalResources = async () => {
    const uuids: string[] = [];
    const { removePersonalResources } = this.classroomStore.cloudDriveStore;
    if (this.isPersonalResSelectedAll) {
      this.personalResources.forEach((item) => {
        uuids.push(item.resourceUuid);
      });
    } else {
      this.personalResourcesCheckSet.forEach((uuid) => {
        uuids.push(uuid);
      });
    }
    try {
      await removePersonalResources(uuids);
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
      return;
    }
    runInAction(() => {
      this.personalResourcesCheckSet = new Set<string>();
      this.isPersonalResSelectedAll = false;
    });
    const { list = [] } =
      (await this.fetchPersonalResources({
        pageNo: this.currentPersonalResPage,
        pageSize: this.pageSize,
      })) || {};
    if (!list.length && this.currentPersonalResPage > 1) {
      this.setPersonalResCurrentPage(this.currentPersonalResPage - 1);
    }
  };

  onDestroy() {}
}
