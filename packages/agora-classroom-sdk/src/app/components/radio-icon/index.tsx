import { FC } from 'react';
import './index.css';
type RadioIconProps = {
  className?: string;
  checked?: boolean;
};
export const RadioIcon: FC<RadioIconProps> = ({ className = '', checked = false }) => {
  return <span className={`radio-icon ${checked ? 'checked' : ''} ${className}`} />;
};
