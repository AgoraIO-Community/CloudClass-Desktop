import { AgoraEduSDK, AgoraEduEvent} from '../../api'
import {ClassRoom, ClassRoomAbstractStore, controller } from '../../api/controller'
import { useHomeStore } from '@/infra/hooks'
import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom'
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
      launchOption.rtmToken = RtmTokenBuilder.buildToken(
        `${REACT_APP_AGORA_APP_ID}`, '04271c107fb447fdbc3b91cc469b4128',
        launchOption.userUuid, RtmRole.Rtm_User, 0)
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