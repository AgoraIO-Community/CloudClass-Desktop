
import store from '../redux/store'
import { userInfoAction } from '../redux/actions/userAction'
import { roomUsersInfo } from '../redux/actions/roomAction'
import { ROLE } from '../contants'

import WebIM from "../utils/WebIM";

// 设置自己的用户属性
export const setUserInfo = () => {
    // 判断当前登陆用户是否为 机器人
    const isRobot = store.getState().propsData.roleType === ROLE.audience.id;
    // 机器人默认头像
    const robotAvatarUrl = "https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/apaas/xeg/robot.png";
    // 登陆用户默认头像
    const defaultAvatarUrl = "https://download-sdk.oss-cn-beijing.aliyuncs.com/downloads/IMDemo/avatar/Image1.png";
    // 用户权限
    const userRoleType = JSON.stringify({ "role": store.getState().propsData.roleType });
    // 用户头像
    const userAvatarUrl = isRobot ? robotAvatarUrl : (store.getState().propsData.imAvatarUrl || defaultAvatarUrl);
    // 用户名称
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
