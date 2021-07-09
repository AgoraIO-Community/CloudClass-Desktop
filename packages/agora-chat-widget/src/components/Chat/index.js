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
import minimize from '../../themes/img/minimize.png'
import notice from '../../themes/img/notice.png'

const { TabPane } = Tabs;

import './index.css'

const renderTabBar = (props, DefaultTabBar) => (
    <Sticky bottomOffset={80}>
        {({ style }) => (
            <DefaultTabBar {...props} className="tab-class" style={{ ...style }} />
        )}
    </Sticky>
);



// 主页面，定义 tabs
export const Chat = () => {
    const [tabKey, setTabKey] = useState(CHAT_TABS_KEYS.chat)
    const [roomUserList, setRoomUserList] = useState([])
    const state = useSelector(state => state)
    const isLogin = state?.isLogin;
    const announcement = state?.room.announcement;
    const showRed = state?.showRed;
    const roleType = state?.loginUserInfo.ext;
    const roomUsers = state?.room.roomUsers;
    const roomUsersInfo = state?.room.roomUsersInfo;
    // 直接在 propsData 中取值
    const isTeacher = roleType && JSON.parse(roleType).role === ROLE.teacher.id;
    useEffect(() => {
        // 加载成员信息
        let _speakerTeacher = []
        let _student = []
        if (isLogin) {
            let val
            roomUsers.map((item) => {
                if (item === "系统管理员") return
                if (Object.keys(roomUsersInfo).length > 0) {
                    val = roomUsersInfo[item]
                }
                let newVal
                switch (val && JSON.parse(val?.ext).role) {
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
            setRoomUserList(_.concat(_speakerTeacher, _student))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomUsers, roomUsersInfo])

    const showChatModal = () => {
        store.dispatch(isShowChat(false))
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
                break;
            default:
                break;
        }
    }

    // 点击聊天Tab中的公告，跳转到公告Tab
    const toTabKey = () => {
        setTabKey(CHAT_TABS_KEYS.notice)
    }
    return <div>
        {showRed && <div className="red-notice"></div>}
        <StickyContainer>
            <Tabs renderTabBar={renderTabBar} onChange={onTabChange} activeKey={tabKey}>
                <TabPane tab="聊天" key={CHAT_TABS_KEYS.chat}>
                    {
                        announcement && announcement.length > 0 && <div className="notice" onClick={() => { toTabKey() }}>
                            <img src={notice} alt="通知" className="notice-icon" />
                            <span className="notice-text">{announcement}</span>
                        </div>
                    }
                    <MessageBox />
                    <InputBox />
                </TabPane>
                {isTeacher && <TabPane tab={roomUsers.length > 0 ? `成员(${roomUsers.length})` : "成员"} key={CHAT_TABS_KEYS.user}>
                    <UserList roomUserList={roomUserList} />
                </TabPane>}
                <TabPane tab="公告" key={CHAT_TABS_KEYS.notice}>
                    <Announcement />
                </TabPane>
            </Tabs>
            <div className="mini-icon">
                <img src={minimize} onClick={() => { showChatModal() }} />
            </div>
        </StickyContainer>
        <div>
        </div>

    </div>
}