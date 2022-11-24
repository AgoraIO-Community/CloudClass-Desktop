import Modal, { ModalProps } from 'antd/lib/modal';
import React from 'react';
export type AModalProps = Pick<
  ModalProps,
  | 'className'
  | 'open'
  | 'afterClose'
  | 'destroyOnClose'
  | 'bodyStyle'
  | 'width'
  | 'title'
  | 'style'
  | 'mask'
  | 'onOk'
  | 'onCancel'
  | 'keyboard'
  | 'footer'
  | 'closable'
  | 'closeIcon'
  | 'cancelText'
  | 'centered'
>;
export const AModal: React.FC<AModalProps> = (props) => {
  return <Modal {...props} />;
};

export const ModalMethod = {
  confirm: Modal.confirm,
  destroyAll: Modal.destroyAll,
};
