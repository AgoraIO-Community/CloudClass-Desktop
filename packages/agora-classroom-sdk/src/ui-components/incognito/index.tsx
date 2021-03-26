import { AgoraEduSDK } from '@/edu-sdk'
import { ClassRoom, ClassRoomAbstractStore, controller } from '@/edu-sdk/controller'
import { AgoraEduEvent } from '@/edu-sdk/declare'
import { useAudienceParams, useHomeStore } from '@/hooks'
import { isEmpty } from 'lodash'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'

//@ts-ignore
window.controller = controller

export const IncognitoPage = observer(() => {

  const homeStore = useHomeStore()

  const history = useHistory()

  const {
    userUuid, // 用户uuid
    userName, // 用户昵称
    roomUuid,
    roleType,
    roomType,
    roomName,
    // listener,
    // pretest = false,
    rtmUid,
    rtmToken,
    language,
    startTime,
    duration,
    recordUrl,
  }: any = useAudienceParams()

  const roomRef = useRef<ClassRoom<ClassRoomAbstractStore> | null>(null)

  // TODO 传参数
  const mountLaunch = useCallback(async (dom: any) => {
    if (dom) {
      AgoraEduSDK.config({
        appId: `${REACT_APP_AGORA_APP_ID}`,
      })
      roomRef.current = await AgoraEduSDK.launch(dom, {
        // userUuid: '666', // 用户uuid
        // userName: 'liyang dalao', // 用户昵称
        // roomUuid: '621621',
        // roleType: 0,
        // roomType: 0,
        // roomName: '1',
        // pretest: false,
        // rtmUid: '',
        // rtmToken: '',
        // language: 'zh',
        // startTime: 1,
        // duration: 1,
        // recordUrl: '',
        // translateLanguage: 'auto',
        // courseWareList: [],
        userUuid,
        userName,
        roomUuid,
        roleType,
        roomType,
        roomName,
        pretest: false,
        rtmUid,
        rtmToken,
        language,
        startTime,
        duration,
        recordUrl,
        translateLanguage: '',
        courseWareList: [],
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
    <div ref={mountLaunch} id="app" style={{ width: '100%', height: '100%' }}></div>
  )
})