import { EduRoleTypeEnum } from 'agora-edu-core';
import axios from 'axios';

export class HomeApi {
  static shared = new HomeApi();
  domain = '';

  async login(
    userUuid: string,
    roomUuid: string,
    role: string,
  ): Promise<{
    appId: string;
    roomUuid: string;
    userUuid: string;
    role: number;
    token: string;
  }> {
    const { data } = await axios.get(
      `${this.domain}/edu/v3/rooms/${roomUuid}/roles/${EduRoleTypeEnum[role]}/users/${userUuid}/token`,
    );
    return data.data;
  }

  async getRecordations(roomUuid: string): Promise<any> {
    const { data } = await axios.get(`${this.domain}/edu/v2/rooms/${roomUuid}/records`);
    return data.data;
  }
}
