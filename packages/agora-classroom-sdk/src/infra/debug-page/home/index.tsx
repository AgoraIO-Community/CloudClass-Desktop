import { useHomeStore } from "@/infra/hooks"
import { changeLanguage, Home } from "~ui-kit"
import {storage} from '@/infra/utils'
import { homeApi, LanguageEnum } from "agora-edu-core"
import { EduRoleTypeEnum, EduSceneType } from "agora-rte-sdk"
import { observer } from "mobx-react"
import React, { useState, useMemo, useEffect } from "react"
import { useHistory } from "react-router"
import { AgoraRegion } from "@/infra/api"
import AgoraRTC from 'agora-rtc-sdk-ng'

export const HomePage = observer(() => {

  const homeStore = useHomeStore()

  const [roomId, setRoomId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userRole, setRole] = useState<string>('')
  const [curScenario, setScenario] = useState<string>('')
  const [duration, setDuration] = useState<number>(30)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [language, setLanguage] = useState<string>(sessionStorage.getItem('language') || 'en')
  const [region, setRegion] = useState<AgoraRegion>('CN')
  const [debug, setDebug] = useState<boolean>(false)

  useEffect(() => {
    changeLanguage(language)
    setLanguage(language)
  }, [])

  const onChangeRegion = (region: string) => {
    setRegion(region as AgoraRegion)
  }

  const onChangeLanguage = (language: string) => {
    sessionStorage.setItem('language', language)
    changeLanguage(language)
    setLanguage(language)
  }

  const role = useMemo(() => {
    const roles = {
      'teacher': EduRoleTypeEnum.teacher,
      'assistant': EduRoleTypeEnum.assistant,
      'student': EduRoleTypeEnum.student,
      'incognito': EduRoleTypeEnum.invisible
    }
    return roles[userRole]
  }, [userRole])

  const scenario = useMemo(() => {
    const scenes = {
      '1v1': EduSceneType.Scene1v1,
      'mid-class': EduSceneType.SceneMedium,
      'big-class': EduSceneType.SceneLarge,
    }
    return scenes[curScenario]
  }, [curScenario])

  const userUuid = useMemo(() => {
    if(!debug) {
      return `${userName}${role}`
    }
    return `${userId}`
  }, [role, userName, debug, userId])

  const roomUuid = useMemo(() => {
    if(!debug) {
      return `${roomName}${scenario}`
    }
    return `${roomId}`
  }, [scenario, roomName, debug, roomId])

  const onChangeRole = (value: string) => {
    setRole(value)
  }

  const onChangeScenario = (value: string) => {
    setScenario(value)
  }

  const text: Record<string, CallableFunction> = {
    'roomId': setRoomId,
    'userName': setUserName,
    'roomName': setRoomName,
    'userId': setUserId,
  }

  const onChangeRoomId = (newValue: string) => {
    text['roomId'](newValue)
  }

  const onChangeUserId = (newValue: string) => {
    text['userId'](newValue)
  }

  const onChangeRoomName = (newValue: string) => {
    text['roomName'](newValue)
  }

  const onChangeUserName = (newValue: string) => {
    text['userName'](newValue)
  }

  const onChangeDebug = (newValue: boolean) => {
    setDebug(newValue)
  }

  const history = useHistory()

  const [courseWareList, updateCourseWareList] = useState<any[]>(storage.getCourseWareSaveList())
  // @ts-ignore
  const SDKVersion = window.isElectron ? window.rtcEngine.getVersion().version : AgoraRTC.VERSION
  return (
    <Home
      version={REACT_APP_BUILD_VERSION}
      SDKVersion={SDKVersion}
      publishDate={REACT_APP_PUBLISH_DATE}
      roomId={roomUuid}
      userId={userUuid}
      roomName={roomName}
      userName={userName}
      role={userRole}
      scenario={curScenario}
      duration={duration}
      region={region}
      debug={debug}
      onChangeDebug={onChangeDebug}
      onChangeRegion={onChangeRegion}
      onChangeRole={onChangeRole}
      onChangeScenario={onChangeScenario}
      onChangeRoomId={onChangeRoomId}
      onChangeUserId={onChangeUserId}
      onChangeRoomName={onChangeRoomName}
      onChangeUserName={onChangeUserName}
      // onChangeStartDate={(date: Date) => {
      //   setStartDate(date)
      // }}
      onChangeDuration={(duration: number) => {
        setDuration(duration)
      }}
      language={language}
      onChangeLanguage={onChangeLanguage}
      onClick={async () => {
        let {rtmToken} = await homeApi.login(userUuid)
        console.log('## rtm Token', rtmToken)
        homeStore.setLaunchConfig({
          // rtmUid: userUuid,
          pretest: true,
          courseWareList: courseWareList.slice(0, 1),
          personalCourseWareList: courseWareList.slice(1, courseWareList.length),
          language: language as LanguageEnum,
          userUuid: `${userUuid}`,
          rtmToken,
          roomUuid: `${roomUuid}`,
          roomType: scenario,
          roomName: `${roomName}`,
          userName: userName,
          roleType: role,
          startTime: undefined,
          // startTime: +(new Date()),
          region,
          duration: duration * 60,
          userFlexProperties: {"avatar": "test"}
        })
        history.push('/launch')
      }}
    />
  )
})