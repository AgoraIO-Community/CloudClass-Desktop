import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import { IAgoraExtApp, useAppPluginContext, useRoomContext, useSmallClassVideoControlContext, useUserListContext } from 'agora-edu-core'
import Draggable from 'react-draggable'
import { Dependencies } from './dependencies'
import { eduSDKApi } from 'agora-edu-core';
import { Modal, transI18n } from '~ui-kit'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import {Adapter} from '../widget/adapter'
// import { transI18n } from '~components/i18n';

export const AppPluginItem = observer(({app, properties, closable, onCancel} : {app:IAgoraExtApp, properties: any, closable: boolean, onCancel: any}) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const {contextInfo} = useAppPluginContext()
    const { rosterUserList } = useUserListContext()
    const {roomInfo} = useRoomContext()

    const {userUuid, userName, userRole, roomName, roomUuid, roomType, language} = contextInfo
    const {events} = Adapter()
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
              userList: roomInfo.userRole === EduRoleTypeEnum.teacher? rosterUserList: [],
              roomInfo: {
                roomName,roomUuid,roomType
              },
              language: language,
              events
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
    const { studentStreams } = useSmallClassVideoControlContext()
    return (
        <Draggable 
          defaultClassName={app?.className || undefined}
          handle=".modal-title" 
          defaultPosition={{x: window.innerWidth / 2 - app.width / 2, y: window.innerHeight / 2 - app.height / 2 - 100}} 
          bounds={['countdown','answer','vote'].includes(app.appName) ? '.whiteboard' : 'body'}
          positionOffset={{x: 0, y: ['countdown','answer','vote'].includes(app.appName) ? (studentStreams.length ? 40 + 170 : 40) : 0}}
        >
            <Modal 
              title={app?.title || transI18n(`${app.appName}.appName`)} 
              width={app.width} onCancel={onCancel} 
              closable={closable}
            >
                <div ref={ref} style={{width: '100%', height: app.height, overflow: 'hidden', transition: '.5s'}}>
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
    <div style={{position: 'absolute', left: 0, top: 0, width: 0, height: 0}}>
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