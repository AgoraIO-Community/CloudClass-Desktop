import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App';
import WebIM from '../src/utils/WebIM'
import { MemoryRouter } from 'react-router-dom'
import { logoutChatroom } from './api/chatroom'
import { _sendCustomMsg } from './api/message'
import { registerMsgCallback } from './redux/aciton'

import './index.css'

export const HXChatRoom = (pluginStore) => {
    return (
        <React.StrictMode>
            <Provider store={store}>
                <MemoryRouter>
                    <App pluginStore={pluginStore} />
                </MemoryRouter>
            </Provider>
        </React.StrictMode>
    )
}

export const renderHXChatRoom = (dom, pluginStore) => {
    ReactDOM.render(
        <HXChatRoom pluginStore={pluginStore} />,
        dom
    );
}

export const logout = () => {
    logoutChatroom()
}

/**
 * @param {Object} option.customExts - 自定义内容 _ customExts:{key:val}
 * @param {String} option.customEvent - // 创建自定义事件
 * @param {Object} option.ext - 消息扩展 _ ext:{key:val}
 * @param {Function} option.success - 成功回调
 * @param {Function} option.fail - 失败回调
 */

//发送自定义消息
export const sendCustomMsg = (option) => {
    _sendCustomMsg(option)
}

// 接收自定义消息回调
export const addCustomMsgListener = (callback) => {
    store.dispatch(registerMsgCallback(callback))
}