import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Tag, Tooltip } from 'antd';
import { ROLE } from '../../contants'
import { setUserMute, removeUserMute } from '../../api/mute'
import _ from 'lodash'
import avatarUrl from '../../themes/img/avatar-big@2x.png'
import muteNo from '../../themes/img/muteNo.png'
import muteOff from '../../themes/img/muteOff.png'
import '../MessageBox/index.css'

// 禁言
const mute = (roomId, val, userId) => {
    if (val) {
        removeUserMute(roomId, userId)
    } else {
        setUserMute(roomId, userId)
    }
}

// 成员页面
export const UserList = ({ roomUserList }) => {
    const state = useSelector(state => state);
    // 改成枚举
    const roomId = state?.room.info.id;
    const muteList = state?.room.muteList;

    return <div className="user">
        {
            roomUserList.length > 0 && roomUserList.map((item, key) => {
                const showMuteIcon = muteList && muteList.includes(item.id);
                const isTeacher = item?.ext && JSON.parse(item?.ext).role === ROLE.teacher.id
                return (
                    <div className="user-list" key={key}>
                        <div className="user-info">
                            <img src={item?.avatarurl || avatarUrl} className="user-avatar" />
                            <span className="user-text" >{item?.nickname || item?.id}</span>
                            {isTeacher ?
                                <Tag className="user-tag teacher-tag" >
                                    <span className="teacher-text" >
                                        {ROLE.teacher.tag}
                                    </span>
                                </Tag> : <Tag className="user-tag student-tag">
                                    <span className="tag-text">
                                        {ROLE.student.tag}
                                    </span>
                                </Tag>}
                        </div>
                        {!isTeacher && <Tooltip placement="top" overlay={muteList.includes(item.id) ? '解除禁言' : '禁言'}>
                            <div className="mute-icon">
                                <img src={showMuteIcon ? muteOff : muteNo} onClick={(e) => { mute(roomId, showMuteIcon, item.id) }} />
                            </div>
                        </Tooltip>}
                    </div>
                )
            })
        }
    </div>

}