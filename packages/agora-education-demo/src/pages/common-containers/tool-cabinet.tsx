import { ToolCabinet, Icon } from 'agora-scenario-ui-kit'
import React from 'react'
import { OpenShareScreen } from './dialog'
import { useSceneStore } from '@/hooks'
import { t } from '@/i18n'

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
                    name: t('tools.screen_share')
                },
                {
                    id: 'laserPoint',
                    icon: <Icon type="laser-pointer" />,
                    name: t('tools.laser_pointer')
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