import React, { useState } from 'react'
import { Meta } from '@storybook/react';
import { ScreenShare } from '~components/screen-share'
import { Button } from '~components/button'
import { Modal } from '~components/modal'
import { list } from '~utilities';

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

const WindowContainer = ({
    onOk,
    onCancel,
}: any) => {

    const windowItems = list(20).map((item, index) => (
        {
            id: 'id-' + (index + 1),
            title: 'title-' + (index + 1),
        }
    ))

    const [windowId, setWindowId] = useState<string>('')

    return (
        <div className='modal'>
            <div className='modal-title'></div>
            <div className='modal-content'>
            <ScreenShare
                onActiveItem={(id: any) => {
                    setWindowId(id)
                }}
                currentActiveId={windowId}
                screenShareTitle={'subTitle'}
                windowItems={windowItems}
                onConfirm={() => {}}
            ></ScreenShare>
            </div>
            <div className='modal-footer'>
                <Button type='ghost' onClick={onCancel}>Cancel</Button>
                <Button type='ghost' onClick={onOk}>OK</Button>
            </div>
        </div>
    )
}

export const Docs = ({ title, subTitle, programCount, scrollHeight }: DocsProps) => {
    const windowItems = list(programCount).map((item, index) => (
        {
            id: 'id-' + (index + 1),
            title: 'title-' + (index + 1),
        }
    ))

    const [windowId, setWindowId] = useState<string>('')
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
                        onActiveItem={(id: any) => {
                            setWindowId(id)
                        }}
                        currentActiveId={windowId}
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
                            onOk: () => { console.log('ok') },
                            onCancel: () => { console.log('cancel') },
                            width: 662,
                            component: <WindowContainer />,
                            // width: 662,
                            // title: '自己封装的show方法',
                            // closable: true,
                            // footer: [
                            //     <Button type="secondary" action="cancel">cancel</Button>,
                            //     <Button action="ok">ok</Button>
                            // ],
                            // onOk: () => {},
                            // onCancel: () => {},
                            // children: () => {
                            //     const [window, setWindow] = useState<string>('')
                            //     return (
                            //     <ScreenShare
                            //         currentActiveId={window}
                            //         onActiveItem={(id: any) => setWindow(id)}
                            //         screenShareTitle={subTitle}
                            //         windowItems={windowItems}
                            //         onConfirm={id => console.log('user get', id)}
                            //     ></ScreenShare>
                            //     )
                            // }
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
