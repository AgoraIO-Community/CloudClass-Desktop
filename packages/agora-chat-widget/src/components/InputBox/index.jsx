import { useSelector } from 'react-redux';
import { InputMsg } from './InputMsg';
import { ROLE } from '../../contants';
import { transI18n } from '~components/i18n';
import './index.css';

const AllMute = () => {
  return (
    <div className="fcr-hx-input-box fcr-hx-all-mute">
      <span>{transI18n('chat.all_muted')}</span>
    </div>
  );
};

const UserMute = () => {
  return (
    <div className="fcr-hx-input-box fcr-hx-all-mute">
      <span>{transI18n('chat.single_muted')}</span>
    </div>
  );
};

export const InputBox = () => {
  const state = useSelector((state) => state);
  const showInputBox = state.configUIVisible.showInputBox;
  const roleType = state?.propsData.roleType;
  const isAllMute = state?.room.allMute;
  const isUserMute = state?.room.isUserMute;
  const isTeacher = roleType === ROLE.teacher.id;
  const isAssistant = roleType === ROLE.assistant.id;
  const isObserver = roleType === ROLE.observer.id;

  return (
    <div className="fcr-hx-input-box">
      {showInputBox && (
        <>
          {!isObserver && !isAssistant && !isTeacher && isAllMute && <AllMute />}
          {!isObserver && !isAssistant && !isTeacher && !isAllMute && isUserMute && <UserMute />}
          {(isAssistant || isTeacher || (!isAllMute && !isUserMute)) && (
            <InputMsg allMutePermission={isTeacher || isAssistant} />
          )}
        </>
      )}
    </div>
  );
};
