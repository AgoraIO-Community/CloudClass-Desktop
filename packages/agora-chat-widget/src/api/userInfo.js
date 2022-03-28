import { userInfoAction } from '../redux/actions/userAction';
import { roomUsersInfo } from '../redux/actions/roomAction';
import WebIM from '../utils/WebIM';

export class UserInfoAPI {
  store = null;
  constructor(store) {
    this.store = store;
  }

  // 设置自己的用户属性
  setUserInfo = ({ roleType, imAvatarUrl, userName }) => {
    const userRoleType = JSON.stringify({
      role: roleType,
    });
    const defaultAvatarUrl =
      'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png';
    const userAvatarUrl = imAvatarUrl || defaultAvatarUrl;
    const userNickName = userName;
    let options = {
      nickname: userNickName,
      avatarurl: userAvatarUrl,
      ext: userRoleType,
    };
    WebIM.conn.updateOwnUserInfo(options).then((res) => {
      this.store.dispatch(userInfoAction(res.data));
    });
  };

  // 获取用户属性
  getUserInfo = async ({ member }) => {
    let count = 0;
    while (member.length > count) {
      let curmembers = member.slice(count, count + 100);
      await WebIM.conn.fetchUserInfoById(curmembers).then((res) => {
        this.store.dispatch(roomUsersInfo(res.data));
      });
      count += 100;
    }
  };
}
