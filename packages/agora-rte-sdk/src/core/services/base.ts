import { AREA_CODE } from './../media-service/interfaces/index';
import { GenericErrorWrapper } from "../utils/generic-error";
import { HttpClient } from "../utils/http-client";
import { AgoraFetchParams } from "../../interfaces";

export type ApiInitParams = {
  userToken: string
  sdkDomain: string
  appId: string
  rtmToken: string
  rtmUid: string
  prefix: string
  roomUuid: string
}

export type ApiBaseInitializerParams = {
  sdkDomain: string
  appId: string
  rtmToken: string
  rtmUid: string
}

export abstract class ApiBase {
  protected rtmToken: string = ''
  protected rtmUid: string = ''
  protected appId: string = ''
  protected sdkDomain: string = '';
  protected userToken: string = '';
  
  protected prefix!: string

  constructor(params: ApiBaseInitializerParams) {
    this.appId = params.appId
    this.sdkDomain = params.sdkDomain
    this.rtmToken = params.rtmToken
    this.rtmUid = params.rtmUid
  }

  updateRtmConfig(info: {
    rtmUid: string
    rtmToken: string
  }) {
    this.rtmUid = info.rtmUid
    this.rtmToken = info.rtmToken
  }

  // 接口请求
  async fetch (params: AgoraFetchParams) {
    const {
      method,
      token,
      data,
      full_url,
      url,
      restToken
    } = params
    const opts: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-agora-token': this.rtmToken,
        'x-agora-uid': this.rtmUid,
      }
    }
    if (data) {
      opts.body = JSON.stringify(data);
    }
    if (token) {
      opts.headers['token'] = token
    } else {
      if (this.userToken) {
        opts.headers['token'] = this.userToken
      }
    }

    if (restToken) {
      delete opts.headers['x-agora-token']
      delete opts.headers['x-agora-uid']
      Object.assign(opts.headers, {
        'authorization': `Basic ${restToken}`
      })
    }
    let resp: any;
    if (full_url) {
      resp = await HttpClient(`${full_url}`, opts);
    } else {
      resp = await HttpClient(`${this.prefix}${url}`, opts);
    }
    if (resp.code !== 0) {
      if(resp.code === undefined) {
        // code is not available when server is not properly return response
        throw GenericErrorWrapper({message: resp.error})
      } else {
        throw GenericErrorWrapper({message: resp.message || resp.msg}, {errCode: `${resp.code}`})
      }
    }
    return resp
  }
}