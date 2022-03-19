import React from 'react';
import { Provider } from 'react-redux';
import createStore from './redux/store';
import { setVisibleUI } from './redux/actions/roomAction';
import { isShowChat, isShowMiniIcon } from './redux/actions/propsAction';
import { messageAction } from './redux/actions/messageAction';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { logoutChatroom } from './api/chatroom';
import { setUserMute, removeUserMute } from './api/mute';

// import './index.css'
let store = null;

export const HXChatRoom = ({ pluginStore }) => {
  const chatStore = React.useMemo(() => (store = createStore()), []);

  return (
    // <React.StrictMode>
    <Provider store={chatStore}>
      <MemoryRouter>
        <App pluginStore={pluginStore} />
      </MemoryRouter>
    </Provider>
    // </React.StrictMode>
  );
};

// export const renderHXChatRoom = (dom, pluginStore, onUpdate) => {
//   ReactDOM.render(<HXChatRoom pluginStore={pluginStore} />, dom);
//   return () => {
//     ReactDOM.unmountComponentAtNode(dom);
//   };
// };

// 单人禁言
export const muteUser = (userId) => {
  setUserMute(userId);
};

// 解除单人禁言
export const unMuteUser = (userId) => {
  removeUserMute(userId);
};

// 当前登陆ID，是否被禁言 --- 学生调用 返回 Boolean
export const isMuted = () => {
  return store?.getState()?.room.isUserMute;
};

// 获取禁言列表 --- 老师调用  返回 userUuid 的数组
export const getMuteList = () => {
  return store?.getState()?.room.muteList;
};
export const dispatchVisibleUI = (data) => {
  return store?.dispatch(setVisibleUI(data));
};
export const dispatchShowChat = (data) => {
  return store?.dispatch(isShowChat(data));
};
export const dispatchShowMiniIcon = (data) => {
  return store?.dispatch(isShowMiniIcon(data));
};

/**
 * 让外部可以插入到消息插入到消息列表中
 * @param {*} data
 * @returns
 */
export const receiveMessage = (data) => {
  return store?.dispatch(messageAction(data));
};

export const logout = () => {
  logoutChatroom();
  store.dispatch({ type: 'RESET_ACTION' });
};
