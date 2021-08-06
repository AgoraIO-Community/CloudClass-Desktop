import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal } from 'antd';
import store from '../../redux/store';
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
      去发布
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
  const isTeacher = roleType && JSON.parse(roleType).role === ROLE.teacher.id;

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
                  修改
                </span>
                <span
                  className="update-content"
                  onClick={() => {
                    showModal();
                  }}>
                  删除
                </span>
              </div>
            )}
            <div className="announcement-content">{Announcement}</div>
          </div>
        </div>
      ) : (
        <div className="no-show-icon">
          <div className="no-announcement">
            <img src={announcement} alt="公告" className="announcement-icon" />
            <div className="no-notice">
              <span className="no-notice-text">暂无公告，</span>
              {isTeacher && <Edit />}
            </div>
          </div>
        </div>
      )}
      <Modal
        title={DELETE_CONFIRM}
        visible={visible}
        onOk={() => {
          updateAnnouncement(roomId, '', callback);
        }}
        onCancel={() => {
          hideModal();
        }}
        okText="确认"
        cancelText="取消"
        width={280}
        className="delete-modal"
        style={{ top: '40%' }}
        destroyOnClose
        getContainer={document.getElementById('hx-chatroom')}>
        <span className="delete-text">{DELETE_CONTENT}</span>
      </Modal>
    </div>
  );
};
