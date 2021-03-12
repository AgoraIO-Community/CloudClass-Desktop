import React from 'react';
import { Meta } from '@storybook/react';
import { LeftToolBar } from '~components/leftToolBar';

const meta: Meta = {
  title: 'Components/LeftToolBar',
  component: LeftToolBar,
};

const click = (e: any) => {
  console.log('******', e)
}

export const Docs = () => (
  <>
    <LeftToolBar handleClickEvent={click}></LeftToolBar>
  </>
);

export default meta;

