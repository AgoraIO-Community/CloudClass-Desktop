import React, { FC } from 'react';
import { Button, transI18n } from '~ui-kit';

type ConfirmDialogProps = {
  children: React.ReactNode;
  onOk: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  onOkText?: string;
  onCancelText?: string;
};

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  children,
  onOk,
  onCancel,
  onOkText = '',
  onCancelText = '',
}) => {
  return (
    <div className="confirm-dialog-without-title-container">
      <div className="confirm-dialog-withoout-title-main">
        <div className="main-content">{children}</div>
        <div className="main-footer confirm-panel-footer">
          <Button
            type="secondary"
            size="xs"
            className="rounded-btn"
            style={{ marginRight: 15 }}
            onClick={() => {
              onCancel();
            }}>
            {onOkText ? onOkText : transI18n('breakout_room.cancel_submit')}
          </Button>
          <Button
            size="xs"
            className="rounded-btn"
            onClick={() => {
              onOk();
            }}>
            {onCancelText ? onCancelText : transI18n('fcr_group_sure')}
          </Button>
        </div>
      </div>
    </div>
  );
};
