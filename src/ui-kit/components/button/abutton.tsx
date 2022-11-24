import Button, { ButtonProps } from 'antd/lib/button';
import { FC } from 'react';
import './abutton.css';
type AButtonProps = Pick<ButtonProps, 'className' | 'onClick' | 'icon' | 'type' | 'style'>;

export const AButton: FC<AButtonProps> = ({ className = '', ...props }) => {
  return <Button {...props} className={`fcr-theme ${className}`} />;
};
