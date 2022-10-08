import { FC } from 'react';
import { MenuItem, MenuItemProps } from '../menu-item';
import './index.css';
interface MenuProps {
  data: MenuItemProps[];
}

export const Menu: FC<MenuProps> = ({ data = [] }) => {
  return (
    <div className="h5-menu">
      {data?.map((item, index) => {
        return <MenuItem key={`${index}-${item.text}`} {...item} />;
      })}
    </div>
  );
};
