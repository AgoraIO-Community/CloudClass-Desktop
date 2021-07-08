import { useState,useEffect } from 'react'
import { Switch } from 'antd'
import { Flex, Text, Image } from 'rebass'
import _ from 'lodash'
import voiceOff from '../../../themes/img/icon-mute.svg'
import voiceNo from '../../../themes/img/icon-chat.svg'
import forbid from '../../../themes/img/icon_forbid.svg'
import RcTooltip from 'rc-tooltip'
import avatarUrl from '../../../themes/img/avatar-big@2x.png'
import 'rc-tooltip/assets/bootstrap_white.css'

const MuteList = ({ roomListInfo, muteMembers, onSetMute,searchUser }) => {
    const [dataLength, setDataLength] = useState(false);
    useEffect(() => {
        setDataLength(false)
    }, [searchUser,muteMembers])
    return (
        <div>
            {muteMembers.map((member, key) => {
                const isTeacher = roomListInfo && (Number(_.get(roomListInfo[member], 'ext')) === 3 || Number(_.get(roomListInfo[member], 'ext')) === 1);
                if (!isTeacher && !isNaN(Number(_.get(roomListInfo[member], 'ext')))) {
                    if(!dataLength){
                        setDataLength(true)
                    }
                    return <Flex className="user-item" justifyContent='space-between' alignItems='center' mt='16px' key={key}>
                        <Flex alignItems='center'>
                            <div className='list-user-box'>
                                <Image src={(_.get(roomListInfo[member], 'avatarurl',avatarUrl))} className='list-user-img' />
                                <Image className='list-user-forbid'
                                    src={forbid}
                                />
                            </div>

                            <Text className='username' ml='5px' >{_.get(roomListInfo[member], 'nickname') || _.get(roomListInfo[member], 'id')}</Text>
                        </Flex>
                        <RcTooltip placement="top" overlay={muteMembers.includes(_.get(roomListInfo[member], 'id')) ? '解除禁言' : '禁言'} >
                            <div className='voice-img-box'>
                                <img
                                className='voice-img'
                                title="禁言"
                                src={muteMembers.includes(_.get(roomListInfo[member], 'id'))? voiceNo : voiceOff}
                                onClick={onSetMute(_.get(roomListInfo[member], 'id'))}
                                />
                            </div>
                        </RcTooltip>
                    </Flex>
                }
            })}
            {!dataLength && <div className='no-search'>无搜索结果</div>} 
        </div>
    )
}

export default MuteList;