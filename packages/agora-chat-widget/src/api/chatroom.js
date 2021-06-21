import WebIM from "../utils/WebIM";
import { message } from 'antd'
import { roomInfo, roomNotice, roomAdmins, roomUsers, roomMuteUsers, roomAllMute, loadGif, userMute } from '../redux/aciton'
import store from '../redux/store'
import { setUserInfo } from './userInfo'
import { getHistoryMessages } from './historyMessages'

// 加入聊天室
export const joinRoom = async () => {
    const roomId = store.getState().extData.chatroomId;
    const userUuid = store.getState().extData.userUuid;
    const roleType = store.getState().extData.roleType;
    let options = {
        roomId: roomId,   // 聊天室id
        message: 'reason'   // 原因（可选参数）
    }
    await setUserInfo();
    await WebIM.conn.joinChatRoom(options).then((res) => {
        message.success('已成功加入聊天室！');
        setTimeout(() => {
            message.destroy();
        }, 3000);
        if (Number(roleType) === 2 || Number(roleType) === 0) {
            isChatRoomWhiteUser(roomId, userUuid)
        }
        getRoomInfo(options.roomId);
        getHistoryMessages(false);
    })

};

// 获取聊天室详情
export const getRoomInfo = (roomId) => {
    let options = {
        chatRoomId: roomId   // 聊天室id
    }
    WebIM.conn.getChatRoomDetails(options).then((res) => {
        store.dispatch(roomInfo(res.data[0]));
        getRoomNotice(roomId);
        getRoomAdmins(roomId);
        //getRoomUsers(roomId);
        getRoomWhileList(roomId);
    })
}

// 获取群组公告
export const getRoomNotice = (roomId) => {
    let options = {
        roomId       // 聊天室id                          
    };
    WebIM.conn.fetchChatRoomAnnouncement(options).then((res) => {
        const isAllMute = res.data.announcement.slice(0, 1)
        const newAnnouncement = res.data.announcement.slice(1)
        store.dispatch(roomNotice(newAnnouncement));
        if (Number(isAllMute) === 0) {
            store.dispatch(roomAllMute(false))
        } else {
            store.dispatch(roomAllMute(true))
        }

    })
};

// 识别网址
// let newNotice = '';
// function httpString(str) {
//     var textR = str;
//     var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
//     if (reg.exec('')) {
//     } else {
//         newNotice = textR.replace(reg, "<a href='$1$2'>$1$2</a>");
//         return newNotice
//     }
// }

// 上传/修改 群组公告
export const updateRoomNotice = (roomId, noticeCentent) => {
    const isRoomAllMute = store.getState().isRoomAllMute;
    if (isRoomAllMute) {
        noticeCentent = '1' + noticeCentent
    } else {
        noticeCentent = '0' + noticeCentent
    }
    let options = {
        roomId: roomId,                 // 聊天室id   
        announcement: noticeCentent // 公告内容                        
    };
    WebIM.conn.updateChatRoomAnnouncement(options).then((res) => {
        getRoomNotice(res.data.id);
    })
}

// 获取聊天室管理员
export const getRoomAdmins = (roomId) => {
    let options = {
        chatRoomId: roomId   // 聊天室id
    }
    WebIM.conn.getChatRoomAdmin(options).then((res) => {
        store.dispatch(roomAdmins(res.data));
    })
};

// 获取聊天室成员列表
export const getRoomUsers = (pageNum, pageSize, roomId) => {
    let options = {
        pageNum: pageNum,
        pageSize: pageSize,
        chatRoomId: roomId,
    }
    WebIM.conn.listChatRoomMember(options).then((res) => {
        store.dispatch(roomUsers(res.data));
    })
}

// 获取聊天室禁言成员列表
export const getRoomMuteList = (roomId) => {
    let options = {
        chatRoomId: roomId // 聊天室id
    };
    WebIM.conn.getChatRoomMuted(options).then((res) => {
        store.dispatch(roomMuteUsers(res.data));
    })
}

// 获取聊天室白名单，为了保证禁言时可以提问，使用白名单做禁言列表
export const getRoomWhileList = (roomId) => {
    let options = {
        chatRoomId: roomId  // 聊天室id
    }
    WebIM.conn.getChatRoomWhitelist(options).then((res) => {
        store.dispatch(roomMuteUsers(res.data));
    });
}

// 判断当前登陆账号是否在白名单
export const isChatRoomWhiteUser = (roomId, userId) => {
    let options = {
        chatRoomId: roomId, // 聊天室id
        userName: userId         // 要查询的成员
    }
    WebIM.conn.isChatRoomWhiteUser(options).then((res) => {
        console.log('isChatRoomWhiteUser', res);
        store.dispatch(userMute(res.data.white))
    });
}

// 退出聊天室
export const logoutChatroom = () => {
    const roomId = store.getState().extData.chatroomId;
    WebIM.conn.quitChatRoom({
        roomId: roomId,// 聊天室id
        success: function (res) {
            console.log('quitChatRoom>>>', res)
        }
    });
}