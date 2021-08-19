import { ApiBase, ApiBaseInitializerParams } from './base';

type LoginParams = {
  roomUuid: string;
  rtmUid: string;
  role: string;
};

type LoginResult = Promise<{
  rtmToken: string;
  userUuid: string;
}>;

type ConfigParams = Pick<ApiBaseInitializerParams, 'sdkDomain' | 'appId'>;

function getHomeApiRegion(region: string) {
  const map: Record<string, string> = {
    CN: 'bj2',
    AP: 'sg3sbm',
    NA: 'sv3sbm',
    EU: 'fr3sbm',
  };
  return map[region] || 'bj2';
}

export class HomeApi extends ApiBase {
  region: string;
  constructor(params: ApiBaseInitializerParams) {
    super(params);
    this.prefix = `${this.sdkDomain}/edu`.replace('%app_id%', this.appId);
    this.region = 'CN';
  }

  async login(userUuid: string): Promise<{
    rtmToken: string;
    userUuid: string;
    appId: string;
  }> {
    const res = await this.fetch({
      url: `/v2/users/${userUuid}/token`,
      method: 'GET',
    });
    return res.data;
  }

  updateConfig(params: ConfigParams) {
    this.appId = params.appId;
    // this.sdkDomain = params.sdkDomain
    // this.prefix = `${this.sdkDomain}/edu`.replace("%app_id", this.appId)
  }

  setRegion(region: string, sdkDomain: string) {
    this.region = region;
    this.setSDKDomain(sdkDomain);
  }
  setSDKDomain(sdkDomainParams: string = 'https://api-solutions.%region%.agoralab.co') {
    const prefixRegion = getHomeApiRegion(this.region);
    const sdkDomain = `${sdkDomainParams}/edu`.replace('%region%', prefixRegion);
    this.sdkDomain = sdkDomain;
    this.prefix = this.sdkDomain;
  }
}

export const homeApi = new HomeApi({
  sdkDomain: ``,
  appId: ``,
  rtmToken: '',
  rtmUid: '',
});
