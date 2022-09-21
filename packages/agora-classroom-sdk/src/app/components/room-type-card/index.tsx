import { FC } from 'react';
import { RadioIcon } from '../radio-icon';
import './index.css';

type RoomTypeCardProps = {
  checked?: boolean;
  className?: string;
  onClick?: () => void;
  title: string;
  description: string;
};

export const RoomTypeCard: FC<RoomTypeCardProps> = ({
  className = '',
  checked = false,
  title,
  description,
  onClick = () => {},
}) => {
  return (
    <div className={`room-type-card ${className}  ${checked ? 'checked' : ''}`} onClick={onClick}>
      <RadioIcon checked={checked} className="radio" />
      <div className="name">{title}</div>
      <div className="description">{description}</div>
    </div>
  );
};
