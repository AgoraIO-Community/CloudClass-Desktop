import WebIM from '../utils/WebIM';
import { roomAllMute, roomUserMute, isUserMute } from '../redux/actions/roomAction';
import { SET_ALL_MUTE, REMOVE_ALL_MUTE, MUTE_USER, UNMUTE_USER, MUTE_CONFIG } from '../contants';
import axios from 'axios';

/*
    为保证单人禁言后，重新进入也是禁言状态，使用白名单代替禁言
    一键禁言，使用正确的api
*/

export class MuteAPI {
  store = null;
  messageAPI = null;
  constructor(store, messageAPI) {
    this.store = store;
    this.messageAPI = messageAPI;
  }

  // 获取当前登陆用户禁言状态
  getCurrentUserStatus = async () => {
    const { host, appId, roomUuid, userUuid } = this.store.getState().agoraTokenConfig;
    const url = `${host}/edu/apps/${appId}/v2/rooms/${roomUuid}/users/${userUuid}`;
    try {
      const resp = await axios
        .get(url);
      const { userProperties } = resp.data.data;
      if (userProperties?.flexProps?.mute) {
        this.store.dispatch(isUserMute(true));
      }
    } catch (err) {
      console.log('err>>>', err);
    }
  }


  // 禁言后，设置 properties
  setUserProperties = () => {
    const { host, appId, roomUuid, userUuid } = this.store.getState().agoraTokenConfig;
    const url = `${host}/edu/apps/${appId}/v2/rooms/${roomUuid}/users/properties/batch`;
    const requestData = {
      users: [{
        userUuid,
        properties: {
          mute: MUTE_CONFIG.mute
        },
        cause: {
          mute: MUTE_USER
        }
      }]
    };
    axios({
      method: 'put',
      url: url,
      headers: {
        "Content-Type": "application/json"
      },
      data: requestData
    })
  }

  // 解除禁言后，删除 properties
  removeUserProperties = () => {
    const { host, appId, roomUuid, userUuid } = this.store.getState().agoraTokenConfig;
    const url = `${host}/edu/apps/${appId}/v2/rooms/${roomUuid}/users/properties/batch`;
    const requestData = {
      users: [{
        userUuid,
        properties: ["mute"],
        cause: {
          "mute": UNMUTE_USER
        }
      }]
    };
    axios({
      method: 'delete',
      url: url,
      headers: {
        "Content-Type": "application/json"
      },
      data: requestData
    })
  }

  // 学生登陆成功后，检查自己是否被禁言，`true`， 调用此接口禁言
  muteCurrentUser = () => {
    const { host, appId, roomUuid, userUuid } = this.store.getState().agoraTokenConfig;
    const url = `${host}/edu/apps/${appId}/v2/rooms/${roomUuid}/widgets/easemobIM/users/${userUuid}/mute`;
    const requestData = {
      duration: -1
    };
    axios({
      method: 'put',
      url: url,
      headers: {
        "Content-Type": "application/json"
      },
      data: requestData
    })
  }

  // 单人禁言
  setUserMute = (userId) => {
    const roomId = this.store.getState().propsData.chatRoomId;
    let options = {
      chatRoomId: roomId, // 聊天室id
      username: userId, // 成员id列表
      muteDuration: -1,
    };
    WebIM.conn.muteChatRoomMember(options).then((res) => {
      console.log('setUserMute success>>>', res);
      this.messageAPI.sendCmdMsg(MUTE_USER, res.data[0]?.user);
      this.getChatRoomMuteList(roomId);
    });
  };

  // 移除个人禁言
  removeUserMute = (userId) => {
    const roomId = this.store.getState().propsData.chatRoomId;
    let options = {
      chatRoomId: roomId, // 群组id
      username: userId, // 要移除的成员
    };
    WebIM.conn.unmuteChatRoomMember(options).then((res) => {
      console.log('removeUserMute success>>>', res);
      this.messageAPI.sendCmdMsg(UNMUTE_USER, res.data[0]?.user);
      this.getChatRoomMuteList(roomId);
    });
  };

  // 获取禁言列表
  getChatRoomMuteList = (roomId) => {
    const owner = this.store.getState()?.room.info.owner;
    let options = {
      chatRoomId: roomId, // 聊天室id
    };
    WebIM.conn.getChatRoomMuteList(options).then((res) => {
      console.log('getChatRoomMuteList success>>>', res);
      let newMuteList = [];
      res.data.map((item) => {
        if (item.user === owner) return;
        return newMuteList.push(item.user);
      });
      this.store.dispatch(roomUserMute(newMuteList));
    });
  };
  // 判断当前登陆账号是否在白名单
  isChatRoomWhiteUser = (userId) => {
    const roomId = this.store.getState().propsData.chatRoomId;
    let options = {
      chatRoomId: roomId, // 聊天室id
      userName: userId, // 要查询的成员
    };
    WebIM.conn.isChatRoomWhiteUser(options).then((res) => {
      this.store.dispatch(isUserMute(res.data.white));
      return res.data.white;
    });
  };
  // 一键禁言
  setAllmute = (roomId) => {
    let options = {
      chatRoomId: roomId, // 聊天室id
    };
    WebIM.conn.disableSendChatRoomMsg(options).then((res) => {
      this.messageAPI.sendCmdMsg(SET_ALL_MUTE);
      this.store.dispatch(roomAllMute(true));
    });
  };
  // 解除一键禁言
  removeAllmute = (roomId) => {
    let options = {
      chatRoomId: roomId, // 聊天室id
    };
    WebIM.conn.enableSendChatRoomMsg(options).then((res) => {
      this.messageAPI.sendCmdMsg(REMOVE_ALL_MUTE);
      this.store.dispatch(roomAllMute(false));
    });
  };
}