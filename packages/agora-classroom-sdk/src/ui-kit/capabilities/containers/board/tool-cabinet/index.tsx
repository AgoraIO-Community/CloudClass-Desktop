import { Icon, t, ToolCabinet } from '~ui-kit'

export const ToolCabinetContainer = (props: any) => {

    const {onClick} = props

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