import { ToolCabinet, Icon, t } from 'agora-scenario-ui-kit'
import React from 'react'
import { useBoardStore, useSceneStore } from '@/hooks'

export const ToolCabinetContainer = () => {
    const sceneStore = useSceneStore()

    const boardStore = useBoardStore()

    return (
        <ToolCabinet
            value='tools'
            label='工具箱'
            icon='tools'
            cabinetList={[
                {
                    id: 'screenShare',
                    icon: <Icon type="share-screen" />,
                    name: t('tools.screen_share')
                },
                {
                    id: 'laserPoint',
                    icon: <Icon type="laser-pointer" />,
                    name: t('tools.laser_pointer')
                },
            ]}
            onClick={async id => {
                switch (id) {
                    case 'screenShare': {
                        await sceneStore.startOrStopSharing();
                        break;
                    }
                    case 'laserPoint': {
                        await boardStore.setLaserPoint()
                    }
                }
            }}
        />
    )
}