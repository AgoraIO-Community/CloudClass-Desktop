import OSS from 'ali-oss';
import md5 from 'js-md5';
import { UAParser } from 'ua-parser-js';
import { AgoraRteEngineConfig } from '../../configs';
import { ApiBase } from './base';
import { AGRteErrorCode, RteErrorCenter } from '../utils/error';

const UA = new UAParser();
const parser = UA.getResult();

//TODO
const platform = 'web';

export class AgoraLogService extends ApiBase {
  async fetchStsToken(roomId: string, fileExt: string) {
    const _roomId = roomId ? roomId : 0;

    let timestamp = new Date().getTime();
    let body = {
      appId: AgoraRteEngineConfig.shared.appId,
      appVersion: 'agora_rte_sdk_version',
      deviceName: parser.os.name,
      deviceVersion: parser.os.version,
      fileExt: fileExt,
      platform: platform,
      tag: {
        roomId: _roomId,
      },
    };

    let params = JSON.stringify(body);
    let appSecret = '7AIsPeMJgQAppO0Z';
    let signStr = appSecret + params + timestamp;
    let sign = md5(signStr);
    const host = AgoraRteEngineConfig.shared.service?.host;

    let data = await this.fetch({
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
    };
  }

  async uploadZipLogFile(roomId: string, file: any) {
    const res = await this.uploadToOss(roomId, file, 'zip');
    return res;
  }

  // upload log
  async uploadLogFile(roomId: string, file: any) {
    const res = await this.uploadToOss(roomId, file, 'log');
    return res;
  }

  async uploadToOss(roomId: string, file: any, ext: string) {
    let {
      bucketName,
      callbackBody,
      callbackContentType,
      accessKeyId,
      accessKeySecret,
      securityToken,
      ossKey,
    } = await this.fetchStsToken(roomId, ext);
    const ossParams = {
      bucketName,
      callbackBody,
      callbackContentType,
      accessKeyId,
      accessKeySecret,
      securityToken,
    };
    const ossClient = new OSS({
      accessKeyId: ossParams.accessKeyId,
      accessKeySecret: ossParams.accessKeySecret,
      stsToken: ossParams.securityToken,
      bucket: ossParams.bucketName,
      secure: true,
      // TODO: 请传递你自己的oss endpoint
      // TODO: Please use your own oss endpoint
      endpoint: 'oss-accelerate.aliyuncs.com',
    });
    const host = AgoraRteEngineConfig.shared.service?.host;

    try {
      const ossCallbackUrl = `${host}/monitor/v1/log/oss/callback`;
      console.log('log: ossCallbackUrl ', ossCallbackUrl, ' body ', JSON.stringify(callbackBody));
      let { data } = await ossClient.put(ossKey, file, {
        callback: {
          url: `${host}/monitor/v1/log/oss/callback`,
          body: callbackBody,
          contentType: 'application/json',
        },
      });

      return (data as { data: object }).data ?? -1;
    } catch (err) {
      RteErrorCenter.shared.handleThrowableError(
        AGRteErrorCode.RTE_ERR_LOG_UPLOAD_FAIL,
        err as Error,
      );
    }
  }

  async uploadElectronLog(roomId: any) {
    //@ts-ignore
    if (window.doGzip) {
      //@ts-ignore
      let file = await window.doGzip();
      const res = await this.uploadZipLogFile(roomId, file);
      return res;
    }
  }

  async enableUpload(roomUuid: string, isElectron: boolean) {}

  async uploadLog(roomId: string) {
    throw 'not implementing';
    // let res: any = await this.uploadLogFile(roomId, file);
    // await db.readAndDeleteBy(now);
    // Logger.info(
    //   `完成日志上传，文件名: ${file.name}, 上传时间: ${now}, 日志上传，res: ${JSON.stringify(res)}`,
    // );
    // return res;
  }
}
