import { Icon, t, ToolCabinet } from 'agora-scenario-ui-kit'
import React from 'react'
import { useToolCabinetContext } from '../hooks'

export const ToolCabinetContainer = () => {
    const {onClick} = useToolCabinetContext()

    return (
        <ToolCabinet
            value='tools'
            label={t('scaffold.tools')}
            icon='tools'
            cabinetList={[
                {
                    id: 'screenShare',
                    icon: <Icon type="share-screen" />,
                    name: t('scaffold.screen_share')
                },
                {
                    id: 'laserPoint',
                    icon: <Icon type="laser-pointer" />,
                    name: t('scaffold.laser_pointer')
                },
            ]}
            onClick={onClick}
        />
    )
}