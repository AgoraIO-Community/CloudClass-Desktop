import React, { useEffect, useRef } from 'react';
import { useHistory, } from 'react-router-dom';
import {  useHomeStore , useAudienceParams} from '@/hooks';
import { AgoraEduEvent } from '@/edu-sdk/declare'
import { homeApi } from '@/services/home-api';
import { LaunchOption, LanguageEnum, TranslateEnum } from "@/edu-sdk";
import { AgoraEduSDK } from '@/edu-sdk'
import { observer } from 'mobx-react';


export const Invisible = observer(() => {
  const history = useHistory();
  const homeStore = useHomeStore()
  const roomRef = useRef<any>()
  const setRoomInfo = async () => {
    console.log('useAudienceParams',useAudienceParams())
    const { userUuid, userRole = 0, roomType = 0, roomUuid, roomName = 'audience', userName = 'audience', duration = 1000 }: any = useAudienceParams()
    const uid = `audience${userRole}`
    const { rtmToken } = await homeApi.login(uid)
    AgoraEduSDK.config({
      appId: `${REACT_APP_AGORA_APP_ID}`,
    })
    const config = {
      rtmUid: userUuid,
      pretest: false,
      courseWareList: [],
      translateLanguage: ("auto" as TranslateEnum),
      language: ('en' as LanguageEnum),
      userUuid,
      rtmToken,
      roomUuid,
      roomName,
      userName,
      roomType: parseInt(roomType,10),
      roleType:  parseInt(userRole,10),
      startTime: new Date().getTime(),
      duration,
    }
    homeStore.setLaunchConfig(config as Omit<LaunchOption, 'listener'>)
    await AgoraEduSDK.launch(roomRef?.current, {
      ...config,
      listener: (evt: AgoraEduEvent) => {
        if (evt === AgoraEduEvent.destroyed) {
          history.push('/')
        }
      }
    })
  }
  useEffect(() => {
    setRoomInfo()
  }, []);
  return (<div ref={roomRef}  style={{width: '100%', height: '100%'}}/>)
})