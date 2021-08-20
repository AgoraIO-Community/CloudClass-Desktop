import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector } from "react-redux";
import { Button, Input, message, Checkbox } from 'antd'
import { SmileOutlined, CloseCircleOutlined, UpOutlined } from '@ant-design/icons';
import { Flex, Text } from 'rebass'
import WebIM from '../../utils/WebIM'
import store from '../../redux/store'
import { Emoji } from '../../utils/emoji'
import { roomMessages, qaMessages, messageListIsBottom } from '../../redux/aciton'
import { CHAT_TABS_KEYS, INPUT_SIZE, TEXT_ERROR, IMG_MAX_SIZE, IMG_SUPPORT, NOT_INPUT } from '../MessageBox/constants'
import iconSmiley from '../../themes/img/icon-smiley.svg'
import iconImage from '../../themes/img/icon-image.svg'
import msgAvatarUrl from '../../themes/img/avatar-big@2x.png'
import './index.css'
import RcTooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'
import checkInputStringRealLength from '../../utils/checkStringRealLength'
import iconMute from '../../themes/img/icon-mute.svg'
import iconScreen from '../../themes/img/icon-caijian.svg'
import iconError from '../../themes/img/icon-error.svg'

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
    let privateRoomId = useSelector((state) => state?.extData?.privateChatRoom?.chatRoomId) || ''

    // const privateRoomId = useSelector((state) => state?.extData.privateChatRoom.chatRoomId)
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
    // 消息过滤提示
    const [isShow, setIsShow] = useState(false);
    const [showText, setShowText] = useState('');
    const [sendBtnDisabled, setSendBtnDisabled] = useState(false);
    const [checkValue, setCheckValue] = useState(true)
    const [showCheck, setShowCheck] = useState(false)
    const isElectron = window.navigator.userAgent.indexOf("Electron") !== -1;
    // 是否是复合输入
    // const [isComposition, setIsComposition] = useState(false);

    // 整体都要改
    //  消息类型 0普通消息，1提问消息，2回答消息
    let msgType = 0;
    //  消息中的提问用户名
    let requestUser = '';
    //  当前登陆ID 
    let loginId = useSelector(state => state.loginName);
    //  从当前登陆用户取的属性头像
    let avatarUrl = userInfo.avatarurl;
    //  从当前登陆用户取的属性昵称
    let userNickName = userInfo.nickname;
    let toRoomid = roomId
    //  isTool 是控制是否显示图片标签
    if (activeKey === "QA") {
        toRoomid = privateRoomId
        msgType = 2;
        requestUser = qaUser
    }
    if (isQa) {
        toRoomid = privateRoomId
        msgType = 1;
        requestUser = qaUser || loginId
    }
    if (!userInfo.avatarurl) {
        avatarUrl = msgAvatarUrl;
    }
    if (!userInfo.nickname) {
        userNickName = '学生测试'
    }



    if (isElectron) {
        const ipcRenderer = window.electron.ipcRenderer;
        const dataURLtoBlob = (dataurl) => {
            var arr = dataurl.split(","),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        ipcRenderer.removeAllListeners("shortcutCaptureDone");
        ipcRenderer.on(
            "shortcutCaptureDone",
            (event, dataURL, bounds) => {
                console.log("shortcutCaptureDone>>>", dataURL, "bounds>>>", bounds)
                const blob = dataURLtoBlob(dataURL);
                //dataURL = window.URL.createObjectURL(blob);
                console.log("blob>>>", blob)
                let file = {
                    url: dataURL,
                    data: blob,
                    filename: `截图文件${new Date().getTime()}.png`,
                    filetype: "png",
                    // 该参数用来标识图片发送对象的来源，主要告诉拦截器如果是截图，就不要在输入框生成缩略图了
                    from: "screenShot",
                    imgsrc: dataURL
                }
                sendImgMessage(toRoomid, '', file)
            }
        );
    }

    // 发送图片消息，及获取input 值
    const couterRef = useRef();
    const updateImage = () => {
        couterRef.current.focus()
        couterRef.current.click()
    }

    // 获取到点击的表情，加入到输入框
    const getEmoji = (e) => {
        const chatBoxTextArea = document.querySelector("#chat-box-textarea")
        /*
         * 处理逻辑：A 允许输入总长度   B 还可输入长度
         * 1、判断进来的字符串长度 C
         *      如果C 大于 B 做截取操作
         *      如果C 小于 B 直接输入
         */

        // 本次输入的内容
        let tempContent = e.target.innerText;
        // 本次输入的内容切割为数组
        let tempContentArr = Array.from(tempContent);
        // 剩余可输入字数
        let surplusCount = INPUT_SIZE - count;

        // 输入的字数大于剩余字数时，做裁减
        if (tempContentArr.length > surplusCount) {
            tempContentArr = tempContentArr.slice(0, surplusCount)
        }

        // 更新内容和长度
        let totalContent = content + tempContentArr.join("");
        let tempCount = Array.from(totalContent).length;
        setCount(tempCount);

        // 设置输入框内容
        setContent(totalContent);
        chatBoxTextArea.value = totalContent;

        setSendBtnDisabled((tempCount === 0 || tempCount > INPUT_SIZE) ? true : false);
        // 隐藏表情面板
        hideEmoji();
        // 输入框获取焦点
        document.querySelector("#chat-box-textarea").focus();
    }

    // 输入框消息
    const changeMsg = (e) => {
        const chatBoxTextArea = document.querySelector("#chat-box-textarea")

        let msgContent = e?.target?.value || e;
        let tempContent = Array.from(msgContent);

        if (tempContent.length > INPUT_SIZE) {
            tempContent = tempContent.slice(0, INPUT_SIZE);
        }

        // 更新内容和长度
        let tempCount = tempContent.length;
        setCount(tempCount);
        setContent(tempContent.join(""));
        setSendBtnDisabled((tempCount === 0 || tempCount > INPUT_SIZE) ? true : false)

        // 设置输入框内容
        chatBoxTextArea.value = tempContent.join("");
    }

    // 发送消息
    const sendMessage = (toRoomid, content) => {
        const chatBoxTextArea = document.querySelector("#chat-box-textarea")

        content = content.trim();

        // 消息为空不发送
        if (content === "") {
            setIsShow(true);
            setShowText(NOT_INPUT)
            setTimeout(() => {
                setIsShow(false);
            }, 2500);
            return false;
        }

        // 消息超长不发送
        if (count > INPUT_SIZE) {
            message.error(`消息内容不能超过${INPUT_SIZE}！`)
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
        // 发送消息，设置按钮为禁止点击
        setSendBtnDisabled(true);
        // 发送消息，将消息列表滚动条拉到最底部
        store.dispatch(messageListIsBottom(true));

        let id = WebIM.conn.getUniqueId();         // 生成本地消息id
        let msg = new WebIM.message('txt', id); // 创建文本消息
        let option = {
            msg: content,          // 消息内容
            to: toRoomid,               // 接收消息对象(聊天室id)
            chatType: 'chatRoom',            // 群聊类型设置为聊天室
            ext: {
                msgtype: msgType,   // 消息类型
                roomUuid: roomUuid,
                asker: requestUser,
                role: roleType,
                avatarUrl: avatarUrl,
                nickName: userNickName,
            },                         // 扩展消息
            success: function (id, serverId) {
                msg.id = serverId;
                msg.body.id = serverId;
                msg.body.time = (new Date().getTime()).toString()
                if (msg.body.ext.msgtype === 2) {
                    store.dispatch(qaMessages(msg.body, msg.body.ext.asker, { showNotice: false }, msg.body.ext.time));
                } else if (msg.body.ext.msgtype === 1) {
                    store.dispatch(qaMessages(msg.body, msg.body.ext.asker, { showNotice: !activeKey }, msg.body.ext.time));
                } else {

                    // 触发发送弹幕事件
                    document.dispatchEvent(
                        new CustomEvent("pushBarrage", {
                            detail: {
                                avatarUrl: msg.body.ext.avatarUrl,
                                data: msg.value
                            }
                        })
                    );

                    store.dispatch(roomMessages(msg.body, { showNotice: !activeKey }));
                }

                setContent('');
                chatBoxTextArea.value = "";
                setCount(0);
            },                               // 对成功的相关定义，sdk会将消息id登记到日志进行备份处理
            fail: function (err) {

                if (err.type === 501) {
                    setCount(0);
                    setContent('');
                    chatBoxTextArea.value = "";
                    setIsShow(true);
                    setShowText(TEXT_ERROR)
                    setTimeout(() => {
                        setIsShow(false);
                    }, 2500);
                }
            }
        };
        msg.set(option);
        WebIM.conn.send(msg.body);
    }

    useEffect(() => {

        let isComposition = false;

        const chatBoxTextArea = document.querySelector("#chat-box-textarea")

        if (!chatBoxTextArea) return;

        // 复合输入开始
        const compositionstartFunction = () => {
            isComposition = true;
        }
        chatBoxTextArea.addEventListener('compositionstart', compositionstartFunction);

        // 复合输入结束
        const addEventListenerFunction = (e) => {
            isComposition = false;
            changeMsg(e);
        }
        chatBoxTextArea.addEventListener('compositionend', addEventListenerFunction);

        // 非复合输入
        const inputFunction = (e) => {
            if (isComposition) return;
            changeMsg(e);
        }
        chatBoxTextArea.addEventListener('input', inputFunction);

        // 监听回车
        const keyupFunction = (e) => {
            if (e.keyCode === 13) {
                console.log('>>>>>');
                e.preventDefault();
                sendMessage(toRoomid, e.target.value);
            }
        }
        chatBoxTextArea.addEventListener('keyup', keyupFunction)


        return () => {
            chatBoxTextArea.removeEventListener('compositionstart', compositionstartFunction);
            chatBoxTextArea.removeEventListener('compositionend', addEventListenerFunction);
            chatBoxTextArea.removeEventListener('input', inputFunction);
            chatBoxTextArea.removeEventListener('keyup', keyupFunction)
        }

    }, [toRoomid, qaUser])

    // 发送图片
    const sendImgMessage = (toRoomid, e, type) => {
        var id = WebIM.conn.getUniqueId();                   // 生成本地消息id
        var msg = new WebIM.message('img', id);        // 创建图片消息
        let file = type ? type : WebIM.utils.getFileUrl(e.target)     // 将图片转化为二进制文件
        var allowType = {
            'jpeg': true,
            'jpg': true,
            'png': true,
            'bmp': true
        };
        if (file.data.size < 10240000) {
            if (file.filetype.toLowerCase() in allowType) {
                var option = {
                    file: file,
                    length: '3000',                       // 视频文件时，单位(ms)
                    to: toRoomid,
                    ext: {
                        msgtype: msgType,   // 消息类型
                        roomUuid: roomUuid,
                        asker: requestUser,
                        role: roleType,
                        avatarUrl: avatarUrl,
                        nickName: userNickName,
                    },                       // 接收消息对象
                    chatType: 'chatRoom',               // 设置为单聊
                    onFileUploadError: function (err) {      // 消息上传失败
                        console.log('onFileUploadError>>>', err);
                    },
                    onFileUploadComplete: function (res) {   // 消息上传成功
                        console.log('onFileUploadComplete>>>', res);
                    },
                    success: function (id, serverId) {                // 消息发送成功
                        msg.id = serverId;
                        msg.body.id = serverId;
                        msg.body.time = (new Date().getTime()).toString()
                        store.dispatch(qaMessages(msg.body, msg.body.ext.asker, { showRed: false }, msg.body.ext.time));
                        couterRef.current.value = null
                    },
                    fail: function (e) {
                        //如禁言、拉黑后发送消息会失败
                        couterRef.current.value = null
                    },
                    flashUpload: WebIM.flashUpload
                };
                msg.set(option);
                WebIM.conn.send(msg.body);
            } else {
                couterRef.current.value = null
                setIsShow(true);
                setShowText(IMG_SUPPORT)
                setTimeout(() => {
                    setIsShow(false);
                }, 2500);
            }
        } else {
            couterRef.current.value = null
            setIsShow(true);
            setShowText(IMG_MAX_SIZE)
            setTimeout(() => {
                setIsShow(false);
            }, 2500);
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

    // 点击截图
    const captureScreen = (e) => {
        console.log('e>>>>', e)
        e.preventDefault();
        let hideWindow = !checkValue;
        window.electron && window.electron.ipcRenderer.send("shortcutcapture", { hideWindow });
    }

    // 禁言后，判断权限是否遮盖输入框
    return (
        <div className='chat-box'>
            {/* 是否全局禁言 */}
            {!isTeacher && isAllMute && !isQa && <Flex className='msg-box-mute' flexDirection="column">
                <img src={iconMute} className="mute-state-icon" alt="" />
                <Text className='mute-msg'>全员禁言中</Text>
            </Flex>}
            {/* 是否被禁言 */}
            {(!isTeacher && isUserMute) && !isQa && <Flex className='msg-box-mute' flexDirection="column">
                <img src={iconMute} className="mute-state-icon" alt="" />
                <Text className='mute-msg'>你已被老师禁言，请谨慎发言哦</Text>
            </Flex>}
            {/* 不禁言展示发送框 */}
            {(isQa || (isTeacher || (!isUserMute && !isAllMute))) && <div >
                {
                    isShow && <Flex className='show-error' alignItems='center' justifyContent='left'>
                        <img src={iconError} style={{ width: 32, height: 32, paddingLeft: 10 }} alt="" />
                        <Text ml='10px' className='show-error-msg' >{showText}</Text>
                    </Flex>
                }
                <Flex justifyContent='flex-start' alignItems='center'>
                    {isEmoji && <ShowEomji getEmoji={getEmoji} hideEmoji={hideEmoji} />}
                    <RcTooltip placement="top" overlay="表情">
                        <img src={iconSmiley} onClick={showEmoji} className="chat-tool-item" alt="" />
                    </RcTooltip>
                    {isTool
                        && <RcTooltip placement="top" overlay="图片">
                            <div onClick={updateImage} className="chat-tool-item">
                                <img src={iconImage} alt="" />
                                {/* <Image src={icon_img} width='18px' background='#D3D6D8' ml='8px' /> */}
                                <input
                                    id="uploadImage"
                                    onChange={sendImgMessage.bind(this, toRoomid)}
                                    type="file"
                                    ref={couterRef}
                                    style={{
                                        display: 'none'
                                    }}
                                />
                            </div>
                        </RcTooltip>}
                    {isTool && isElectron && <RcTooltip placement="top" overlay="截图">
                        <img src={iconScreen} onClick={captureScreen} className="chat-tool-item" alt="" />
                    </RcTooltip>}
                    {isTool && isElectron && <UpOutlined className='icon-style' onClick={() => setShowCheck(!showCheck)} />}
                    {/* 截图功能选择 */}
                    {isTool && isElectron && showCheck &&
                        <div className='check-style'>
                            <div className='check-mask' onClick={() => setShowCheck(false)}></div>
                            <Checkbox checked={checkValue} onChange={() => setCheckValue(!checkValue)}><span style={{ marginLeft: '5px' }}>不隐藏当前窗口</span></Checkbox>
                        </div>}
                </Flex>
                <div>
                    {/* 输入框中placeholder：
                        教师端/助教端 聊天框显示：‘说点什么呗’；提问框显示：‘为他解答吧’； 
                        学生端 聊天框显示：‘说点什么呗’；提问框显示：‘开始提问吧’
                    */}
                    <textarea
                        id="chat-box-textarea"
                        placeholder={activeKey === CHAT_TABS_KEYS.chat ? (isQa ? '开始提问吧~' : '说点什么呗~') : '为Ta解答吧~'}
                        // onChange={(e) => changeMsg(e)}
                        className="msg-box"
                        //maxLength={INPUT_SIZE}
                        autoFocus
                        // value={content}
                        onClick={hideEmoji}
                    // onPressEnter={sendMessage(toRoomid, content)}
                    />
                </div>
                <Flex justifyContent='flex-end' className='btn-tool'>
                    <Text color="#626773" fontSize="12px">{count}/{INPUT_SIZE}</Text>
                    <button disabled={sendBtnDisabled} onClick={() => { sendMessage(toRoomid, content) }} className="msg-btn">
                        发送
                    </button>
                </Flex>
            </div>}
        </div>
    )
}

export default ChatBox;