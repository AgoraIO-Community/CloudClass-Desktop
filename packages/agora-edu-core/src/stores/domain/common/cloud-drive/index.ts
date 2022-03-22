import OSS, { Checkpoint, MultipartUploadResult } from 'ali-oss';
import { action, computed, flow, observable, reaction, runInAction, toJS } from 'mobx';
import { EduClassroomConfig } from '../../../../configs/index';
import {
  CloudDriveResourceConvertProgress,
  CloudDriveResourceInfo,
  CloudDrivePagingOption,
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
  private async _initProgress(progress: CloudDriveUploadingProgress) {
    this.uploadProgress.set(progress.resourceUuid, progress);
  }

  @action.bound
  private async _updateProgress(resourceUuid: string, progressValue: number) {
    let progress = this.uploadProgress.get(resourceUuid);
    if (progress) {
      progress.progress = progressValue;
    }
  }

  // others
  private _checkpoints: Map<string, Checkpoint> = new Map<string, Checkpoint>();

  private async _uploadByAli(
    file: File,
    resourceUuid: string,
    ossConfig: {
      accessKeyId: string;
      accessKeySecret: string;
      bucketName: string;
      ossEndpoint: string;
      securityToken: string;
      ossKey: string;
    },
    callbackConfig: {
      callbackHost: string;
      callbackBody: string;
      callbackContentType: string;
    },
  ): Promise<string> {
    const { appId, sessionInfo } = EduClassroomConfig.shared;
    const { ossKey, accessKeyId, accessKeySecret, bucketName, ossEndpoint, securityToken } =
      ossConfig;
    const { callbackHost, callbackBody, callbackContentType } = callbackConfig;
    const ossClient = new OSS({
      accessKeyId,
      accessKeySecret,
      bucket: bucketName,
      endpoint: ossEndpoint,
      secure: true,
      stsToken: securityToken,
    });
    const checkpoint = this._checkpoints.get(resourceUuid);

    const callbackUrl = `${callbackHost}/edu/apps/${appId}/v1/rooms/${sessionInfo.roomUuid}/resources/callback`;
    const { res }: MultipartUploadResult = await ossClient.multipartUpload(ossKey, file, {
      progress: (p, cpt) => {
        runInAction(() => {
          this._checkpoints.set(resourceUuid, cpt);
          this._updateProgress(resourceUuid, p);
        });
      },
      callback: {
        url: callbackUrl,
        body: callbackBody,
        contentType: callbackContentType,
      },
      //resume upload if checkpoints exists
      checkpoint,
    });

    if (res.status !== 200) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UPLOAD_ALI_FAIL,
        new Error(`upload to ali oss error, status is ${res.status}`),
      );
    }

    // clean up
    this._checkpoints.delete(resourceUuid);

    const url = ossClient.generateObjectUrl(ossKey);
    return url;
  }

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
    },
    callbackConfig: {
      callbackHost: string;
      callbackBody: string;
      callbackContentType: string;
    },
  ): Promise<string> {
    const { appId, sessionInfo } = EduClassroomConfig.shared;
    const { preSignedUrl } = ossConfig;
    const { callbackHost, callbackBody, callbackContentType } = callbackConfig;
    const callbackUrl = `${callbackHost}/edu/apps/${appId}/v1/rooms/${sessionInfo.roomUuid}/resources/callback`;

    await axios.put(preSignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent: any) => {
        let percentCompleted = Math.floor(progressEvent.loaded / progressEvent.total);
        runInAction(() => {
          this._updateProgress(resourceUuid, percentCompleted);
        });
      },
    });
    let res = await axios.post(callbackUrl, JSON.parse(callbackBody), {
      headers: {
        ['content-type']: callbackContentType,
      },
    });

    if (res.status !== 200) {
      EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_UPLOAD_AWS_FAIL,
        new Error(`upload to aws oss error, status is ${res.status}`),
      );
    }

    // clean up
    this._checkpoints.delete(resourceUuid);

    return res.data.data.url;
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
      if (!CloudDriveResource.supportedTypes.includes(ext))
        return EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_INVALID_CLOUD_RESOURCE,
          new Error(`unsupported file type ${ext}`),
        );
      const conversion = CloudDriveUtils.conversionOption(ext);
      let progress = new CloudDriveUploadingProgress({
        resourceName: name,
        resourceUuid,
        ext: ext,
        size: file.size,
        updateTime: 0,
      });
      this._initProgress(progress);
      // step 1. fetch sts token for futher operations
      let data = await this.classroomStore.api.fetchFileUploadSts(sessionInfo.roomUuid, {
        resourceName: name,
        resourceUuid,
        ext: ext,
        size: file.size,
      });
      const { vendor = -1 } = data;
      let url = '';

      // step 2. begin upload by vendor
      if (vendor === 1) {
        // aws
        const {
          accessKeyId,
          accessKeySecret,
          bucketName,
          ossEndpoint,
          securityToken,
          ossKey,
          callbackBody,
          callbackContentType,
          callbackHost,
          //only available for aws for now
          preSignedUrl,
        } = data;
        url = await this._uploadByAws(
          file,
          resourceUuid,
          {
            accessKeyId,
            accessKeySecret,
            bucketName,
            ossEndpoint,
            securityToken,
            ossKey,
            preSignedUrl,
          },
          { callbackBody, callbackContentType, callbackHost },
        );
      } else if (vendor === 2) {
        // ali
        const {
          accessKeyId,
          accessKeySecret,
          bucketName,
          ossEndpoint,
          securityToken,
          ossKey,
          callbackBody,
          callbackContentType,
          callbackHost,
        } = data;
        url = await this._uploadByAli(
          file,
          resourceUuid,
          {
            accessKeyId,
            accessKeySecret,
            bucketName,
            ossEndpoint,
            securityToken,
            ossKey,
          },
          { callbackBody, callbackContentType, callbackHost },
        );
      } else {
        return EduErrorCenter.shared.handleThrowableError(
          AGEduErrorCode.EDU_ERR_UPLOAD_FAILED_UNSUPPORTED_VENDOR,
          new Error(`vendor ${vendor} is not supported`),
        );
      }

      // step 3. done uploading, binding
      await this._addCloudDriveResource(resourceUuid, {
        resourceName: name,
        ext,
        size: file.size,
        url,
        conversion,
      });
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
