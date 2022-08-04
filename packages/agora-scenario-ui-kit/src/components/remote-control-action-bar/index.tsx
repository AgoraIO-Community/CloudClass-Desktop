import { FC } from 'react';
import { useI18n } from '../i18n';
import { Select } from '../select';
import { SvgIconEnum, SvgImg } from '../svg-img';
import './index.css';

type UserStruct = {
  userUuid: string;
  userName: string;
  userRole: number;
  userProperties: any;
};
interface IPropsTypes {
  value: string;
  studentList: UserStruct[];
  onChange: (studentUuid: string) => void;
  onClose: () => void;
}
export const RemoteControlActionBar: FC<IPropsTypes> = (props) => {
  const { studentList, onChange, onClose, value } = props;

  const t = useI18n();

  return (
    <div className="remote-control-action-bar">
      <div className="student-list">
        <span className="text-level1">{t('fcr_share_title_controling')}</span>
        <Select
          value={value}
          options={studentList.map((i) => {
            return {
              label: i.userName,
              value: i.userUuid,
            };
          })}
          onChange={onChange}
          direction="up"
          size="sm"></Select>
      </div>
      <div className="divide"></div>
      <div className="close-btn" onClick={onClose}>
        <SvgImg type={SvgIconEnum.CLOSE} size={26} colors={{ iconPrimary: '#586376' }} />
      </div>
    </div>
  );
};
