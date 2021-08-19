import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App';
import WebIM from '../src/utils/WebIM'
import { MemoryRouter } from 'react-router-dom'
import { logoutChatroom } from './api/chatroom'
import { _sendCustomMsg, _sendTextMsg } from './api/message'
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

// 发送文本消息
export const sendTextMsg = (content, roomUuid, roleType, avatarUrl, nickName, successCallback, failCallback) => {
    _sendTextMsg(content, roomUuid, roleType, avatarUrl, nickName, successCallback, failCallback)
}


// -------------------------------------------------------------------------------------------------

// /**
//  * electron客户端状态管理工具 electron-json-storage
//  * 先获取userId，进行拼接，用于获取json-storage的文件路径 
//  * 
//  */
// const userId = new URLSearchParams(window.location.search).get('userId');
// console.log('====URLSearchParams userId >>>', window.location, userId);

// const electronJsonStorage = window.electronJsonStorage

// // 设置electron-json-storage存储路径
// electronJsonStorage.setDataPath(window.path.join(window.electronJsonStorageFilePath, userId?.toString()));

// // 同步获取 electron-json-storage 状态数据
// let electronJsonStorage_data = electronJsonStorage.getSync('imProps')

// console.log('========imProps', electronJsonStorage_data);

// renderHXChatRoom(document.getElementsByTagName("body")[0], {
//     props: electronJsonStorage_data
// })

