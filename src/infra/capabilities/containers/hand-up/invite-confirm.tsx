import { useStore } from '@classroom/infra/hooks/ui-store';
import { HandUpUIStore } from '@classroom/infra/stores/common/hand-up';
import { DialogCategory, EduShareUIStore } from '@classroom/infra/stores/common/share';
import { EduClassroomConfig, Platform } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React, { useEffect } from 'react';
import { Button, Modal } from '@classroom/ui-kit';
import './invite-confirm.css';
import { useI18n } from 'agora-common-libs';

interface InviteConfirmContainerProps {
  id: string;
  onOk: () => void;
  onClose: () => void;
  onCancel: () => void;
}

export const useInvitedModal = (
  beingInvited: boolean,
  handUpUIStore: HandUpUIStore,
  shareUIStore: EduShareUIStore,
) => {
  useEffect(() => {
    if (beingInvited) {
      shareUIStore.addDialog(DialogCategory.InviteConfirm, {
        id: 'inviteConfirm',
        onOk: () => {
          handUpUIStore.confirmInvited();
        },
        onCancel: () => {
          handUpUIStore.refuseInvited();
        },
      });
    }
  }, [beingInvited]);
};

export const InviteConfirmContainer: React.FC<InviteConfirmContainerProps> = observer(
  ({ onOk, onClose, onCancel }) => {
    const { handUpUIStore } = useStore();
    const { beingInvited } = handUpUIStore;

    const okHandler = () => {
      if (beingInvited) {
        onOk && onOk();
        onClose && onClose();
      }
    };

    const cancelHandler = () => {
      onCancel && onCancel();
      onClose && onClose();
    };

    const isH5 = EduClassroomConfig.shared.platform === Platform.H5;

    const Comp = isH5 ? H5inviteConfirm : PCinviteConfirm;

    return <Comp onOk={okHandler} onCancel={cancelHandler} beingInvited={beingInvited} />;
  },
);

interface inviteConfirmUIProps {
  beingInvited: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const PCinviteConfirm: React.FC<inviteConfirmUIProps> = ({ onOk, onCancel, beingInvited }) => {
  const transI18n = useI18n();
  const footer = [
    <Button key="cancel" type={'secondary'} action="cancel">
      {transI18n('invite.confirm.cancel')}
    </Button>,
    <Button key="ok" type={beingInvited ? 'primary' : 'ghost'} disabled={!beingInvited} action="ok">
      {transI18n('invite.confirm.ok')}
    </Button>,
  ];
  return (
    <Modal
      className="inviteConfirm"
      closable={true}
      title={transI18n('invite.confirm.title')}
      footer={footer}
      onCancel={onCancel}
      onOk={onOk}>
      <p className="content">{transI18n('invite.confirm.content')}</p>
    </Modal>
  );
};

const H5inviteConfirm: React.FC<inviteConfirmUIProps> = observer(
  ({ onOk, onCancel, beingInvited }) => {
    const okHandler = () => {
      onOk && onOk();
    };
    const cancelHandler = () => {
      onCancel && onCancel();
    };
    const transI18n = useI18n();
    return (
      <div className="inviteConfirm h5">
        <div className="title">{transI18n('invite.confirm.title')}</div>
        <p className="content">{transI18n('invite.confirm.content')}</p>
        <div className="footer">
          <div className="button" onClick={cancelHandler}>
            {transI18n('invite.confirm.cancel')}
          </div>
          <div className={`button ${beingInvited ? '' : 'disable'}`} onClick={okHandler}>
            {transI18n('invite.confirm.ok')}{' '}
          </div>
        </div>
      </div>
    );
  },
);
