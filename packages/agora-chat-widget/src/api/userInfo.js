
import store from '../redux/store'
import { userInfoAction } from '../redux/actions/userAction'
import { roomUsersInfo } from '../redux/actions/roomAction'
import { ROLE } from '../contants'

import WebIM from "../utils/WebIM";

// 设置自己的用户属性
export const setUserInfo = () => {
    const isRobot = store.getState().propsData.roleType === ROLE.audience.id;
    const robotAvatarUrl = "https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/apaas/xeg/robot.png";
    const defaultAvatarUrl = "https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png";
    const userRoleType = JSON.stringify({ "role": store.getState().propsData.roleType });
    const userAvatarUrl = isRobot ? robotAvatarUrl : (store.getState().propsData.imAvatarUrl || defaultAvatarUrl);
    const userNickName = isRobot? '录课机器人' : store.getState().propsData.userName;
    let options = {
        nickname: userNickName,
        avatarurl: userAvatarUrl,
        ext: userRoleType
    }
    WebIM.conn.updateOwnUserInfo(options).then((res) => {
        store.dispatch(userInfoAction(res.data))
    })
}

// 获取用户属性
export const getUserInfo = async (member) => {
    let count = 0;
    while (member.length > count) {
        let curmembers = member.slice(count, count + 100);
        await WebIM.conn.fetchUserInfoById(curmembers).then((res) => {
            store.dispatch(roomUsersInfo(res.data))
        })
        count += 100;
    }
}
