import React, { useState } from 'react'
import { Home } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import { homeApi } from '@/services/home-api'
import { useHomeStore } from '@/hooks'
import {storage} from '@/utils/utils'
import dayjs from 'dayjs'
import { useHistory } from 'react-router'

export const HomePage = observer(() => {

  const homeStore = useHomeStore()

  const [roomId, setRoomId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [scenario, setScenario] = useState<string>('')
  const [duration, setDuration] = useState<number>(3000)

  const uid = `${roomId}${userName}${role}`

  const onChangeRole = (value: string) => {
    setRole(value)
  }

  const onChangeScenario = (value: string) => {
    setScenario(value)
  }

  const text: Record<string, CallableFunction> = {
    'roomId': setRoomId,
    'userName': setUserName
  }

  const onChange = (type: string, value: string) => {
    const caller = text[type]
    caller && caller(value)
  }

  const history = useHistory()

  const [courseWareList, updateCourseWareList] = useState<any[]>(storage.getCourseWareSaveList())

  return (
    <Home
      version="1.2.0"
      roomId={roomId}
      userName={userName}
      role={role}
      scenario={scenario}
      duration={duration}
      onChangeRole={onChangeRole}
      onChangeScenario={onChangeScenario}
      onChangeText={onChange}
      onChangeDuration={(v: number) => {
        setDuration(v)
      }}
      onClick={async () => {
        let {userUuid, rtmToken} = await homeApi.login(uid)
        homeStore.setLaunchConfig({
          rtmUid: userUuid,
          pretest: false,
          courseWareList: courseWareList.slice(0, 1),
          personalCourseWareList: courseWareList.slice(1, courseWareList.length),
          translateLanguage: "auto",
          language: 'zh',
          userUuid: `${userUuid}`,
          rtmToken,
          roomUuid: roomId,
          roomType: 0,
          roomName: `test${roomId}`,
          userName: userName,
          roleType: 1,
          startTime: +dayjs(Date.now()),
          duration: duration,
        })
        history.push('/launch')
      }}
    />
  )
})