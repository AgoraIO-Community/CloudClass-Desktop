import { ApiBase, ApiBaseInitializerParams } from './base';

type LoginParams = {
  roomUuid: string
  rtmUid: string
  role: string
}

type LoginResult = Promise<{
  rtmToken: string,
  userUuid: string
}>

type ConfigParams = Pick<ApiBaseInitializerParams, 'sdkDomain' | 'appId'>

export class HomeApi extends ApiBase {
  constructor(params: ApiBaseInitializerParams) {
    super(params)
    this.prefix = `${this.sdkDomain}/edu`.replace('%app_id%', this.appId)
  }

  async login(userUuid: string): Promise<{
    rtmToken: string,
    userUuid: string
  }> {
    const res = await this.fetch({
      url: `/v2/users/${userUuid}/token`,
      method: 'GET',
    })
    return res.data
  }

  updateConfig(params: ConfigParams) {
    this.appId = params.appId
    this.sdkDomain = params.sdkDomain
    this.prefix = `${this.sdkDomain}/edu`.replace("%app_id", this.appId)
  }
}

export const homeApi = new HomeApi({
  sdkDomain: ``,
  appId: ``,
  rtmToken: '',
  rtmUid: ''
})