import OSS from 'ali-oss';
import { action, computed, flow, observable, reaction, runInAction, toJS } from 'mobx';
import { EduClassroomConfig } from '../../../../configs/index';
import {
  CloudDriveResourceConvertProgress,
  CloudDriveResourceInfo,
  CloudDrivePagingOption,
  CloudDriveResourceUploadStatus,
  Checkpoints,
  UploadType,
  CheckPointsValue,
} from './type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { EduStoreBase } from '../base';
import { CloudDriveUtils } from './utils';
import axios from 'axios';
import { CloudDriveResource, CloudDriveUploadingProgress } from './struct';

export class CloudDriveStore extends EduStoreBase {
  get publicResources() {
    const list = EduClassroomConfig.shared.courseWareList;
    const map = new Map<string, CloudDriveResource>();
    list.forEach((item) => {
      map.set(item.resourceUuid, item);
    });
    return map;
  }

  // ------------  observable  ------------------
  @observable personalResources: Map<string, CloudDriveResource> = new Map<
    string,
    CloudDriveResource
  >();
  @observable personalResourceUuidByPage: Map<number, string[]> = new Map<number, string[]>();
  @observable uploadProgress: Map<string, CloudDriveUploadingProgress> = new Map<
    string,
    CloudDriveUploadingProgress
  >();

  @observable
  personalResourcesTotalNum: number = 0;

