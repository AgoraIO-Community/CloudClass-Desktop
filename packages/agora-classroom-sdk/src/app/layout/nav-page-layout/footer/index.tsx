import { FC } from 'react';
import { AButton } from '~ui-kit';
import './index.css';
type NavFooterProps = {
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  className?: string;
  okClassName?: string;
  cancelClassName?: string;
};
export const NavFooter: FC<NavFooterProps> = ({
  className = '',
  okClassName = '',
  cancelClassName = '',
  cancelText = 'Cancel',
  okText = 'OK',
  onOk,
  onCancel,
}) => {
  const onOkHandle = () => {
    onOk && onOk();
  };
  const onCancelHandle = () => {
    onCancel && onCancel();
  };
  return (
    <div className={`nav-footer ${className}`}>
      <AButton className={`cancel ${cancelClassName}`} onClick={onCancelHandle}>
        {cancelText}
      </AButton>
      <AButton className={`ok ${okClassName}`} onClick={onOkHandle}>
        {okText}
      </AButton>
    </div>
  );
};
