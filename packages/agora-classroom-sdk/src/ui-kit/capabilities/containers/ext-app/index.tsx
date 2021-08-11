import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { IAgoraExtApp, useAppPluginContext, useRoomContext } from 'agora-edu-core'
import Draggable from 'react-draggable'
import { Dependencies } from './dependencies'
import { eduSDKApi } from 'agora-edu-core';
import { Modal, transI18n } from '~ui-kit'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { ContextPoolAdapters } from '@/ui-kit/utilities/adapter'
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
          defaultClassName="extapp-draggable-container"
          handle=".modal-title" 
          defaultPosition={{x: window.innerWidth / 2, y: window.innerHeight / 2 - 100}} 
          bounds={'body'}
          positionOffset={{x: 0, y: 0}}
        >
            <Modal 
              title={app.appName} 
              width={'min-content'}
              onCancel={onCancel} 
              closable={closable}
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
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0, zIndex: 10}}>
      {Array.from(activeAppPlugins.values()).map((app: IAgoraExtApp, idx: number) => 
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