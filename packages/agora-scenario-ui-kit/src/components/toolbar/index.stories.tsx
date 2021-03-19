import React, { FC, useState } from 'react';
import { Meta } from '@storybook/react';
import { Toolbar, ToolbarProps, Colors, ToolItem } from '~components/toolbar';

const meta: Meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
};

export const Docs: FC<ToolbarProps> = (props) => {
  const [activeColor, setActiveColor] = useState('#7ed321');
  const tools: ToolItem[] = [
    {
      value: 'selection',
      label: '选择',
      icon: 'select',
    },
    {
      value: 'text',
      label: '文本',
      icon: 'text',
    },
    {
      value: 'eraser',
      label: '橡皮',
      icon: 'eraser',
    },
    {
      value: 'color',
      label: '颜色',
      icon: 'color',
      render: (tool: ToolItem) => (
        <Colors
          {...tool}
          activeColor={activeColor}
          onClick={(color) => setActiveColor(color)}
        />
      ),
    },
    {
      value: 'blank-page',
      label: '新增空白页',
      icon: 'blank-page',
    },
    {
      value: 'hand',
      label: '举手',
      icon: 'hand',
    },
    {
      value: 'cloud',
      label: '云盘',
      icon: 'cloud',
    },
    {
      value: 'follow',
      label: '视角跟随',
      icon: 'follow',
    },
    {
      value: 'tools',
      label: '工具箱',
      icon: 'tools',
    },
  ];
  return <Toolbar {...props} tools={tools}></Toolbar>;
};

export default meta;
