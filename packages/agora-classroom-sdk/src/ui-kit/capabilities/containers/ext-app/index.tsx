import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { IAgoraExtApp, useAppPluginContext } from 'agora-edu-core'
import Draggable from 'react-draggable'
import { Dependencies } from './dependencies'
import { eduSDKApi } from 'agora-edu-core';
import { Modal } from '@/ui-kit/components/modal'

export const AppPluginItem = observer(({app, properties} : {app:IAgoraExtApp, properties: any}) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const {onShutdownAppPlugin, contextInfo} = useAppPluginContext()

    const {userUuid, userName, userRole, roomName, roomUuid, roomType, language} = contextInfo

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
              language: language
            }, {
              updateRoomProperty: async (properties: any, cause: {}) => {
                return await eduSDKApi.updateExtAppProperties(roomUuid, app.appIdentifier, properties, cause)
              },
              deleteRoomProperties: async(properties: string[], cause: {}) => {
                return await eduSDKApi.deleteExtAppProperties(roomUuid, app.appIdentifier, properties, cause)
              }
            })
        }
        return () => app.extAppWillUnload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, app])
    return (
        <Draggable handle=".modal-title" defaultPosition={{x: 100, y: 100}}>
            <Modal title={app.appName} width={app.width} onCancel={() => onShutdownAppPlugin(app.appIdentifier)}>
                <div ref={ref} style={{width: '100%', height: app.height}}>
                </div>
            </Modal>
        </Draggable>
    )
})

export const AppPluginContainer = observer(() => {
  const {activeAppPlugins, appPluginProperties} = useAppPluginContext()
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0}}>
      {Array.from(activeAppPlugins.values()).map((app: IAgoraExtApp, idx: number) => 
        <AppPluginItem key={app.appIdentifier} app={app} properties={appPluginProperties(app)}></AppPluginItem>
      )}
    </div>
  )
})