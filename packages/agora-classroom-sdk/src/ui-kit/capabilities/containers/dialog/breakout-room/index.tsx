import { useMemo, useState } from 'react';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { Modal } from '~ui-kit';
import './index.css';
import { transI18n } from '@/infra/stores/common/i18n';
import { Start } from './fragments/start';
import { GroupSelect } from './fragments/group-select';

export const BreakoutRoomDialog = ({ id }: { id: string }) => {
  const { shareUIStore } = useStore();
  const { removeDialog } = shareUIStore;
  const [stage, setStage] = useState<'start' | 'select'>('start');

  const fragment = useMemo(() => {
    switch (stage) {
      case 'start':
        return (
          <Start
            onNext={() => {
              setStage('select');
            }}
          />
        );
      case 'select':
        return (
          <GroupSelect
            onNext={() => {
              removeDialog(id);
            }}
          />
        );
      default:
        return null;
    }
  }, [stage]);

  return (
    <Modal
      onCancel={() => {
        removeDialog(id);
      }}
      closable
      title={transI18n('scaffold.breakout_room')}
      className="breakout-room"
      contentClassName="content-area">
      {fragment}
    </Modal>
  );
};
