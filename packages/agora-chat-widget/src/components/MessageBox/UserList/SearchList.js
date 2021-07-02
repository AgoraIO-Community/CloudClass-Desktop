import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { Flex, Text, Image } from 'rebass'
import { Switch, Tag } from 'antd';
import _ from 'lodash'
import avatarUrl from '../../../themes/img/avatar-big@2x.png'
import voiceOff from '../../../themes/img/icon-mute.svg'
import voiceNo from '../../../themes/img/icon-chat.svg'
import forbid from '../../../themes/img/icon_forbid.svg'
import RcTooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'

const SearchList = ({ roomListInfo, searchUser, onSetMute, muteMembers }) => {
    const [dataLength, setDataLength] = useState(false);
    useEffect(() => {
        setDataLength(false)
    }, [searchUser])
    const roomOwner = useSelector((state) => state.room.info.owner);
    const roomUsers = useSelector(state => state.room.users)
    // const roomAdmins = useSelector((state) => state.room.admins);
    // 新的空数组，存用户头像，昵称，环信ID
    const aryList = [];
    Object.keys(roomListInfo).forEach(item => {
        const userName = roomListInfo[item].nickname;
        const avatarUrl = roomListInfo[item].avatarurl;
        const roleType = roomListInfo[item].ext;
        if (roomUsers.includes(item)) {
            aryList.push([userName, avatarUrl, item, roleType]);
        }
    })

    let speakerTeacher = []
    let coachTeacher = []
    let student = []
    let audience = []

    _.forIn(aryList, (val, key) => {
        let newVal = {}
        switch (val[3]) {
            case '0':
                newVal = _.assign(val, { id: val[2] })
                audience.push(newVal)
                break;
            case '1':
                newVal = _.assign(val, { id: val[2] })
                speakerTeacher.push(newVal)
                break;
            case '2':
                newVal = _.assign(val, { id: val[2] })
                student.push(newVal)
                break;
            case '3':
                newVal = _.assign(val, { id: val[2] })
                coachTeacher.push(newVal)
                break;
            default:
                break;
        }
    })
    const roomUserList = _.concat(speakerTeacher, coachTeacher, audience, student)
    return (
        <div>
            {
                roomUserList.map((member, key) => {
                    if (member[2] === roomOwner) {
                        return null
                    } else {
                        if (member[0] && (member[0].toLocaleLowerCase()).indexOf(searchUser.toLocaleLowerCase()) !== -1) {
                            if (!dataLength) {
                                setDataLength(true)
                            }
                            return (
                                <Flex className="user-item" justifyContent='space-between' alignItems='center' mt='16px' key={key}>
                                    <Flex alignItems='center'>
                                        <div className='list-user-box'>
                                            <Image src={member[1] || avatarUrl} className='list-user-img' />
                                            {Number(member[3]) === 2 && muteMembers.includes(member[2]) && <Image className='list-user-forbid' src={forbid} />}
                                        </div>


                                        <Flex ml='8px'>
                                            {Number(member[3]) === 1 && <Tag className='tags' ><Text className='tags-txt' ml='4px' mt='1px'>主讲老师</Text></Tag>}
                                            {Number(member[3]) === 3 && <Tag className='tags' ><Text className='tags-txt' ml='4px' mt='1px'>辅导老师</Text></Tag>}
                                            <Text className='username' ml='5px' >{member[0]}</Text>
                                        </Flex>
                                    </Flex>
                                    {/* {
                                        Number(member[3]) === 2 && <Switch
                                            size="small"
                                            title="禁言"
                                            checked={muteMembers.includes(member[2])}
                                            onClick={onSetMute(member[2])}
                                        />
                                    } */}
                                    {
                                        Number(member[3]) === 2 &&
                                        <RcTooltip placement="top" overlay={muteMembers.includes(member[2]) ? '解除禁言' : '禁言'} >
                                            <div className='voice-img-box'>
                                                <img
                                                    className='voice-img'
                                                    src={muteMembers.includes(member[2]) ? voiceNo : voiceOff}
                                                    onClick={onSetMute(member[2])} />
                                            </div>
                                        </RcTooltip>
                                    }
                                </Flex>
                            )
                        }
                    }
                })
            }
            {!dataLength && <div className='no-search'>无搜索结果</div>}
        </div>
    )
}

export default SearchList;