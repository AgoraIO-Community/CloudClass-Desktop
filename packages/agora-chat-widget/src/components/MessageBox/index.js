import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { TextMsg } from './TextMsg'
import { CmdMsg } from './CmdMsg'
import scrollElementToBottom from '../../utils/scrollElementToBottom'
import { CHAT_TABS_KEYS } from '../../contants'
import noMessage_icon from '../../themes/img/noMessage.png'
import './index.css'

// 聊天页面
export const MessageBox = () => {
    const state = useSelector(state => state);
    const msgs = state?.messages;
    const isTabKey = state?.isTabKey
    let isHaveMsg = msgs && msgs.length > 0;

    const activeTab = isTabKey === CHAT_TABS_KEYS.chat
    useEffect(() => {
        autoLastMsg()
    }, [msgs, activeTab])

    // 消息自动加载最后一条消息
    const autoLastMsg = () => {
        let scrollElement = document.getElementById('chat-messages')
        scrollElementToBottom(scrollElement)
    }

    return <div className="message-box" id="chat-messages" >
        {isHaveMsg ? <div>
            {
                msgs && msgs.map((item, key) => {
                    const isText = item?.contentsType === "TEXT" || item?.type === "txt"
                    const isCmd = item?.contentsType === "COMMAND" || item?.type === "cmd"
                    return (
                        <div key={key}>
                            {isText && <TextMsg item={item} />}
                            {isCmd && <CmdMsg item={item} />}
                        </div>
                    )
                })
            }
        </div> : <div className="no-msgs">
            <img src={noMessage_icon} />
            <span>还没有消息</span>
        </div>
        }
    </div>
}