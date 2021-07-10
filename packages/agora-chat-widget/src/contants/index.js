
// 角色权限
export const ROLE = {
    teacher: {
        id: 1,
        tag: '老师'
    },
    student: {
        id: 2,
        tag: '学生'
    }
}

// 当前选中的 tab
export const CHAT_TABS_KEYS = {
    chat: 'CHAT',
    user: 'USER',
    notice: 'ANNOUNCEMENT'
}

// 消息模式
export const MSG_TYPE = {
    common: 0,
    question: 1,
    answer: 2
}
// 拉取消息条数
export const HISTORY_COUNT = 50
// 公告输入限制
export const ANNOUNCEMENT_SIZE = 500
// 超过限制
export const MORE_SIZE = "最多可输入500字符"

// 禁言 aciton
export const SET_ALL_MUTE = "setAllMute"
export const REMOVE_ALL_MUTE = "removeAllMute"
export const SET_ALL_MUTE_MSG = "已开启全体学生禁言"
export const REMOVE_ALL_MUTE_MSG = "已关闭全体学生禁言"

// 登陆提示
export const LOGIN_SUCCESS = "登陆IM成功！"
// 加入聊天室成功提示
export const JOIN_ROOM_SUCCESS = "加入聊天室成功！"
// 删除消息
export const DELETE = "删除"
// 撤回消息
export const RECALL = "撤回"


