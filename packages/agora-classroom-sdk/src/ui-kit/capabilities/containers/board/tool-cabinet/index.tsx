import { CabinetItem } from '@/ui-kit/components/toolbar/tool-cabinet'
import { useBoardContext, useAppPluginContext, IAgoraExtApp, useRoomContext, useScreenShareContext } from 'agora-edu-core'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { useCallback } from 'react'
import { Icon, t, ToolCabinet } from '~ui-kit'
import {observer} from 'mobx-react'
import { ScreenShareType } from 'agora-rte-sdk'

export const ToolCabinetContainer = observer(() => {

    const {
        setLaserPoint,
        currentSelector,
        canSharingScreen,
    } = useBoardContext()

    const {
        startOrStopSharing
    } = useScreenShareContext()

    const {
        appPlugins,
        onLaunchAppPlugin
    } = useAppPluginContext()

    const onClick = useCallback(async (itemType: string) => {
        switch(itemType) {
            case 'screenShare': {
                if (canSharingScreen) {
                    await startOrStopSharing()
                }
                break;
            }
            case 'laser': {
                setLaserPoint()
                break;
            }
            default: {
                onLaunchAppPlugin(itemType)
                break;
            }
        }
    }, [canSharingScreen, startOrStopSharing, setLaserPoint, onLaunchAppPlugin])

    const {
        roomInfo
    } = useRoomContext()

    const getCabinetList = useCallback(() => {
        const screenShareTool: CabinetItem[] = [{
            id: 'screenShare',
            icon: <Icon type="share-screen" useSvg />,
            name: t('scaffold.screen_share'),
        }]

        const restTools: CabinetItem[] = [
            {
                id: 'laser',
                icon: <Icon type="laser-pointer" />,
                name: t('scaffold.laser_pointer'),
            },
            ...appPlugins.map((p:IAgoraExtApp) => {
                return {
                    id: p.appIdentifier,
                    icon:<Icon type="share-screen" />,
                    name: p.appName
                }
            })
        ]

        if (roomInfo.userRole === EduRoleTypeEnum.teacher) {
            return screenShareTool.concat(...restTools)
        } else {
            return restTools
        }
    }, [roomInfo.userRole])

    return (
        <ToolCabinet
            key={`${canSharingScreen}`}
            value='tools'
            label={t('scaffold.tools')}
            icon='tools'
            cabinetList={getCabinetList()}
            onClick={onClick}
            activeItem={currentSelector}
        />
    )
})