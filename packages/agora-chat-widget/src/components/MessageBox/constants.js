
import UserList from './UserList/UserList'
import QaUserList from './QaList/QaUserList'
import MessageItem from './Message/index'
export const CHAT_TABS_KEYS = {
    chat: 'CHAT',
    qa: 'QA',
    user: 'USER',
}

export const CHAT_TABS = [{
    key: CHAT_TABS_KEYS.chat,
    name: '聊天',
    component: MessageItem,
    className: 'message-list'
}, {
    key: CHAT_TABS_KEYS.qa,
    name: '提问',
    component: QaUserList,
    className: 'qa-list'
}, {
    key: CHAT_TABS_KEYS.user,
    name: `成员`,
    component: UserList,
    className: 'user-list'
}]

// 获取历史记录消息条数
export const HISTORY_COUNT = 50;

// 分页获取成员数
export const ROOM_PAGESIZE = 20;

// 输入框限制字符数
export const INPUT_SIZE = 500;


