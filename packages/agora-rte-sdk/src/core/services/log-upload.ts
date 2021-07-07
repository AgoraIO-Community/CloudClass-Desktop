import { AgoraFetch } from "../utils/fetch";
import OSS from "ali-oss";
import md5 from "js-md5";
import { get } from "lodash";
import { UAParser } from 'ua-parser-js';
import { GenericErrorWrapper } from "../utils/generic-error";

const UA = new UAParser();
const parser = UA.getResult()
const platform: string = window.isElectron ? 'Electron' : 'Web'

window.platform = platform

const AgoraFetchJson = async ({url, method, data, token, outHeaders}:{url?: string, method: string, data?: any, token?: string, outHeaders?: any}) => {  
  const opts: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  }
  if (token) {
    opts.headers['token'] = token;
  }
  if (outHeaders) {
    Object.keys(outHeaders).forEach(k => {
      opts.headers[k] = outHeaders[k]
    })
  }
  if (data) {
    opts.body = JSON.stringify(data);
  }
  let resp = await AgoraFetch(`${url}`, opts);
  const {code, msg, data: responseData} = resp
  if (code !== 0 && code !== 408) {
    const error = `${code}`
    // const error = getIntlError(`${code}`)
    const isErrorCode = `${error}` === `${code}`
    if (code === 401 || code === 1101012) {
      return
    }
    throw {api_error: error, isErrorCode}
  }

  return responseData
}


export class LogUpload {

  appID: string;
  roomId: string = '';
  sdkDomain: string;

  constructor(params: {
    appId: string,
    sdkDomain: string
  }) {
    this.sdkDomain = params.sdkDomain
    this.appID = params.appId
  }
  
  async fetchStsToken(roomId: string, fileExt: string) {

    const _roomId = roomId ? roomId : 0

    let timestamp = new Date().getTime()
    let body = {
      appId: this.appID,
      appVersion: 'agora_rte_sdk_version',
      deviceName: parser.os.name,
      deviceVersion: parser.os.version,
      fileExt: fileExt,
      platform: platform,
      tag: {
        roomId: _roomId,
      },
    }

    let params = JSON.stringify(body)
    let appSecret = '7AIsPeMJgQAppO0Z'
    let signStr = appSecret + params + timestamp
    let sign =  md5(signStr)

    let data = await AgoraFetchJson({
      url: `${this.sdkDomain}/monitor/v1/log/oss/policy`,
      data: body,    
      method: 'POST',
      outHeaders: {
        sign: sign,
        timestamp: timestamp,
      }
    })
    return {
      bucketName: data.bucketName as string,
      callbackBody: data.callbackBody as string,
      callbackContentType: data.callbackContentType as string,
      accessKeyId: data.accessKeyId as any,
      accessKeySecret: data.accessKeySecret as string,
      securityToken: data.securityToken as string,
      ossKey: data.ossKey as string,
    }
  }

  async uploadZipLogFile(
    roomId: string,
    file: any
  ) {
    const res = await this.uploadToOss(roomId, file, 'zip')
    return res;
  }

  //TODO: only work in agora cef platform
  private async uploadCefLogFile(roomId: string) {
    // if (window.getCachePath) {
    //   await new Promise((resolve) => {
    //     window.getCachePath((path: string) => {
    //       console.log(`CEF LOG ${path}agorasdk.log`);
    //       resolve(path)
    //     })
    //   })
    // }
    let resp = await fetch('https://convertcdn.netless.link/agorasdk.log');
    const blob = await resp.blob()
    const contentType = blob.type
    const fileName = `${roomId}-cef.log`
    const file = new File([blob], fileName, {type: contentType})
    await this.uploadToOss(roomId, file, 'log')
  }

  // upload log
  async uploadLogFile(
    roomId: string,
    file: any
  ) {
    const res = await this.uploadToOss(roomId, file, 'log')
    // await this.uploadCefLogFile(roomId)
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
      ossKey
    } = await this.fetchStsToken(roomId, ext);
    const ossParams = {
      bucketName,
      callbackBody,
      callbackContentType,
      accessKeyId,
      accessKeySecret,
      securityToken,
    }
    const ossClient = new OSS({
      accessKeyId: ossParams.accessKeyId,
      accessKeySecret: ossParams.accessKeySecret,
      stsToken: ossParams.securityToken,
      bucket: ossParams.bucketName,
      secure: true,
      // TODO: 请传递你自己的oss endpoint
      // TODO: Please use your own oss endpoint
      endpoint: 'oss-accelerate.aliyuncs.com',
    })

    try {
      const ossCallbackUrl = `${this.sdkDomain}/monitor/v1/log/oss/callback`
      console.log("log: ossCallbackUrl ", ossCallbackUrl, " body ", JSON.stringify(callbackBody))
      let res = await ossClient.put(ossKey, file, {
        callback: {
          url: `${this.sdkDomain}/monitor/v1/log/oss/callback`,
          body: callbackBody,
          contentType: 'application/json',
        }
      });
      return get(res, 'data.data', -1)
    } catch(err) {
      throw GenericErrorWrapper(err)
    }
  }

}