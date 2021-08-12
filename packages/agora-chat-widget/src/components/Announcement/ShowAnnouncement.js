import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal } from 'antd';
import store from '../../redux/store';
import { transI18n } from '~ui-kit';
import { announcementStatus } from '../../redux/actions/roomAction';
import { updateAnnouncement } from '../../api/chatroom';
import { ROLE, DELETE_CONFIRM, DELETE_CONTENT } from '../../contants';
import announcement from '../../themes/img/announcement.png';

import './index.css';

const onChangeStatus = () => {
  store.dispatch(announcementStatus(false));
};

const Edit = () => {
  return (
    <span
      className="edit"
      onClick={() => {
        onChangeStatus();
      }}>
      {transI18n('chat.to_publish')}
    </span>
  );
};

export const ShowAnnouncement = () => {
  const [visible, setVisible] = useState(false);
  const state = useSelector((state) => state);
  const roomId = state.room.info.id;
  const Announcement = state.room.announcement;
  const roleType = state?.loginUserInfo.ext;
  // 在propsData 取值
  const isTeacher =
    roleType &&
    (JSON.parse(roleType).role === ROLE.teacher.id ||
      JSON.parse(roleType).role === ROLE.assistant.id);

  const callback = () => {
    hideModal();
  };

  const showModal = () => {
    setVisible(true);
  };

  const hideModal = () => {
    Modal.destroyAll();
    setVisible(false);
  };

  return (
    <div>
      {Announcement.length > 0 ? (
        <div className="announcement">
          <div className="announcement-box" id="deleteModal">
            {isTeacher && (
              <div className="menu">
                {/* updateAnnouncement(roomId, "" */}
                <span
                  className="update-content"
                  onClick={() => {
                    onChangeStatus();
                  }}>
                  {transI18n('chat.update')}
                </span>
                <span
                  className="update-content"
                  onClick={() => {
                    showModal();
                  }}>
                  {transI18n('chat.delete')}
                </span>
              </div>
            )}
            <div className="announcement-content">{Announcement}</div>
          </div>
        </div>
      ) : (
        <div className="no-show-icon">
          <div className="no-announcement">
            <img src={announcement} className="announcement-icon" />
            <div className="no-notice">
              <span className="no-notice-text">
                {' '}
                {transI18n('chat.default_announcement')}
              </span>
              {isTeacher && <Edit />}
            </div>
          </div>
        </div>
      )}
      <Modal
        title={transI18n('chat.delete_comfirm')}
        visible={visible}
        onOk={() => {
          updateAnnouncement(roomId, '', callback);
        }}
        onCancel={() => {
          hideModal();
        }}
        okText={transI18n('chat.ok')}
        cancelText={transI18n('chat.cancel')}
        width={280}
        className="delete-modal"
        style={{ top: '40%' }}
        destroyOnClose
        getContainer={document.getElementById('hx-chatroom')}>
        <span className="delete-text">{transI18n('chat.delete_content')}</span>
      </Modal>
    </div>
  );
};
