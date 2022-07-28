import { FC } from 'react';
import arrowRightIcon from '../../../assets/arrow-right.svg';
import checkOffIcon from '../../../assets/check-off.svg';
import checkOnIcon from '../../../assets/check-on.svg';
import './index.css';
export interface MenuItemProps {
  text: string;
  onClick: () => void;
  rightContent?: React.ReactNode;
}

export const ArrowRightIcon = () => {
  return <img className="menu-icon" src={arrowRightIcon} alt="" />;
};

export const CheckIcon: FC<{ checked: boolean }> = ({ checked = false }) => {
  return <img className="menu-icon" src={checked ? checkOnIcon : checkOffIcon} alt="" />;
};

export const MenuItem: FC<MenuItemProps> = ({
  text,
  onClick,
  rightContent = <ArrowRightIcon />,
}) => {
  return (
    <div className="menu-item" onClick={onClick}>
      {text}
      {rightContent}
    </div>
  );
};
