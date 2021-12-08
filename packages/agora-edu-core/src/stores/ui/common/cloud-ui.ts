import { action, computed, observable, reaction, runInAction, toJS } from 'mobx';
import { AGError, bound } from 'agora-rte-sdk';
import { EduUIStoreBase } from './base';
import { EduClassroomStore } from '../../domain';
import { EduShareUIStore } from './share-ui';
import {
  CloudDriveCourseResource,
  CloudDriveResource,
} from '../../domain/common/cloud-drive/struct';
import { CloudDrivePagingOption } from '../../domain/common/cloud-drive/type';
import { AGEduErrorCode } from '../../../utils/error';
import { delay } from 'lodash';

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
          let hasConverting = personalResourcesList.some(
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
    return 'excel';
  }

  formatFileSize(fileByteSize: number, decimalPoint?: number) {
    const bytes = +fileByteSize;
    if (bytes === 0) return '- -';
    const k = 1000;
    const dm = decimalPoint || 2;
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + units[i];
  }

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

  @bound
  async uploadPersonalResource(file: File) {
    try {
      const data = await this.classroomStore.cloudDriveStore.uploadPersonalResource(file);
      return data;
    } catch (e) {
      this.shareUIStore.addGenericErrorDialog(e as AGError);
    }
  }

  @bound
  async openResource(resource: CloudDriveResource) {
    try {
      await this.classroomStore.boardStore.openResource(resource);
    } catch (e) {
      let error = e as AGError;
      this.shareUIStore.addGenericErrorDialog(e as AGError);
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

  get publicResources() {
    return this.classroomStore.cloudDriveStore.publicResources;
  }

  //  ---------  observable ---------------
  @observable
  personalResourcesCheckSet: Set<string> = new Set();

  @observable
  currentPersonalResPage: number = 1;

  @observable
  isPersonalResSelectedAll: boolean = false;

  // ------------- computed ---------------
  @computed
  get personalResources() {
    return this.classroomStore.cloudDriveStore.personalResources;
  }

  @computed
  get personalResourcesTotalNum() {
    return this.classroomStore.cloudDriveStore.personalResourcesTotalNum;
  }

  @computed
  get personalResourcesList() {
    const { personalResourceUuidByPage } = this.classroomStore.cloudDriveStore;
    const uuids = personalResourceUuidByPage.get(this.currentPersonalResPage) || [];
    let arr = [];
    for (let uuid of uuids) {
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

  @computed
  get hasSelectedPersonalRes() {
    if (this.isPersonalResSelectedAll) {
      return true;
    }
    return [...this.personalResources].some(([uuid, item]: [string, CloudDriveResource]) => {
      return !!this.personalResourcesCheckSet.has(uuid);
    });
  }

  @computed
  get uploadingProgresses(): UploadItem[] {
    const { uploadProgress } = this.classroomStore.cloudDriveStore;
    const arr = [];
    for (let item of uploadProgress.values()) {
      const { resourceName, size, progress } = item;
      if (progress !== 1) {
        let progressValue = Math.floor(progress * 100);
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

  @action
  setAllPersonalResourceSelected = (val: boolean) => {
    let set = new Set<string>();
    if (val) {
      this.personalResources.forEach((item) => {
        set.add(item.resourceUuid);
      });
    }
    this.isPersonalResSelectedAll = val;
    this.personalResourcesCheckSet = set;
  };

  @action
  setPersonalResCurrentPage = (num: number) => {
    this.currentPersonalResPage = num;
  };

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
