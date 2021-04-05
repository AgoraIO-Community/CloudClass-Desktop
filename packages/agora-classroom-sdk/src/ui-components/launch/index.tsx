import { AgoraEduSDK } from '@/edu-sdk'
import { ClassRoom, ClassRoomAbstractStore, controller } from '@/edu-sdk/controller'
import { AgoraEduEvent } from '@/edu-sdk/declare'
import { useHomeStore } from '@/hooks'
import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'

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
      })
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