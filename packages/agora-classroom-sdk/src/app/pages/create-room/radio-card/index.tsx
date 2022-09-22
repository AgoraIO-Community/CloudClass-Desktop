import { RadioIcon } from '@/app/components/radio-icon';
import { FC } from 'react';
import './index.css';

type RadioCardProps = {
  label: string;
  icon: React.ReactNode;
  checked?: boolean;
  className?: string;
  onClick?: () => void;
  description?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
};
export const RadioCard: FC<RadioCardProps> = ({
  checked = false,
  icon,
  className = '',
  onClick,
  label = '',
  description = '',
  style,
  disabled
}) => {
  return (
    <div
      style={style}
      className={`radio-card ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}>
      <RadioIcon checked={checked} className="radio" disabled={disabled} />
      <div className="icon">{icon}</div>
      {label ? <div className="text">{label}</div> : null}
      {description ? <div className="description">{description}</div> : null}
    </div>
  );
};
