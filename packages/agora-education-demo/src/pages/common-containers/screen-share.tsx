import React, { useState } from 'react'
import { IconButton, Icon, Modal, Button, ScreenShare } from 'agora-scenario-ui-kit'

export const ScreenShareContainer = () => {
    const title = 'screen share title';
    const subTitle = 'screen share sub-title';
    const [visible, setVisible] = useState<boolean>(true)
    const [iconBtnShow, setIconBtnShow] = useState<boolean>(false)
    const [windowItems, setWindowItems] = useState([{
        id: 'share-1',
        title: 'share-1'
    }])
    const [windowId, setWindowId] = useState<string>('')
    function closeModal() {
        setVisible(false)
    }
    // console.log({visible, windowItems, windowId})
    return (
        <div className="fixed-container">
            {iconBtnShow ? (<IconButton icon={<Icon type="exit" color="red" />} buttonTextColor="skyblue" buttonText="停止共享" />) : ""}
            {visible ? (
                <>
                    <Modal
                        width={662}
                        title={title}
                        footer={[
                            <Button type="secondary" action="cancel">cancel</Button>,
                            <Button action="ok">ok</Button>
                        ]}
                        onCancel={closeModal}
                        onOk={() => {
                            setIconBtnShow(true)
                            closeModal()
                        }}
                    >
                        <ScreenShare
                            onActiveItem={(id: any) => {
                                setWindowId(id)
                            }}
                            currentActiveId={windowId}
                            screenShareTitle={subTitle}
                            windowItems={windowItems}
                            onConfirm={() => { }}
                        ></ScreenShare>
                    </Modal>
                </>
            ) : ""}
        </div>
    )
}