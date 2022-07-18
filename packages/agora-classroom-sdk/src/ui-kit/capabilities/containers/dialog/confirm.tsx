import { ConfirmDialogAction } from '@/infra/stores/common/type';
import { observer } from 'mobx-react';
import { Button, Modal, useI18n } from '~ui-kit';
import { BaseDialogProps } from '.';

export const Confirm: React.FC<
  BaseDialogProps & {
    title: string;
    content: string;
    opts?: {
      actions?: ConfirmDialogAction[];
      btnText?: Record<ConfirmDialogAction, string>;
      onOk?: () => void;
      onCancel?: () => void;
    };
  }
> = observer(({ id, title, content, opts }) => {
  const t = useI18n();
  const actions = opts && opts.actions ? opts.actions : ['cancel', 'ok'];
  const footer = actions.map((action) => {
    switch (action) {
      case 'ok':
        return (
          <Button type={'primary'} action="ok">
            {opts?.btnText?.ok || t('toast.confirm')}
          </Button>
        );
      case 'cancel':
        return (
          <Button type={'secondary'} action="cancel">
            {opts?.btnText?.cancel || t('toast.cancel')}
          </Button>
        );
      default:
        return null;
    }
  });
  return (
    <Modal
      id={id}
      style={{ width: 300 }}
      title={title}
      onOk={opts && opts.onOk ? opts.onOk : () => { }}
      onCancel={opts && opts.onCancel ? opts.onCancel : () => { }}
      footer={footer}>
      <p>{content}</p>
    </Modal>
  );
});
