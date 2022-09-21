import { getRegion } from '@/app/stores/home';
import { getTokenDomain } from '@/app/utils/env';
import { request } from '@/app/utils/request';
import { EduRegion } from 'agora-edu-core';

export class HomeApi {
  static shared = new HomeApi();
  get domain() {
    return getTokenDomain(getRegion());
  }

  get builderDomain() {
    return getTokenDomain(EduRegion.CN);
  }

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
}
