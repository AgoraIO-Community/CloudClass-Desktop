import { observer } from 'mobx-react';
import { useState } from 'react';
import { useStore } from '@/infra/hooks/ui-store';
import { Button, Modal, transI18n } from '~ui-kit';
import { BaseDialogProps } from '.';

export const KickOut: React.FC<BaseDialogProps & { onOk: (ban: boolean) => void }> = observer(
  ({ id, onOk }) => {
    const { shareUIStore } = useStore();

    const { removeDialog } = shareUIStore;

    const [type, setType] = useState<'kicked_once' | 'kicked_ban'>('kicked_once');

    return (
      <Modal
        style={{ width: 300 }}
        title={transI18n('kick.kick_out_student')}
        onOk={() => {
          onOk(type === 'kicked_ban');
          removeDialog(id);
        }}
        onCancel={() => {
          removeDialog(id);
        }}
        footer={[
          <Button key="cancel" type={'secondary'} action="cancel">
            {transI18n('toast.cancel')}
          </Button>,
          <Button key="ok" type={'primary'} action="ok">
            {transI18n('toast.confirm')}
          </Button>,
        ]}>
        <div className="radio-container">
          <label className="customize-radio">
            <input
              type="radio"
              name="kickType"
              value="kicked_once"
              checked={type === 'kicked_once'}
              onChange={() => setType('kicked_once')}
            />
            <span className="ml-2">{transI18n('radio.kicked_once')}</span>
          </label>
          <label className="customize-radio">
            <input
              type="radio"
              name="kickType"
              value="kicked_ban"
              onChange={() => setType('kicked_ban')}
            />
            <span className="ml-2">{transI18n('radio.ban')}</span>
          </label>
        </div>
      </Modal>
    );
  },
);
