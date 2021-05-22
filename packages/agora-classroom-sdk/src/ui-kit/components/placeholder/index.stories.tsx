import React from 'react'
import { Meta } from '@storybook/react';
import { Placeholder, CameraPlaceHolder } from '~components/placeholder'

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
                backgroundColor='#F9F9FC'
            />
        </div>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType="cameraClose"
                backgroundColor='#F9F9FC'
            />
        </div>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType="noBody"
                backgroundColor='#F9F9FC'
            />
        </div>
        <div className="mt-4">
            <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType=""
                backgroundColor='#F9F9FC'
            />
        </div>
        <div className="mt-4">
            <CameraPlaceHolder state="disabled" />
            {/* <Placeholder
                placeholderDesc={placeholderDesc}
                placeholderType="noFile"
            /> */}
        </div>
    </>
)

Docs.args = {
    placeholderDesc: ""
}

export default meta;