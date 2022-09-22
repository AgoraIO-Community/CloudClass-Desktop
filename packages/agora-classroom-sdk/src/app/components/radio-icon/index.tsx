import { FC } from 'react';
import './index.css';
type RadioIconProps = {
  className?: string;
  checked?: boolean;
  disabled?: boolean;
};
export const RadioIcon: FC<RadioIconProps> = ({ className = '', checked = false, disabled }) => {
  return <span className={`radio-icon ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${className}`} />;
};
