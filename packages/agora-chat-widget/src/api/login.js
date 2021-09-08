import WebIM from "../utils/WebIM";
import store from '../redux/store'
import { userAction } from '../redux/actions/userAction'

// 登陆
export const loginIM = (appkey, fnCallback) => {
    const userName = store.getState().propsData.userUuid;
    let potions = {
        user: userName ? userName.toLocaleLowerCase() : '',
        pwd: userName,
        appKey: appkey,
        success: () => {
            store.dispatch(userAction(potions.user));
            fnCallback()
        }
    };
    WebIM.conn.open(potions);
};