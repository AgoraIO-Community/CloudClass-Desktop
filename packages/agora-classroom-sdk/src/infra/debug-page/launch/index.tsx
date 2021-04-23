import { AgoraEduSDK, AgoraEduEvent} from '../../api'
import {ClassRoom, ClassRoomAbstractStore, controller } from '../../api/controller'
import { useHomeStore } from '@/infra/hooks'
import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom'
import { AgoraExtAppCountDown, AgoraExtAppWhiteboard } from 'agora-plugin-gallery'
import { RtmTokenBuilder, RtmRole } from 'agora-access-token'

//@ts-ignore
window.controller = controller

export const LaunchPage = observer(() => {

  console.log("Launch")

  const homeStore = useHomeStore()

  const history = useHistory()

  const launchOption = homeStore.launchOption

  const roomRef = useRef<ClassRoom<ClassRoomAbstractStore> | null>(null)

  useEffect(() => {
    if (!launchOption || isEmpty(launchOption)) {
      history.push('/')
      return 
    }
  }, [])

  const mountLaunch = useCallback(async (dom: any) => {
    if (dom) {
      AgoraEduSDK.config({
        appId: `${REACT_APP_AGORA_APP_ID}`,
        sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`
      })

      // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
      // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
      const appCertificate = `${REACT_APP_AGORA_APP_CERTIFICATE}`
      if(appCertificate) {
        launchOption.rtmToken = RtmTokenBuilder.buildToken(
          `${REACT_APP_AGORA_APP_ID}`,
          appCertificate,
          launchOption.userUuid,
          RtmRole.Rtm_User,
          0
        )
      }

      // launchOption.extApps = [new AgoraExtAppCountDown(), new AgoraExtAppWhiteboard()]
      roomRef.current = await AgoraEduSDK.launch(dom, {
        ...launchOption,
        listener: (evt: AgoraEduEvent) => {
          console.log("launch#listener ", evt)
          if (evt === AgoraEduEvent.destroyed) {
            history.push('/')
          }
        }
      })
    }
    return () => {
      if (roomRef.current) {
        roomRef.current.destroy()
      }
    }
  }, [AgoraEduSDK])

  return (
    <div ref={mountLaunch} id="app" style={{width: '100%', height: '100%'}}></div>
  )
})