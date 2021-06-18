import store from '../redux/store'
import { loginInfo, memberInfo } from '../redux/aciton'
import WebIM from "../utils/WebIM";


// 设置自己的用户属性
export const setUserInfo = () => {

    const userAvatarUrl = store.getState().extData.imAvatarUrl;
    const userRoleType = Number(store.getState().extData.roleType);
    const userNickName = userRoleType === 0 ? "录制机器人" : store.getState().extData.imUserName;
    let options = {
        nickname: userNickName,
        avatarurl: userAvatarUrl,
        ext: userRoleType
    }
    WebIM.conn.updateOwnUserInfo(options).then((res) => {
        store.dispatch(loginInfo(res.data))
    })
}

// 获取用户属性
export const getUserInfo = (member) => {
    WebIM.conn.fetchUserInfoById(member).then((res) => {
        store.dispatch(memberInfo(res.data))
    })
}