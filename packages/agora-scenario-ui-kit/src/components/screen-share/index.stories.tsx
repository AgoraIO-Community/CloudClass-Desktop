import React from 'react'
import { Meta } from '@storybook/react';
import { ScreenShare } from '~components/screen-share'
import { Button } from '~components/button'
import { Modal } from '~components/modal'

const meta: Meta = {
    title: 'Components/ScreenShare',
    component: ScreenShare,
};

type DocsProps = {
    title: string
    subTitle: string,
    programCount: number,
    scrollHeight: number
}


export const Docs = ({ title, subTitle, programCount, scrollHeight }: DocsProps) => {
    const windowItems = [...'.'.repeat(programCount)].map((item, index) => (
        {
            id: 'id-' + (index + 1),
            title: 'title-' + (index + 1),
        }
    ))
    return (
        <>
            <div className="mt-4">
                <Modal
                    width={662}
                    title={title}
                    footer={[
                        <Button type="secondary">cancel</Button>,
                        <Button>ok</Button>
                    ]}
                >
                    <ScreenShare
                        screenShareTitle={subTitle}
                        windowItems={windowItems}
                        onConfirm={() => {}}
                    ></ScreenShare>
                </Modal>
            </div>
            <div className="mt-4">
                <Button
                    onClick={() => {
                        Modal.show({
                            width: 662,
                            title: '自己封装的show方法',
                            closable: true,
                            footer: [
                                <Button type="secondary" action="cancel">cancel</Button>,
                                <Button action="ok">ok</Button>
                            ],
                            onOk: () => {},
                            onCancel: () => {},
                            children: (
                                <>
                                    <ScreenShare
                                        screenShareTitle={subTitle}
                                        windowItems={windowItems}
                                        onConfirm={id => console.log('user get', id)}
                                    ></ScreenShare>
                                </>
                            )
                        })
                    }}
                >show screen share</Button>
            </div>
        </>
    );
}

Docs.args = {
    title: 'Screen Share Title',
    subTitle: 'This Is Subtitle',
    programCount: 6,
    scrollHeight: 300
}

export default meta;
