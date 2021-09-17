import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App';
import { MemoryRouter } from 'react-router-dom'
import { logoutChatroom } from './api/chatroom'
import { setUserMute, removeUserMute } from './api/mute'
import { clearStore } from './redux/actions/userAction'

import './index.css'
export const HXChatRoom = ({pluginStore, sendMsg, onReceivedMsg}) => {
    return (
        // <React.StrictMode>
            <Provider store={store}>
                <MemoryRouter>
                    <App pluginStore={pluginStore} sendMsg={sendMsg} onReceivedMsg={onReceivedMsg}/>
                </MemoryRouter>
            </Provider>
        // </React.StrictMode>
    )
}

export const renderHXChatRoom = (dom, pluginStore, sendMsg, onReceivedMsg) => {
    ReactDOM.render(
        <HXChatRoom pluginStore={pluginStore} sendMsg={sendMsg} onReceivedMsg={onReceivedMsg}/>,
        dom
    );
}

// 单人禁言
export const muteUser = (userId) => {
    setUserMute(userId)
}

// 解除单人禁言
export const unMuteUser = (userId) => {
    removeUserMute(userId)
}

// 当前登陆ID，是否被禁言 --- 学生调用 返回 Boolean
export const isMuted = () => {
    return store.getState()?.room.isUserMute
}

// 获取禁言列表 --- 老师调用  返回 userUuid 的数组
export const getMuteList = () => {
    return store.getState()?.room.muteList
}


export const logout = () => {
    const isLoginIM = store.getState()?.isLogin;
    if (!isLoginIM) {
        store.dispatch(clearStore({}))
    }
    logoutChatroom()
}