import WebIM from '../utils/WebIM';
import { ref } from '../redux/store';
import { userAction } from '../redux/actions/userAction';

// 登陆
export const loginIM = (appkey) => {
  const userName = ref.store.getState().propsData.userUuid;
  let options = {
    user: userName ? userName.toLocaleLowerCase() : '',
    pwd: userName,
    appKey: appkey,
    success: () => {
      ref.store.dispatch(userAction(options.user));
    },
  };
  WebIM.conn.open(options);
};
