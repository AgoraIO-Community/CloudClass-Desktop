
import WebIM from "../utils/WebIM";
import store from '../redux/store'

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
