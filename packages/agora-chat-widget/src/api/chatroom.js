import WebIM from '../utils/WebIM';
import { message } from 'antd';
import store from '../redux/store';
import {
  roomInfo,
  roomUsers,
  roomAnnouncement,
  roomAllMute,
  announcementStatus,
} from '../redux/actions/roomAction';
import { transI18n } from '~ui-kit';
import { JOIN_ROOM_SUCCESS, ROLE } from '../contants';
import { getUserInfo } from './userInfo';
import { getHistoryMessages } from './historyMsg';
import { getRoomWhileList, isChatRoomWhiteUser } from './mute';

// 加入聊天室
export const joinRoom = async () => {
  const roomId = store.getState().propsData.chatroomId;
  const userUuid = store.getState().propsData.userUuid;
  const roleType = store.getState().propsData.roleType;
  let options = {
    roomId: roomId, // 聊天室id
    message: 'reason', // 原因（可选参数）
  };
  WebIM.conn.mr_cache = [];
  setTimeout(() => {
    WebIM.conn.joinChatRoom(options).then((res) => {
      message.success(transI18n('chat.join_room_success'));
      getRoomInfo(options.roomId);
      if (roleType === ROLE.student.id) {
        setTimeout(() => {
          isChatRoomWhiteUser(userUuid);
        }, 300);
      }
      getHistoryMessages(roomId);
    });
  }, 500);
};

// 获取聊天室详情
export const getRoomInfo = (roomId) => {
  let options = {
    chatRoomId: roomId, // 聊天室id
  };
  WebIM.conn.getChatRoomDetails(options).then((res) => {
    store.dispatch(roomInfo(res.data[0]));
    // 将成员存到 store
    let newArr = [];
    res.data[0].affiliations.map((item) => {
      if (item.owner) {
        return;
      } else {
        newArr.push(item.member);
      }
    });
    store.dispatch(roomUsers(newArr));
    // 判断是否全局禁言
    if (res.data[0].mute) {
      store.dispatch(roomAllMute(true));
    }
    getUserInfo(newArr);
    getAnnouncement(roomId);
    getRoomWhileList(roomId);
  });
};

// 获取群组公告
export const getAnnouncement = (roomId) => {
  let options = {
    roomId, // 聊天室id
  };
  WebIM.conn.fetchChatRoomAnnouncement(options).then((res) => {
    store.dispatch(roomAnnouncement(res.data.announcement));
  });
};

// 上传/修改 群组公告
export const updateAnnouncement = (roomId, noticeCentent, callback) => {
  if (noticeCentent.length > 500) {
    return message.error(transI18n('chat.announcement_content'));
  }
  let options = {
    roomId: roomId, // 聊天室id
    announcement: noticeCentent, // 公告内容
  };
  WebIM.conn.updateChatRoomAnnouncement(options).then((res) => {
    getAnnouncement(res.data.id);
    store.dispatch(announcementStatus(true));
    callback && callback();
  });
};

// 退出聊天室
export const logoutChatroom = () => {
  const roomId = store.getState().propsData.chatroomId;
  WebIM.conn.quitChatRoom({
    roomId: roomId, // 聊天室id
    success: function (res) {
      console.log('quitChatRoom_Success>>>', res);
      WebIM.conn.close();
    },
    error: function (err) {
      console.log('quitChatRoom_Error>>>', err);
      WebIM.conn.close();
    },
  });
};
