import { Meta } from '@storybook/react';
import { Select } from '~components/select'
const { Option } = Select

const meta: Meta = {
    title: 'Components/Select',
    component: Select,
}

const optionData = [...'.'.repeat(5)].map((item, index) => ({
    value: index
})).concat([...'.'.repeat(5)].map((item, index) => ({
    value: index
})))

export const Docs = () => (
    <>
        <div className="mt-4">
            <Select
                placeholder={'请选择数字'}
                // defaultValue={'1'}
                onSelect={value => {
                    console.log(value)
                }}
            >
                {optionData.map((item, index) => (<Option value={item.value} key={index}>{item.value}</Option>))}
            </Select>
        </div>
    </>
)

export default meta;