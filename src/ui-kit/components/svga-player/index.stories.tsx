import React from 'react';
import { Meta } from '@storybook/react';
import { SvgaPlayer } from '../svga-player';

const meta: Meta = {
  title: 'Components/SvgaPlayer',
  component: SvgaPlayer,
};

export const Docs = () => (
  <>
    <div className="mt-4">
      <SvgaPlayer url="" width={100} height={100} />
    </div>
  </>
);

export default meta;
