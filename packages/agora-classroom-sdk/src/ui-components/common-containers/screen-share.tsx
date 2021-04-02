import React, { useState } from 'react'
import { IconButton, Icon, Modal, Button, ScreenShare } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react';
import { useScreenSharePlayerContext } from '../hooks';

export const ScreenShareContainer = observer(() => {

    const windowItems: any[] = []
    // TODO: 子标题待确认
    const subTitle = 'screen share sub-title';
    const [windowId, setWindowId] = useState<string>('')
    return (
        <ScreenShare
            onActiveItem={(id: any) => {
                setWindowId(id)
            }}
            currentActiveId={windowId}
            screenShareTitle={subTitle}
            windowItems={windowItems}
            onConfirm={() => { }}
        ></ScreenShare>
    )
})