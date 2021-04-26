import React, { useState } from 'react'
import { Meta } from '@storybook/react';
import { Modal } from '~components/modal'
import { HomeAbout } from '~components/home-about'

const meta: Meta = {
    title: 'Components/HomeAbout',
    component: HomeAbout,
}

const HomeAboutContainer = () => {
    const [visible, setVisible] = useState<boolean>(true)
    return (
        <div>
            {visible ? (
                <Modal
                    title="关于"
                    width={366}
                    onCancel={() => {
                        setVisible(false)
                    }}
                >
                    <HomeAbout/>
                </Modal>
            ) : null}
        </div>
    )
}

export const Docs = () => {
    return (
        <>
            <div className="mt-4">
                <HomeAboutContainer/>
            </div>
        </>
    )
}

export default meta;