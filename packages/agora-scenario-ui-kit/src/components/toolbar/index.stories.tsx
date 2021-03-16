import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Toolbar, ToolbarProps } from '~components/toolbar';

const meta: Meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
};

export const Docs: FC<ToolbarProps> = () => {
  return <Toolbar></Toolbar>;
};

export default meta;
