import React, { useEffect, useState } from 'react';
import i18n from 'i18next';
import { useSelector } from 'react-redux';
import WebIM, { initIMSDK } from './utils/WebIM';
import store from './redux/store';
import { transI18n } from '~ui-kit';
import { propsAction, isShowChat } from './redux/actions/propsAction';
import { statusAction, clearStore } from './redux/actions/userAction';
import { messageAction, showRedNotification } from './redux/actions/messageAction';
import { roomAllMute, roomUsers, isUserMute, announcementNotice } from './redux/actions/roomAction';
import { loginIM } from './api/login';
import { setUserInfo, getUserInfo } from './api/userInfo';
import { joinRoom, getAnnouncement } from './api/chatroom';
import { getRoomWhileList } from './api/mute';
import _ from 'lodash';
import { Chat } from './components/Chat';
import { message } from 'antd';
import { ROOM_TYPE, CHAT_TABS_KEYS } from './contants';
import showChat_icon from './themes/img/chat.png';
import im_CN from './locales/zh_CN';
import im_US from './locales/en_US';
import './App.css';
import 'antd/dist/antd.css';
const App = function (props) {
  // 白板全屏状态下，控制IMChat
  const { isFullScreen } = props.pluginStore.globalContext;
  const state = useSelector((state) => state);
  const showChat = state?.showChat;
  const showRed = state?.showRed;
  const showAnnouncementNotice = state?.showAnnouncementNotice;
  const isSmallClass = state?.propsData?.roomType === ROOM_TYPE.smallClass;
  i18n.addResourceBundle('zh', 'translation', im_CN);
  i18n.addResourceBundle('en', 'translation', im_US);

  useEffect(() => {
    let im_Data = props.pluginStore;
    let im_Data_Props = _.get(im_Data, 'props', '');
    let im_Data_RoomInfo = _.get(im_Data, 'context.roomInfo', '');
    let im_Data_UserInfo = _.get(im_Data, 'context.localUserInfo', '');
    let new_IM_Data = _.assign(im_Data_Props, im_Data_RoomInfo, im_Data_UserInfo);
    let appkey = im_Data_Props.orgName + '#' + im_Data_Props.appName;
    store.dispatch(propsAction(new_IM_Data));
    if (appkey) {
      initIMSDK(appkey);
    }
    createListen(new_IM_Data, appkey);
    loginIM(appkey);
  }, []);

  // 最小化窗口设置
  const onChangeModal = () => {
    store.dispatch(isShowChat(true));
    store.dispatch(showRedNotification(false));
  };

  let arr = [];
  let intervalId;
  const createListen = (new_IM_Data, appkey) => {
    WebIM.conn.listen({
      onOpened: () => {
        console.log('onOpened>>>');
        store.dispatch(statusAction(true));
        message.success(transI18n('chat.login_success'));
        setUserInfo();
        joinRoom();
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
        const type = JSON.parse(_.get(err, 'data.data')).error_description;
        const resetName = store.getState().propsData.userUuid;
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
          store.dispatch(messageAction(message, { isHistory: false }));
          const showChat = store.getState().showChat;
          const isShowRed = store.getState().isTabKey !== CHAT_TABS_KEYS.chat;
          store.dispatch(showRedNotification(isShowRed));
          if (!showChat) {
            store.dispatch(showRedNotification(true));
          }
        }
      },
      onCmdMessage: (message) => {
        console.log('onCmdMessaeg>>>', message);
        if (new_IM_Data.chatroomId === message.to) {
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
        if (new_IM_Data.chatroomId !== message.gid) {
          return;
        }
        const roomUserList = _.get(store.getState(), 'room.roomUsers');
        const showChat = store.getState().showChat;
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
              store.dispatch(roomUsers(message.from, 'addMember'));
            }
            break;
          case 'leaveChatRoom':
            // 成员数 - 1
            // 移除成员
            store.dispatch(roomUsers(message.from, 'removeMember'));
            break;
          case 'updateAnnouncement':
            getAnnouncement(message.gid);
            store.dispatch(announcementNotice(activeTabKey));
            if (!showChat) {
              store.dispatch(showRedNotification(true));
            }
            break;
          case 'deleteAnnouncement':
            getAnnouncement(message.gid);
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
            getRoomWhileList(message.gid);
            store.dispatch(isUserMute(false));
            break;
          // 增加聊天室白名单成员
          case 'addUserToChatRoomWhiteList':
            getRoomWhileList(message.gid);
            store.dispatch(isUserMute(true));
            break;
          default:
            break;
        }
      },
    });
  };

  return (
    <div>
      {showChat ? (
        isSmallClass ? (
          <div
            className="app"
            style={{
              width: isFullScreen ? '300px' : '340px',
              display: isFullScreen ? 'none' : 'block',
            }}>
            <Chat />
          </div>
        ) : (
          <div className="app" style={{ width: '300px', display: isFullScreen ? 'none' : 'block' }}>
            <Chat />
          </div>
        )
      ) : (
        <div className="chat">
          <div
            className="show-chat-icon"
            onClick={() => {
              // 展开聊天
              onChangeModal();
            }}>
            <img src={showChat_icon} />
            {(showRed || showAnnouncementNotice) && <div className="chat-notice"></div>}
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
