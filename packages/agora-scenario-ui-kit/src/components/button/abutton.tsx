import { Button, ButtonProps } from 'antd';
import { FC } from 'react';
import './abutton.css';
type AButtonProps = Pick<ButtonProps, 'className' | 'onClick' | 'icon' | 'type'>;

export const AButton: FC<AButtonProps> = ({ className = '', ...props }) => {
  return <Button {...props} className={`fcr-theme ${className}`} />;
};
