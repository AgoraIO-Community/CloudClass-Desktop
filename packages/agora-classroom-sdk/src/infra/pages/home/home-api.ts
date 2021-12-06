import { ApiBase } from 'agora-rte-sdk';
import axios from 'axios';

export type ApiBaseInitializerParams = {
  sdkDomain: string;
  appId: string;
};

const urlTpl = `%sdkDomain%/edu/v2/users/%userUuid%/token`;

export class HomeApi extends ApiBase {
  static shared = new HomeApi();
  private _params: ApiBaseInitializerParams = {
    sdkDomain: '',
    appId: '',
  };
  private _region: string;

  constructor() {
    super();
    this.pathPrefix = `${this._params.sdkDomain}/edu`.replace('%app_id%', this._params.appId);
    this._region = 'CN';
  }

  async login(userUuid: string): Promise<{
    rtmToken: string;
    userUuid: string;
    appId: string;
  }> {
    // const res = await this.fetch({
    //   full_url: this.getFullURL().replace('%userUuid%', userUuid),
    //   method: 'GET',
    // });
    const { data } = await axios.get(this.getFullURL().replace('%userUuid%', userUuid));
    return data.data;
  }

  setAppId(appId: string) {
    this._params.appId = appId;
  }

  setRegion(region: string, sdkDomain: string) {
    this._region = region;
    this._params.sdkDomain = sdkDomain;
  }

  setSDKDomain(sdkDomain: string) {
    this._params.sdkDomain = sdkDomain;
  }

  private getFullURL() {
    return urlTpl
      .replace('%sdkDomain%', this._params.sdkDomain || '')
      .replace('%region%', this._region || '')
      .replace('%appId%', this._params.appId || '');
  }
}
