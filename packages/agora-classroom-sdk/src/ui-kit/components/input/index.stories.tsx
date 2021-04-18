import React from 'react'
import { Meta } from '@storybook/react'
import { Input } from '~components/input'
import { Icon } from '~components/icon'

const meta: Meta = {
    title: 'Components/Input',
    component: Input,
};

export const Docs = () => (
    <>
        <div className="mt-4">
            <Input placeholder='文本的placeholder' prefix={<span style={{color: '#333'}}>纯文本</span>} />
        </div>
        <div className="mt-4">
            <Input placeholder='这个是icon的placeholder' prefix={<Icon type="pen" color="skyblue"/>} />
        </div>
    </>
)

export default meta