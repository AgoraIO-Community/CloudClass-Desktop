import { transI18n } from '~components/i18n';
import { statusAction, clearStore } from '../redux/actions/userAction';
import { messageAction, showRedNotification } from '../redux/actions/messageAction';
import {
  roomAllMute,
  roomUsers,
  isUserMute,
  announcementNotice,
} from '../redux/actions/roomAction';
import _ from 'lodash';
import { message } from 'antd';
import { CHAT_TABS_KEYS } from '../contants';
import WebIM from './WebIM';
import { ROLE } from '../contants'

export const createListener = (store) => {
  let arr = [];
  let intervalId;

  const createListen = (new_IM_Data, appkey) => {
    const { apis } = store.getState();
    WebIM.conn.listen({
      onOpened: () => {
        console.log('onOpened>>>');
        store.dispatch(statusAction(true));
        // message.success(transI18n('chat.login_success'));
        apis.userInfoAPI.setUserInfo(new_IM_Data);
        apis.chatRoomAPI.joinRoom(new_IM_Data);
      },
      onClosed: () => {
        console.log('onClosed>>>');
        store.dispatch(statusAction(false));
        store.dispatch(clearStore({}));
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
      },
      onTextMessage: (message) => {
        console.log('onTextMessage>>>', message);
        if (new_IM_Data.chatRoomId === message.to) {
          const newMessage = apis.messageAPI.convertCustomMessage(message);
          store.dispatch(messageAction(newMessage, { isHistory: false }));
          const showChat = store.getState().showChat;
          const isShowRed = store.getState().isTabKey !== CHAT_TABS_KEYS.chat;
          store.dispatch(showRedNotification(isShowRed));
          if (!showChat) {
            store.dispatch(showRedNotification(true));
          }
        }
      },
      onPictureMessage: (message) => {
        console.log('onPictureMessage>>>', message);
        if (new_IM_Data.chatRoomId === message.to) {
          const showChat = store.getState().showChat;
          const isShowRed = store.getState().isTabKey !== CHAT_TABS_KEYS.chat;
          store.dispatch(showRedNotification(isShowRed));
          store.dispatch(messageAction(message, { isHistory: false }));
          if (!showChat) {
            store.dispatch(showRedNotification(true));
          }
        }
      },
      onCmdMessage: (message) => {
        console.log('onCmdMessaeg>>>', message);
        if (new_IM_Data.chatRoomId === message.to) {
          store.dispatch(
            messageAction(message, {
              showNotice: store.getState().isTabKey !== CHAT_TABS_KEYS.chat,
              isHistory: false,
            }),
          );
          const showChat = store.getState().showChat;
          const isShowRed = store.getState().isTabKey !== CHAT_TABS_KEYS.chat;
          store.dispatch(showRedNotification(isShowRed));
          if (!showChat) {
            store.dispatch(showRedNotification(true));
          }
        }
      },
      onPresence: (message) => {
        console.log('onPresence>>>', message);
        const activeTabKey = store.getState().isTabKey !== CHAT_TABS_KEYS.notice;
        const roleType = store.getState().propsData?.roleType
        const isAdmins = roleType === ROLE.teacher.id || roleType === ROLE.assistant.id
        if (new_IM_Data.chatRoomId !== message.gid) return;
        const roomUserList = _.get(store.getState(), 'room.roomUsers');
        const showChat = store.getState().showChat;
        switch (message.type) {
          case 'memberJoinChatRoomSuccess':
            if (!isAdmins) return
            if (message.from === '系统管理员') return;
            arr.push(message.from);
            intervalId && clearInterval(intervalId);
            intervalId = setTimeout(() => {
              let users = _.cloneDeep(arr);
              arr = [];
              apis.userInfoAPI.getUserInfo({ member: users });
            }, 500);
            let ary = [];
            roomUserList.map((v, k) => {
              ary.push(v);
            });
            if (!ary.includes(message.from)) {
              store.dispatch(roomUsers(message.from, 'addMember'));
            }
            break;
          case 'leaveChatRoom':
            // 成员数 - 1
            // 移除成员
            store.dispatch(roomUsers(message.from, 'removeMember'));
            break;
          case 'updateAnnouncement':
            apis.chatRoomAPI.getAnnouncement(message.gid);
            store.dispatch(announcementNotice(activeTabKey));
            if (!showChat) {
              store.dispatch(showRedNotification(true));
            }
            break;
          case 'deleteAnnouncement':
            apis.chatRoomAPI.getAnnouncement(message.gid);
            store.dispatch(announcementNotice(activeTabKey));
            if (!showChat) {
              store.dispatch(showRedNotification(true));
            }
            break;
          case 'muteChatRoom':
            store.dispatch(roomAllMute(true));
            break;
          case 'rmChatRoomMute':
            store.dispatch(roomAllMute(false));
            break;
          // 删除聊天室白名单成员
          case 'rmUserFromChatRoomWhiteList':
            apis.muteAPI.getRoomWhileList(message.gid);
            store.dispatch(isUserMute(false));
            break;
          // 增加聊天室白名单成员
          case 'addUserToChatRoomWhiteList':
            apis.muteAPI.getRoomWhileList(message.gid);
            store.dispatch(isUserMute(true));
            break;
          default:
            break;
        }
      },
      onPresenceStatusChange: (message) => {
        // 移除成员  
        message.forEach(item => {
          if (!item.statusDetails.length) {
            store.dispatch(roomUsers(item.userId, 'removeMember'));
          }
        });
      }
    });
  };

  return { createListen };
};
