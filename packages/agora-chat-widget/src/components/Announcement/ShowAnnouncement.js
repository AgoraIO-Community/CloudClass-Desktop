import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import store from '../../redux/store'
import { announcementStatus } from '../../redux/actions/roomAction'
import { updateAnnouncement } from '../../api/chatroom'
import { ROLE } from '../../contants'
import announcement from '../../themes/img/announcement.png'

import './index.css'

const onChangeStatus = () => {
    store.dispatch(announcementStatus(false))
}

const Edit = () => {
    return (
        <span className="edit" onClick={() => { onChangeStatus() }} >去发布</span>
    )
};


export const ShowAnnouncement = () => {
    const state = useSelector(state => state);
    const roomId = state.room.info.id;
    const Announcement = state.room.announcement;
    const roleType = state?.loginUserInfo.ext;
    // 在propsData 取值
    const isTeacher = roleType && JSON.parse(roleType).role === ROLE.teacher.id;
    return <div className="announcement">
        {
            Announcement.length > 0 ?
                <div className="announcement-box">
                    {
                        isTeacher && <div className="menu">
                            <span className="update-content" onClick={() => { onChangeStatus() }}>修改</span>
                            <span className="update-content" onClick={() => { updateAnnouncement(roomId, "") }}>删除</span>
                        </div>
                    }
                    <div className="announcement-content">
                        {Announcement}
                    </div>
                </div> : <div className="no-announcement">
                    <img src={announcement} alt="公告" className="announcement-icon" />
                    <div className="no-notice"><span>暂无公告，</span>{isTeacher && <Edit />}</div>
                </div>
        }
    </div>
}