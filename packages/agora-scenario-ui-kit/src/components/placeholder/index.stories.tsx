import React from 'react'
import { Meta } from '@storybook/react';
import { Placeholder } from '~components/placeholder'

const meta: Meta = {
    title: 'Components/Placeholder',
    component: Placeholder,
}

type DocsProps = {
    placeholderDesc: string;
}

export const Docs = ({ placeholderDesc }: DocsProps) => (
    <>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
            />
        </div>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType="cameraBroken"
            />
        </div>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType="cameraClose"
            />
        </div>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType="noBody"
            />
        </div>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType="noFile"
            />
        </div>
    </>
)

Docs.args = {
    placeholderDesc: ""
}

export default meta;