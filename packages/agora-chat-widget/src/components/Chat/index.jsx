import { useState, useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Tabs } from 'antd';
import { MessageBox } from '../MessageBox';
import { InputBox } from '../InputBox';
import { UserList } from '../UserList';
import { Announcement } from '../Announcement';
import { ROLE, CHAT_TABS_KEYS } from '../../contants';
import { isShowChat } from '../../redux/actions/propsAction';
import { selectTabAction, showRedNotification } from '../../redux/actions/messageAction';
import { transI18n } from '~components/i18n';
import { announcementNotice } from '../../redux/actions/roomAction';
// import minimize from '../../themes/img/minimize.png';
import minimize from '../../themes/svg/minimize.svg';
import notice from '../../themes/img/notice.png';
import _ from 'lodash';
import './index.css';

const { TabPane } = Tabs;

// 主页面，定义 tabs
export const Chat = () => {
  const [tabKey, setTabKey] = useState(CHAT_TABS_KEYS.chat);
  const [roomUserList, setRoomUserList] = useState([]);
  const state = useSelector((state) => state);
  const store = useStore();
  const isLogin = _.get(state, 'isLogin');
  const announcement = _.get(state, 'room.announcement', '');
  const showRed = _.get(state, 'showRed');
  const showAnnouncementNotice = _.get(state, 'showAnnouncementNotice');
  const roleType = _.get(state, 'propsData.roleType', '');
  const roomUsers = _.get(state, 'room.roomUsers', []);
  const roomUsersInfo = _.get(state, 'room.roomUsersInfo', {});
  const showChat = _.get(state, 'showChat');
  const showMIniIcon = _.get(state, 'isShowMiniIcon');
  const configUIVisible = _.get(state, 'configUIVisible');
  const isTabKey = state?.isTabKey;
  // 直接在 propsData 中取值
  const isTeacher =
    roleType === ROLE.teacher.id || roleType === ROLE.assistant.id || roleType === ROLE.observer.id;
  useEffect(() => {
    // 加载成员信息
    let _speakerTeacher = [];
    let _assistant = [];
    let _student = [];
    if (isLogin) {
      let val;
      roomUsers.map((item) => {
        if (item === '系统管理员') return;
        if (Object.keys(roomUsersInfo).length > 0) {
          val = roomUsersInfo[item];
        }
        let newVal;
        let role = val && val.ext && JSON.parse(val.ext).role;
        switch (role) {
          case 1:
            newVal = _.assign(val, { id: item });
            _speakerTeacher.push(newVal);
            break;
          case 2:
            newVal = _.assign(val, { id: item });
            _student.push(newVal);
            break;
          case 3:
            newVal = _.assign(val, { id: item });
            _assistant.push(newVal);
            break;
          default:
            break;
        }
      });
      setRoomUserList(_.concat(_speakerTeacher, _student));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUsers, roomUsersInfo]);

  const hideChatModal = () => {
    store.dispatch(isShowChat(false));
    store.dispatch(selectTabAction(CHAT_TABS_KEYS.chat));
  };

  // 监听 Tab 切换
  const onTabChange = (key) => {
    store.dispatch(selectTabAction(key));
    switch (key) {
      case 'CHAT':
        setTabKey(CHAT_TABS_KEYS.chat);
        store.dispatch(showRedNotification(false));
        break;
      case 'USER':
        setTabKey(CHAT_TABS_KEYS.user);
        break;
      case 'ANNOUNCEMENT':
        setTabKey(CHAT_TABS_KEYS.notice);
        store.dispatch(announcementNotice(false));
        break;
      default:
        break;
    }
  };

  // 点击聊天Tab中的公告，跳转到公告Tab
  const toTabKey = () => {
    setTabKey(CHAT_TABS_KEYS.notice);
    store.dispatch(announcementNotice(false));
  };
  return (
    <div>
      <Tabs onChange={onTabChange} activeKey={tabKey}>
        <TabPane
          tab={
            <div>
              {showRed && <div className="fcr-hx-red-notice"></div>}
              {transI18n('chat.chat')}
            </div>
          }
          key={CHAT_TABS_KEYS.chat}>
          {announcement && (
            <div
              className="fcr-hx-notice"
              onClick={() => {
                toTabKey();
              }}>
              <img src={notice} className="fcr-hx-notice-icon" />
              <span className="fcr-hx-notice-text">{announcement}</span>
            </div>
          )}
          <MessageBox />
          <InputBox />
        </TabPane>
        {configUIVisible.memebers && isTeacher && (
          <TabPane
            tab={
              roomUserList.length > 0
                ? `${transI18n('chat.members')}(${roomUserList.length})`
                : `${transI18n('chat.members')}`
            }
            key={CHAT_TABS_KEYS.user}>
            <UserList roomUserList={roomUserList} />
          </TabPane>
        )}
        {configUIVisible.announcement && (
          <TabPane
            tab={
              <div>
                {showAnnouncementNotice && <div className="fcr-hx-red-notice"></div>}
                {transI18n('chat.announcement')}
              </div>
            }
            key={CHAT_TABS_KEYS.notice}>
            <Announcement />
          </TabPane>
        )}
      </Tabs>
      {showMIniIcon && (
        <div className="fcr-hx-mini-icon">
          <img
            src={minimize}
            onClick={() => {
              // 最小化聊天
              hideChatModal();
            }}
          />
        </div>
      )}
    </div>
  );
};
