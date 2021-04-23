import { useBoardContext, useAppPluginContext, IAgoraExtApp } from 'agora-edu-core'
import { Icon, t, ToolCabinet } from '~ui-kit'

export const ToolCabinetContainer = () => {

    const {
        startOrStopSharing,
        setLaserPoint,
        currentSelector
    } = useBoardContext()

    const {
        appPlugins,
        onLaunchAppPlugin
    } = useAppPluginContext()

    const onClick = async (itemType: string) => {
        switch(itemType) {
            case 'screenShare': {
                await startOrStopSharing()
                break;
            }
            case 'laser': {
                setLaserPoint()
                break;
            }
        }
    }
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
                    id: 'laser',
                    icon: <Icon type="laser-pointer" />,
                    name: t('scaffold.laser_pointer')
                },
                ...appPlugins.map((p:IAgoraExtApp) => {
                    return {
                        id: p.appIdentifier,
                        icon:<Icon type="share-screen" />,
                        name: p.appName
                    }
                })
            ]}
            onClick={(id: any) => {
                if(['screenShare', 'laser'].includes(id)) {
                    onClick(id)
                } else {
                    onLaunchAppPlugin(id)
                }
            }}
            activeItem={currentSelector}
        />
    )
}