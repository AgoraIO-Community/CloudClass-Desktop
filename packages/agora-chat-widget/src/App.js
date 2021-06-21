import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import store from './redux/store'
import { roomMessages, roomUserCount, qaMessages, userMute, roomAllMute, extData, roomUsers } from './redux/aciton'
import WebIM, { appkey } from './utils/WebIM';
import LoginIM from './api/login'
import { joinRoom, getRoomInfo, getRoomNotice, getRoomWhileList, getRoomUsers } from './api/chatroom'
import Notice from './components/Notice'
import MessageBox from './components/MessageBox/MessageList'
import { CHAT_TABS_KEYS, ROOM_PAGESIZE } from './components/MessageBox/constants'
import { getPageQuery } from './utils'
import _ from 'lodash'

import './App.css'

const App = function (props) {
  const history = useHistory();
  const isRoomAllMute = useSelector(state => state.isRoomAllMute)
  const iframeData = useSelector(state => state.extData)
  const roomUserList = useSelector(state => state.room.users)
  const [isEditNotice, isEditNoticeChange] = useState(0) // 0 显示公告  1 编辑公告  2 展示更多内容

  const [activeKey, setActiveKey] = useState(CHAT_TABS_KEYS.chat)
  useEffect(() => {
    let im_Data = props.pluginStore.pluginStore;
    let im_Data_Props = _.get(im_Data, 'props', {})
    let im_Data_RoomInfo = _.get(im_Data, 'context.roomInfo', {})
    let im_Data_UserInfo = _.get(im_Data, 'context.localUserInfo', {})
    let new_IM_Data = _.assign(im_Data_Props, im_Data_RoomInfo, im_Data_UserInfo)
    localStorage.setItem('appkey', im_Data_Props.orgName + '#' + im_Data_Props.appName)
    store.dispatch(extData(new_IM_Data));
    LoginIM();
  }, [])

  useEffect(() => {
    if (isRoomAllMute) {
      store.dispatch(roomAllMute(true))
    } else {
      store.dispatch(roomAllMute(false))
    }
  }, [isRoomAllMute])

  WebIM.conn.listen({
    onOpened: () => {
      joinRoom();
      // setTimeout(() => {
      //   history.push(`/chatroom?chatRoomId=${iframeData.chatRoomId}&roomUuid=${iframeData.roomUuid}&roleType=${iframeData.roleType}&userUuid=${iframeData.userUuid}&avatarUrl=${iframeData.avatarUrl}&org=${iframeData.org}&apk=${iframeData.apk}&nickName=${iframeData.nickName}`)
      // }, 500);
    },
    // 文本消息
    onTextMessage: (message) => {
      console.log('onTextMessage', message);
      if (iframeData.chatroomId == message.to) {
        const { ext: { msgtype, asker } } = message
        const { time } = message
        if (msgtype === 0) {
          store.dispatch(roomMessages(message, { showNotice: activeKey !== CHAT_TABS_KEYS.chat, isHistory: false }))
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
            LoginIM();
          },
        };
        WebIM.conn.registerUser(options);
      }
    },
    // 聊天室相关监听
    onPresence: (message) => {
      console.log('type-----', message);
      if (iframeData.chatroomId !== message.gid) {
        return
      }
      const userCount = _.get(store.getState(), 'room.info.affiliations_count')
      switch (message.type) {
        case "memberJoinChatRoomSuccess":
          // getRoomUsers(1, ROOM_PAGESIZE, message.gid);
          store.dispatch(roomUsers({ member: message.from }, 'addMember'))
          let ary = []
          roomUserList.map((v, k) => {
            ary.push(v.member)
          })
          if (!(ary.includes(message.from))) {
            store.dispatch(roomUserCount({ type: 'add', userCount: userCount }))
          }
          break;
        case "leaveChatRoom":
          let num = parseInt((roomUserList.length + ROOM_PAGESIZE - 1) / ROOM_PAGESIZE)
          getRoomUsers(num, ROOM_PAGESIZE, message.gid);
          // 成员数 - 1
          store.dispatch(roomUserCount({ type: 'remove', userCount: userCount }))

          // 移除成员
          store.dispatch(roomUsers({ member: message.from }, 'removeMember'))
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
      if (iframeData.chatroomId == message.to) {
        store.dispatch(roomMessages(message, { showNotice: activeKey !== CHAT_TABS_KEYS.chat, isHistory: false }))
      }
    },
    //  收到图片消息
    onPictureMessage: (message) => {
      console.log('onPictureMessage', message);
      if (iframeData.chatroomId == message.to) {
        store.dispatch(qaMessages(message, message.ext.asker, { showNotice: true, isHistory: false }))
      }
    },
    //  收到CMD消息
    onCmdMessage: (message) => {
      console.log('onCmdMessage', message);
      if (iframeData.chatroomId == message.to) {
        store.dispatch(roomMessages(message, { showNotice: activeKey !== CHAT_TABS_KEYS.chat, isHistory: false }))
      }
    },
  })

  return (
    <div className="app">
      <Notice isEdit={isEditNotice} isEditNoticeChange={isEditNoticeChange} />
      {isEditNotice === 0 && (<MessageBox activeKey={activeKey} setActiveKey={setActiveKey} />)}
    </div >
  );
}
export default App;

