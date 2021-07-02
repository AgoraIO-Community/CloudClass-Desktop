import { useState, useEffect, memo } from 'react'
import { useSelector } from 'react-redux'
import { Image, Flex } from 'rebass'
import _ from 'lodash'
import store from '../../../redux/store'
import { removeShowRed, setCurrentUser } from '../../../redux/aciton'
import QaMessage from './QaMessage'
import { getUserInfo } from '../../../api/userInfo'
import { CHAT_TABS, CHAT_TABS_KEYS } from '../constants'
import './QaMessage.css'
import avatarUrl from '../../../themes/img/avatar-big@2x.png'

const QaUserList = ({ getClickUser }) => {
    const roomListInfo = useSelector(state => state.userListInfo)
    const qaList = useSelector(state => state.messages.qaList);
    const isTab = useSelector(state => state.activeKey);
    const currentUser = useSelector(state => state.currentUser);;
    const isQaList = (Object.keys(qaList)).length === 0
    // 遍历，拿到需要的ID和时间
    let newUser = [];
    let leaveUser = []
    _.forEach(qaList, function (v, k) {
        if (!(roomListInfo[k])) {
            leaveUser.push(k)
        }
        newUser.push({ id: k, time: v.time })
    })
    leaveUser.length > 0 && getUserInfo(leaveUser)
    // 根据 时间进行排序
    let sortArr = _.orderBy(newUser, ['time'], ['desc'])

    // 拿到需要回复提问者id
    const getUser = (user) => {
        getClickUser(user)
        store.dispatch(setCurrentUser(user))
        store.dispatch(removeShowRed(user))
    }
    let bool = isTab === CHAT_TABS_KEYS.qa && sortArr.length > 0
    useEffect(() => {
        if (sortArr.length > 0) {
            if (currentUser === '') {
                getUser(sortArr[0].id)
            } else {
                getUser(currentUser)
            }
        }
    }, [bool])

    // 在当前聊天页，收到新消息不展示红点
    useEffect(() => {
        if (qaList[currentUser]) {
            if (isTab === CHAT_TABS_KEYS.qa) {
                // getClickUser(currentUser)
                store.dispatch(removeShowRed(currentUser))
            }
        }
    }, [_.get(qaList[currentUser], 'msg')])
    return (
        <Flex style={{ height: 'calc(100% - 25px)' }}>
            {
                isQaList ? (
                    <div className='qa-mark'></div>
                ) : (
                    <div className='user-border'>
                        {
                            sortArr.map((user, k) => {
                                return (
                                    <Flex onClick={() => getUser(user.id)} key={k} className="qa-user-list" m="6px" style={{ backgroundColor: currentUser === user.id ? "#2D3340" : "transparent" }}>
                                        <Image src={_.get(roomListInfo[user.id], 'avatarurl') || avatarUrl}
                                            className="qa-user-image"
                                        />
                                        {qaList[user.id].showRedNotice && (
                                            <div className='qa-red-notice'></div>
                                        )}
                                    </Flex>
                                )
                            })
                        }
                    </div>
                )
            }
            {/*  */}
            < QaMessage />
        </Flex>
    )
}

export default memo(QaUserList);