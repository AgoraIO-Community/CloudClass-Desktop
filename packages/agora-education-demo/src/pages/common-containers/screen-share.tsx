import React, { useState } from 'react'
import { IconButton, Icon, Modal, Button, ScreenShare } from 'agora-scenario-ui-kit'

export const ScreenShareContainer = () => {
    // TODO: 子标题待确认
    const subTitle = 'screen share sub-title';
    const [visible, setVisible] = useState<boolean>(true)
    const [iconBtnShow, setIconBtnShow] = useState<boolean>(false)
    const [windowItems, setWindowItems] = useState([{
        id: 'share-1',
        title: 'share-1'
    }])
    const [windowId, setWindowId] = useState<string>('')
    return (
        <>
            {iconBtnShow ? (<IconButton icon={<Icon type="exit" color="red" />} buttonTextColor="skyblue" buttonText="停止共享" />) : ""}
            {visible ? (
                <>
                    <ScreenShare
                        onActiveItem={(id: any) => {
                            setWindowId(id)
                        }}
                        currentActiveId={windowId}
                        screenShareTitle={subTitle}
                        windowItems={windowItems}
                        onConfirm={() => { }}
                    ></ScreenShare>
                </>
            ) : ""}
        </>
    )
}