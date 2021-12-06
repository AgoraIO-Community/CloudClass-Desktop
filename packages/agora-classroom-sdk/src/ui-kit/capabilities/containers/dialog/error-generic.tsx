import { Button, Modal } from '~ui-kit';
import { BaseDialogProps } from '.';

export const GenericErrorDialog: React.FC<
  BaseDialogProps & {
    onOK: () => void;
    okBtnText: string;
    title: string;
    content: string;
    error: Error;
  }
> = ({ onOK, title, content, okBtnText }) => {
  return (
    <Modal
      onOk={onOK}
      footer={[
        <Button type={'primary'} action="ok">
          {okBtnText}
        </Button>,
      ]}
      title={title}>
      <span style={{ fontSize: 12, wordWrap: 'break-word', width: '100%' }}>{content}</span>
    </Modal>
  );
};
