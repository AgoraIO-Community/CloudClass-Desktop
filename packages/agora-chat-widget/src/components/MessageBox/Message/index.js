import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Flex, Text } from 'rebass'
import { Button } from 'antd'
import store from '../../../redux/store'
import { roomMessages } from '../../../redux/aciton'
import WebIM from '../../../utils/WebIM'
import MessageItem from './MessageItem'
import './MessageList.css'


// 消息渲染
const Message = ({ messageList, isHiedReward, hasEditPermisson, activeKey, isLoadGif, isMoreHistory, getHistoryMessages }) => {
    const roomId = useSelector(state => state.room.info.id);
    const userInfo = useSelector(state => state.loginInfo)
    // 控制弹框
    const [showModal, setShowModal] = useState('none');
    // 撤回需要的 msgId
    const [recallMsgId, setRecallMsgId] = useState('');
    // 礼物消息控制
    let renderMsgs = messageList
    if (isHiedReward) {
        renderMsgs = messageList.filter((item) => item.contentsType !== 'CUSTOM')
    }
    if (!renderMsgs?.length) {
        return (
            <div></div>
        )
    }

    // 删除消息
    const deleteMsg = (roomId, recallId, activeKey) => {
        let id = WebIM.conn.getUniqueId();            //生成本地消息id
        let msg = new WebIM.message('cmd', id); //创建命令消息
        msg.set({
            to: roomId,                        //接收消息对象
            action: 'DEL',                     //用户自定义，cmd消息必填
            chatType: 'chatRoom',
            ext: {
                msgtype: 0,
                msgId: recallId,
                avatarurl: userInfo.avatarurl || '',
                nickName: userInfo.nickname || '辅导老师'

            },    //用户自扩展的消息内容（群聊用法相同）
            success: function (id, serverMsgId) {
                console.log(id, serverMsgId);
                setShowModal('none')
            }, //消息发送成功回调 
            fail: function (e) {
                console.log("Fail", e); //如禁言、拉黑后发送消息会失败
            }
        });
        WebIM.conn.send(msg.body);
        store.dispatch(roomMessages(msg.body, { showNotice: !activeKey }))
    }

    return (
        <>
        <div >
            {renderMsgs.map((message) => 
                <MessageItem message={message} key={message.id} setShowModal={setShowModal} setRecallMsgId={setRecallMsgId} hasEditPermisson={hasEditPermisson} />)
            }
        </div>
        {/* 弹窗 */}
        <div style={{ display: `${showModal}` }}>
            <div className='mask'>
            </div>
            <div className='card'>
                <div className='card-txt'>确定要删除此消息吗？</div>
                <Flex justifyContent='center' >
                    <div className='cancle-btn' onClick={() => { setShowModal('none') }}>取消</div>
                    <div className='ok-btn' onClick={() => { deleteMsg(roomId, recallMsgId, activeKey) }}>确定</div>
                </Flex>
            </div>
        </div>
        </>
    )
}
export default Message