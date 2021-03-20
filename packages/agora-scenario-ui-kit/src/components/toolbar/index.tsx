import React, { FC, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Tool, ToolItem } from './tool';
import unfoldAbsent from './assets/icon-close.svg';
import foldAbsent from './assets/icon-open.svg';
import unfoldHover from './assets/icon-close-hover.svg';
import foldHover from './assets/icon-open-hover.svg';
import './index.css';

export { Colors } from './colors';

export { Pens } from './pens'

export { CloudDisk } from './cloud-disk'

export type { ToolItem } from './tool';

export interface ToolbarProps extends BaseProps {
  tools: ToolItem[];
  active?: string;
  defaultOpened?: boolean;
  onClick?: (value: string) => Promise<unknown>;
  onOpenedChange?: (opened: boolean) => void;
}

const menus: { [key: string]: string } = {
  [`fold-absent`]: foldAbsent,
  [`unfold-absent`]: unfoldAbsent,
  [`fold-hover`]: foldHover,
  [`unfold-hover`]: unfoldHover,
};

export const Toolbar: FC<ToolbarProps> = ({
  className,
  style,
  tools,
  active,
  defaultOpened = true,
  onOpenedChange,
  onClick,
}) => {
  const [opened, setOpened] = useState<boolean>(defaultOpened);
  const [menuHover, setMenuHover] = useState<boolean>(false);
  const cls = classnames({
    [`toolbar`]: 1,
    [`opened`]: opened,
    [`${className}`]: !!className,
  });

  return (
    <div className={cls} style={style}>
      <div
        className={`menu ${opened ? 'unfold' : 'fold'}`}
        onMouseEnter={() => setMenuHover(true)}
        onMouseLeave={() => setMenuHover(false)}
        onClick={() => {
          setOpened(!opened);
          onOpenedChange && onOpenedChange(!opened);
        }}>
        <img
          src={
            menus[
              `${opened ? 'unfold' : 'fold'}-${menuHover ? 'hover' : 'absent'}`
            ]
          }
          alt="menu"
        />
      </div>
      <div className="tools">
        {tools.map(({ value, ...restProps }) => (
          <Tool
            key={value}
            value={value}
            {...restProps}
            onClick={onClick}
            isActive={active === value}
          />
        ))}
      </div>
    </div>
  );
};
