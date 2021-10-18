import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Tag, Tooltip } from 'antd';
import { ROLE } from '../../contants'
import { setUserMute, removeUserMute } from '../../api/mute'
import _ from 'lodash'
import avatarUrl from '../../themes/img/avatar-big@2x.png'
import muteNo from '../../themes/img/muteNo.png'
import muteOff from '../../themes/img/muteOff.png'
import './index.css'

// 禁言
const mute = (val, userId) => {
    if (val) {
        removeUserMute(userId)
    } else {
        setUserMute(userId)
    }
}

// 成员页面
export const UserList = ({ roomUserList }) => {
    const state = useSelector(state => state);
    // 改成枚举
    const muteList = state?.room.muteList;

    const userList = roomUserList.filter(user => {
        const { ext } = user;
         if (ext) {
            let role = JSON.parse(ext).role
            if(role === ROLE.assistant.id) {
                return false
            }else {
                return true
            }
         }else {
             return true
         }
    })

    return <div className="user">
        {
            roomUserList.length > 0 && userList.map((item, key) => {
                const showMuteIcon = muteList && muteList.includes(item.id);
                const { ext } = item;
                let role;
                if (ext) {
                    role = JSON.parse(ext).role
                }
                const isTeacher = role === ROLE.teacher.id;
                const isStudent = role === ROLE.student.id;
                const isRobot = role === ROLE.audience.id;
                return (
                    <div className="user-list" key={key}>
                        <div className="user-info">
                            <img src={item?.avatarurl || avatarUrl} className="user-avatar" />
                            <span className="user-text" >{item?.nickname || item?.id}</span>
                            {isTeacher && <Tag className="user-tag teacher-tag" >
                                    <span className="teacher-text" >
                                        {ROLE.teacher.tag}
                                    </span>
                                </Tag>}
                            {isStudent && <Tag className="user-tag student-tag">
                                    <span className="tag-text">
                                        {ROLE.student.tag}
                                    </span>
                                </Tag>}
                            {isRobot && <Tag className="user-tag teacher-tag" >
                                    <span className="teacher-text" >
                                    {ROLE.audience.tag}
                                    </span>
                                </Tag>}
                        </div>
                        {!isTeacher && !isRobot && <Tooltip placement="leftBottom" overlay={muteList.includes(item.id) ? '解除禁言' : ' 禁言 '}>
                            <div className="mute-icon">
                                <img src={showMuteIcon ? muteOff : muteNo} onClick={(e) => { mute(showMuteIcon, item.id) }} />
                            </div>
                        </Tooltip>}
                    </div>
                )
            })
        }
    </div>

}