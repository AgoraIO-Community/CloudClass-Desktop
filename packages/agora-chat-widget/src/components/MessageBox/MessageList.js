import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Tabs } from 'antd';
import { Text, Flex } from 'rebass'
import _ from 'lodash'
import WebIM from "../../utils/WebIM";
import ToolBar from '../ToolBar'
import MessageItem from './Message/index'
import QuestionMessage from './QaList/QuestionMessage'
import { CHAT_TABS, CHAT_TABS_KEYS, HISTORY_COUNT } from './constants'
import store from '../../redux/store'
import { roomMessages, qaMessages, removeChatNotification, isTabs } from '../../redux/aciton'
import { getHistoryMessages } from '../../api/historyMessages'
import scrollElementToBottom from '../../utils/scrollElementToBottom'


import './list.css'

const { TabPane } = Tabs;

// 列表项
const MessageList = ({ activeKey }) => {
  // 控制 Toolbar 组件是否展示
  const [hide, sethide] = useState(true);
  // 控制 Toolbar 组件是否展示图片 
  const [isTool, setIsTool] = useState(false);
  const [qaUser, setQaUser] = useState('');

  const [roomUserList, setRoomUserList] = useState([])
  // 是否已登陆
  const isLogin = useSelector(state => state.isLogin)
  // 获取当前登陆ID，RoomId，及成员数
  const userName = useSelector((state) => state.loginName);
  const roomId = useSelector(state => state.extData.chatRoomId)
  const userCount = useSelector(state => state.room.info.affiliations_count);
  // 获取当前登陆的用户权限
  const isTeacher = useSelector(state => state.loginInfo.ext)
  const messageList = useSelector(state => state.messages.list) || [];
  const notification = useSelector(state => state.messages.notification);
  //获取群组成员，及成员的用户属性
  const roomUsers = useSelector(state => state.room.users)
  const roomListInfo = useSelector((state) => state.userListInfo);
  // 是否展示加载更多
  const isMoreHistory = useSelector(state => state.isMoreHistory)
  // 展示加载动画
  const isLoadGif = useSelector(state => state.isLoadGif)
  // 是否隐藏赞赏消息
  const isHiedReward = useSelector(state => state.isReward);
  // 是否为提问消息
  const isHiedQuestion = useSelector(state => state.isQa);
  // 是否有权限
  let hasEditPermisson = Number(isTeacher) === 3;
  // 当前是哪个tab
  const [tabKey, setTabKey] = useState(CHAT_TABS_KEYS.chat);
  // 加载历史消息动画

  // 获取提问列表
  const qaList = useSelector(state => state.messages.qaList) || [];
  let bool = _.find(qaList, (v, k) => {
    return v.showRedNotice
  })

  // 加载默认展示
  useEffect(() => {
    if (activeKey === 'USER') {
      sethide(false)
    } else if (activeKey === 'QA') {
      setIsTool(true);
    } else return
  }, [activeKey])
  // 切换 tab 
  const handleTabChange = (key) => {
    setTabKey(key)
    switch (key) {
      case "CHAT":
        store.dispatch(isTabs(CHAT_TABS_KEYS.chat))
        sethide(true);
        setIsTool(false);
        store.dispatch(removeChatNotification(false))
        break;
      case "QA":
        store.dispatch(isTabs(CHAT_TABS_KEYS.qa))
        sethide(true);
        setIsTool(true);
        break;
      case "USER":
        store.dispatch(isTabs(CHAT_TABS_KEYS.user))
        sethide(false)
        break;
      default:
        break;
    }
  }
  // 需要拿到选中的提问者id
  const getClickUser = (user) => {
    setQaUser(user)
  }

  useEffect(() => {
    // 加载成员信息
    let _speakerTeacher = []
    let _coachTeacher = []
    let _student = []
    let _audience = []
    if (isLogin) {
      let val
      roomUsers.map((item) => {
        if (roomListInfo) {
          val = roomListInfo && roomListInfo[item]
        }
        let newVal
        switch (val && val.ext) {
          case '0':
            newVal = _.assign(val, { id: item })
            _audience.push(newVal)
            break;
          case '1':
            newVal = _.assign(val, { id: item })
            _speakerTeacher.push(newVal)
            break;
          case '2':
            newVal = _.assign(val, { id: item })
            _student.push(newVal)
            break;
          case '3':
            newVal = _.assign(val, { id: item })
            _coachTeacher.push(newVal)
            break;
          default:
            newVal = _.assign(val, { id: item })
            _student.push(newVal)
            break;
        }
      })
      setRoomUserList(_.concat(_speakerTeacher, _coachTeacher, _audience, _student))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUsers, roomListInfo])

  useEffect(() => {
    let scrollElement = document.getElementById('chat-box-tag')
    scrollElementToBottom(scrollElement)
  }, [messageList])
  // 遍历成员列表，拿到成员数据，结构和 roomAdmin 统一
  return (
    <div className='message'>
      {hasEditPermisson ? (
        <Tabs activeKey={activeKey} onChange={handleTabChange}>
          {
            CHAT_TABS.map(({ key, name, component: Component, className }) => (
              <TabPane tab={<Flex>
                <Text whiteSpace="nowrap">{name === '成员' && roomUsers.length > 0 ? `${name}(${roomUsers.length})` : name}</Text>
                {name === '提问' && bool && bool.showRedNotice && (
                  // <Text ml="6px" whiteSpace="nowrap" color="red" fontSize='40px'>·</Text>
                  <div className="msg-red-dot"></div>
                )}
                {name !== '提问' && Boolean(notification[key]) && (
                  <div className="msg-red-dot"></div>
                )}
              </Flex>} key={key}>
                <div className={className} id={key === CHAT_TABS_KEYS.chat ? "chat-box-tag" : ""}>
                  {name !== '成员' && !isLoadGif && (isMoreHistory ? <div className='more-msg' onClick={() => { getHistoryMessages(name === '提问') }}>加载更多</div> : <div className='more-msg'>没有更多消息啦~</div>)}
                  {isLoadGif && <div className='load'></div>}
                  <Component {
                    ...key === CHAT_TABS_KEYS.chat && {
                      messageList,
                      isHiedReward,
                      activeKey,
                      id: 'chat-box-tag'
                    }
                  } {...key === CHAT_TABS_KEYS.qa && {
                    getClickUser
                  }} {...key === CHAT_TABS_KEYS.user && {
                    roomUserList
                  }} />
                </div>
              </TabPane>
            ))
          }
        </Tabs>
      ) : (
        <>
          {/* 通过isHiedQuestion控制学生端消息列表/提问列表的显示隐藏 */}
          <Flex flexDirection="column" className="member-msg" style={{ display: isHiedQuestion ? '' : 'none' }}>
            {Number(isTeacher) === 2 && <div className="qa-student-tips">
              提示：提问内容仅你和老师可见
            </div>}
            {isLoadGif && <div className='load'></div>}
            <QuestionMessage userName={userName} isLoadGif={isLoadGif} isMoreHistory={isMoreHistory} getHistoryMessages={getHistoryMessages} />
          </Flex>
          <div className="member-msg" id="chat-box-tag" style={{ display: isHiedQuestion ? 'none' : '' }}>
            {isLoadGif && <div className='load'></div>}
            {!isLoadGif && (isMoreHistory ? <div className='more-msg' onClick={() => { getHistoryMessages(false) }}>加载更多</div> : <div className='more-msg'>没有更多消息啦~</div>)}

            {
              messageList.length > 0 ? (
                <MessageItem messageList={messageList} isHiedReward={isHiedReward} isLoadGif={isLoadGif} isMoreHistory={isMoreHistory} getHistoryMessages={getHistoryMessages} />
              ) : (
                <div>
                  {/* <Text textAlign='center' color='#D3D6D8'>暂无消息</Text> */}
                </div>
              )
            }
          </div>
        </>
      )}
      <ToolBar tabKey={tabKey} hide={hide} isTool={isTool} qaUser={qaUser} activeKey={activeKey} />
    </div>
  )
}
export default MessageList