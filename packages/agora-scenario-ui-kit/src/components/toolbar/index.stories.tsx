import { Meta } from '@storybook/react';
import React, { FC, useState } from 'react';
import {
  Pens,
  Toolbar,
  ToolbarProps,
  ToolCabinet,
} from '../toolbar';
import { SvgIconEnum, SvgImg } from '../svg-img';
import { ToolItem } from './tool';

const meta: Meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
};

export const Docs: FC<ToolbarProps> = (props) => {
  const [pen, updatePen] = useState<string>('pen');

  const [activeItem, updateActiveItem] = useState<string>('');

  const handleClick = React.useCallback(
    async (type: string) => {
      updateActiveItem(type);
    },
    [updateActiveItem],
  );
  const tools: ToolItem[] = [
    {
      value: 'selection',
      label: '选择',
      icon: SvgIconEnum.SELECT,
    },
    {
      value: 'clicker',
      label: '鼠标',
      icon: SvgIconEnum.CLICKER,
    },
    {
      value: 'pen',
      label: '铅笔',
      icon: SvgIconEnum.PEN,
      component: () => {
        return (
          <Pens
            value="pen"
            label="铅笔"
            icon={SvgIconEnum.PEN}
            activePen={pen}
            onClick={(color) => updatePen(color)}
          />
        );
      },
    },
    {
      value: 'text',
      label: '文本',
      icon: SvgIconEnum.TEXT,
    },
    {
      value: 'eraser',
      label: '橡皮',
      icon: SvgIconEnum.ERASER,
    },
    {
      value: 'tools',
      label: '工具箱',
      icon: SvgIconEnum.TOOLS,
      component: () => {
        return (
          <span />
        );
      },
    },
    {
      value: 'register',
      label: '用户列表',
      icon: SvgIconEnum.REGISTER,
    },
  ];
  return (
    <Toolbar
      {...props}>
    </Toolbar>
  );
};

export default meta;
