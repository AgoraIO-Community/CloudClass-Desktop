import { request } from '@/infra/utils/request';
import { EduRegion } from 'agora-edu-core';

const REACT_APP_AGORA_APP_TOKEN_DOMAIN = process.env.REACT_APP_AGORA_APP_TOKEN_DOMAIN;
export class HomeApi {
  static shared = new HomeApi();
  domain = '';
  builderDomain = '';

  async loginV3(
    userUuid: string,
    roomUuid: string,
    role: number,
  ): Promise<{
    appId: string;
    roomUuid: string;
    userUuid: string;
    role: number;
    token: string;
  }> {
    const { data } = await request.get(
      `${this.domain}/edu/v3/rooms/${roomUuid}/roles/${role}/users/${userUuid}/token`,
    );
    return data.data;
  }

  async login(
    userUuid: string,
    roomUuid: string,
    role: number,
  ): Promise<{
    appId: string;
    roomUuid: string;
    userUuid: string;
    role: number;
    token: string;
  }> {
    const { data } = await request.get(
      `${this.domain}/edu/v4/rooms/${roomUuid}/roles/${role}/users/${userUuid}/token`,
    );
    return data.data;
  }

  async getRecordations(roomUuid: string): Promise<any> {
    const { data } = await request.get(`${this.domain}/edu/v2/rooms/${roomUuid}/records`);
    return data.data;
  }

  async getBuilderResource(companyId: string, projectId: string): Promise<any> {
    const { data } = await request.get(
      `${this.builderDomain}/builder/companys/${companyId}/v1/projects/${projectId}/preview`,
    );

    return data;
  }

  setDomainRegion(region: EduRegion) {
    let tokenDomain = '';
    let tokenDomainCollection: any = {};

    try {
      tokenDomainCollection = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
    } catch (e) {
      tokenDomain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
    }

    if (!tokenDomain && tokenDomainCollection) {
      switch (region) {
        case 'CN':
          tokenDomain = tokenDomainCollection['prod_cn'];
          break;
        case 'AP':
          tokenDomain = tokenDomainCollection['prod_ap'];
          break;
        case 'NA':
          tokenDomain = tokenDomainCollection['prod_na'];
          break;
        case 'EU':
          tokenDomain = tokenDomainCollection['prod_eu'];
          break;
      }
    }

    HomeApi.shared.domain = tokenDomain;
  }

  setBuilderDomainRegion(region: EduRegion) {
    let tokenDomain = '';
    let tokenDomainCollection: any = {};

    try {
      tokenDomainCollection = JSON.parse(`${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`);
    } catch (e) {
      tokenDomain = `${REACT_APP_AGORA_APP_TOKEN_DOMAIN}`;
    }

    if (!tokenDomain && tokenDomainCollection) {
      switch (region) {
        case 'CN':
          tokenDomain = tokenDomainCollection['prod_cn'];
          break;
        case 'AP':
          tokenDomain = tokenDomainCollection['prod_ap'];
          break;
        case 'NA':
          tokenDomain = tokenDomainCollection['prod_na'];
          break;
        case 'EU':
          tokenDomain = tokenDomainCollection['prod_eu'];
          break;
      }
    }

    HomeApi.shared.builderDomain = tokenDomain;
  }
}
