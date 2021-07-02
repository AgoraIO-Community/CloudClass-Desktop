import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import store from './redux/store'
import { isLogin, roomMessages, roomUserCount, qaMessages, userMute, roomAllMute, extData, roomUsers, clearStore } from './redux/aciton'
import WebIM, { initIMSDK } from './utils/WebIM';
import LoginIM from './api/login'
import { joinRoom, getRoomInfo, getRoomNotice, getRoomWhileList, getRoomUsers } from './api/chatroom'
import { getUserInfo } from './api/userInfo'
import Notice from './components/Notice'
import MessageBox from './components/MessageBox/MessageList'
import { CHAT_TABS_KEYS, ROOM_PAGESIZE } from './components/MessageBox/constants'
import { getPageQuery } from './utils'
import _ from 'lodash'

import './App.css'

const App = function (props) {
  const history = useHistory();
  const isRoomAllMute = useSelector(state => state.isRoomAllMute)
  const [isEditNotice, isEditNoticeChange] = useState(0) // 0 显示公告  1 编辑公告  2 展示更多内容
  const activeKey = useSelector(state => state.activeKey)

  useEffect(() => {
    let im_Data = props.pluginStore.pluginStore;
    let im_Data_Props = _.get(im_Data, 'props', {})
    let im_Data_RoomInfo = _.get(im_Data, 'context.roomInfo', {})
    let im_Data_UserInfo = _.get(im_Data, 'context.localUserInfo', {})
    let new_IM_Data = _.assign(im_Data_Props, im_Data_RoomInfo, im_Data_UserInfo)
    let appkey = im_Data_Props.orgName + '#' + im_Data_Props.appName;
    store.dispatch(extData(new_IM_Data));
    if (appkey) {
      initIMSDK(appkey)
    }
    createListen(new_IM_Data, appkey)
    LoginIM(appkey);
  }, [])


  useEffect(() => {
    if (isRoomAllMute) {
      store.dispatch(roomAllMute(true))
    } else {
      store.dispatch(roomAllMute(false))
    }
  }, [isRoomAllMute])
  let arr = []
  let intervalId;
  const createListen = (new_IM_Data, appkey) => {
    WebIM.conn.listen({
      onOpened: () => {
        store.dispatch(isLogin(true))
        joinRoom();
      },
      onClosed: (err) => {
        console.log('退出', err);
        store.dispatch(isLogin(false))
        store.dispatch(clearStore({}))
      },
      // 文本消息
      onTextMessage: (message) => {
        console.log('onTextMessage', message);
        if (new_IM_Data.chatroomId == message.to) {
          const { ext: { msgtype, asker } } = message
          const { time } = message
          if (msgtype === 0) {
            store.dispatch(roomMessages(message, { showNotice: store.getState().activeKey !== CHAT_TABS_KEYS.chat, isHistory: false }))
          } else if ([1, 2].includes(msgtype)) {
            store.dispatch(qaMessages(message, asker, { showNotice: true, isHistory: false }, time))
          }
        }

      },
      // 异常回调
      onError: (message) => {
        console.log('onError', message);
        const type = JSON.parse(_.get(message, 'data.data')).error_description;
        const resetName = store.getState().extData.userUuid;
        if (message.type === '16') {
          return
        } else if (type === "user not found") {
          let options = {
            username: resetName.toLocaleLowerCase(),
            password: resetName,
            appKey: appkey,
            success: function () {
              LoginIM(appkey);
            },
          };
          WebIM.conn.registerUser(options);
        }
      },
      // 聊天室相关监听
      onPresence: (message) => {
        console.log('type-----', message);
        if (new_IM_Data.chatroomId !== message.gid) {
          return
        }
        const userCount = _.get(store.getState(), 'room.info.affiliations_count')
        const roomUserList = _.get(store.getState(), 'room.users')
        switch (message.type) {
          case "memberJoinChatRoomSuccess":
            // getRoomUsers(1, ROOM_PAGESIZE, message.gid);
            arr.push(message.from)
            intervalId && clearInterval(intervalId);
            intervalId = setTimeout(() => {
              let users = _.cloneDeep(arr);
              arr = [];
              getUserInfo(users)
            }, 500);


            let ary = []
            roomUserList.map((v, k) => {
              ary.push(v)
            })
            if (!(ary.includes(message.from))) {
              store.dispatch(roomUsers(message.from, 'addMember'))
              store.dispatch(roomUserCount({ type: 'add', userCount: userCount }))
            }
            break;
          case "leaveChatRoom":
            let num = parseInt((roomUserList.length + ROOM_PAGESIZE - 1) / ROOM_PAGESIZE)
            // 成员数 - 1
            store.dispatch(roomUserCount({ type: 'remove', userCount: userCount }))

            // 移除成员
            store.dispatch(roomUsers(message.from, 'removeMember'))
            break;
          case "updateAnnouncement":
            getRoomNotice(message.gid)
            break;
          case 'muteChatRoom':
            getRoomInfo(message.gid);
            break;
          case 'rmChatRoomMute':
            getRoomInfo(message.gid);
            break;
          // 删除聊天室白名单成员
          case 'rmUserFromChatRoomWhiteList':
            getRoomWhileList(message.gid);
            store.dispatch(userMute(false))
            break;
          // 增加聊天室白名单成员
          case 'addUserToChatRoomWhiteList':
            getRoomWhileList(message.gid);
            store.dispatch(userMute(true))
            break;
          default:
            break;
        }
      },
      //  收到自定义消息
      onCustomMessage: (message) => {
        console.log('CUSTOM--', message);
        if (new_IM_Data.chatroomId == message.to) {
          store.dispatch(roomMessages(message, { showNotice: activeKey !== CHAT_TABS_KEYS.chat, isHistory: false }))
        }
      },
      //  收到图片消息
      onPictureMessage: (message) => {
        console.log('onPictureMessage', message);
        if (new_IM_Data.chatroomId == message.to) {
          store.dispatch(qaMessages(message, message.ext.asker, { showNotice: true, isHistory: false }))
        }
      },
      //  收到CMD消息
      onCmdMessage: (message) => {
        console.log('onCmdMessage', message);
        if (new_IM_Data.chatroomId == message.to) {
          store.dispatch(roomMessages(message, { showNotice: store.getState().activeKey !== CHAT_TABS_KEYS.chat, isHistory: false }))
        }
      },
    })
  }

  return (
    <div className="app">
      <Notice isEdit={isEditNotice} isEditNoticeChange={isEditNoticeChange} />
      {isEditNotice === 0 && (<MessageBox activeKey={activeKey} />)}
    </div >
  );
}
export default App;

