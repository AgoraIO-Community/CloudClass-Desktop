import React, { useEffect, useState,useRef } from 'react';
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import store from './redux/store'
import { isLogin, roomMessages, roomUserCount, qaMessages, userMute, roomAllMute, extData, roomUsers, clearStore, setStateListner, roomAdmins,resetPage } from './redux/aciton'
import WebIM, { initIMSDK } from './utils/WebIM';
import LoginIM from './api/login'
import { joinRoom, getRoomInfo, getRoomNotice, getRoomWhileList, getRoomUsers } from './api/chatroom'
import { getUserInfo, setUserInfo } from './api/userInfo'
import Notice from './components/Notice'
import MessageBox from './components/MessageBox/MessageList'
import { CHAT_TABS_KEYS, ROOM_PAGESIZE } from './components/MessageBox/constants'
import { _onCustomMsg } from './api/message'
import { message } from 'antd'
// import { Loading, Card } from '~ui-kit'
import { getLoginRetryCount, getJoinRetryCount, setLoginRetryCount, setJoinRetryCount } from './api/retryCount'
import _ from 'lodash'

import './App.css'

let Message = message

const App = function (props) {
  const history = useHistory();
  const isRoomAllMute = useSelector(state => state.isRoomAllMute)
  const [isEditNotice, isEditNoticeChange] = useState(0) // 0 显示公告  1 编辑公告  2 展示更多内容
  const activeKey = useSelector(state => state.activeKey)
  const joinRoomState = useSelector(state => state.joinRoomState)



  // 登录、聊天室状态
  useEffect(() => {
    let stateListnerFuc = (loginState, joinRoomState) => {
      if (loginState === 'not_login') {
        if (getLoginRetryCount() < 0) {
          Message.error('登录失败，请刷新重试')
          setTimeout(() => {
            Message.destroy();
          }, 5000);
          return
        }
        setLoginRetryCount(getLoginRetryCount() - 1)
        setTimeout(() => {
          LoginIM();
        }, 1000)
      } else {
        if (joinRoomState === 'join_the_failure') {
          if (getJoinRetryCount() < 0) {
            Message.error('加入聊天室失败，请刷新重试')
            setTimeout(() => {
              Message.destroy();
            }, 5000);
            return
          }
          setJoinRetryCount(getJoinRetryCount() - 1)
          setTimeout(() => {
            joinRoom()
          }, 1000)
        }
        return
      }
    }
    store.dispatch(setStateListner(stateListnerFuc))
  }, [])

  useEffect(() => {
    let im_Data = props.pluginStore.pluginStore;
    let im_Data_Props = _.get(im_Data, 'props', {})
    let im_Data_RoomInfo = _.get(im_Data, 'context.roomInfo', {})
    let im_Data_UserInfo = _.get(im_Data, 'context.localUserInfo', {})
    let new_IM_Data = _.assign(im_Data_Props, im_Data_RoomInfo, im_Data_UserInfo)
    let appkey = im_Data_Props.orgName + '#' + im_Data_Props.appName;
    store.dispatch(extData(new_IM_Data));
    if (im_Data_Props.orgName && im_Data_Props.appName && im_Data_Props.chatroomId) {
      setJoinRetryCount(3);
      setLoginRetryCount(3);
      initIMSDK(appkey)
    } else {
      return Message.error('加入聊天室失败，请刷新重试')
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
  let arr = useRef([]);
  let intervalId;
  const createListen = (new_IM_Data, appkey) => {
    WebIM.conn.listen({
      onOpened: () => {
        const roomId = new_IM_Data?.chatroomId;
        const privateInfo = new_IM_Data?.privateChatRoom
        const enabled = privateInfo?.enabled;
        const privateRoomId = privateInfo?.chatRoomId;
        store.dispatch(isLogin('logined'))
        setUserInfo();
        joinRoom(roomId);
        if (enabled && privateRoomId) {
          joinRoom(privateRoomId);
        }
      },
      onClosed: (err) => {
        console.log('退出', err);
        // store.dispatch(isLogin('not_login'))
        store.dispatch(clearStore({}))
      },
      // 文本消息
      onTextMessage: (message) => {
        console.log('onTextMessage', message);
        // 判断消息是否来自公共聊天室/私聊聊天室
        // message.to 为消息中的 聊天室ID
        if (new_IM_Data.chatroomId === message.to || new_IM_Data.privateChatRoom?.chatRoomId === message.to) {
          const { ext: { msgtype, asker } } = message
          const { time } = message
          if (msgtype === 0) {

            // 触发发送弹幕事件
            document.dispatchEvent(
              new CustomEvent("pushBarrage", {
                detail: {
                  avatarUrl: message.ext.avatarUrl,
                  data: message.sourceMsg
                }
              })
            );

            store.dispatch(roomMessages(message, { showNotice: store.getState().activeKey !== CHAT_TABS_KEYS.chat, isHistory: false }))
          } else if ([1, 2].includes(msgtype)) {
            store.dispatch(qaMessages(message, asker, { showNotice: true, isHistory: false }, time))
          }
        }
      },
      // 异常回调
      onError: (message) => {
        console.log('onError', message);
        if (message.type === 16) {
          return
        }
        const type = JSON.parse(_.get(message, 'data.data')).error_description;
        const resetName = store.getState().extData.userUuid;
        if (message.type === 1 || message.type === 3) {
          if (type === "user not found") {
            let options = {
              username: resetName.toLocaleLowerCase(),
              password: resetName,
              appKey: appkey,
              success: function () {
                LoginIM(appkey);
              },
            };
            WebIM.conn.registerUser(options);
          } else {
            store.dispatch(isLogin('not_login'))
          }
        }
      },
      // 聊天室相关监听
      onPresence: (message) => {
        console.log('onPresence', message);
        // 判断通知是否为公共聊天室通知
        if (new_IM_Data.chatroomId !== message.gid) return
        if (new_IM_Data.privateChatRoom?.chatRoomId === message.gid) return
        const userCount = _.get(store.getState(), 'room.info.affiliations_count')
        const roomUserList = _.get(store.getState(), 'room.users')
        const roomOwner = _.get(store.getState(), 'room.owner');
        const updateAdmins = _.get(store.getState(), 'room.admins');
        switch (message.type) {
          case "memberJoinChatRoomSuccess":
            if (roomOwner === message.from) return
            if (message.from === "系统管理员") return
            // getRoomUsers(1, ROOM_PAGESIZE, message.gid);
            arr.current.push(message.from)
            if(!intervalId) {
              intervalId = setTimeout(() => {
                let users = _.cloneDeep(arr.current);
                arr.current = [];
                getUserInfo(users);
                intervalId = null
              }, 1000);
            }
            
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
            store.dispatch(resetPage(true))
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

            // 触发改变禁言状态事件
            document.dispatchEvent(
              new CustomEvent("im_changeMutedState", {
                detail: {
                  type: 'user',
                  status: false
                }
              })
            )
            break;
          // 增加聊天室白名单成员
          case 'addUserToChatRoomWhiteList':
            getRoomWhileList(message.gid);
            store.dispatch(userMute(true))
            // 触发改变禁言状态事件
            document.dispatchEvent(
              new CustomEvent("im_changeMutedState", {
                detail: {
                  type: 'user',
                  status: true
                }
              })
            )
            break;
          case 'addAdmin':
            if (!(updateAdmins.includes(message.to))) {
              store.dispatch(roomAdmins(message.to, 'addAdmin'))
            }
            break
          case 'removeAdmin':
            store.dispatch(roomAdmins(message.to, 'removeAdmin'))
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
        store.getState().customMsg?.receiveCallback(message)
      },
      //  收到图片消息
      onPictureMessage: (message) => {
        console.log('onPictureMessage', message);
        if (new_IM_Data.chatroomId == message.to || new_IM_Data.privateChatRoom?.chatRoomId === message.to) {
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
    <>
      {joinRoomState === 'join_the_success'
        && <div className="app">
          <Notice isEdit={isEditNotice} isEditNoticeChange={isEditNoticeChange} />
          {isEditNotice === 0 && (<MessageBox activeKey={activeKey} />)}
        </div>
        // <div>
        //   <Card width={90} height={90}>
        //     <Loading></Loading>
        //   </Card>
        // </div>
      }
    </>

  );
}
export default App;

