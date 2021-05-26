import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { IAgoraExtApp, useAppPluginContext, useRoomContext } from 'agora-edu-core'
import Draggable from 'react-draggable'
import { Dependencies } from './dependencies'
import { eduSDKApi } from 'agora-edu-core';
import { Modal } from '@/ui-kit/components/modal'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { transI18n } from '~components/i18n';

export const AppPluginItem = observer(({app, properties, closable} : {app:IAgoraExtApp, properties: any, closable: boolean}) => {
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
    return (
        <Draggable 
          handle=".modal-title" 
          defaultPosition={{x: 100, y: 100}} 
          bounds={['countdown'].includes(app.appName) ? '.whiteboard' : 'body'}
          positionOffset={{x: 0, y: ['countdown'].includes(app.appName) ? 40 : 0}}
        >
            <Modal 
              title={transI18n(`${app.appName}.appName`)} 
              width={app.width} onCancel={() => onShutdownAppPlugin(app.appIdentifier)} 
              closable={closable}
            >
                <div ref={ref} style={{width: '100%', height: app.height}}>
                </div>
            </Modal>
        </Draggable>
    )
})

export const AppPluginContainer = observer(() => {
  const {activeAppPlugins, appPluginProperties} = useAppPluginContext()
  const {roomInfo} = useRoomContext()
  const closable = roomInfo.userRole === EduRoleTypeEnum.teacher // 老师能关闭， 学生不能关闭
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0}}>
      {Array.from(activeAppPlugins.values()).map((app: IAgoraExtApp, idx: number) => 
        <AppPluginItem key={app.appIdentifier} app={app} properties={appPluginProperties(app)} closable={closable}></AppPluginItem>
      )}
    </div>
  )
})