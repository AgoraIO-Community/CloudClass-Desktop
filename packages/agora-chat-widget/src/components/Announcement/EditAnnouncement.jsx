import { Button, Input } from 'antd';
import { useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { transI18n } from '~components/i18n';
import { ANNOUNCEMENT_SIZE } from '../../contants';
import { announcementStatus } from '../../redux/actions/roomAction';
import './index.css';

const { TextArea } = Input;

export const EditAnnouncement = () => {
  const state = useSelector((state) => state);
  const store = useStore();
  const { apis } = state;
  const roomId = state?.room.info.id;
  const announcement = state?.room.announcement;
  // 输入公告长度
  const [count, setCount] = useState(announcement.length);
  const [content, setContent] = useState(announcement);
  // 公告内容修改
  const changeContent = (e) => {
    let newContent = e.target.value;
    setCount(newContent.length);
    setContent(newContent);
  };

  const editStatus = () => {
    store.dispatch(announcementStatus(true));
  };
  return (
    <div className="fcr-hx-edit-content">
      <TextArea
        placeholder={transI18n('chat.enter_contents')}
        className="fcr-hx-input-content"
        onChange={changeContent}
        // maxLength={ANNOUNCEMENT_SIZE}
        defaultValue={announcement}
        value={content}
      />
      <div className="fcr-hx-tips-content">
        <div>
          {count > ANNOUNCEMENT_SIZE && (
            <div className="fcr-hx-more-message">{transI18n('chat.announcement_content')}</div>
          )}
        </div>
        <div className="fcr-hx-count-content">
          {count}/{ANNOUNCEMENT_SIZE}
        </div>
      </div>
      <div className="fcr-hx-btn-content">
        <Button
          type="text"
          className="fcr-hx-cancel-btn"
          onClick={() => {
            editStatus();
          }}>
          <span className="fcr-hx-btn-text fcr-hx-cancel-btn-text">{transI18n('chat.cancel')}</span>
        </Button>
        <Button
          type="primary"
          className="fcr-hx-ok-btn"
          onClick={() => {
            apis.chatRoomAPI.updateAnnouncement(roomId, content);
          }}>
          <span className="fcr-hx-btn-text fcr-hx-ok-btn-text">{transI18n('chat.publish')}</span>
        </Button>
      </div>
    </div>
  );
};
