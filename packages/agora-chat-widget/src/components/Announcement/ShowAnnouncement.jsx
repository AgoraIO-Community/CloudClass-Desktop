import { Modal } from 'antd';
import { useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { transI18n } from '~components/i18n';
import { ROLE } from '../../contants';
import { announcementStatus } from '../../redux/actions/roomAction';
import announcement from '../../themes/img/announcement.png';
import './index.css';

const Edit = ({ onChangeStatus }) => {
  return (
    <span
      className="fcr-hx-edit"
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
        <div className="fcr-hx-announcement">
          <div className="fcr-hx-announcement-box" id="deleteModal">
            {(isTeacher || isAssistant) && (
              <div className="fcr-hx-menu">
                {/* updateAnnouncement(roomId, "" */}
                <span
                  className="fcr-hx-update-content"
                  onClick={() => {
                    onChangeStatus();
                  }}>
                  {transI18n('chat.update')}
                </span>
                <span
                  className="fcr-hx-update-content"
                  onClick={() => {
                    showModal();
                  }}>
                  {transI18n('chat.delete')}
                </span>
              </div>
            )}
            <div className="fcr-hx-announcement-content">{Announcement}</div>
          </div>
        </div>
      ) : (
          <div className="fcr-hx-no-show-icon">
            <div className="fcr-hx-no-announcement">
              <img src={announcement} className="fcr-hx-announcement-icon" />
              <div className="fcr-hx-no-notice">
                <span className="fcr-hx-no-notice-text"> {transI18n('chat.default_announcement')}</span>
              {(isTeacher || isAssistant) && (
                  <span className="fcr-hx-no-notice-text"> {transI18n('chat.sentence_connector')}</span>
              )}
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
        className="fcr-hx-delete-modal"
        style={{ top: '40%' }}
        destroyOnClose
        getContainer={document.getElementById('hx-chatroom')}>
        <span>{transI18n('chat.delete_content')}</span>
      </Modal>
    </div>
  );
};
