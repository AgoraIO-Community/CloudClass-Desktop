import axios from 'axios';

export class HomeApi {
  static shared = new HomeApi();
  domain = '';

  async login(userUuid: string): Promise<{
    rtmToken: string;
    userUuid: string;
    appId: string;
  }> {
    const { data } = await axios.get(`${this.domain}/edu/v2/users/${userUuid}/token`);
    return data.data;
  }
}
