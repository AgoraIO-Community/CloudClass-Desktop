import { Modal } from 'antd';
import { useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { transI18n } from '~ui-kit';
import { ROLE } from '../../contants';
import { announcementStatus } from '../../redux/actions/roomAction';
import announcement from '../../themes/img/announcement.png';
import './index.css';

const Edit = ({ onChangeStatus }) => {
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
  const store = useStore();
  const state = useSelector((state) => state);
  const { apis } = state;
  const roomId = state.room.info.id;
  const Announcement = state.room.announcement;
  const roleType = state?.propsData.roleType;
  // 在propsData 取值
  const isTeacher = roleType === ROLE.teacher.id;
  const isAssistant = roleType === ROLE.assistant.id;

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

  const onChangeStatus = () => {
    store.dispatch(announcementStatus(false));
  };

  return (
    <div>
      {Announcement.length > 0 ? (
        <div className="announcement">
          <div className="announcement-box" id="deleteModal">
            {(isTeacher || isAssistant) && (
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
              <span className="no-notice-text"> {transI18n('chat.default_announcement')}</span>
              {(isTeacher || isAssistant) && <Edit onChangeStatus={onChangeStatus} />}
            </div>
          </div>
        </div>
      )}
      <Modal
        title={transI18n('chat.delete_comfirm')}
        visible={visible}
        onOk={() => {
          apis.chatRoomAPI.updateAnnouncement(roomId, '', callback);
        }}
        onCancel={() => {
          hideModal();
        }}
        okText={transI18n('chat.ok')}
        cancelText={transI18n('chat.cancel')}
        className="delete-modal"
        style={{ top: '40%' }}
        destroyOnClose
        getContainer={document.getElementById('hx-chatroom')}>
        <span className="delete-text">{transI18n('chat.delete_content')}</span>
      </Modal>
    </div>
  );
};
