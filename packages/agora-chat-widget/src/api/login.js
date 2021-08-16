import WebIM, { appkey } from "../utils/WebIM";
import store from '../redux/store'
import { LoginName,isLogin } from '../redux/aciton'

// 登陆
const loginIM = (appkey) => {
    const userName = store.getState().extData.userUuid;
    const orgName = store.getState().extData.orgName
    const appName = store.getState().extData.appName
    const _appkey =  orgName + '#' + appName;
    let potions = {
        user: userName ? userName.toLocaleLowerCase() : '',
        pwd: userName,
        appKey: appkey?appkey:_appkey ,
        success: () => {
            store.dispatch(LoginName(potions.user));
        }
    };
    store.dispatch(isLogin('In_the_login'))
    WebIM.conn.open(potions);
};

export default loginIM;

