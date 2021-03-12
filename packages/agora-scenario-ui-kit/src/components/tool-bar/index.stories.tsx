import React from 'react';
import { Meta } from '@storybook/react';
import { ToolBar } from '~components/tool-bar';

const meta: Meta = {
  title: 'Components/ToolBar',
  component: ToolBar,
};

const click = (e: any) => {
  console.log('******', e)
}

export const Docs = () => (
  <>
    <ToolBar handleClickEvent={click}></ToolBar>
  </>
);

export default meta;

