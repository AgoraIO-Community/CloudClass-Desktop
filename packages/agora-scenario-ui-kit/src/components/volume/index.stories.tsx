import React from 'react';
import { Meta } from '@storybook/react';
import { Volume } from '~components/volume'

const meta: Meta = {
    title: 'Components/Volume',
    component: Volume,
}

type DocsProps = {
    width: number;
    height: number;
    currentVolume: number,
    maxLength: number;
}

export const Docs = ({width, height, currentVolume, maxLength}: DocsProps) => (
    <div className="mt-4">
        <Volume
            width={width}
            height={height}
            currentVolume={currentVolume}
            maxLength={maxLength}
        />
    </div>
)

Docs.args = {
    width: 3,
    height: 12,
    currentVolumn: 0,
    maxLength: 20
}

export default meta;