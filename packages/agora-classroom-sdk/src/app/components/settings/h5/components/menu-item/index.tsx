import arrowRightIcon from '@/app/assets/arrow-right.svg';
import checkOffIcon from '@/app/assets/check-off.svg';
import checkOnIcon from '@/app/assets/check-on.svg';
import { FC } from 'react';
import './index.css';
export interface MenuItemProps {
  text: string;
  onClick: () => void;
  rightContent?: React.ReactNode;
}

export const ArrowRightIcon = () => {
  return <img className="h5-menu-icon" src={arrowRightIcon} alt="" />;
};

export const CheckIcon: FC<{ checked: boolean }> = ({ checked = false }) => {
  return <img className="h5-menu-icon" src={checked ? checkOnIcon : checkOffIcon} alt="" />;
};

export const MenuItem: FC<MenuItemProps> = ({
  text,
  onClick,
  rightContent = <ArrowRightIcon />,
}) => {
  return (
    <div className="h5-menu-item" onClick={onClick}>
      {text}
      {rightContent}
    </div>
  );
};
