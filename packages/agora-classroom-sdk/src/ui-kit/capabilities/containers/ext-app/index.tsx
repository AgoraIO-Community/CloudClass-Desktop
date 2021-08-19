import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { IAgoraExtApp, useAppPluginContext, useRoomContext } from 'agora-edu-core'
import { useUIStore } from '@/infra/hooks'
import Draggable from 'react-draggable'
import { Dependencies } from './dependencies'
import { eduSDKApi } from 'agora-edu-core';
import { Modal } from '~ui-kit'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { ContextPoolAdapters } from '@/ui-kit/utilities/adapter'
import "./index.css"
import CloseIcon from './close-icon'
// import { transI18n } from '~components/i18n';

export const AppPluginItem = observer(({app, properties, closable, onCancel} : {app:IAgoraExtApp, properties: any, closable: boolean, onCancel: any}) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const {contextInfo} = useAppPluginContext()

    const {userUuid, userName, userRole, roomName, roomUuid, roomType, language} = contextInfo

    const contexts = ContextPoolAdapters()

    useEffect(() => {
        if (ref.current) {
            // only run for very first time
            app.extAppDidLoad(ref.current, {
              properties: properties,
              dependencies: Dependencies,
              localUserInfo: {
                userUuid: userUuid,
                userName: userName,
                roleType: userRole
              },
              roomInfo: {
                roomName,roomUuid,roomType
              },
              language: language,
              contexts
            }, {
              updateRoomProperty: async (properties: any, common: any, cause: {}) => {
                return await eduSDKApi.updateExtAppProperties(roomUuid, app.appIdentifier, properties, common, cause)
              },
              deleteRoomProperties: async(properties: string[], cause: {}) => {
                return await eduSDKApi.deleteExtAppProperties(roomUuid, app.appIdentifier, properties, cause)
              }
            })
        }
        return () => app.extAppWillUnload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, app])
    // const { studentStreams } = useSmallClassVideoControlContext()
    return (
        <Draggable 
          defaultClassName="extapp-draggable-container fixed"
          handle=".modal-title" 
          defaultPosition={{x: window.innerWidth / 2 - app.width / 2 , y: window.innerHeight / 2 - app.height / 2}} 
          bounds={'body'}
          positionOffset={{x: 0, y: 0}}
        >
            <Modal 
              title={app.appName} 
              width={'min-content'}
              onCancel={onCancel} 
              closable={closable}
              header={app.customHeader}
              className='extapp-modal'
              closeIcon={<CloseIcon />}
            >
                <div ref={ref} style={{transition: '.5s'}}>
                </div>
            </Modal>
        </Draggable>
    )
})

export const AppPluginContainer = observer(() => {
  const {activeAppPlugins, appPluginProperties, onShutdownAppPlugin, contextInfo} = useAppPluginContext()
  const {roomInfo} = useRoomContext()
  const closable = roomInfo.userRole === EduRoleTypeEnum.teacher // 老师能关闭， 学生不能关闭

  const { activePluginId } = useUIStore()

  let activePlugin: IAgoraExtApp | null = null
  // pick out currently active plugin, and remove from plugin list
  const appPlugins = Array.from(activeAppPlugins.values()).filter((plugin) => {
    if(plugin.appIdentifier === activePluginId) {
      activePlugin = plugin
    }
    return plugin.appIdentifier !== activePluginId
  })
  // put active plugin at last of the plugin list so that it will be renered on most top layer
  activePlugin && appPlugins.push(activePlugin)

  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, zIndex: 10}}>
      {appPlugins.map((app: IAgoraExtApp, idx: number) => 
        <AppPluginItem 
          key={app.appIdentifier}
          app={app} 
          properties={appPluginProperties(app)} 
          closable={closable}
          onCancel={async () => {
            onShutdownAppPlugin(app.appIdentifier)
          }}
        ></AppPluginItem>
      )}
    </div>
  )
})