import { observer } from 'mobx-react';
import { FC } from 'react';
import { useI18n } from '~ui-kit';
import './index.css';
interface ConfirmDialogH5Props {
  title?: React.ReactNode;
  context?: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  onOk: () => void;
  onCancel: () => void;
}

export const ConfirmDialogH5: FC<ConfirmDialogH5Props> = observer(
  ({ onOk, onCancel, title, context, cancelText, okText }) => {
    const transI18n = useI18n();
    const okHandler = () => {
      onOk && onOk();
    };

    const cancelHandler = () => {
      onCancel && onCancel();
    };
    return (
      <div className="confirm-dialog-h5 absolute flex justify-center items-center w-screen h-screen top-0 left-0 pointer-events-auto">
        <div className="container">
          {title ? <div className="title">{title}</div> : null}
          {context ? <div className="content">{context}</div> : null}
          <div className="footer">
            <div className={`button`} onClick={cancelHandler}>
              {cancelText ? cancelText : transI18n('fcr_alert_cancel')}
            </div>
            <div className="button" onClick={okHandler}>
              {okText ? okText : transI18n('fcr_alert_submit')}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
