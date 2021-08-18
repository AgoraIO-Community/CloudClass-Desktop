
import WebIM from "../utils/WebIM";
import store from '../redux/store';
import { roomMessages } from '../redux/aciton';
import { CHAT_TABS_KEYS } from '../components/MessageBox/constants'

// 自定义消息
export const _sendCustomMsg = (option) => {
    const roomId = store.getState().extData.chatroomId
    var id = WebIM.conn.getUniqueId();           // 生成本地消息id
    var msg = new WebIM.message('custom', id);   // 创建自定义消息
    msg.set({
        to: roomId,                          // 接收消息对象（用户id）
        customEvent: option.customEvent,    // 创建自定义事件 
        customExts: option.customExts,          // 消息内容扩展
        chatType: 'chatRoom',            // 群聊类型设置为聊天室
        ext: option.ext,
        success: option.success,
        fail: option.fail
    });
    WebIM.conn.send(msg.body);
}

// 文本消息
export const _sendTextMsg = (content, roomUuid, roleType, avatarUrl, nickName, failCallback) => {
    const roomId = store.getState().extData.chatroomId
    var id = WebIM.conn.getUniqueId();           // 生成本地消息id
    var msg = new WebIM.message('txt', id);   // 创建自定义消息
    msg.set({
        to: roomId,               // 接收消息对象(聊天室id)
        msg: content,          // 消息内容
        chatType: 'chatRoom',            // 群聊类型设置为聊天室
        ext: {
            msgtype: 0,   // 消息类型 0普通消息，1提问消息，2回答消息
            roomUuid: roomUuid,
            role: roleType,
            avatarUrl: avatarUrl,
            nickName: nickName,
        },
        success: (id, serverId) => {
            console.log('====发送成功') 

            msg.id = serverId;
            msg.body.id = serverId;
            msg.body.time = (new Date().getTime()).toString()

            // 触发发送弹幕事件
            document.dispatchEvent(
                new CustomEvent("pushBarrage", {
                    detail: {
                        avatarUrl: msg.body.ext.avatarUrl,
                        data: msg.value
                    }
                })
            );
            store.dispatch(roomMessages(msg.body, { showNotice: store.getState().activeKey !== CHAT_TABS_KEYS.chat, isHistory: false  }));
        },
        fail: failCallback
    })

    WebIM.conn.send(msg.body);
}

