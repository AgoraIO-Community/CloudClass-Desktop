import _ from 'lodash'
import { CHAT_TABS_KEYS } from '../contants'
let defaultState = {
    propsData: {},          // props 值
    showChat: true,          // 控制Chat
    isLogin: false,         // 登陆状态
    loginUser: '',          // 当前登陆ID
    loginUserInfo: {},      // 当前登陆账号的用户属性
    room: {
        info: {},           // 聊天室详情
        roomUsers: [],      // 成员列表
        announcement: '',   // 聊天室公告
        muteList: [],       // 禁言列表
        roomUsersInfo: {},  // 成员属性
        allMute: false,     // 全局禁言
        isUserMute: false   // 单人是否禁言
    },
    messages: [],           // 消息列表
    isTabKey: CHAT_TABS_KEYS.chat,  // 当前选中的Tab
    showRed: false,         // 不在聊天Tab消息提示
    showChatRed: false,     // 窗口最小化提示
    announcementStatus: true   // 公告编辑状态
}
const reducer = (state = defaultState, action) => {
    const { type, data } = action;
    switch (type) {
        case 'SAVE_PROPS_ACTION':
            return {
                ...state,
                propsData: data
            };
        case 'IS_SHOW_CHAT':
            return {
                ...state,
                showChat: data
            };
        case 'IS_SHOW_CHAT_RED':
            return {
                ...state,
                showChatRed: data
            };
        case 'STATUS_ACTION':
            return {
                ...state,
                isLogin: data
            };
        case 'USER_ACTION':
            return {
                ...state,
                loginUser: data
            };
        case 'USER_INFO_ACTION':
            return {
                ...state,
                loginUserInfo: data
            };
        case 'ROOM_INFO':
            return {
                ...state,
                room: {
                    ...state.room,
                    info: data
                }
            };
        case 'ROOM_USERS':
            let ary = [];
            let userInfo = state.room.roomUsersInfo;
            if (action.option === 'addMember') {
                ary = ary.concat(data, ...state.room.roomUsers)
            } else if (action.option === 'removeMember') {
                _.remove(state.room.roomUsers, (v) => {
                    return v == data
                });
                ary = state.room.roomUsers
                userInfo = _.omit(userInfo, data)
            } else {
                ary = state.room.roomUsers.concat(data)
            }
            let newAry = _.uniq(ary)
            return {
                ...state,
                room: {
                    ...state.room,
                    roomUsers: newAry,
                    roomUsersInfo: userInfo
                },

            };
        case 'ROOM_USERS_COUNT':
            let num
            if (data.type === 'add') {
                num = data.userCount + 1
            } else {
                num = data.userCount - 1
            }
            return {
                ...state,
                room: {
                    ...state.room,
                    info: {
                        ...state.room.info,
                        affiliations_count: num
                    }
                }
            };
        case 'ROOM_USERS_INFO':
            let newInfo = _.assign({}, state.room.roomUsersInfo, data)
            return {
                ...state,
                room: {
                    ...state.room,
                    roomUsersInfo: newInfo
                }
            };
        case 'ROOM_ANNOUNCEMENT':
            return {
                ...state,
                room: {
                    ...state.room,
                    announcement: data
                }
            };
        case 'SAVE_ROOM_MESSAGE':
            const { isHistory } = action.options
            let msgs;
            if (isHistory) {
                msgs = [data].concat(state.messages)
            } else {
                msgs = state.messages.concat([data])
            }
            if (data.ext.msgId) {
                msgs = msgs.filter((item) => item.id !== data.ext.msgId)
            }
            return {
                ...state,
                messages: msgs
            };
        case 'ROOM_ALL_MUTE':
            return {
                ...state,
                room: {
                    ...state.room,
                    allMute: data
                }
            };
        case 'ROOM_USER_MUTE':
            return {
                ...state,
                room: {
                    ...state.room,
                    muteList: data
                }
            };
        case 'IS_USER_MUTE':
            return {
                ...state,
                room: {
                    ...state.room,
                    isUserMute: data
                }
            };
        case 'CLEAR_STORE':
            return _.assign({}, defaultState)
        case 'SELECT_TAB_ACTION':
            return {
                ...state,
                isTabKey: data
            }
        case 'SHOW_RED_NOTIFICSTION':
            return {
                ...state,
                showRed: data
            }
        case 'ANNOUNCEMENT_STATUS':
            return {
                ...state,
                announcementStatus: data
            }
        default:
            break;
    }
}

export default reducer
