import WebIM from '../utils/WebIM';
import { userAction } from '../redux/actions/userAction';

export class LoginAPI {
  store = null;
  constructor(store) {
    this.store = store;
  }
  // 登陆
  loginIM = (appkey) => {
    const userName = this.store.getState().propsData.userUuid;
    let options = {
      user: userName ? userName.toLocaleLowerCase() : '',
      pwd: userName,
      appKey: appkey,
      success: () => {
        this.store.dispatch(userAction(options.user));
      },
    };
    WebIM.conn.open(options);
  };
}
