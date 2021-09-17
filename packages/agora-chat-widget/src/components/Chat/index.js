import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Tabs } from 'antd';
import { StickyContainer, Sticky } from 'react-sticky';
import { MessageBox } from '../MessageBox'
import { InputBox } from '../InputBox'
import { UserList } from '../UserList'
import { Announcement } from '../Announcement'
import { ROLE, CHAT_TABS_KEYS } from '../../contants'
import store from '../../redux/store'
import { isShowChat } from '../../redux/actions/propsAction'
import { selectTabAction, showRedNotification } from '../../redux/actions/messageAction'
import { announcementNotice } from '../../redux/actions/roomAction'
import minimize from '../../themes/img/minimize.png'
import notice from '../../themes/img/notice.png'
import _ from 'lodash'

import './index.css'

const { TabPane } = Tabs;

const renderTabBar = (props, DefaultTabBar) => (
    <Sticky bottomOffset={80}>
        {({ style }) => (
            <DefaultTabBar {...props} className="tab-class" style={{ ...style }} />
        )}
    </Sticky>
);

// 主页面，定义 tabs
export const Chat = ({ onReceivedMsg, sendMsg }) => {
    const [tabKey, setTabKey] = useState(CHAT_TABS_KEYS.chat)
    const [roomUserList, setRoomUserList] = useState([])
    const state = useSelector(state => state)
    const isLogin = _.get(state, 'isLogin')
    const announcement = _.get(state, 'room.announcement', '')
    const showRed = _.get(state, 'showRed')
    const showAnnouncementNotice = _.get(state, 'showAnnouncementNotice')
    const roleType = _.get(state, 'propsData.roleType', '')
    const roomUsers = _.get(state, 'room.roomUsers', [])
    const roomUsersInfo = _.get(state, 'room.roomUsersInfo', {})
    const showMinimizeBtn = sendMsg?.showMinimizeBtn
    const width = sendMsg?.width
    const height = sendMsg?.height

    const isTeacher = roleType === ROLE.teacher.id;
    useEffect(() => {
        // 加载成员信息
        let _speakerTeacher = []
        let _student = []
        let _audience = []
        if (isLogin) {
            let val
            roomUsers.map((item) => {
                if (item === "系统管理员") return
                if (Object.keys(roomUsersInfo).length > 0) {
                    val = roomUsersInfo[item]
                }
                let newVal
                let role = val && JSON.parse(val?.ext).role
                switch (role) {
                    case 0:
                        newVal = _.assign(val, { id: item })
                        _audience.push(newVal)
                        break;
                    case 1:
                        newVal = _.assign(val, { id: item })
                        _speakerTeacher.push(newVal)
                        break;
                    case 2:
                        newVal = _.assign(val, { id: item })
                        _student.push(newVal)
                        break;
                    default:
                        newVal = _.assign(val, { id: item })
                        _student.push(newVal)
                        break;
                }
            })
            setRoomUserList(_.concat(_speakerTeacher, _audience, _student))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomUsers, roomUsersInfo])

    const hideChatModal = () => {
        store.dispatch(isShowChat(false))
        store.dispatch(selectTabAction(CHAT_TABS_KEYS.chat))
        onReceivedMsg && onReceivedMsg({ isShowChat: false })
    }

    // 监听 Tab 切换
    const onTabChange = (key) => {
        store.dispatch(selectTabAction(key))
        switch (key) {
            case "CHAT":
                setTabKey(CHAT_TABS_KEYS.chat)
                store.dispatch(showRedNotification(false))
                break;
            case "USER":
                setTabKey(CHAT_TABS_KEYS.user)
                break;
            case "ANNOUNCEMENT":
                setTabKey(CHAT_TABS_KEYS.notice)
                store.dispatch(announcementNotice(false))
                break;
            default:
                break;
        }
    }

    // 点击聊天Tab中的公告，跳转到公告Tab
    const toTabKey = () => {
        setTabKey(CHAT_TABS_KEYS.notice)
    }
    return <div style={{ height, width}}>
        {/* <StickyContainer> */}
        <Tabs onChange={onTabChange} activeKey={tabKey} tabBarStyle={{ margin: '2px' }}>
            <TabPane tab={<div>
                {showRed && <div className="red-notice"></div>}
                聊天
            </div>} key={CHAT_TABS_KEYS.chat}>
                {
                    announcement && <div className="notice" onClick={() => { toTabKey() }}>
                        <img src={notice} alt="通知" className="notice-icon" />
                        <span className="notice-text">
                            {announcement}
                        </span>
                    </div>
                }
                <MessageBox />
                <InputBox />
            </TabPane>
            {isTeacher && <TabPane tab={roomUsers.length > 0 ? `成员(${roomUsers.length})` : "成员"} key={CHAT_TABS_KEYS.user}>
                <UserList roomUserList={roomUserList} />
            </TabPane>}
            <TabPane tab={<div>
                {showAnnouncementNotice && <div className="red-notice"></div>}
                公告
            </div>
            } key={CHAT_TABS_KEYS.notice}>

                <Announcement />
            </TabPane>
        </Tabs>
        { showMinimizeBtn && <div className="mini-icon">
            <img src={minimize} alt="" onClick={hideChatModal} />
        </div>}
        {/* </StickyContainer> */}
        <div>
        </div>

    </div>
}