import React from 'react';
import { useSelector } from 'react-redux';
import { InputMsg } from './InputMsg';
import { ROLE } from '../../contants';
import { transI18n } from '~ui-kit';
import './index.css';

const AllMute = () => {
  return (
    <div className="input-box all-mute">
      <span>{transI18n('chat.all_muted')}</span>
    </div>
  );
};

const UserMute = () => {
  return (
    <div className="input-box all-mute">
      <span>{transI18n('chat.single_muted')}</span>
    </div>
  );
};

export const InputBox = () => {
  const state = useSelector((state) => state);
  const roleType = state?.loginUserInfo.ext;
  const isAllMute = state?.room.allMute;
  const isUserMute = state?.room.isUserMute;
  let isTeacher =
    roleType &&
    (JSON.parse(roleType).role === ROLE.teacher.id ||
      JSON.parse(roleType).role === ROLE.assistant.id);
  return (
    <div className="input-box">
      {!isTeacher && isAllMute && <AllMute />}
      {!isTeacher && !isAllMute && isUserMute && <UserMute />}
      {(isTeacher || (!isAllMute && !isUserMute)) && <InputMsg isTeacher={isTeacher} />}
    </div>
  );
};
