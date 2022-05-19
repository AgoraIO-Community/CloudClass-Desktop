import { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { Modal } from '~ui-kit';
import './index.css';
import { transI18n } from '@/infra/stores/common/i18n';
import { Start } from './fragments/start';
import { GroupSelect } from './fragments/group-select';
import { GroupState } from 'agora-edu-core';
import { observer } from 'mobx-react';

export const BreakoutRoomDialog = observer(({ id }: { id: string }) => {
  const { shareUIStore, groupUIStore } = useStore();
  const { removeDialog } = shareUIStore;
  const { groupState } = groupUIStore;

  const [stage, setStage] = useState<'start' | 'select'>(() =>
    groupState === GroupState.OPEN ? 'select' : 'start',
  );

  const onCancel = useCallback(() => {
    removeDialog(id);
  }, [removeDialog, id]);

  const fragment = useMemo(() => {
    switch (stage) {
      case 'start':
        return (
          <Start
            onCancel={onCancel}
            onNext={() => {
              setStage('select');
            }}
          />
        );
      case 'select':
        return (
          <GroupSelect
            onNext={() => {
              setStage('start');
            }}
          />
        );
      default:
        return null;
    }
  }, [stage]);

  return (
    <Modal
      hasMask={false}
      onCancel={onCancel}
      closable
      title={`${transI18n('scaffold.breakout_room')} ${
        groupState === GroupState.OPEN
          ? transI18n('scaffold.in_progress')
          : transI18n('scaffold.not_in_progress')
      }`}
      className="breakout-room"
      contentClassName={`content-area ${stage}`}>
      {fragment}
    </Modal>
  );
});
