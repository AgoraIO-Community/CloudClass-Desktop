import { useState, useEffect, useRef } from 'react'
import { Input, Switch, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Flex, Text, Image } from 'rebass'
import { useSelector } from 'react-redux'
import { getRoomWhileList, getRoomUsers } from '../../../api/chatroom'
import WebIM from '../../../utils/WebIM'
import SearchList from './SearchList'
import MuteList from './MuteList'
import { ROOM_PAGESIZE } from '../constants'
import './userList.css'
import avatarUrl from '../../../themes/img/avatar-big@2x.png'
import voiceOff from '../../../themes/img/icon-mute.svg'
import voiceNo from '../../../themes/img/icon-chat.svg'
import forbid from '../../../themes/img/icon_forbid.svg'
import RcTooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'

const UserList = ({ roomUserList }) => {
    // 禁言列表
    const [isMute, setIsMute] = useState(false);
    // 搜索成员
    const [searchUser, setSearchUser] = useState('');
    const [muteMembers, setMuteMembers] = useState([]);
    const [loading, setLoading] = useState(false)
    const roomId = useSelector((state) => state.room.info.id)
    const memberCount = useSelector(state => state.room.info.affiliations_count)
    const roomMuteList = useSelector((state) => state.room.muteList);
    const roomListInfo = useSelector((state) => state.userListInfo);
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        let ary = []
        roomMuteList.forEach((item) => {
            ary.push(item)
        })
        setMuteMembers(ary);
    }, [roomMuteList])
    // 设置个人禁言
    const setUserMute = (roomId, val) => {
        let options = {
            chatRoomId: roomId,   // 聊天室id
            users: [val]   // 成员id列表
        };
        WebIM.conn.addUsersToChatRoomWhitelist(options).then((res) => {
            setLoading(false)
            getRoomWhileList(roomId)
            // store.dispatch(roomMuteUsers(true))
        }).catch(() => { setLoading(false) });
    }
    // 移除个人禁言
    const removeUserMute = (roomId, val) => {
        let options = {
            chatRoomId: roomId,  // 群组id
            userName: val           // 要移除的成员
        }
        WebIM.conn.rmUsersFromChatRoomWhitelist(options).then((res) => {
            setLoading(false)
            getRoomWhileList(roomId)
            // store.dispatch(roomMuteUsers(false))
        }).catch(() => { setLoading(false) });
    }
    // 禁言开关
    const onMuteList = checked => {
        setIsMute(checked);
    }
    // 搜索值
    const onSearch = e => {
        setSearchUser(e.target.value)
    }
    // 是否禁言
    const onSetMute = val => (e) => {
        let checked = muteMembers.includes(val)
        setLoading(true)
        if (!checked) {
            setUserMute(roomId, val);
        } else {
            removeUserMute(roomId, val);
        }
    }

    // useEffect(() => {
    //     getRoomUsers(currentPage, ROOM_PAGESIZE, roomId)
    // }, [])

    // 监听滚动条事件，滚动加载成员
    const userRef = useRef()
    const handleUser = (e) => {
        e.preventDefault()
        const scrollTop = userRef.current.scrollTop;
        const clientHeight = userRef.current.clientHeight;
        const scrollHeight = userRef.current.scrollHeight;
        const isBottom = scrollTop + clientHeight === scrollHeight;
        if (isBottom) {
            let count = parseInt(memberCount / ROOM_PAGESIZE) + 1
            if (currentPage < count) {
                getRoomUsers(currentPage + 1, ROOM_PAGESIZE, roomId);
                setCurrentPage(currentPage + 1)
            }
        }
    }

    return (
        <div style={{ height: '100%' }}>
            <div className='search-back'>
                <Input placeholder='输入学生姓名' className='search-user' onChange={onSearch} allowClear />
                <SearchOutlined className='search-icon' />
            </div>
            {
                !searchUser && <Flex justifyContent='flex-start' alignItems='center' mt='16px' mb='16px'>
                    <Switch
                        size="small"
                        title="禁言"
                        checked={isMute}
                        onChange={onMuteList}
                    />
                    <Text className='only-mute'>只看禁言</Text>
                </Flex>
            }
            {
                <div style={{ height: 'calc(100% + 100px)', overflowY: 'scroll' }} ref={userRef}>
                    {/* 是否展示搜索列表 */}
                    {searchUser && <SearchList roomListInfo={roomListInfo} searchUser={searchUser} onSetMute={onSetMute} muteMembers={muteMembers} />}
                    {!searchUser && isMute && <MuteList roomListInfo={roomListInfo} muteMembers={muteMembers} onSetMute={onSetMute} />}
                    {/* 展示列表及搜索结果列表 */}
                    {!searchUser && !isMute && roomUserList.map((item, key) => {
                        // if (!isMute || (isMute && muteMembers.includes(item.id))) {
                        return (
                            <Flex className="user-item" key={key} justifyContent='space-between' mt='16px' alignItems='center'>
                                <Flex alignItems='center'>
                                    <div className='list-user-box'>
                                        <Image className='list-user-img'
                                            src={item.avatarurl || avatarUrl}
                                        />
                                        {Number(item.ext) === 2 && muteMembers.includes(item.id) &&
                                            <Image className='list-user-forbid'
                                                src={forbid}
                                            />}
                                    </div>
                                    <Flex ml='8px' alignItems='center'>
                                        {Number(item.ext) === 1 && <Tag className='tags' ><Text className='tags-txt' ml='4px' mt='1px'>主讲老师</Text></Tag>}
                                        {Number(item.ext) === 3 && <Tag className='tags' ><Text className='tags-txt' ml='4px' mt='1px'>辅导老师</Text></Tag>}
                                        <Text className='username' ml='5px' >{item.nickname || item.id}</Text>
                                    </Flex>
                                </Flex>

                                {Number(item.ext) === 2
                                    && <RcTooltip placement="top" overlay={muteMembers.includes(item.id) ? '解除禁言' : '禁言'} >
                                        <div className='voice-img-box'>
                                            <img
                                                className='voice-img'
                                                src={muteMembers.includes(item.id) ? voiceNo : voiceOff}
                                                onClick={onSetMute(item.id)}
                                            />
                                        </div>
                                    </RcTooltip>}
                            </Flex>
                        )
                        // }
                    })}
                </div>
            }
        </div >
    )
}
export default UserList;