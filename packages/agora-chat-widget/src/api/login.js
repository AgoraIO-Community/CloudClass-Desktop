import WebIM from '../utils/WebIM';
import axios from 'axios';

export class LoginAPI {
  store = null;
  constructor(store) {
    this.store = store;
  }

  // get token
  getToken = () => {
    const { host, appId, roomUuid, userUuid, token } = this.store.getState().agoraTokenConfig;
    const url = `${host}/edu/apps/${appId}/v2/rooms/${roomUuid}/widgets/easemobIM/users/${userUuid}/token`;
    return axios
      .get(url, {
        headers: {
          'x-agora-token': token,
          'x-agora-uid': userUuid,
          Authorization: `agora token="${token}"`,
        },
      })
      .then((resp) => {
        return resp.data.data;
      })
      .catch((err) => {
        console.log('err>>>', err);
      });
  };

  // token 登陆
  loginWithToken = async (appkey, userUuid) => {
    const { token } = await this.getToken();
    WebIM.conn.open({
      user: userUuid,
      accessToken: token,
      appKey: appkey,
    });
  };

  // 登陆
  // loginIM = (appkey) => {
  //   this.loginWithToken()
  //   const userName = this.store.getState().propsData.userUuid;
  //   let options = {
  //     user: userName ? userName.toLocaleLowerCase() : '',
  //     pwd: userName,
  //     appKey: appkey,
  //     success: () => {
  //       this.store.dispatch(userAction(options.user));
  //     },
  //   };
  //   WebIM.conn.open(options);
  // };
}
