import { getRegion } from '@/app/stores/global';
import { request } from '@/app/utils/request';
import { EduRegion } from 'agora-edu-core';
import { getApiDomain, getSceneBuilderDomain } from '../utils';

export class HomeApi {
  private get domain() {
    return getApiDomain(getRegion());
  }

  private get builderDomain() {
    return getSceneBuilderDomain(EduRegion.CN);
  }

  async getRecordations(roomUuid: string): Promise<any> {
    const { data } = await request.get(`${this.domain}/edu/v2/rooms/${roomUuid}/records`);
    return data.data;
  }

  public async getBuilderResource(companyId: string, projectId: string): Promise<any> {
    const { data } = await request.get(
      `${this.builderDomain}/builder/companys/${companyId}/v1/projects/${projectId}/preview`,
    );

    return data;
  }
}

export const homeApi = new HomeApi();
