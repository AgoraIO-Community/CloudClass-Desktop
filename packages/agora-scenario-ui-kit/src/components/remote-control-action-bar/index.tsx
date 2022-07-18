import { FC, useState } from 'react';
import { useI18n } from '../i18n';
import { Select } from '../select';
import { SvgImg } from '../svg-img';
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
        <span>{t('fcr_share_title_controling')}</span>
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
        <SvgImg type={'close'} size={26} color={'#586376'} />
      </div>
    </div>
  );
};
