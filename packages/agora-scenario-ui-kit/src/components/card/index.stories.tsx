import React from 'react'
import { Meta } from '@storybook/react';
import { Card } from '~components/card'

const meta: Meta = {
    title: 'Components/Card',
    component: Card,
}

type DocsProps = {
    width: number;
    height: number;
}

export const Docs = ({width, height}: DocsProps) => (
    <>
        <Card
            width={width}
            height={height}
        >
            <h1>Hello Card !</h1>
        </Card>
    </>
)

Docs.args = {
    width: 250,
    height: 200,
}

export default meta;