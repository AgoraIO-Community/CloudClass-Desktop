
// 收到数据存储
export const extData = data => {
    return { type: 'SAVE_EXT_DATA', data }
}
// 是否已登陆
export const isLogin = data => {
    return { type: 'IS_LOGIN', data }
}
// 登陆ID
export const LoginName = data => {
    return { type: 'LOGIN_NAME', data }
}

// 选中的Tab
export const isTabs = data => {
    return { type: 'IS_TABS', data }
}
// 聊天室详情
export const roomInfo = data => {
    return { type: 'GET_ROOM_INFO', data }
}

// 成员数
export const roomUserCount = data => {
    return { type: 'GET_USERS_COUNT', data }
}

// 聊天室公告
export const roomNotice = data => {
    return { type: 'UPDATE_ROOM_NOTICE', data }
}
// 聊天室管理员
export const roomAdmins = data => {
    return { type: 'GET_ROOM_ADMINS', data }
}
// 聊天室成员
export const roomUsers = (data, option) => {
    return { type: 'GET_ROOM_USERS', data, option }
}

// 聊天室全局禁言
export const roomAllMute = data => {
    return { type: 'GET_ROOM_ALL_MUTE', data }
}
// 聊天室禁言成员
export const roomMuteUsers = data => {
    return { type: 'GET_ROOM_MUTE_USERS', data }
}
//聊天室单人禁言
export const userMute = data => {
    return { type: 'IS_USER_MUTE', data }
}
// 是否开启提问模式
export const isQa = data => {
    return { type: 'QA_MESSAGE_SWITCH', data }
}

// 是否隐藏赞赏消息
export const isReward = data => {
    return { type: 'REWARD_MESSAGE_SWITCH', data }
}
// 聊天室 普通/赞赏 消息
export const roomMessages = (data, options) => {
    return { type: 'SAVE_ROOM_MESSAGES', data, options }
}
// 移除聊天信息提示
export const removeChatNotification = (data) => {
    return { type: 'REMOVE_CHAT_NOTIFICATION', data }
}
// 移除红点消息提示
export const removeQaNotification = (data) => {
    return { type: 'REMOVE_QA_NOTIFICATION', data }
}
// 移除提问框红点提示
export const removeShowRed = (data) => {
    return { type: 'REMOVE_RED_MESSAGE', data }
}
// 聊天室提问消息
export const qaMessages = (data, qaSender, options, time) => {
    return { type: 'SAVE_QA_MESSAGE', data, qaSender, options, time }
}
//  存个人信息
export const loginInfo = data => {
    return { type: 'SAVE_LOGIN_INFO', data }
}
// 取成员信息
export const memberInfo = (data) => {
    return { type: 'SAVE_MEMBER_INFO', data }
}

// 历史消息
export const moreHistory = (data) => {
    return { type: 'MORE_HISTORY', data }
}
// 历史消息加载动画
export const loadGif = (data) => {
    return { type: 'LOAD_GIF', data }
}

// 退出清空store
export const clearStore = (data) => {
    return { type: 'CLEAR_STORE', data }
}

// 设置当前提问人
export const setCurrentUser = (data) => {
    return {type: 'SAVE_CURRENT_USER',data}
}