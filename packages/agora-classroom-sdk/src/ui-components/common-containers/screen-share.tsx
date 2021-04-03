import React, { useState } from 'react'
import { IconButton, Icon, Modal, Button, ScreenShare } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react';
import { useScreenShareContext, useScreenSharePlayerContext } from '../hooks';

export type ScreenShareContainerProps = {
    windowId: string,
    setWindowId: (newValue: string) => void,
}

export const ScreenShareContainer: React.FC<ScreenShareContainerProps> = observer((props) => {
    const {
        windowItems,
        subTitle,
    } = useScreenShareContext()
    
    return (
        <ScreenShare
            onActiveItem={(id: any) => {
                props.setWindowId(id)
            }}
            currentActiveId={props.windowId}
            screenShareTitle={subTitle}
            windowItems={windowItems}
        ></ScreenShare>
    )
})