  // --------- actions ----------------------
  @action.bound
  cancelUpload = async (resourceUuid: string) => {
    const checkpoint = this._checkpoints.get(resourceUuid);
    if (checkpoint) {
      switch (checkpoint.type) {
        case UploadType.COMMON_XHR:
          const { checkPoint: cancelTokenSource } =
            checkpoint as CheckPointsValue<UploadType.COMMON_XHR>;
          if (cancelTokenSource) {
            cancelTokenSource.cancel('Cancled');
            this.uploadProgress.delete(resourceUuid);
          }
          break;
      }
    } else {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UPLOAD_FAILED_NO_CHECKPOINT,
        new Error(`get upload checkpoint failed when cancel upload`),
      );
    }
  };
  @action
  retryUpload = (resourceUuid: string) => {
    const checkpoint = this._checkpoints.get(resourceUuid);
    if (checkpoint) {
      this.uploadPersonalResource(checkpoint.file);
    } else {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UPLOAD_FAILED_NO_CHECKPOINT,
        new Error(`get upload checkpoint failed when retry upload`),
      );
    }
  };
  @action
  fetchPersonalResources = async (options: CloudDrivePagingOption) => {
    let data = {
      list: [],
      total: 0,
    };
    try {
      const { userUuid } = EduClassroomConfig.shared.sessionInfo;
      data = await this.classroomStore.api.fetchPersonalResources(userUuid, {
        pageSize: options.pageSize,
        pageNo: options.pageNo,
        resourceName: options.resourceName,
      });
      const { list = [], total = 0 } = data;
      const resourceList = list.map(
        (data: {
          ext: string;
          resourceName: string;
          resourceUuid: string;
          size: number;
          updateTime: number;
          taskProgress?: CloudDriveResourceConvertProgress;
          taskUuid?: string;
          url?: string;
        }) => CloudDriveResource.fromData(data),
      );
      runInAction(() => {
        let resourceUuids: string[] = [];
        for (let i = 0; i < resourceList.length; i++) {
          const item = resourceList[i];
          resourceUuids.push(item.resourceUuid);
          this.personalResources.set(item.resourceUuid, item);
        }
        this.personalResourcesTotalNum = total;
        this.personalResourceUuidByPage.set(options.pageNo, resourceUuids);
      });
    } catch (e) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CLOUD_FETCH_PERSONAL_RESOURCE_FAIL,
        e as Error,
      );
    }
    return data;
  };

  @action.bound
  private _initProgress(progress: CloudDriveUploadingProgress) {
    this.uploadProgress.set(progress.resourceUuid, progress);
  }

  @action.bound
  private async _updateProgress(
    resourceUuid: string,
    progressValue?: number,
    status?: CloudDriveResourceUploadStatus,
  ) {
    let progress = this.uploadProgress.get(resourceUuid);
    if (progress) {
      if (progressValue) {
        progress.progress = progressValue;
        if (progressValue === 1) {
          progress.status = CloudDriveResourceUploadStatus.Success;
        }
      }
      if (status) progress.status = status;
    }
  }

  // others
  private _checkpoints: Checkpoints = new Map();

  private async _uploadByAws(
    file: File,
    resourceUuid: string,
    ossConfig: {
      accessKeyId: string;
      accessKeySecret: string;
      bucketName: string;
      ossEndpoint: string;
      securityToken: string;
      ossKey: string;
      preSignedUrl: string;
      fileUrl: string;
    },
  ): Promise<string> {
    const { preSignedUrl, fileUrl } = ossConfig;

    const cancelTokenSource = axios.CancelToken.source();
    try {
      await axios.put(preSignedUrl, file, {
        cancelToken: cancelTokenSource.token,
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent: any) => {
          const checkpoint = this._checkpoints.get(resourceUuid)!;
          if (!checkpoint.checkPoint)
            this._checkpoints.set(resourceUuid, {
              ...checkpoint,
              checkPoint: cancelTokenSource,
            });

          let percentCompleted = Math.floor(progressEvent.loaded / progressEvent.total);
          runInAction(() => {
            this._updateProgress(resourceUuid, percentCompleted);
          });
        },
      });
      this._checkpoints.delete(resourceUuid);
    } catch (e) {
      if ((e as Error).message === 'Cancled') {
        this._updateProgress(resourceUuid, undefined, CloudDriveResourceUploadStatus.Canceled);
        return '';
      } else {
        this._updateProgress(resourceUuid, undefined, CloudDriveResourceUploadStatus.Failed);
        EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_UPLOAD_AWS_FAIL,
          new Error(`upload to oss error`),
        );
      }
    }

    return fileUrl;
  }

  private async _addCloudDriveResource(resourceUuid: string, resourceInfo: CloudDriveResourceInfo) {
    const { sessionInfo } = EduClassroomConfig.shared;
    return await this.classroomStore.api.addCloudDriveFile(
      resourceUuid,
      sessionInfo.userUuid,
      resourceInfo,
    );
  }

  // upload file resource
  uploadPersonalResource = async (file: File) => {
    try {
      const { sessionInfo } = EduClassroomConfig.shared;
      const resourceUuid = await CloudDriveUtils.calcResourceUuid(file);
      const name = file.name;
      let ext = CloudDriveUtils.extractFileExt(name);
      if (!ext) {
        return EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_UPLOAD_FAILED_NO_FILE_EXT,
          new Error(`no file ext`),
        );
      }
      ext = ext.toLowerCase();

      // step 1. fetch sts token for futher operations

      const uploadData = {
        userUuid: sessionInfo.userUuid,
        resourceName: name,
        resourceUuid,
        contentType: CloudDriveUtils.fileExt2ContentType(ext),
        ext: ext,
        size: file.size,
        updateTime: 0,
      };
      const progress = new CloudDriveUploadingProgress(uploadData);
      this._initProgress(progress);
      if (!this._checkpoints.get(resourceUuid)) {
        this._checkpoints.set(resourceUuid, {
          type: UploadType.COMMON_XHR,
          file,
        });
      }
      if (!CloudDriveResource.supportedTypes.includes(ext)) {
        this._updateProgress(resourceUuid, undefined, CloudDriveResourceUploadStatus.Failed);
        return EduErrorCenter.shared.handleNonThrowableError(
          AGEduErrorCode.EDU_ERR_INVALID_CLOUD_RESOURCE,
          new Error(`unsupported file type ${ext}`),
        );
      }

      // step 1. fetch sts token for futher operations
      const data = await this.classroomStore.api.fetchFileUploadSts(
        sessionInfo.roomUuid,
        uploadData,
      );

      let url = '';

      // step 2. begin upload by vendor
      // aws
      const {
        accessKeyId,
        accessKeySecret,
        bucketName,
        ossEndpoint,
        securityToken,
        ossKey,

        //only available for aws for now
        preSignedUrl,
        url: fileUrl,
      } = data[0];

      url = await this._uploadByAws(file, resourceUuid, {
        accessKeyId,
        accessKeySecret,
        bucketName,
        ossEndpoint,
        securityToken,
        ossKey,
        preSignedUrl,
        fileUrl,
      });
      const conversion = CloudDriveUtils.conversionOption(ext);

      // step 3. done uploading, binding
      url &&
        (await this._addCloudDriveResource(resourceUuid, {
          resourceName: name,
          ext,
          size: file.size,
          url,
          conversion,
        }));
    } catch (e) {
      EduErrorCenter.shared.handleThrowableError(AGEduErrorCode.EDU_ERR_UPLOAD_FAIL, e as Error);
    }
  };

  removePersonalResources = async (resourceUuids: string[]) => {
    try {
      const { sessionInfo } = EduClassroomConfig.shared;
      const { userUuid } = sessionInfo;
      await this.classroomStore.api.removeMaterials(resourceUuids, userUuid);
      for (let uuid of resourceUuids) {
        this.personalResources.delete(uuid);
      }
    } catch (e) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_CLOUD_REMOVE_PERSONAL_RESOURCE_FAIL,
        e as Error,
      );
    }
  };

  onInstall() {}
  onDestroy() {}
}
