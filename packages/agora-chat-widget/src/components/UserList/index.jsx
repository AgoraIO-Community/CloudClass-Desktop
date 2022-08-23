import { useSelector } from 'react-redux';
import { Tag, Tooltip } from 'antd';
import { ROLE } from '../../contants';
import { transI18n } from '~components/i18n';
import avatarUrl from '../../themes/img/avatar-big@2x.png';
import muteNo from '../../themes/img/muteNo.png';
import muteOff from '../../themes/img/muteOff.png';
import './index.css';

// 成员页面
export const UserList = ({ roomUserList }) => {
  const state = useSelector((state) => state);
  const { apis } = state;
  // 改成枚举
  const muteList = state?.room.muteList;
  // 禁言
  const mute = (val, userId) => {
    if (val) {
      apis.muteAPI.removeUserMute(userId);
    } else {
      apis.muteAPI.setUserMute(userId);
    }
  };
  return (
    <div className="fcr-hx-user">
      {roomUserList.length > 0 &&
        roomUserList.map((item, key) => {
          console.log('render>>>>',item);
          const showMuteIcon = muteList && muteList.includes(item.id);
          const isTeacher = item?.ext && JSON.parse(item?.ext).role === ROLE.teacher.id;
          const isAssistant = item?.ext && JSON.parse(item?.ext).role === ROLE.assistant.id;
          return (
            <div className="fcr-hx-user-list" key={key}>
              <div className="fcr-hx-user-info">
                <img src={item?.avatarurl || avatarUrl} className="fcr-hx-user-avatar" />
                <span className="fcr-hx-user-text" title={item?.nickname || item?.id}>
                  {item?.nickname || item?.id}
                </span>
                {isTeacher && (
                  <Tag className="fcr-hx-user-tag fcr-hx-teacher-tag">
                    <span className="fcr-hx-teacher-text">{transI18n('chat.teacher')}</span>
                  </Tag>
                )}
                {isAssistant && (
                  <Tag className="fcr-hx-user-tag fcr-hx-teacher-tag">
                    <span className="fcr-hx-teacher-text">{transI18n('chat.assistant')}</span>
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
                  <div className="fcr-hx-mute-icon">
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
