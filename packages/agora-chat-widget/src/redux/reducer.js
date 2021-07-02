import { CHAT_TABS_KEYS } from '../components/MessageBox/constants'
import _ from 'lodash'
let defaultState = {
    extData: {},        //iframe 传递过来的参数
    isLogin: false,     // 是否已登陆  
    loginName: '',      //当前登陆ID
    loginInfo: {},      //当前的用户的信息
    room: {             //聊天室
        info: {
            affiliations_count: 0
        },       //详情
        notice: "",     //公告
        users: [],      //成员
        admins: [],     //管理员
        muteList: [],    //禁言列表
    },
    messages: {         //消息
        list: [],       //TXT/TEXT 消息、CMD 消息、CUSTOM 消息
        qaList: {},     // QA 消息
        notification: { //判断当前所在Tab
            [CHAT_TABS_KEYS.chat]: false,
            [CHAT_TABS_KEYS.qa]: false
        }
    },
    activeKey: CHAT_TABS_KEYS.chat,
    currentUser: '',
    isUserMute: false,   //单人禁言
    isMoreHistory: true, //展示更多
    isLoadGif: false,
    isQa: false,         //是否为提问消息开关
    isReward: false,     //是否隐藏赞赏消息开关
    userListInfo: {},    //成员信息
    isRoomAllMute: false  //全局禁言

}
const reducer = (state = defaultState, action) => {
    const { type, data, qaSender } = action;
    switch (type) {
        //iframe 传递过来的参数
        case 'SAVE_EXT_DATA':
            return {
                ...state,
                extData: data
            };
        // 是否登陆
        case 'IS_LOGIN':
            return {
                ...state,
                isLogin: data
            };
        // 当前登陆的name
        case 'LOGIN_NAME':
            return {
                ...state,
                loginName: data
            };
        case 'IS_TABS':
            return {
                ...state,
                activeKey: data
            };
        // 聊天室详情
        case 'GET_ROOM_INFO':
            return {
                ...state,
                room: {
                    ...state.room,
                    info: data
                }
            };
        // 聊天室成员加减
        case 'GET_USERS_COUNT':
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
        // 获取聊天室公告
        case 'UPDATE_ROOM_NOTICE':
            return {
                ...state,
                room: {
                    ...state.room,
                    notice: data
                }
            };
        // 聊天室全局禁言
        case 'GET_ROOM_ALL_MUTE':
            return {
                ...state,
                isRoomAllMute: data,
            };
        //获取聊天室管理员
        case 'GET_ROOM_ADMINS':
            return {
                ...state,
                room: {
                    ...state.room,
                    admins: data
                }
            };
        //获取聊天室成员
        case 'GET_ROOM_USERS':
            let ary = [];
            let userInfo = state.userListInfo;
            if (action.option === 'addMember') {
                ary = ary.concat(data, ...state.room.users)
            } else if (action.option === 'removeMember') {
                _.remove(state.room.users, (v) => {
                    return v == data
                });
                ary = state.room.users
                userInfo = _.omit(userInfo, data)
            } else {
                ary = state.room.users.concat(data)
            }
            let newAry = _.uniq(ary)
            return {
                ...state,
                room: {
                    ...state.room,
                    users: newAry,
                },
                userListInfo: userInfo
            };
        //聊天室禁言列表
        case 'GET_ROOM_MUTE_USERS':
            return {
                ...state,
                room: {
                    ...state.room,
                    muteList: data
                }
            };
        //聊天室单人禁言
        case 'IS_USER_MUTE':
            return {
                ...state,
                isUserMute: data
            };
        //聊天室消息
        case 'SAVE_ROOM_MESSAGES':
            const { showNotice, isHistory } = action.options
            let msgs;
            let isTabShowChatNotice;
            if (isHistory) {
                msgs = [data].concat(state.messages.list)
                isTabShowChatNotice = state.messages.notification[CHAT_TABS_KEYS.chat];
            } else {
                msgs = state.messages.list.concat(data)
                isTabShowChatNotice = showNotice;
            }
            if (data.ext.msgId) {
                msgs = msgs.filter((item) => item.id !== data.ext.msgId)
            }
            return {
                ...state,
                messages: {
                    ...state.messages,
                    list: msgs,
                    notification: {
                        ...state.messages.notification,
                        [CHAT_TABS_KEYS.chat]: isTabShowChatNotice
                    }
                }
            };
        //移除聊天框红点通知
        case 'REMOVE_CHAT_NOTIFICATION':
            return {
                ...state,
                messages: {
                    ...state.messages,
                    notification: {
                        ...state.messages.notification,
                        [CHAT_TABS_KEYS.chat]: data
                    }
                }
            };
        //提问消息开关
        case 'QA_MESSAGE_SWITCH':
            return {
                ...state,
                isQa: data
            };
        //隐藏赞赏
        case 'REWARD_MESSAGE_SWITCH':
            return {
                ...state,
                isReward: data
            };
        // 提问消息
        case 'SAVE_QA_MESSAGE':
            const qaList = state.messages.qaList
            let qaMsgs;
            let isShowRedNotice;
            let isTabShowRedNotice;
            if (action.options.isHistory) {
                if (action.options.unRead) {
                    isShowRedNotice = action.options.showNotice;
                    isTabShowRedNotice = isShowRedNotice;
                } else {
                    isShowRedNotice = qaList[qaSender]?.showRedNotice;
                    isTabShowRedNotice = state.messages.notification[CHAT_TABS_KEYS.qa];
                }
                qaMsgs = [data, ...(qaList[qaSender]?.msg || [])]
            } else {
                qaMsgs = [...(qaList[qaSender]?.msg || []), data]
                isShowRedNotice = action.options.showNotice;
                isTabShowRedNotice = action.options.showNotice;
            }
            return {
                ...state,
                messages: {
                    ...state.messages,
                    qaList: {
                        ...qaList,
                        [qaSender]: {
                            msg: qaMsgs,
                            showRedNotice: isShowRedNotice,
                            time: qaList[qaSender]?.time || action.time
                        }
                    },
                    notification: {
                        ...state.messages.notification,
                        [CHAT_TABS_KEYS.qa]: isTabShowRedNotice
                    }
                }
            };
        //移除提问框红点通知
        case 'REMOVE_QA_NOTIFICATION':
            return {
                ...state,
                messages: {
                    ...state.messages,
                    notification: {
                        ...state.messages.notification,
                        [CHAT_TABS_KEYS.qa]: data
                    }
                }
            };
        // 移除提问框成员列表红点通知
        case 'REMOVE_RED_MESSAGE':
            return {
                ...state,
                messages: {
                    ...state.messages,
                    qaList: {
                        ...state.messages.qaList,
                        [data]: {
                            ...state.messages.qaList[data],
                            showRedNotice: false
                        }
                    },
                }
            };
        //当前登陆的用户属性
        case 'SAVE_LOGIN_INFO':
            return {
                ...state,
                loginInfo: data
            };
        //聊天室成员属性
        case 'SAVE_MEMBER_INFO':
            let newInfo = _.assign({}, state.userListInfo, data)
            return {
                ...state,
                userListInfo: newInfo
            };
        // 更多消息
        case 'MORE_HISTORY':
            return {
                ...state,
                isMoreHistory: data
            };
        case 'LOAD_GIF':
            return {
                ...state,
                isLoadGif: data
            };
        case 'CLEAR_STORE':
            return _.assign({}, defaultState)

        case 'SAVE_CURRENT_USER':
            return {
                ...state,
                currentUser: data
            }
        default:
            return state;
    }
}

export default reducer

