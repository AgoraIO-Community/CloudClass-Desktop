import { ref } from '../redux/store';
import { transI18n } from '~ui-kit';
import { statusAction, clearStore } from '../redux/actions/userAction';
import { messageAction, showRedNotification } from '../redux/actions/messageAction';
import {
  roomAllMute,
  roomUsers,
  isUserMute,
  announcementNotice,
} from '../redux/actions/roomAction';
import { loginIM } from '../api/login';
import { setUserInfo, getUserInfo } from '../api/userInfo';
import { joinRoom, getAnnouncement } from '../api/chatroom';
import { getRoomWhileList } from '../api/mute';
import _ from 'lodash';
import { message } from 'antd';
import { CHAT_TABS_KEYS } from '../contants';
import WebIM from './WebIM';

export const createListener = () => {
  let arr = [];
  let intervalId;
  const createListen = (new_IM_Data, appkey) => {
    WebIM.conn.listen({
      onOpened: () => {
        console.log('onOpened>>>');
        ref.store.dispatch(statusAction(true));
        message.success(transI18n('chat.login_success'));
        setUserInfo();
        joinRoom();
      },
      onClosed: () => {
        console.log('onClosed>>>');
        ref.store.dispatch(statusAction(false));
        ref.store.dispatch(clearStore({}));
      },
      onOnline: (network) => {
        console.log('onOnline>>>', network);
      },
      onOffline: (network) => {
        console.log('onOffline>>>', network);
      },
      onError: (err) => {
        console.log('onError>>>', err);
        if (err.type === 16) {
          return message.error(transI18n('chat.login_again'));
        }
        if (err.type === 604) return;
        const type = JSON.parse(_.get(err, 'data.data')).error_description;
        const resetName = ref.store.getState().propsData.userUuid;
        if (type === 'user not found') {
          let options = {
            username: resetName.toLocaleLowerCase(),
            password: resetName,
            appKey: appkey,
            success: function () {
              loginIM(appkey);
            },
          };
          WebIM.conn.registerUser(options);
        }
      },
      onTextMessage: (message) => {
        console.log('onTextMessage>>>', message);
        if (new_IM_Data.chatroomId === message.to) {
          ref.store.dispatch(messageAction(message, { isHistory: false }));
          const showChat = ref.store.getState().showChat;
          const isShowRed = ref.store.getState().isTabKey !== CHAT_TABS_KEYS.chat;
          ref.store.dispatch(showRedNotification(isShowRed));
          if (!showChat) {
            ref.store.dispatch(showRedNotification(true));
          }
        }
      },
      onCmdMessage: (message) => {
        console.log('onCmdMessaeg>>>', message);
        if (new_IM_Data.chatroomId === message.to) {
          ref.store.dispatch(
            messageAction(message, {
              showNotice: ref.store.getState().isTabKey !== CHAT_TABS_KEYS.chat,
              isHistory: false,
            }),
          );
          const showChat = ref.store.getState().showChat;
          const isShowRed = ref.store.getState().isTabKey !== CHAT_TABS_KEYS.chat;
          ref.store.dispatch(showRedNotification(isShowRed));
          if (!showChat) {
            ref.store.dispatch(showRedNotification(true));
          }
        }
      },
      onPresence: (message) => {
        console.log('onPresence>>>', message);
        const activeTabKey = ref.store.getState().isTabKey !== CHAT_TABS_KEYS.notice;
        if (new_IM_Data.chatroomId !== message.gid) {
          return;
        }
        const roomUserList = _.get(ref.store.getState(), 'room.roomUsers');
        const showChat = ref.store.getState().showChat;
        switch (message.type) {
          case 'memberJoinChatRoomSuccess':
            if (message.from === '系统管理员') return;
            arr.push(message.from);
            intervalId && clearInterval(intervalId);
            intervalId = setTimeout(() => {
              let users = _.cloneDeep(arr);
              arr = [];
              getUserInfo(users);
            }, 500);
            let ary = [];
            roomUserList.map((v, k) => {
              ary.push(v);
            });
            if (!ary.includes(message.from)) {
              ref.store.dispatch(roomUsers(message.from, 'addMember'));
            }
            break;
          case 'leaveChatRoom':
            // 成员数 - 1
            // 移除成员
            ref.store.dispatch(roomUsers(message.from, 'removeMember'));
            break;
          case 'updateAnnouncement':
            getAnnouncement(message.gid);
            ref.store.dispatch(announcementNotice(activeTabKey));
            if (!showChat) {
              ref.store.dispatch(showRedNotification(true));
            }
            break;
          case 'deleteAnnouncement':
            getAnnouncement(message.gid);
            ref.store.dispatch(announcementNotice(activeTabKey));
            if (!showChat) {
              ref.store.dispatch(showRedNotification(true));
            }
            break;
          case 'muteChatRoom':
            ref.store.dispatch(roomAllMute(true));
            break;
          case 'rmChatRoomMute':
            ref.store.dispatch(roomAllMute(false));
            break;
          // 删除聊天室白名单成员
          case 'rmUserFromChatRoomWhiteList':
            getRoomWhileList(message.gid);
            ref.store.dispatch(isUserMute(false));
            break;
          // 增加聊天室白名单成员
          case 'addUserToChatRoomWhiteList':
            getRoomWhileList(message.gid);
            ref.store.dispatch(isUserMute(true));
            break;
          default:
            break;
        }
      },
    });
  };

  return { createListen };
};
