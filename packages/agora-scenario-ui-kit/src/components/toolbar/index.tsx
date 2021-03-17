import React, { FC, useState } from 'react';
import classnames from 'classnames';
import { cloneDeep } from 'lodash';
import { BaseProps } from '~components/interface/base-props';
import { ExpandableToolItem, OnItemClick, Tool, ToolItem } from './tool';
import unfoldAbsent from './assets/icon-close.svg';
import foldAbsent from './assets/icon-open.svg';
import unfoldHover from './assets/icon-close-hover.svg';
import foldHover from './assets/icon-open-hover.svg';
import './index.css';
import { defaultTools } from './default-tools';

const menus: { [key: string]: string } = {
  [`fold-absent`]: foldAbsent,
  [`unfold-absent`]: unfoldAbsent,
  [`fold-hover`]: foldHover,
  [`unfold-hover`]: unfoldHover,
};

export interface ToolbarProps extends BaseProps {
  tools?: ToolItem[];
  defaultOpened?: boolean;
  onClick?: (value: string, subValue?: string) => Promise<unknown>;
}

export const Toolbar: FC<ToolbarProps> = ({
  className,
  style,
  tools: customTools,
  defaultOpened = true,
  onClick,
}) => {
  const [opened, setOpened] = useState<boolean>(defaultOpened);
  const [menuHover, setMenuHover] = useState<boolean>(false);
  const [active, setActive] = useState<string>();
  const [tools, setTools] = useState<ExpandableToolItem[]>(
    customTools ?? defaultTools,
  );
  const cls = classnames({
    [`toolbar`]: 1,
    [`opened`]: opened,
    [`${className}`]: !!className,
  });

  const handleItemClick: OnItemClick = (value, subItem) => {
    const currentTool = tools.find((t) => t.value === value);
    if (currentTool && currentTool.canActive) {
      setActive(value);
    }
    const nextTools = cloneDeep(tools);
    nextTools.forEach((tool) => {
      if (tool.value === value && tool.expand && subItem) {
        tool.expand.active = subItem;
      }
    });
    setTools(nextTools);
    if (typeof subItem === 'string' || typeof subItem === 'undefined') {
      onClick && onClick(value, subItem);
    } else {
      onClick && onClick(value, (subItem as ToolItem).value);
    }
  };

  return (
    <div className={cls} style={style}>
      <div
        className={`menu ${opened ? 'unfold' : 'fold'}`}
        onMouseEnter={() => setMenuHover(true)}
        onMouseLeave={() => setMenuHover(false)}
        onClick={() => setOpened(!opened)}>
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
            onClick={handleItemClick}
            isActive={active === value}
          />
        ))}
      </div>
    </div>
  );
};
