import React, { useState } from 'react'
import { Home } from '.'

export default {
  title: 'Scaffold/home',
  layout: 'fullscreen'
}

export const HomePage = () => {

  const [roomId, setRoomId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [scenario, setScenario] = useState<string>('')
  const [duration, setDuration] = useState<number>(3000)
  const [startDate, setStartDate] = useState<Date>(new Date())

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

  const onChangeStartDate = (date: Date) => {
    setStartDate(date)
  }

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
      onChangeDate={onChangeStartDate}
      onClick={() => {
        console.log('click')
      }}
    />
  )
}