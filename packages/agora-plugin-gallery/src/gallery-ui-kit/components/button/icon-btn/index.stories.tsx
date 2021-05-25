import React from 'react';
import { Meta } from '@storybook/react';
import { IconButton } from '~components/button/icon-btn';
import { Icon } from '~components/icon'

const meta: Meta = {
    title: 'Components/IconButton',
    component: IconButton,
}

type DocsProps = {
    buttonText: string;
    buttonTextColor: string;
}

export const Docs = ({buttonText, buttonTextColor}: DocsProps) => (
    <>
        <div className="mt-4">
            <IconButton
                icon={<Icon type="color" color="red"/>}
                buttonText={buttonText}
                buttonTextColor={buttonTextColor}
                onClick={() => {console.log('点击了这个只有一个icon的按钮')}}
            />
        </div>
        <div className="mt-4">
            <IconButton
                icon={<Icon type="forward" color="#357BF6"/>}
                buttonText={buttonText}
                buttonTextColor={buttonTextColor}
                onClick={() => {console.log('点击了另一个icon的按钮')}}
            />
        </div>
    </>
)

Docs.args = {
    buttonText: 'test',
    buttonTextColor: '#357BF6'
}

export default meta;