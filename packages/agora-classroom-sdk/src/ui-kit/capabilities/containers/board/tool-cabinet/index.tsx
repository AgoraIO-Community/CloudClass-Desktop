import { CabinetItem } from '~ui-kit/components/toolbar/tool-cabinet'
import { useBoardContext, useAppPluginContext, IAgoraExtApp, useRoomContext, useScreenShareContext } from 'agora-edu-core'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { useCallback } from 'react'
import { Icon, t, ToolCabinet } from '~ui-kit'
import {observer} from 'mobx-react'
import { useUIStore } from '@/infra/hooks'
import { BoardSavingStateDialog } from '../../dialog'

export const ToolCabinetContainer = observer(() => {

    const {
        setLaserPoint,
        currentSelector,
        // saveToCloudDrive
    } = useBoardContext()

    const {
        canSharingScreen,
        startOrStopSharing
    } = useScreenShareContext()

    const {
        appPlugins,
        onLaunchAppPlugin,
        setActivePlugin
    } = useAppPluginContext()

    const {
        addDialog
    } = useUIStore()

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
            case 'countdown':
                setActivePlugin('io.agora.countdown')
                onLaunchAppPlugin('io.agora.countdown')
                break;
            case 'boardSave':
                addDialog(BoardSavingStateDialog, {})
                break;
            default: {
                setActivePlugin(itemType)
                onLaunchAppPlugin(itemType)
                break;
            }
        }
    }, [canSharingScreen, startOrStopSharing, setLaserPoint, onLaunchAppPlugin, setActivePlugin])

    const {
        roomInfo
    } = useRoomContext()

    const getCabinetList = useCallback(() => {
        const screenShareTool: CabinetItem[] = [{
            id: 'screenShare',
            icon: <Icon type="share-screen" useSvg size={24} />,
            name: t('scaffold.screen_share'),
        }]

        const boardSaveTool: CabinetItem[] = [{
            id: 'boardSave',
            icon: <Icon type="share-screen" useSvg size={24} />,
            name: t('scaffold.boardSave')
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
                    icon: p.icon,
                    name: p.appName
                }
            })
        ]

        if (roomInfo.userRole === EduRoleTypeEnum.teacher) {
            return screenShareTool.concat(boardSaveTool).concat(...restTools)
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