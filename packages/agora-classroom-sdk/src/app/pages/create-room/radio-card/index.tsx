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
};
export const RadioCard: FC<RadioCardProps> = ({
  checked = false,
  icon,
  className = '',
  onClick,
  label = '',
  description = '',
  style,
}) => {
  return (
    <div
      style={style}
      className={`radio-card ${checked ? 'checked' : ''} ${className}`}
      onClick={onClick}>
      <RadioIcon checked={checked} className="radio" />
      <div className="icon">{icon}</div>
      {label ? <div className="text">{label}</div> : null}
      {description ? <div className="description">{description}</div> : null}
    </div>
  );
};
