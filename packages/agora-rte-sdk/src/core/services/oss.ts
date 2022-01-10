import OSS, { Checkpoint, MultipartUploadResult } from 'ali-oss';
import axios from 'axios';
import md5 from 'js-md5';
import { UAParser } from 'ua-parser-js';
import { AgoraRteEngineConfig } from '../..';
import { ApiBase } from './base';

const UA = new UAParser();
const parser = UA.getResult();

//TODO
const platform = 'web';

export type TagInfo = {
  roomUuid: string;
  roomName: string;
  roomType: number;
  userUuid: string;
  userName: string;
  role: number;
};

export class OSSFileUploader {
  private _adapter: UploaderAdapter;
  constructor(private _appId: string, private _tagInfo: TagInfo) {
    this._adapter = new OSSUploader(this._appId, this._tagInfo);
  }

  async upload(file: File, ext: string) {
    await this._adapter.upload(file, ext);
  }
}

interface UploaderAdapter {
  upload(file: File, ext: string): Promise<void>;
}

class OSSUploader implements UploaderAdapter {
  private _apiService = new ApiBase();
  private _checkpoints: Map<string, Checkpoint> = new Map<string, Checkpoint>();
  constructor(private _appId: string, private _tagInfo: TagInfo) {}

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
  ): Promise<void> {
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

    const callbackUrl = `${callbackHost}/monitor/apps/${this._appId}/v1/log/oss/callback`;
    const { res }: MultipartUploadResult = await ossClient.multipartUpload(ossKey, file, {
      progress: (p, cpt) => {
        this._checkpoints.set(resourceUuid, cpt);
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
      throw new Error(`upload to ali oss error, status is ${res.status}`);
    }

    // clean up
    this._checkpoints.delete(resourceUuid);

    ossClient.generateObjectUrl(ossKey);
  }

  private async _uploadByAws(
    file: File,
    resourceUuid: string,
    ossConfig: {
      preSignedUrl: string;
    },
    callbackConfig: {
      callbackHost: string;
      callbackBody: string;
      callbackContentType: string;
    },
  ): Promise<void> {
    const { preSignedUrl } = ossConfig;
    const { callbackHost, callbackBody, callbackContentType } = callbackConfig;
    const callbackUrl = `${callbackHost}/monitor/apps/${this._appId}/v1/log/oss/callback`;

    await axios.put(preSignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    let res = await axios.post(callbackUrl, JSON.parse(callbackBody), {
      headers: {
        ['content-type']: callbackContentType,
      },
    });

    if (res.status !== 200) {
      throw new Error(`upload to aws oss error, status is ${res.status}`);
    }

    // clean up
    this._checkpoints.delete(resourceUuid);
  }

  private async _fetchStsToken(tag: unknown, fileExt: string) {
    let timestamp = new Date().getTime();
    let body = {
      appId: AgoraRteEngineConfig.shared.appId,
      appVersion: AgoraRteEngineConfig.version,
      deviceName: parser.os.name,
      deviceVersion: parser.os.version,
      fileExt: fileExt,
      platform: platform,
      tag: tag,
    };

    let params = JSON.stringify(body);
    let appSecret = '7AIsPeMJgQAppO0Z';
    let signStr = appSecret + params + timestamp;
    let sign = md5(signStr);

    let { data } = await this._apiService.fetch({
      path: `/monitor/v1/log/oss/policy`,
      data: body,
      method: 'POST',
      headers: {
        sign: sign,
        timestamp: timestamp,
      },
    });
    return {
      bucketName: data.bucketName as string,
      callbackBody: data.callbackBody as string,
      callbackContentType: data.callbackContentType as string,
      accessKeyId: data.accessKeyId as any,
      accessKeySecret: data.accessKeySecret as string,
      securityToken: data.securityToken as string,
      ossKey: data.ossKey as string,
      callbackHost: data.callbackHost as string,
      preSignedUrl: data.preSignedUrl as string,
      vendor: data.vendor as number,
      ossEndpoint: data.ossEndpoint as string,
    };
  }

  async upload(file: File, ext: string) {
    const data = await this._fetchStsToken(this._tagInfo, ext);
    const { vendor = -1 } = data;
    // step 2. begin upload by vendor
    if (vendor === 1) {
      // aws
      const {
        ossKey,
        callbackBody,
        callbackContentType,
        callbackHost,
        //only available for aws for now
        preSignedUrl,
      } = data;
      await this._uploadByAws(
        file,
        ossKey,
        {
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
      await this._uploadByAli(
        file,
        ossKey,
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
      throw new Error(`vendor ${vendor} is not supported`);
    }
  }
}
