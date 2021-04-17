import { useBoardContext } from 'agora-edu-sdk'
import { Icon, t, ToolCabinet } from '~ui-kit'

export const ToolCabinetContainer = () => {

    const {
        startOrStopSharing,
        setLaserPoint
    } = useBoardContext()

    const onClick = async (itemType: string) => {
        switch(itemType) {
            case 'screenShare': {
                await startOrStopSharing()
                break;
            }
            case 'laserPoint': {
                await setLaserPoint()
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
                    id: 'laserPoint',
                    icon: <Icon type="laser-pointer" />,
                    name: t('scaffold.laser_pointer')
                },
            ]}
            onClick={onClick}
        />
    )
}