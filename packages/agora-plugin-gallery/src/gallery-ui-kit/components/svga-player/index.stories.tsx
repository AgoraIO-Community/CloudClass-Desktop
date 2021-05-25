import React from 'react';
import { Meta } from '@storybook/react';
import { SvgaPlayer } from '~components/svga-player'

const meta: Meta = {
  title: 'Components/SvgaPlayer',
  component: SvgaPlayer,
};

export const Docs = () => (
    <>
        <div className="mt-4">
            <SvgaPlayer type="reward" width={100} height={100}/>
        </div>
        <div className="mt-4">
            <SvgaPlayer type="hands-up"/>
        </div>
    </>
)

export default meta;