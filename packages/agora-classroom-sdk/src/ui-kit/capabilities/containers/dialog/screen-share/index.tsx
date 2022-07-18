import { useStore } from '@/infra/hooks/ui-store';
import { ScreenShareRoleType } from '@/infra/stores/common/type';
import { FC } from 'react';
import { Card, Modal, useI18n } from '~ui-kit';
import './index.css';

export const ScreenShareDialog = ({
  id,
  onOK,
  onCancel,
}: {
  id: string;
  onOK: (roleType: ScreenShareRoleType) => void;
  onCancel?: () => void;
}) => {
  const { shareUIStore } = useStore();
  const t = useI18n();
  const { removeDialog } = shareUIStore;
  return (
    <Modal
      closable
      id={id}
      style={{ width: 456 }}
      onCancel={() => {
        removeDialog(id);
        onCancel && onCancel();
      }}
      className={'screen-share-dialog'}
      hasMask={false}
      title={t('toast.screen_share.title')}>
      <ScreenShareDialogContent
        onSelect={(role) => {
          removeDialog(id);
          onOK(role);
        }}
      />
    </Modal>
  );
};
interface IScreenShareDialogContentPropsType {
  onSelect: (role: ScreenShareRoleType) => void;
}
const ScreenShareDialogContent: FC<IScreenShareDialogContentPropsType> = (props) => {
  const t = useI18n();
  return (
    <div className="screen-share-dialog-container">
      <div className="screen-share-dialog-card-container">
        <Card width={190} height={210}>
          <ScreenShareCardContent onClick={props.onSelect} type={ScreenShareRoleType.Teacher} />
        </Card>
        <Card width={190} height={210}>
          <ScreenShareCardContent onClick={props.onSelect} type={ScreenShareRoleType.Student} />
        </Card>
      </div>

      <div className="screen-share-dialog-container-tips">
        <span>*</span>
        <span>{t('fcr_rc_control_anti_virus_software_conflict')}</span>
      </div>
    </div>
  );
};

const ScreenShareCardContent = (props: {
  type: ScreenShareRoleType;
  onClick: (role: ScreenShareRoleType) => void;
}) => {
  const t = useI18n();
  const { type, onClick } = props;
  return type === ScreenShareRoleType.Teacher ? (
    <div
      className="screen-share-dialog-content"
      onClick={() => {
        onClick(type);
      }}>
      <div className="screen-share-teacher-logo"></div>

      <h4>{t('fcr_share_title_teacher')}</h4>
      <ul>
        <li>{t('fcr_share_title_singel_window')}</li>
        <li>{t('fcr_share_title_full_screen')}</li>
        <li>{t('fcr_share_title_sound')}</li>
      </ul>
    </div>
  ) : (
    <div
      className="screen-share-dialog-content"
      onClick={() => {
        onClick(type);
      }}>
      <div className="screen-share-student-logo"></div>

      <h4>{t('fcr_share_title_all_student')}</h4>
      <ul>
        <li>{t('fcr_share_title_any_student')}</li>
        <li>{t('fcr_share_title_full_screen')}</li>
        <li>{t('fcr_share_title_sound')}</li>
      </ul>
    </div>
  );
};
