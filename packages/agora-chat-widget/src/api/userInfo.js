import store from '../redux/store'
import { loginInfo, memberInfo } from '../redux/aciton'
import WebIM from "../utils/WebIM";
import { setReadMsgId } from "./qaReadMsg"

// 设置自己的用户属性
export const setUserInfo = (val) => {
    const userRoleType = Number(store.getState().extData.roleType);
    const robotAvatarUrl = 'https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/recordRobot.webp'
    const userAvatarUrl = userRoleType === 0 ? robotAvatarUrl : store.getState().extData.imAvatarUrl;
    const userNickName = userRoleType === 0 ? "录制机器人" : store.getState().extData.userName;
    let isSetMsg = val ? Object.keys(val).length > 0 : false;
    let options = isSetMsg ? { 'sign': JSON.stringify([val]) } : {
        nickname: userNickName,
        avatarurl: userAvatarUrl,
        ext: userRoleType
    }
    WebIM.conn.updateOwnUserInfo(options).then((res) => {
        if (!res) return

        if (!isSetMsg) {
            let arr = res.data.sign ? JSON.parse(res.data.sign) : [];
            arr.length > 0 && setReadMsgId(arr[0])
            store.dispatch(loginInfo(res.data))
        }
    })
}

// 获取用户属性
export const getUserInfo = async (member, callback = null) => {
    let count = 0;
    while (member.length > count) {
        let curmembers = member.slice(count, count + 100);
        await WebIM.conn.fetchUserInfoById(curmembers).then((res) => {
            store.dispatch(memberInfo(res.data))
            callback && callback()
        })
        count += 100;
    }

}