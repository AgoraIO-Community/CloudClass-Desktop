import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Tag, Tooltip } from 'antd';
import { ROLE } from '../../contants';
import { transI18n } from '~ui-kit';
import { setUserMute, removeUserMute } from '../../api/mute';
import _ from 'lodash';
import avatarUrl from '../../themes/img/avatar-big@2x.png';
import muteNo from '../../themes/img/muteNo.png';
import muteOff from '../../themes/img/muteOff.png';
import './index.css';

// 禁言
const mute = (val, userId) => {
  if (val) {
    removeUserMute(userId);
  } else {
    setUserMute(userId);
  }
};

// 成员页面
export const UserList = ({ roomUserList }) => {
  const state = useSelector((state) => state);
  // 改成枚举
  const muteList = state?.room.muteList;

  return (
    <div className="user">
      {roomUserList.length > 0 &&
        roomUserList.map((item, key) => {
          const showMuteIcon = muteList && muteList.includes(item.id);
          const isTeacher =
            item?.ext && JSON.parse(item?.ext).role === ROLE.teacher.id;
          const isAssistant =
            item?.ext && JSON.parse(item?.ext).role === ROLE.assistant.id;
          return (
            <div className="user-list" key={key}>
              <div className="user-info">
                <img
                  src={item?.avatarurl || avatarUrl}
                  className="user-avatar"
                />
                <span className="user-text">{item?.nickname || item?.id}</span>
                {isTeacher && (
                  <Tag className="user-tag teacher-tag">
                    <span className="teacher-text">
                      {transI18n('chat.teacher')}
                    </span>
                  </Tag>
                )}
                {isAssistant && (
                  <Tag className="user-tag teacher-tag">
                    <span className="teacher-text">
                      {transI18n('chat.assistant')}
                    </span>
                  </Tag>
                )}
              </div>
              {!isTeacher && !isAssistant && (
                <Tooltip
                  placement="leftBottom"
                  overlay={
                    muteList.includes(item.id)
                      ? `${transI18n('chat.remove_mute')}`
                      : `${transI18n('chat.mute')}`
                  }>
                  <div className="mute-icon">
                    <img
                      src={showMuteIcon ? muteOff : muteNo}
                      onClick={(e) => {
                        mute(showMuteIcon, item.id);
                      }}
                    />
                  </div>
                </Tooltip>
              )}
            </div>
          );
        })}
    </div>
  );
};
