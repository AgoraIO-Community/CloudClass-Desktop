import React from 'react';
import { useSelector } from 'react-redux';
import { ROLE, SET_ALL_MUTE_MSG, REMOVE_ALL_MUTE_MSG } from '../../contants';
import icon_cautions from '../../themes/img/icon-cautions.png';

import './index.css';
export const CmdMsg = ({ item }) => {
  const state = useSelector((state) => state);
  const isSetMuteMsg = item?.action === 'setAllMute';
  const isRemoveMuteMsg = item?.action === 'removeAllMute';
  const isMuteUser = item?.action === 'mute';
  const isUnmuteUser = item?.action === 'unmute';
  const isDeleteMsg = item?.action === 'DEL';
  const isTeahcer = state?.propsData.roleType === ROLE.teacher.id;
  const isMuter = state?.propsData.userUuid === item?.ext.muteMember;

  let renderMsg = () => {
    // 常规
    if (isSetMuteMsg) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{SET_ALL_MUTE_MSG}</span>
        </div>
      );
    }
    if (isRemoveMuteMsg) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{REMOVE_ALL_MUTE_MSG}</span>
        </div>
      );
    }
    if (isDeleteMsg) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{item.ext.nickName} 删除了一条消息</span>
        </div>
      );
    }

    //老师视角
    if (isTeahcer && isMuteUser) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{item.ext.muteNickName}被您禁言了</span>
        </div>
      );
    }
    if (isTeahcer && isUnmuteUser) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{item.ext.muteNickName}被您解除禁言了</span>
        </div>
      );
    }

    //学生视角
    if (isMuter && isMuteUser) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>您被{item.ext.nickName}老师禁止发言了</span>
        </div>
      );
    }
    if (isMuter && isUnmuteUser) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>您被{item.ext.nickName}老师允许发言了</span>
        </div>
      );
    }
  };
  return <>{renderMsg()}</>;
};
