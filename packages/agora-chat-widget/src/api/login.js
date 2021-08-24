import WebIM from "../utils/WebIM";
import store from '../redux/store'
import { userAction } from '../redux/actions/userAction'

// 登陆
export const loginIM = (appkey) => {
    console.log('login>>>');
    const userName = store.getState().propsData.userUuid;
    let potions = {
        user: userName ? userName.toLocaleLowerCase() : '',
        pwd: userName,
        appKey: appkey,
        success: () => {
            store.dispatch(userAction(potions.user));
        }
    };
    WebIM.conn.open(potions);
};