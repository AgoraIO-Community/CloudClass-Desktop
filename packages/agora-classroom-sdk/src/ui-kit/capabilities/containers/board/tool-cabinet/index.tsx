import { useBoardContext } from 'agora-edu-core'
import { Icon, t, ToolCabinet } from '~ui-kit'

export const ToolCabinetContainer = () => {

    const {
        startOrStopSharing,
        setLaserPoint,
        currentSelector
    } = useBoardContext()

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
            ]}
            onClick={onClick}
            activeItem={currentSelector}
        />
    )
}