import React, { FC, ReactElement } from 'react';
import { Button, transI18n } from '~ui-kit';
import { Panel } from './panel';

type ConfirmPanelProps = {
  title: string;
  onOk: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  panelId?: string;
  children?: React.ReactNode;
};

export const ConfirmPanel: FC<ConfirmPanelProps> = ({
  title,
  onOk,
  onCancel,
  panelId,
  children,
}) => {
  return (
    <Panel
      panelId={panelId}
      className="breakout-room-confirm-panel"
      trigger={children as ReactElement}>
      <div className="confirm-panel-wrap">
        <div className="confirm-panel-title">{title}</div>
        <div className="confirm-panel-footer flex justify-end">
          <Button
            type="secondary"
            size="xs"
            className="rounded-btn"
            style={{ marginRight: 15 }}
            onClick={() => {
              onCancel();
            }}>
            {transI18n('breakout_room.cancel_submit')}
          </Button>
          <Button
            size="xs"
            className="rounded-btn"
            onClick={() => {
              onOk();
            }}>
            {transI18n('fcr_group_sure')}
          </Button>
        </div>
      </div>
    </Panel>
  );
};
