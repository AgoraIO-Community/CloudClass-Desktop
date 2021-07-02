import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App';
import { MemoryRouter } from 'react-router-dom'
import { logoutChatroom } from './api/chatroom'

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