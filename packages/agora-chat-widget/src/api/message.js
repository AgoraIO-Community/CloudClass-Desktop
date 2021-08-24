import WebIM from '../utils/WebIM';
import { MSG_TYPE } from '../contants';
import store from '../redux/store';
import { messageAction } from '../redux/actions/messageAction';

// 禁言消息
export const sendCmdMsg = (action, userId) => {
  const state = store.getState();
  const roomId = state?.propsData.chatroomId;
  const roomUuid = state?.propsData.roomUuid;
  const roleType = state?.propsData.roleType;
  const loginName = state?.propsData.userName;
  const loginUser = state?.loginUser;
  var id = WebIM.conn.getUniqueId(); //生成本地消息id
  var msg = new WebIM.message('cmd', id); //创建命令消息
  msg.set({
    to: roomId, //接收消息对象
    action: action, //用户自定义，cmd消息必填
    chatType: 'chatRoom',
    from: loginUser,
    ext: {
      msgtype: MSG_TYPE.common, // 消息类型
      roomUuid: roomUuid,
      role: roleType,
      muteMember: userId || '',
      muteNickName: (userId && state.room.roomUsersInfo[userId].nickname) || '',
      nickName: loginName,
    }, //用户自扩展的消息内容（群聊用法相同）
    success: function (id, serverId) {
      msg.id = serverId;
      msg.body.id = serverId;
      msg.body.time = new Date().getTime().toString();
      store.dispatch(messageAction(msg.body, { isHistory: false }));
    }, //消息发送成功回调
    fail: function (e) {
      console.log('Fail'); //如禁言、拉黑后发送消息会失败
    },
  });
  WebIM.conn.send(msg.body);
};
