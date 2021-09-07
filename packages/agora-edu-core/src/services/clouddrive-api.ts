
import { GenericErrorWrapper } from "agora-rte-sdk";
import { ApiBase } from "./base";

export interface PagingOptions {
    nextId?: string,
    tags?: string[],
    resourceName?: string,
    limit?: number,
    pageSize?: number,
    pageNo?: number,
    converted?: number,
    orderBy?: string
}


type AgoraCloudDriveApiParams = {
  // userToken: string
  sdkDomain: string
  appId: string
  rtmToken: string
  rtmUid: string
  // prefix: string
  roomUuid: string
}

export class AgoraCloudDriveApi extends ApiBase {
  constructor(
    params: AgoraCloudDriveApiParams
  ) {
    super(params)
    this.prefix = `${params.sdkDomain}/edu/apps/%app_id`.replace('%app_id', this.appId)
  }

  async fetchPersonalResources(userUuid:string, options?: PagingOptions) {
    let queryparams:string[] = []

    if(!options) {
      options = {}
    }
    
    if(options.converted !== 0) {
      // default to 1
      options.converted = 1
    }

    options.orderBy = 'updateTime'

    queryparams = Object.entries(options).filter((([, value]) => !!value)).map(([name, value]) => `${name}=${value}`);
    
    let res = await this.fetch({
      url: `/v2/users/${userUuid}/resources/page?${queryparams.join('&')}`,
      method: 'GET'
    })

    if(res.data.code) {
      throw GenericErrorWrapper(res.data.msg)
    }

    return res
  }
}