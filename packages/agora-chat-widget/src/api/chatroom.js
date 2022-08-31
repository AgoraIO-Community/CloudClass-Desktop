import { message } from 'antd';
import { transI18n } from '~components/i18n';
import { ROLE } from '../contants';
import {
  announcementStatus,
  roomAllMute,
  roomAnnouncement,
  roomInfo,
  roomUsers,
} from '../redux/actions/roomAction';
import WebIM from '../utils/WebIM';
export class ChatRoomAPI {
  store = null;
  chatHistoryAPI = null;
  muteAPI = null;
  userInfoAPI = null;
  presenceAPI = null;
  constructor(store, chatHistoryAPI, muteAPI, userInfoAPI, presenceAPI) {
    this.store = store;
    this.chatHistoryAPI = chatHistoryAPI;
    this.muteAPI = muteAPI;
    this.userInfoAPI = userInfoAPI;
    this.presenceAPI = presenceAPI;
  }

  // 加入聊天室
  joinRoom = async ({ chatRoomId: roomId, userUuid, roleType }) => {
    let options = {
      roomId: roomId, // 聊天室id
      message: 'reason', // 原因（可选参数）
    };
    WebIM.conn.mr_cache = [];

    WebIM.conn.joinChatRoom(options).then((res) => {
      // message.success(transI18n('chat.join_room_success'));
      this.getRoomInfo(options.roomId);
      if (roleType === ROLE.student.id) {
        this.muteAPI.isChatRoomWhiteUser(userUuid);
      }
      if (roleType === ROLE.teacher.id || roleType === ROLE.assistant.id) {
        this.getRoomsAdmin(roomId);
      }
      this.chatHistoryAPI.getHistoryMessages(roomId);
    });
  };

  // 获取聊天室详情
  getRoomInfo = (roomId) => {
    let options = {
      chatRoomId: roomId, // 聊天室id
    };
    WebIM.conn
      .getChatRoomDetails(options)
      .then((res) => {
        this.store.dispatch(roomInfo(res.data[0]));
        // 将成员存到 store
        let newArr = [];
        res.data[0].affiliations.map((item) => {
          if (item.owner) {
            return;
          } else {
            newArr.push(item.member);
          }
        });
        this.store.dispatch(roomUsers(newArr));
        // 判断是否全局禁言
        if (res.data[0].mute) {
          this.store.dispatch(roomAllMute(true));
        }
        this.userInfoAPI.getUserInfo({ member: newArr });
        this.getAnnouncement(roomId);
        this.muteAPI.getRoomWhileList(roomId);
      })
      .catch((err) => {
        message.error(transI18n('get_room_info'));
        console.log('getRoomInfo>>>', err);
      });
  };

  // 获取群管理员
  getRoomsAdmin = roomId => {
    let option = {
      chatRoomId: roomId
    };
    WebIM.conn.getChatRoomAdmin(option).then((res) => {
      const { data } = res;
      const currentLoginUser = WebIM.conn.context.userId;
      const admins = data.filter(item => item !== currentLoginUser)
      this.presenceAPI.subscribePresence(admins)
    })
  }

  // 获取群组公告
  getAnnouncement = (roomId) => {
    let options = {
      roomId, // 聊天室id
    };
    WebIM.conn
      .fetchChatRoomAnnouncement(options)
      .then((res) => {
        this.store.dispatch(roomAnnouncement(res.data.announcement));
      })
      .catch((err) => {
        message.error(transI18n('chat.get_room_announcement'));
        console.log('getAnnouncement>>>', err);
      });
  };

  // 上传/修改 群组公告
  updateAnnouncement = (roomId, noticeCentent, callback) => {
    if (noticeCentent.length > 500) {
      return message.error(transI18n('chat.announcement_content'));
    }
    let options = {
      roomId: roomId, // 聊天室id
      announcement: noticeCentent, // 公告内容
    };
    WebIM.conn
      .updateChatRoomAnnouncement(options)
      .then((res) => {
        this.getAnnouncement(res.data.id);
        this.store.dispatch(announcementStatus(true));
        callback && callback();
      })
      .catch((err) => {
        message.error(transI18n('chat.update_room_announcement'));
        console.log('updateAnnouncement>>>', err);
      });
  };

  // 退出聊天室
  logoutChatroom = () => {
    const roomId = this.store.getState().propsData.chatRoomId;
    if (!WebIM.conn) {
      return;
    }
    if (WebIM.conn.token) {
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
    }
  };
}
