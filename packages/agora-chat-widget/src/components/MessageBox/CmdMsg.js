import React from 'react';
import { useSelector } from 'react-redux';
import { transI18n } from '~ui-kit';
import { ROLE } from '../../contants';
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
  const assistantTeacher = state?.propsData.roleType === ROLE.assistant.id;
  const currentUserId = state?.loginUser;
  const isMuter = state?.propsData.userUuid === item?.ext.muteMember;

  String.prototype.format = function () {
    if (arguments.length == 0) return this;
    var param = arguments[0];
    var s = this;
    if (typeof param == 'object') {
      for (var key in param) s = s.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key]);
      return s;
    } else {
      for (var i = 0; i < arguments.length; i++)
        s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), arguments[i]);
      return s;
    }
  };

  let renderMsg = () => {
    // 常规
    if (isSetMuteMsg) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{transI18n('chat.muted_all')}</span>
        </div>
      );
    }
    if (isRemoveMuteMsg) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{transI18n('chat.unmuted_all')}</span>
        </div>
      );
    }
    if (isDeleteMsg) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>
            {item.ext.nickName + ' '}
            {transI18n('chat.remove_message_notify')}
          </span>
        </div>
      );
    }

    //老师视角
    // 禁言
    if (isTeahcer && isMuteUser) {
      if (currentUserId === item.from) {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.mute_msg').format(transI18n('chat.you'))}
            </span>
          </div>
        );
      } else {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.mute_msg').format(`${item.ext.nickName}`) +
                transI18n('chat.teacher')}
            </span>
          </div>
        );
      }
    }

    // 解除禁言
    if (isTeahcer && isUnmuteUser) {
      if (currentUserId === item.from) {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.unmute_msg').format(transI18n('chat.you'))}
            </span>
          </div>
        );
      } else {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.mute_msg').format(`${item.ext.nickName}`) +
                transI18n('chat.teacher')}
            </span>
          </div>
        );
      }
    }

    // 助教视角
    // 禁言
    if (assistantTeacher && isMuteUser) {
      if (currentUserId === item.from) {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.mute_msg').format(transI18n('chat.you'))}
            </span>
          </div>
        );
      } else {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.mute_msg').format(`${item.ext.nickName}`) +
                transI18n('chat.teacher')}
            </span>
          </div>
        );
      }
    }
    // 解除禁言
    if (assistantTeacher && isUnmuteUser) {
      if (currentUserId === item.from) {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.unmute_msg').format(transI18n('chat.you'))}
            </span>
          </div>
        );
      } else {
        return (
          <div className="mute-msg">
            <img src={icon_cautions} />
            <span>
              {item.ext.muteNickName + ' '}
              {transI18n('chat.unmute_msg').format(`${item.ext.nickName}`) +
                transI18n('chat.teacher')}
            </span>
          </div>
        );
      }
    }

    //学生视角
    if (isMuter && isMuteUser) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{transI18n('chat.mute_user_msg').format(item.ext.nickName)}</span>
        </div>
      );
    }
    if (isMuter && isUnmuteUser) {
      return (
        <div className="mute-msg">
          <img src={icon_cautions} />
          <span>{transI18n('chat.unmute_user_msg').format(item.ext.nickName)}</span>
        </div>
      );
    }
  };
  return <>{renderMsg()}</>;
};
