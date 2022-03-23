import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Tag, Dropdown, Modal } from 'antd';
import { ROLE } from '../../contants';
import { transI18n } from '~ui-kit';
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
          <div className="msg-user-me">
            {teacherTag && <Tag className="msg-tag">{transI18n('chat.teacher')}</Tag>}
            {assistantTag && <Tag className="msg-tag">{transI18n('chat.assistant')}</Tag>}
            <span className="msg-from-name">{userNickName}</span>
            {<img src={useAvatarUrl} className="msg-avatar" alt="" />}
          </div>
        ) : (
          <div className="msg-user-other">
            {<img src={useAvatarUrl} className="msg-avatar" alt="" />}
            <span className="msg-from-name">{userNickName}</span>
            {teacherTag && <Tag className="msg-tag">{transI18n('chat.teacher')}</Tag>}
            {assistantTag && <Tag className="msg-tag">{transI18n('chat.assistant')}</Tag>}
          </div>
        )}
        <div className={sender ? 'msg-border' : ''}>
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
        className="max-img">
        <div className="img-box">
          <img src={maxImgUrl} style={{ maxHeight: '720px', height: '100%' }} alt="" />
          <div className="closeStyle" onClick={() => setMaxImg(false)}>
            X
          </div>
        </div>
      </Modal>
    </div>
  );
};
