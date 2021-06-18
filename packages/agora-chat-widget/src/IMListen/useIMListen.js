import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import store from '../redux/store'
// import { message } from 'antd'
import { roomMessages, qaMessages, userMute } from '../redux/aciton'
import WebIM, { appkey } from '../utils/WebIM';
import { joinRoom, getRoomInfo, getRoomNotice, getRoomMuteList } from '../api/chatroom'
import { CHAT_TABS_KEYS } from '../components/MessageBox/constants'
import loginIM from '../api/login'
import _ from 'lodash'

// WebIM 注册监听回调
const useIMListen = ({ currentTab }) => {
    const history = useHistory();
    useEffect(() => {
        WebIM.conn.listen({
            onOpened: () => {
                joinRoom();
                // setTimeout(() => {
                //     history.push('/chatroom?chatRoomId=149861134565377&roomUuid=test222&roleType=3&userUuid=lizg8&avatarUrl=https://img2.baidu.com/it/u=1593081528,1330377059&fm=26&fmt=auto&gp=0.jpg&org=easemob-demo&apk=cloudclass&nickName=AB')
                // }, 500);
            },
            // 文本消息
            onTextMessage: (message) => {
                const { ext: { msgtype, asker } } = message
                if (msgtype === 0) {
                    store.dispatch(roomMessages(message, { showNotice: currentTab !== CHAT_TABS_KEYS.chat }))
                } else if ([1, 2].includes(msgtype)) {
                    store.dispatch(qaMessages(message, asker, { showNotice: currentTab !== CHAT_TABS_KEYS.qa && msgtype === 1 }))
                }
            },
            // 异常回调
            onError: (message) => {
                console.log('onError', message);
                const type = JSON.parse(_.get(message, 'data.data')).error_description;
                const resetName = store.getState().extData.userUuid;
                if (message.type === '16') {
                    return
                } else if (type === "user not found") {
                    let options = {
                        username: resetName.toLocaleLowerCase(),
                        password: resetName,
                        appKey: appkey,
                        success: function () {
                            loginIM();
                        },
                    };
                    WebIM.conn.registerUser(options);
                }
            },
            // 聊天室相关监听
            onPresence: (message) => {
                console.log('type-----', message.type);
                switch (message.type) {
                    case "memberJoinChatRoomSuccess":
                        getRoomInfo(message.gid);
                        // message.success(message.from + '已成功加入聊天室！');
                        // setTimeout(() => {
                        //     message.destroy();
                        // }, 3000);
                        break;
                    case "leaveChatRoom":
                        getRoomInfo(message.gid);
                        // message.success(message.from + '已离开聊天室！');
                        // setTimeout(() => {
                        //     message.destroy();
                        // }, 3000);
                        break;
                    case "updateAnnouncement":
                        getRoomNotice(message.gid)
                        break;
                    case 'muteChatRoom':
                        getRoomInfo(message.gid);
                        break;
                    case 'rmChatRoomMute':
                        getRoomInfo(message.gid);
                        break;
                    case 'addMute':
                        getRoomMuteList(message.gid);
                        store.dispatch(userMute(true))
                        break;
                    case 'removeMute':
                        getRoomMuteList(message.gid);
                        store.dispatch(userMute(false))
                        break;
                    default:
                        break;
                }
            },
            onCustomMessage: (message) => {
                console.log('CUSTOM--', message);
                // store.dispatch(roomMessages(message))
                store.dispatch(roomMessages(message, { showNotice: currentTab !== CHAT_TABS_KEYS.chat }))
            },
            onPictureMessage: (message) => {
                console.log('onPictureMessage', message);
                store.dispatch(qaMessages(message, message.ext.asker, { showNotice: currentTab !== CHAT_TABS_KEYS.qa }))
            }, //收到图片消息
            onCmdMessage: (message) => {
                console.log('onCmdMessage', message);
                // store.dispatch(roomMessages(message))
                store.dispatch(roomMessages(message, { showNotice: currentTab !== CHAT_TABS_KEYS.chat }))
            },
        })
    }, [history, currentTab])
}
export default useIMListen;