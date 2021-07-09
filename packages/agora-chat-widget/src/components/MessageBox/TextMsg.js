import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Tag, Popover } from 'antd'
import { ROLE, RECALL, DELETE, MSG_TYPE } from '../../contants'
import store from '../../redux/store'
import { messageAction } from '../../redux/actions/messageAction'
import recall_icon from '../../themes/img/recall.png'
import delete_icon from '../../themes/img/delete.png'
import './index.css'


// 聊天页面
export const TextMsg = ({ item }) => {
    const [visible, setVisible] = useState(false)
    const state = useSelector(state => state);
    const roomId = state?.room.info.id;
    const roomUuid = state?.propsData.roomUuid;
    const loginUser = state?.loginUser;
    const roleType = state?.propsData.roleType;
    const sender = item?.from === loginUser;
    const tagNmae = item?.ext.role === ROLE.teacher.id;
    const msgData = item?.msg || item?.data;
    const avatarUrl = item?.ext.avatarUrl;
    const nickName = item?.ext.nickName
    const isTeacher = state.propsData.roleType === ROLE.teacher.id

    // 删除消息
    const deleteMsg = (recallId) => {
        var id = WebIM.conn.getUniqueId();            //生成本地消息id
        var msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
            to: roomId,                        //接收消息对象
            action: 'DEL',                     //用户自定义，cmd消息必填
            chatType: 'chatRoom',
            from: loginUser,
            ext: {
                msgtype: MSG_TYPE.common,   // 消息类型
                roomUuid: roomUuid,
                msgId: recallId,
                role: roleType,
                nickName: nickName,
            },    //用户自扩展的消息内容（群聊用法相同）
            success: function (id, serverId) {
                msg.id = serverId;
                msg.body.id = serverId;
                msg.body.time = (new Date().getTime()).toString()
                store.dispatch(messageAction(msg.body, { isHistory: false }));
                hide();
            }, //消息发送成功回调 
            fail: function (e) {
                console.log("Fail"); //如禁言、拉黑后发送消息会失败
            }
        });
        WebIM.conn.send(msg.body);
    }
    // 控制删除框隐藏
    const hide = () => {
        setVisible(false)
    }
    // 删除框的显/隐状态
    const handleVisibleChange = (visible) => {
        setVisible(visible);
    }

    return (
        <div className="msg">
            {sender && <div>
                <div className="msg-user-me">
                    {tagNmae && <Tag className="msg-tag" >{ROLE.teacher.tag}</Tag>}
                    <span>{nickName}</span>
                    <img src={avatarUrl} className="msg-avatar" />
                </div>
                <div className="msg-border">
                    <Popover placement="top" content={<div onClick={() => { deleteMsg(item.id) }} className="delete-btn"><img src={recall_icon} />{RECALL}</div>}
                        trigger="click" visible={visible} onVisibleChange={handleVisibleChange}>
                        <div className="msg-text msg-text-me">
                            <span> {msgData}</span>
                        </div>
                    </Popover>
                </div>
            </div>}
            {!sender && <div>
                <div className="msg-user-other">
                    <img src={avatarUrl} className="msg-avatar" />
                    <span>{nickName}</span>
                    {tagNmae && <Tag className="msg-tag">{ROLE.teacher.tag}</Tag>}
                </div>
                {isTeacher && <Popover placement="top" content={<div onClick={() => { deleteMsg(item.id) }} className="delete-btn" ><img src={delete_icon} />{DELETE}</div>}
                    trigger="click" visible={visible} onVisibleChange={handleVisibleChange}>
                    <div className="msg-text msg-text-other">
                        <span> {msgData}</span>
                    </div>
                </Popover>}
                {!isTeacher && <div className="msg-text msg-text-other">
                    {msgData}
                </div>}
            </div>}
        </div>

    )
}