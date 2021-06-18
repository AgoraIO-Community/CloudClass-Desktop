import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux";
import cx from 'classnames'
import ShowNotice from './ShowNotice'
import EditNotice from './EditNotice'
import MoreNotice from './MoreNotice'
import './index.css'

const Notice = ({ isEdit, isEditNoticeChange }) => {
    const isTeacher = useSelector(state => state.loginInfo.ext)
    const noticeContent = useSelector((state) => state.room.notice);
    const [roomAnnouncement, setRoomAnnouncement] = useState('')

    useEffect(() => {
        setRoomAnnouncement(noticeContent)
    }, [noticeContent])

    // 显示公告编辑框  
    const onEdit = () => {
        isEditNoticeChange(1);
    };
    // 关闭公告编辑框
    const onView = () => {
        isEditNoticeChange(0);
    };
    // 显示更多公告内容
    const onMore = () => {
        isEditNoticeChange(2);
    };
    // 判断权限是否为 admin 或 owner
    const hasEditPermisson = (Number(isTeacher) === 3)
    return (
        <div className={cx("notice", {'notice-edit-and-more': isEdit !== 0 })}>
            { isEdit === 0 && < ShowNotice hasEditPermisson={hasEditPermisson} roomAnnouncement={roomAnnouncement} onEdit={onEdit} onMore={onMore} /> }
            { isEdit === 1 && < EditNotice hasEditPermisson={hasEditPermisson} roomAnnouncement={roomAnnouncement} onView={onView} /> }
            { isEdit === 2 && < MoreNotice hasEditPermisson={hasEditPermisson} roomAnnouncement={roomAnnouncement} onView={onView} onEdit={onEdit} /> }
        </div >
    )

}
export default Notice;

