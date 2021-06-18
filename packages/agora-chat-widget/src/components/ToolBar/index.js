import React from 'react'
import { useSelector } from "react-redux";
import WebIM from '../../utils/WebIM'
import store from '../../redux/store'
import { isReward, isQa, roomAllMute } from '../../redux/aciton'
import { Flex, Text } from 'rebass'
import { Switch } from 'antd';
import ChatBox from '../ChatBox'
import './index.css'
import { CHAT_TABS_KEYS } from '../MessageBox/constants'
import iconQaMode from '../../themes/img/icon-qa-mode.svg'


const ToolBar = ({ tabKey, hide, isTool, qaUser, activeKey }) => {
    // const userName = useSelector((state) => state.loginName);
    const roomId = useSelector((state) => state.room.info.id);
    const isTeacher = useSelector((state) => state.loginInfo.ext);
    const isAllMute = useSelector((state) => state.isRoomAllMute);
    const isQaSwitch = useSelector((state) => state.isQa)
    const isGift = useSelector(state => state.isReward);
    const rommAnnouncement = (useSelector(state => state.room.notice))
    const isAdmins = Number(isTeacher) === 1 || Number(isTeacher) === 3;

    // 赞赏开关
    const onChangeReward = (val) => {
        if (!val) {
            store.dispatch(isReward(true))
        } else {
            store.dispatch(isReward(false))
        }
    }
    // 全局禁言开关
    const onChangeMute = (val) => {
        if (!val) {
            setAllmute();
        } else {
            removeAllmute();
        }
    }
    // 提问消息开关
    function onChangeQa(val) {
        if (!val) {
            store.dispatch(isQa(true))
        } else {
            store.dispatch(isQa(false))
        }
    }

    // 一键禁言
    const setAllmute = () => {
        let options = {
            roomId: roomId,                 // 聊天室id   
            announcement: "1" + rommAnnouncement    // 公告内容                        
        };
        WebIM.conn.updateChatRoomAnnouncement(options).then((res) => {
            store.dispatch(roomAllMute(true))
        })
    }
    // 解除一键禁言
    const removeAllmute = () => {
        let options = {
            roomId: roomId,                 // 聊天室id   
            announcement: "0" + rommAnnouncement    // 公告内容                        
        };
        WebIM.conn.updateChatRoomAnnouncement(options).then((res) => {
            store.dispatch(roomAllMute(false))
        })
    }
    return (
        // 成员列表不展示footer
        <>
        { activeKey !== CHAT_TABS_KEYS.user && <div className='footer'>
            <>
                {/* 只有聊天模式下才展示toolBar */}
                <div className='footer-toolBar' style={{visibility: tabKey === CHAT_TABS_KEYS.chat ? 'visible' : 'hidden'}}>

                    {isAdmins ? (
                        <>
                            {!isTool  && 
                                <Flex justifyContent="space-between" alignItems='center' m='0 12px' height='36px'>
                                    <Flex>
                                        <Switch size="small"
                                            checked={isGift}
                                            onClick={() => { onChangeReward(isGift) }}/>
                                        <Text className="tb-switch-label">隐藏赞赏</Text>
                                    </Flex>
                                    <Flex>
                                        <Switch size="small"
                                            checked={isAllMute}
                                            onClick={() => { onChangeMute(isAllMute) }}/>
                                        <Text className="tb-switch-label">全员禁言</Text>
                                    </Flex>
                                </Flex>
                            }
                        </>
                    ) : (
                        <Flex justifyContent="space-between" alignItems='center' m='0 12px' height='36px'>
                            <Flex>
                                {isQaSwitch 
                                &&  <>
                                        <img src={iconQaMode} style={{width: 14}}></img>
                                        <Text className="tb-switch-label" style={{color: '#626773'}}>提问模式已开启</Text>
                                    </>
                                }
                            </Flex>
                            <Flex>
                                <Switch size="small" checked={isQaSwitch} onClick={() => { onChangeQa(isQaSwitch) }}/>
                                <Text className="tb-switch-label">提问模式</Text>
                            </Flex>
                        </Flex>
                    )}
                </div>
                {/* 聊天输入框 */}
                <ChatBox isAllMute={isAllMute} isTool={isTool} qaUser={qaUser} activeKey={activeKey} />
            </>
        </div>}
        </>
    )
}
export default ToolBar;