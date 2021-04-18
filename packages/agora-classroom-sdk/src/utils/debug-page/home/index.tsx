import { useHomeStore } from '@/hooks'
import { storage } from '@/utils/utils'
import { homeApi, AgoraRegion, LanguageEnum } from 'agora-edu-sdk'
import { EduRoleTypeEnum, EduSceneType } from 'agora-rte-sdk'
import { observer } from 'mobx-react'
import { useMemo, useState } from 'react'
import { useHistory } from 'react-router'
import { changeLanguage, Home } from '~ui-kit'

export const HomePage = observer(() => {

  const homeStore = useHomeStore()

  const [roomId, setRoomId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [roomName, setRoomName] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userRole, setRole] = useState<string>('')
  const [curScenario, setScenario] = useState<string>('')
  const [region, setRegion] = useState<AgoraRegion>('NS')
  const [duration, setDuration] = useState<number>(30)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [language, setLanguage] = useState<string>('en')

  const onChangeLanguage = (language: string) => {
    console.warn(language)
    changeLanguage(language)
    setLanguage(language)
  }

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

  const uid = `${userId}`

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

  const history = useHistory()

  const [courseWareList, updateCourseWareList] = useState<any[]>(storage.getCourseWareSaveList())

  return (
    <Home
      version="1.1.0"
      roomId={roomId}
      userId={userId}
      userName={userName}
      roomName={roomName}
      role={role}
      scenario={scenario}
      duration={duration}
      language={language}
      region={region}
      onChangeRole={onChangeRole}
      onChangeScenario={onChangeScenario}
      onChangeLanguage={onChangeLanguage}
      onChangeRoomId={onChangeRoomId}
      onChangeUserId={onChangeUserId}
      onChangeUserName={onChangeUserName}
      onChangeRoomName={onChangeRoomName}
      onChangeRegion={(region: unknown) => {
        setRegion(region as AgoraRegion)
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
          language: language as LanguageEnum,
          userUuid: `${userUuid}`,
          rtmToken,
          roomUuid: `${roomId}`,
          roomType: scenario,
          roomName: `${roomName}`,
          userName: userName,
          roleType: role,
          startTime: +startDate,
          duration: duration * 60,
          region,
        })
        history.push('/launch')
      }}
    />
  )
})