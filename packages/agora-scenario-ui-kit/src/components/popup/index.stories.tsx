import React from 'react'
import { Meta } from '@storybook/react';
import { Popup } from '~components/popup'
import { Icon } from '~components/icon'
import { Button } from '~components/button'

const meta: Meta = {
    title: 'Components/Popup',
    component: Popup,
};

type DocsProps = {
    title: string
}

export const Docs = ({ title }: DocsProps) => (
    <>
        <div className="mt-4">
            <Popup
                title={title}
                footer={
                    [
                        <Button type="secondary">test</Button>,
                        <Button>test</Button>
                    ]
                }
            >
                <p>你确定要下课吗？</p>
            </Popup>
        </div>
        <div className="mt-4">
            <Popup
                title={title}
                closable={false}
                footer={
                    [
                        <Button>test</Button>
                    ]
                }
            >
                <p>试用时间到，教室已解散！</p>
            </Popup>

        </div>
        <div className="mt-4">
            <Popup
                title={title}
                width={320}
                footer={
                    [
                        <Button type="ghost">test</Button>,
                        <Button>test</Button>
                    ]
                }
            >
                <Icon type="red-caution" color="#F04C36" size={50}/>
                <p>
                    课件未能加载成功，您可以点击重新加载重试，或者从云盘中播放课件
                </p>
            </Popup>

        </div>
    </>
);

Docs.args = {
    title: 'popup title'
}

export default meta;
