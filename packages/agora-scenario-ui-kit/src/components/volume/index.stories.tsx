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
    currentVolumn: number,
    maxLength: number;
}

export const Docs = ({width, height, currentVolumn, maxLength}: DocsProps) => (
    <div className="mt-4">
        <Volume
            width={width}
            height={height}
            currentVolumn={currentVolumn}
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