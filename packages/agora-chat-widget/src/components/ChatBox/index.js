import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from "react-redux";
import { Button, Input, message } from 'antd'
import { SmileOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Flex, Text } from 'rebass'
import WebIM from '../../utils/WebIM'
import store from '../../redux/store'
import { Emoji } from '../../utils/emoji'
import { roomMessages, qaMessages } from '../../redux/aciton'
import { CHAT_TABS_KEYS, INPUT_SIZE } from '../MessageBox/constants'
import iconSmiley from '../../themes/img/icon-smiley.svg'
import iconImage from '../../themes/img/icon-image.svg'
import msgAvatarUrl from '../../themes/img/avatar-big@2x.png'
import './index.css'
import RcTooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'
import checkInputStringRealLength from '../../utils/checkStringRealLength'

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

const ChatBox = ({ isTool, qaUser, activeKey }) => {
    const roomId = useSelector((state) => state.room.info.id);
    const teacher = useSelector(state => state.loginInfo.ext)
    const isAllMute = useSelector(state => state.isRoomAllMute)
    // 是否开启了提问模式
    const isQa = useSelector((state) => state.isQa);
    // 获取用户详情
    const userInfo = useSelector((state) => state.loginInfo);
    // 获取课堂ID
    const roomUuid = useSelector(state => state.extData.roomUuid)
    // 获取当前登陆ID 权限
    const roleType = Number(useSelector(state => state.extData.roleType))
    // 获取是否为单人禁言
    const isUserMute = useSelector(state => state.isUserMute)
    // 是否为老师
    const isTeacher = (Number(teacher) === 1 || Number(teacher) === 3)
    const [count, setCount] = useState(0);
    const [content, setContent] = useState('');
    const [isEmoji, setIsEmoji] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const [sendBtnDisabled, setSendBtnDisabled] = useState(true);


    // 整体都要改
    //  消息类型 0普通消息，1提问消息，2回答消息
    let msgType = 0;
    //  消息中的提问用户名
    let requestUser = '';
    //  当前登陆ID 
    let loginId = WebIM.conn.context.userId;
    //  从当前登陆用户取的属性头像
    let avatarUrl = userInfo.avatarurl;
    //  从当前登陆用户取的属性昵称
    let userNickName = userInfo.nickname;
    //  获取当前时间，在ext 中携带，便于排序
    let timestamp = new Date().getTime()
    //  isTool 是控制是否显示图片标签
    if (isTool) {
        msgType = 2;
        requestUser = qaUser
    } else if (isQa) {
        msgType = 1;
        requestUser = qaUser || loginId
    }
    if (!userInfo.avatarurl) {
        avatarUrl = msgAvatarUrl;
    }
    if (!userInfo.nickname) {
        userNickName = '学生测试'
    }

    // 发送图片消息，及获取input 值
    const couterRef = useRef();
    const updateImage = () => {
        couterRef.current.focus()
        couterRef.current.click()
    }

    // 获取到点击的表情，加入到输入框
    const getEmoji = (e) => {

        let emojiContent = content + e.target.innerText;
        let tempCount = checkInputStringRealLength(emojiContent);
        setCount(tempCount);
        setContent(emojiContent);
        setSendBtnDisabled(tempCount === 0 ? true : false)
    }
    // 输入框消息
    const changeMsg = (e) => {

        let msgContent = e.target.value;
        let tempCount = checkInputStringRealLength(msgContent);
        setCount(tempCount);
        setContent(msgContent);
        setSendBtnDisabled(tempCount === 0 ? true : false)
    }
    
    // 发送消息
    const sendMessage = (roomId, content) => (e) => {
        e.preventDefault();
        // 禁止发送状态下 不允许发送
        if (sendBtnDisabled === true){
            return false;
        }

        // 消息为空不发送
        if (content === '' || count > INPUT_SIZE) {
            message.error(`消息内容不能为空且字符不能超过${INPUT_SIZE}！`)
            setTimeout(() => {
                message.destroy();
            }, 2000);
            return
        }
        // 老师回复时必须选中提问学生才能发言
        if (msgType === 2 && requestUser === '') {
            message.error('请选择提问学生！')
            setTimeout(() => {
                message.destroy();
            }, 2000);
            return
        }
        setSendBtnDisabled(true);// 发送消息，设置按钮为禁止点击
        let id = WebIM.conn.getUniqueId();         // 生成本地消息id
        let msg = new WebIM.message('txt', id); // 创建文本消息
        let option = {
            msg: content,          // 消息内容
            to: roomId,               // 接收消息对象(聊天室id)
            chatType: 'chatRoom',            // 群聊类型设置为聊天室
            ext: {
                msgtype: msgType,   // 消息类型
                roomUuid: roomUuid,
                asker: requestUser,
                role: roleType,
                avatarUrl: avatarUrl,
                nickName: userNickName,
                time: timestamp.toString()
            },                         // 扩展消息
            success: function (id, serverId) {
                msg.id = serverId;
                msg.body.id = serverId;
                if (msg.body.ext.msgtype === 2) {
                    store.dispatch(qaMessages(msg.body, msg.body.ext.asker, { showNotice: false }, msg.body.ext.time));
                } else if (msg.body.ext.msgtype === 1) {
                    store.dispatch(qaMessages(msg.body, msg.body.ext.asker, { showNotice: !activeKey }, msg.body.ext.time));
                } else {
                    store.dispatch(roomMessages(msg.body, { showNotice: !activeKey }));
                }
                setContent('');
                setCount(0);
            },                               // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
            fail: function (err) {
                if (err.type === 501) {
                    setIsShow(true);
                    setTimeout(() => {
                        setIsShow(false);
                    }, 5000);
                }
            }
        };
        msg.set(option);
        WebIM.conn.send(msg.body);
    }
    // 发送图片
    const sendImgMessage = (roomId, e) => {
        var id = WebIM.conn.getUniqueId();                   // 生成本地消息id
        var msg = new WebIM.message('img', id);        // 创建图片消息
        let file = WebIM.utils.getFileUrl(e.target)     // 将图片转化为二进制文件
        var allowType = {
            'jpeg': true,
            'jpg': true,
            'png': true,
            'bmp': true
        };
        if (file.filetype.toLowerCase() in allowType) {
            var option = {
                file: file,
                length: '3000',                       // 视频文件时，单位(ms)
                to: roomId,
                ext: {
                    msgtype: msgType,   // 消息类型
                    roomUuid: roomUuid,
                    asker: requestUser,
                    role: roleType,
                    avatarUrl: avatarUrl,
                    nickName: userNickName,
                    time: timestamp.toString()
                },                       // 接收消息对象
                chatType: 'chatRoom',               // 设置为单聊
                onFileUploadError: function (err) {      // 消息上传失败
                    console.log('onFileUploadError', err);
                },
                onFileUploadComplete: function (res) {   // 消息上传成功
                    console.log('onFileUploadComplete', res);
                },
                success: function () {                // 消息发送成功
                    store.dispatch(qaMessages(msg.body, msg.body.ext.asker, { showRed: false }, msg.body.ext.time));
                },
                fail: function (e) {
                    console.log("Fail", e);              //如禁言、拉黑后发送消息会失败
                },
                flashUpload: WebIM.flashUpload
            };
            msg.set(option);
            WebIM.conn.send(msg.body);
        } else {
            message.error('不支持的图片类型，仅支持JPG、JPEG、PNG、BMP格式图片！')
            // message.error({
            //     content: '不支持的图片类型，仅支持JPG、JPEG、PNG、BMP格式图片！',
            //     style: { width: '200px' }
            // });
            setTimeout(() => {
                message.destroy();
            }, 2000);
        }
    }

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

    // 禁言后，判断权限是否遮盖输入框
    return (
        <div className='chat-box'>
            {/* 是否全局禁言 */}
            {!isTeacher && isAllMute && !isQa && <Flex className='msg-box-mute'>
                <Text className='mute-msg'>全员禁言中</Text>
            </Flex>}
            {/* 是否被禁言 */}
            {(!isTeacher && isUserMute) && !isQa && <Flex className='msg-box-mute'>
                <Text className='mute-msg'>您已被禁言</Text>
            </Flex>}
            {/* 不禁言展示发送框 */}
            {(isQa || (isTeacher || (!isUserMute && !isAllMute))) && <div >
                {
                    isShow && <Flex className='show-error' alignItems='center' justifyContent='center'>
                        <CloseCircleOutlined style={{ color: 'red', paddingLeft: '10px' }} />
                        <Text ml='3px' className='show-error-msg' >发送失败,含有敏感词！</Text>
                    </Flex>
                }
                <Flex justifyContent='flex-start' alignItems='center'>
                    {isEmoji && <ShowEomji getEmoji={getEmoji} hideEmoji={hideEmoji} />}
                    <RcTooltip placement="top" overlay="表情">
                        <img src={iconSmiley} onClick={showEmoji} className="chat-tool-item"/>
                    </RcTooltip>
                    {isTool 
                    && <RcTooltip placement="top" overlay="图片">
                        <div onClick={updateImage} className="chat-tool-item">
                                <img src={iconImage} />
                            {/* <Image src={icon_img} width='18px' background='#D3D6D8' ml='8px' /> */}
                            <input
                                id="uploadImage"
                                onChange={sendImgMessage.bind(this, roomId)}
                                type="file"
                                ref={couterRef}
                                style={{
                                    display: 'none'
                                }}
                                />
                        </div>
                    </RcTooltip>}
                </Flex>
                <div>
                    <Input.TextArea
                        placeholder={activeKey === CHAT_TABS_KEYS.chat ? '说点什么呗~' : '为Ta解答吧~'}
                        onChange={(e) => changeMsg(e)}
                        className="msg-box"
                        maxLength={INPUT_SIZE}
                        autoFocus
                        value={content}
                        onClick={hideEmoji}
                        onPressEnter={sendMessage(roomId, content)}
                    />
                </div>
                <Flex justifyContent='flex-end' className='btn-tool'>
                    <Text color="#626773" fontSize="12px">{count}/{INPUT_SIZE}</Text>
                    <button disabled={sendBtnDisabled} onClick={sendMessage(roomId, content)} className="msg-btn">
                        发送
                    </button>
                </Flex>
            </div>}
        </div>
    )
}

export default ChatBox;