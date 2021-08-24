import WebIM from '../utils/WebIM';
import store from '../redux/store';
import { roomAllMute, roomUserMute, isUserMute } from '../redux/actions/roomAction';
import { SET_ALL_MUTE, REMOVE_ALL_MUTE, MUTE_USER, UNMUTE_USER } from '../contants';
import { sendCmdMsg } from './message';

/*
    为保证单人禁言后，重新进入也是禁言状态，使用白名单代替禁言
    一键禁言，使用正确的api
*/

// 单人禁言
export const setUserMute = (userId) => {
  const roomId = store.getState().propsData.chatroomId;
  let options = {
    chatRoomId: roomId, // 聊天室id
    users: [userId], // 成员id列表
  };
  WebIM.conn.addUsersToChatRoomWhitelist(options).then((res) => {
    console.log('setUserMute success>>>', res);
    sendCmdMsg(MUTE_USER, res.data.user);
    getRoomWhileList(roomId);
  });
};

// 移除个人禁言
export const removeUserMute = (userId) => {
  const roomId = store.getState().propsData.chatroomId;
  let options = {
    chatRoomId: roomId, // 群组id
    userName: userId, // 要移除的成员
  };
  WebIM.conn.rmUsersFromChatRoomWhitelist(options).then((res) => {
    console.log('removeUserMute success>>>', res);
    sendCmdMsg(UNMUTE_USER, res.data.user);
    getRoomWhileList(roomId);
  });
};

// 获取禁言列表
export const getRoomWhileList = (roomId) => {
  const owner = store.getState()?.room.info.owner;
  let options = {
    chatRoomId: roomId, // 聊天室id
  };
  WebIM.conn.getChatRoomWhitelist(options).then((res) => {
    // console.log('getRoomWhileList success>>>', res);
    let newMuteList = [];
    res.data.map((item) => {
      if (item === owner) return;
      return newMuteList.push(item);
    });
    store.dispatch(roomUserMute(newMuteList));
  });
};
// 判断当前登陆账号是否在白名单
export const isChatRoomWhiteUser = (userId) => {
  const roomId = store.getState().propsData.chatroomId;
  let options = {
    chatRoomId: roomId, // 聊天室id
    userName: userId, // 要查询的成员
  };
  WebIM.conn.isChatRoomWhiteUser(options).then((res) => {
    store.dispatch(isUserMute(res.data.white));
    return res.data.white;
  });
};
// 一键禁言
export const setAllmute = (roomId) => {
  let options = {
    chatRoomId: roomId, // 聊天室id
  };
  WebIM.conn.disableSendChatRoomMsg(options).then((res) => {
    sendCmdMsg(SET_ALL_MUTE);
    store.dispatch(roomAllMute(true));
  });
};
// 解除一键禁言
export const removeAllmute = (roomId) => {
  let options = {
    chatRoomId: roomId, // 聊天室id
  };
  WebIM.conn.enableSendChatRoomMsg(options).then((res) => {
    sendCmdMsg(REMOVE_ALL_MUTE);
    store.dispatch(roomAllMute(false));
  });
};
