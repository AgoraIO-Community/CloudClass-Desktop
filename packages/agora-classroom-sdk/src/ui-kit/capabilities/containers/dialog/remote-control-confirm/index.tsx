import { Button, useI18n } from '~ui-kit';
import './index.css';
interface IPropsTypes {
  onOK: () => void;
}
export const RemoteControlConfirm = (props: IPropsTypes) => {
  const t = useI18n();
  return (
    <div className="remote-control-confirm-container">
      <div className="remote-control-confirm-content">
        <div className="remote-control-confirm-content-button">
          <Button type="primary" onClick={props.onOK}>
            {t('fcr_share_button_agree')}
          </Button>
        </div>
        <div className="remote-control-confirm-content-text">
          {t('fcr_share_teacher_requesting_share')}
        </div>
      </div>
    </div>
  );
};
