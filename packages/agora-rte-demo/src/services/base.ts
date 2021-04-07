import { GenericErrorWrapper } from "agora-rte-sdk";
import { HttpClient } from "@/modules/utils/http-client";
import { globalConfigs } from "@/utils/configs";

export interface AgoraFetchParams {
  url?: string
  method: string
  data?: any
  token?: string
  full_url?: string
  type?: string
  restToken?: string
}

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
    // this.appId = params.appId
    // this.sdkDomain = params.sdkDomain
    // unify sdkDomain for all services
    this.appId = globalConfigs.appId
    this.sdkDomain = globalConfigs.sdkDomain
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
      throw GenericErrorWrapper({message: resp.message || resp.msg}, {errCode: `${resp.code}`})
    }
    return resp
  }

  // 接口请求上传文件
  async fetchFormData (params: AgoraFetchParams) {
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
        'Content-Type': 'multipart/form-data',
        'x-agora-token': this.rtmToken,
        'x-agora-uid': this.rtmUid,
      }
    }

    const formData = new FormData()
    for (let key in data) {
      formData.append(key, data[key])
    }
    if (data) {
      opts.body = formData
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
      throw GenericErrorWrapper({message: resp.message || resp.msg})
    }
    return resp
  }
}