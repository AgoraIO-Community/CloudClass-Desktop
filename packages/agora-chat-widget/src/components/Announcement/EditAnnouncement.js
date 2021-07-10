import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Input, Button } from 'antd';
import { ANNOUNCEMENT_SIZE, MORE_SIZE } from '../../contants'
import { updateAnnouncement } from '../../api/chatroom'
import store from '../../redux/store'
import { announcementStatus } from '../../redux/actions/roomAction'

const { TextArea } = Input;
import './index.css'

export const EditAnnouncement = ({ onEdit }) => {
    const state = useSelector(state => state);
    const roomId = state?.room.info.id;
    const announcement = state?.room.announcement
    // 输入公告长度
    const [count, setCount] = useState(announcement.length)
    const [content, setContent] = useState(announcement)
    // 公告内容修改
    const changeContent = (e) => {
        let newContent = e.target.value;
        setCount(newContent.length);
        setContent(newContent);
    }


    const editStatus = () => {
        store.dispatch(announcementStatus(true))
    }
    return (
        <div className="edit-content">
            <TextArea
                placeholder="请在此输入内容"
                className="input-content"
                onChange={changeContent}
                // maxLength={ANNOUNCEMENT_SIZE}
                defaultValue={announcement}
                value={content}
            />
            <div className="tips-content">
                <div>{count > ANNOUNCEMENT_SIZE && <div className="more-message" >{MORE_SIZE}</div>}</div>
                <div className="count-content">{count}/{ANNOUNCEMENT_SIZE}</div>
            </div>
            <div className="btn-content">
                <Button type="default" shape="round" onClick={() => { editStatus() }}>取消</Button>
                <Button type="primary" shape="round" onClick={
                    () => { updateAnnouncement(roomId, content) }}>发布</Button>
            </div>
        </div>
    )
}