import React, { FC, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { ExpandableToolItem, Tool, ToolItem } from './tool';
import unfoldAbsent from './assets/icon-close.svg';
import foldAbsent from './assets/icon-open.svg';
import unfoldHover from './assets/icon-close-hover.svg';
import foldHover from './assets/icon-open-hover.svg';
import './index.css';
import { Icon } from '~components/icon';

const menus: { [key: string]: string } = {
  [`fold-absent`]: foldAbsent,
  [`unfold-absent`]: unfoldAbsent,
  [`fold-hover`]: foldHover,
  [`unfold-hover`]: unfoldHover,
};

export interface ToolbarProps extends BaseProps {
  tools?: ToolItem[];
  defaultOpened?: boolean;
  onClick?: (id: string, subId?: string) => Promise<any>;
}

const defaultTools: ExpandableToolItem[] = [
  {
    id: 'selection',
    label: '选择',
    icon: 'select',
  },
  {
    id: 'pen',
    label: '铅笔',
    icon: 'pen',
    expand: {
      render: (parentId, tool) => {
        return (
          <div className="expand-tool">
            {tool.icon ? <Icon type={tool.icon} /> : null}
            {parentId === tool.id ? <div className="active-indicator" /> : null}
          </div>
        );
      },
      items: [
        {
          id: 'pen',
          label: '铅笔',
          icon: 'pen',
        },
        {
          id: 'rectangle',
          icon: 'square',
          label: '矩形',
        },
        {
          id: 'circle',
          icon: 'circle',
          label: '圆形',
        },
        {
          id: 'line',
          icon: 'line',
          label: '直线',
        },
      ],
    },
  },
  {
    id: 'text',
    label: '文本',
    icon: 'text',
  },
  {
    id: 'eraser',
    label: '橡皮',
    icon: 'eraser',
  },
  {
    id: '#7ed321',
    label: '颜色',
    icon: 'color',
    expand: {
      render: (parentId, tool) => (
        <div
          className="expand-tool color"
          style={{
            borderColor: parentId === tool.id ? tool.id : undefined,
          }}>
          <Icon type="color" color={tool.id} />
        </div>
      ),
      items: [
        { id: '#ffffff' },
        { id: '#9b9b9b' },
        { id: '#4a4a4a' },
        { id: '#000000' },
        { id: '#d0021b' },
        { id: '#f5a623' },
        { id: '#f8e71c' },
        { id: '#7ed321' },
        { id: '#9013fe' },
        { id: '#50e3c2' },
        { id: '#0073ff' },
        { id: '#ffc8e2' },
      ],
    },
  },
  {
    id: 'blank-page',
    label: '新增空白页',
    icon: 'blank-page',
  },
  {
    id: 'hand',
    label: '举手',
    icon: 'hand',
  },
  {
    id: 'cloud',
    label: '云盘',
    icon: 'cloud',
  },
  {
    id: 'follow',
    label: '视角跟随',
    icon: 'follow',
  },
  {
    id: 'tools',
    label: '工具箱',
    icon: 'tools',
  },
];

export const Toolbar: FC<ToolbarProps> = ({
  className,
  style,
  tools: customTools,
  defaultOpened = false,
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

  const handleItemClick = (id: string, subId?: string) => {
    setActive(id);
    console.log(id, subId)
    onClick && onClick(id, subId);
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
        {tools.map(({ id, ...restProps }) => (
          <Tool key={id} id={id} {...restProps} onClick={handleItemClick} isActive={active===id}/>
        ))}
      </div>
    </div>
  );
};
