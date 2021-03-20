import { ToolCabinet, Icon } from 'agora-scenario-ui-kit'
import React from 'react'
import { OpenShareScreen } from './dialog'
import { useSceneStore } from '@/hooks'

export const ToolCabinetContainer = () => {
    const sceneStore = useSceneStore()
    return (
        <ToolCabinet
            value='tools'
            label='工具箱'
            icon='tools'
            cabinetList={[
                {
                    id: 'screenShare',
                    icon: <Icon type="tools" />,
                    name: '屏幕共享'
                },
                {
                    id: 'laserPoint',
                    icon: <Icon type="tools" />,
                    name: '激光笔'
                },
            ]}
            onClick={async id => {
                if (id === 'screenShare') {
                    await sceneStore.startOrStopSharing()
                }
            }}
        />
    )
}