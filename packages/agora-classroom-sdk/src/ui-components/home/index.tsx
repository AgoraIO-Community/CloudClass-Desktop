import { useHomeStore } from '@/hooks'
import { homeApi } from '@/services/home-api'
import { storage } from '@/utils/utils'
import { EduRoleTypeEnum, EduSceneType } from 'agora-rte-sdk'
import { Home } from 'agora-scenario-ui-kit'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import { useHistory } from 'react-router'

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
  // const [lang, setL]

  const role = useMemo(() => {
    const roles = {
      'teacher': EduRoleTypeEnum.teacher,
      'assistant': EduRoleTypeEnum.assistant,
      'student': EduRoleTypeEnum.student,
      'invisible': EduRoleTypeEnum.invisible
    }
    return roles[userRole]
  }, [userRole])

  const scenario = useMemo(() => {
    const scenes = {
      '1v1': EduSceneType.Scene1v1,
      'mid-class': EduSceneType.SceneMedium
    }
    return scenes[curScenario]
  }, [curScenario])

  const uid = `${userId}${role}`

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
      userId={userId}
      roomName={roomName}
      userName={userName}
      role={userRole}
      scenario={curScenario}
      duration={duration}
      onChangeRole={onChangeRole}
      onChangeScenario={onChangeScenario}
      onChangeText={onChange}
      onChangeStartDate={(date: Date) => {
        setStartDate(date)
      }}
      onChangeDuration={(duration: number) => {
        setDuration(duration)
      }}
      onClick={async () => {
        let {userUuid, rtmToken} = await homeApi.login(uid)
        homeStore.setLaunchConfig({
          rtmUid: userUuid,
          pretest: true,
          courseWareList: courseWareList.slice(0, 1),
          personalCourseWareList: courseWareList.slice(1, courseWareList.length),
          translateLanguage: "auto",
          language: 'en',
          userUuid: `${userUuid}`,
          rtmToken,
          roomUuid: `${roomId}`,
          roomType: scenario,
          roomName: `${roomName}`,
          userName: userName,
          roleType: role,
          startTime: +startDate,
          duration: duration * 60,
        })
        history.push('/launch')
      }}
    />
  )
})