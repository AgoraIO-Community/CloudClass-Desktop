import { Modal, ModalProps } from 'antd';
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
>;
export const AModal: React.FC<AModalProps> = (props) => {
  return <Modal {...props} />;
};
