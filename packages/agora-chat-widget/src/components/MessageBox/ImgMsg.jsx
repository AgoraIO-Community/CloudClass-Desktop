import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Tag, Dropdown, Modal } from 'antd';
import { ROLE } from '../../contants';
import { transI18n } from '~components/i18n';
import './index.css';

export const ImgMsg = ({ item }) => {
  const state = useSelector((state) => state);
  const loginUser = state?.propsData.userUuid;
  const roleType = state?.propsData.roleType;
  const sender = item?.from === loginUser;
  const teacherTag = item?.ext.role === ROLE.teacher.id;
  const assistantTag = item?.ext.role === ROLE.assistant.id;
  const imgUrl = item?.url || item?.body?.url;
  const useAvatarUrl = item?.ext.avatarUrl;
  const userNickName = item?.ext.nickName;
  const imgHeight = item?.height;
  const imgWidth = item?.width;
  const isImgStyle = imgHeight > imgWidth;

  // 控制大图
  const [maxImg, setMaxImg] = useState(false);
  const [maxImgUrl, setMaxImgUrl] = useState('');

  // 点击展示大图
  const showMaximumPicture = (imgUrl) => {
    setMaxImgUrl(imgUrl);
    setMaxImg(true);
  };

  return (
    <div>
      <div>
        {sender ? (
          <div className="fcr-hx-msg-user-me">
            {teacherTag && <Tag className="fcr-hx-msg-tag">{transI18n('chat.teacher')}</Tag>}
            {assistantTag && <Tag className="fcr-hx-msg-tag">{transI18n('chat.assistant')}</Tag>}
            <span className="fcr-hx-msg-from-name text-level1">{userNickName}</span>
            {<img src={useAvatarUrl} className="fcr-hx-msg-avatar" alt="" />}
          </div>
        ) : (
          <div className="fcr-hx-msg-user-other">
            {<img src={useAvatarUrl} className="fcr-hx-msg-avatar" alt="" />}
            <span className="fcr-hx-msg-from-name text-level1">{userNickName}</span>
            {teacherTag && <Tag className="fcr-hx-msg-tag">{transI18n('chat.teacher')}</Tag>}
            {assistantTag && <Tag className="fcr-hx-msg-tag">{transI18n('chat.assistant')}</Tag>}
          </div>
        )}
        <div className={sender ? 'fcr-hx-msg-border' : ''}>
          <div style={{ margin: '8px' }} onClick={() => showMaximumPicture(imgUrl)}>
            <div
              style={{
                height: isImgStyle ? '160px' : '100px',
                width: isImgStyle ? '100px' : '160px',
                backgroundImage: `url(${imgUrl})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
              alt=""></div>
          </div>
        </div>
      </div>
      <Modal
        onCancel={() => setMaxImg(false)}
        visible={maxImg}
        footer={null}
        width={imgWidth}
        closable={false}
        bodyStyle={{
          padding: '0',
          display: 'flex',
          justifyContent: 'center',
          height: '80%',
        }}
        className="fcr-hx-max-img">
        <div className="fcr-hx-img-box">
          <img src={maxImgUrl} style={{ maxHeight: '720px', height: '100%' }} alt="" />
          <div className="fcr-hx-closeStyle" onClick={() => setMaxImg(false)}>
            X
          </div>
        </div>
      </Modal>
    </div>
  );
};
