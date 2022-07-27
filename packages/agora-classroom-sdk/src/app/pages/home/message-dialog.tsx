import { useEffect, useState } from 'react';
import { FC } from 'react';
import { Button, Modal, transI18n } from '~ui-kit';
import { useHistory } from 'react-router';
import { useCallback } from 'react';

export const MessageDialog: FC = () => {
  const history = useHistory();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(history.location.search);
    if (params.get('reason') === '1') {
      setMessage(transI18n('toast.kick_by_teacher'));
    }
    console.log('params', history.location, params, params.get('reason'));
  }, [history]);

  const onOk = useCallback(() => {
    setMessage('');
  }, []);

  return message ? (
    <Modal
      title={transI18n('message')}
      onOk={onOk}
      footer={[
        <Button key="ok" type="primary" action="ok">
          {transI18n('toast.confirm')}
        </Button>,
      ]}>
      {transI18n('toast.kick_by_teacher')}
    </Modal>
  ) : null;
};
