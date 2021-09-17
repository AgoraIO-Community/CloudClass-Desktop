import React from 'react'
import { useSelector } from 'react-redux'
import { InputMsg } from './InputMsg'
import { ROLE } from '../../contants'
import './index.css'

const AllMute = () => {
    return (
        <div className="input-box all-mute">
            <span>全员禁言中</span>
        </div>
    )
}

const UserMute = () => {
    return (
        <div className="input-box all-mute">
            <span>您已被老师禁言，请谨慎发言</span>
        </div>
    )
}

export const InputBox = () => {
    const state = useSelector(state => state)
    const roleType = state?.propsData?.roleType;
    const isAllMute = state?.room.allMute;
    const isUserMute = state?.room.isUserMute;
    let isTeacher = roleType === ROLE.teacher.id;
    return <div className="input-box">
        {!isTeacher && isAllMute && <AllMute />}
        {!isTeacher && !isAllMute && isUserMute && <UserMute />}
        {(isTeacher || (!isAllMute && !isUserMute)) && <InputMsg isTeacher={isTeacher} />}
    </div>
}