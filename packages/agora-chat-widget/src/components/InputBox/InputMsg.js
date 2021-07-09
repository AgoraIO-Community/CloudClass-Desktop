import React, { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Switch, Tooltip, Input, Button, message } from 'antd';
import { MSG_TYPE } from '../../contants'
import store from '../../redux/store'
import { messageAction } from '../../redux/actions/messageAction'
import { setAllmute, removeAllmute } from '../../api/mute'
import { Emoji } from '../../utils/emoji'

import emojiIcon from '../../themes/img/emoji.png'
import './index.css'

// 展示表情
const ShowEomji = ({ getEmoji, hideEmoji }) => {
    return (
        <>
            <div className='emoji-mask' onClick={hideEmoji}></div>
            <div className='emoji-all'>
                {Emoji.map((emoji, key) => {
                    return <span className='emoji-content' key={key}
                        onClick={getEmoji}
                    >{emoji}</span>
                })}
            </div>
        </>
    )
}


export const InputMsg = ({ isTeacher }) => {
    const state = useSelector(state => state)
    const loginUser = state?.loginUser;
    const roomId = state?.room.info.id;
    const roleType = state?.loginUserInfo.ext;
    const roomUuid = state?.propsData.roomUuid;
    const userAvatarUrl = state?.loginUserInfo.avatarurl;
    const userNickName = state?.loginUserInfo.nickname;
    const isAllMute = state?.room.allMute;
    // 管理输入框内容
    const [content, setContent] = useState('')
    // 控制表情
    const [isEmoji, setIsEmoji] = useState(false);
    // 输入框焦点
    const inputRef = React.useRef(null);


    // 控制显示/隐藏 表情框
    const showEmoji = () => {
        if (!isEmoji) {
            setIsEmoji(true)
        } else {
            hideEmoji()
        }
    }

    // 隐藏表情框
    const hideEmoji = () => {
        setIsEmoji(false)
    }

    // 获取到点击的表情，加入到输入框
    const getEmoji = (e) => {
        // 监听表情输入后，自动获取输入框焦点
        inputRef.current.focus({
            cursor: 'end',
        });
        // 本次输入的内容
        let tempContent = e.target.innerText;
        // 更新内容和长度
        let totalContent = content + tempContent
        setContent(totalContent);
    }

    // 全局禁言开关
    const onChangeMute = (val) => {
        if (!val) {
            setAllmute(roomId, sendCmdMsg);
        } else {
            removeAllmute(roomId, sendCmdMsg);
        }
    }

    // 监听输入框变化
    const changeMsg = (e) => {
        let msgContent = e.target.value;
        setContent(msgContent);
    }

    // 发送消息
    const sendMessage = () => (e) => {
        e.preventDefault();
        // 消息为空不发送
        if (content === '') {
            message.error(`消息内容不能为空！`)
            return
        }
        let id = WebIM.conn.getUniqueId();         // 生成本地消息id
        let msg = new WebIM.message('txt', id); // 创建文本消息
        let option = {
            msg: content,          // 消息内容
            to: roomId,               // 接收消息对象(聊天室id)
            from: loginUser,
            chatType: 'chatRoom',            // 群聊类型设置为聊天室
            ext: {
                msgtype: MSG_TYPE.common,   // 消息类型
                roomUuid: roomUuid,
                role: JSON.parse(roleType).role,
                avatarUrl: userAvatarUrl || '',
                nickName: userNickName,
            },                         // 扩展消息
            success: function (id, serverId) {
                hideEmoji()
                msg.id = serverId;
                msg.body.id = serverId;
                msg.body.time = (new Date().getTime()).toString()
                store.dispatch(messageAction(msg.body, { isHistory: false }));
            },                               // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
            fail: function (err) {
                console.log('fail>>>', err);
                if (err.type === 501) {
                    message.error("消息内容包含敏感词，请重新发送！")

                }
            }
        };
        msg.set(option);
        setContent('');
        WebIM.conn.send(msg.body);
    }

    // 发送禁言消息
    const sendCmdMsg = (action) => {
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
            to: roomId,                        //接收消息对象
            action: action,                     //用户自定义，cmd消息必填
            chatType: 'chatRoom',
            from: loginUser,
            ext: {
                msgtype: MSG_TYPE.common,   // 消息类型
                roomUuid: roomUuid,
                role: JSON.parse(roleType).role,
            },    //用户自扩展的消息内容（群聊用法相同）
            success: function (id, serverId) {
                msg.id = serverId;
                msg.body.id = serverId;
                msg.body.time = (new Date().getTime()).toString()
                store.dispatch(messageAction(msg.body, { isHistory: false }));
            }, //消息发送成功回调 
            fail: function (e) {
                console.log("Fail"); //如禁言、拉黑后发送消息会失败
            }
        });
        WebIM.conn.send(msg.body);
    }


    return <div>
        <div className="chat-icon">
            {isEmoji && <ShowEomji getEmoji={getEmoji} hideEmoji={hideEmoji} />}
            <Tooltip title="表情">
                <img src={emojiIcon} className="emoji-icon" onClick={showEmoji} />
            </Tooltip>
            {isTeacher && <div>
                <span className="all-mute-text">全体禁言</span>
                <Switch
                    size="small"
                    checked={isAllMute}
                    onClick={() => { onChangeMute(isAllMute) }}
                />
            </div>}

        </div>
        <Input.TextArea
            placeholder="请输入消息"
            className="input-chat"
            autoFocus
            onChange={(e) => changeMsg(e)}
            value={content}
            onPressEnter={sendMessage()}
            ref={inputRef}
        />
        <div className="input-btn">
            <Button type="primary" shape="round" onClick={sendMessage()}>发送</Button>
        </div>
    </div>
}