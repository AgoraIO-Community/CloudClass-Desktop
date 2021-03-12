import React from 'react'
import { Meta } from '@storybook/react';
import { Select } from '~components/select'
const { Option } = Select

const meta: Meta = {
    title: 'Components/Select',
    component: Select,
}

const optionData = [...'.'.repeat(10)].map((item, index) => ({
    value: index,
}))

export const Docs = () => (
    <>
        <div className="mt-4">
            <Select
                placeholder={'请选择数字'}
                // defaultValue={'1'}
            >
                {optionData.map((item, index) => (<Option value={item.value} key={index}>{item.value}</Option>))}
            </Select>
        </div>
    </>
)

export default meta;