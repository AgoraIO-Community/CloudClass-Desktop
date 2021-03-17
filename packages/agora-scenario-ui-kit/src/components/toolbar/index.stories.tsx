import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Toolbar, ToolbarProps } from '~components/toolbar';

const meta: Meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
};

export const Docs: FC<ToolbarProps> = (props) => {
  const handleClick = (value: string, subValue?: string) => {
    console.log(value, subValue);
    return Promise.resolve();
  };
  return <Toolbar {...props} onClick={handleClick}></Toolbar>;
};

export default meta;
