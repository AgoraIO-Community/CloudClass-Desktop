import React, { useState } from 'react'
import { Home } from './home'

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
    />
  )
}

export const HomeDoc = () => {
  return (
    <div className="mt-8 max-w-md">
      <div className="grid grid-cols-1 gap-6">
        <label className="block" />
        <span className="text-gray-700">Full name</span>
        <input type="text" className="mt-1 block w-full" placeholder="" />
        <label className="block" />
        <span className="text-gray-700">Email address</span>
        <input type="email" className="mt-1 block w-full" placeholder="john@example.com" />
        <label className="block" />
        <span className="text-gray-700">When is your event?</span>
        <input type="date" className="mt-1 block w-full" />
          <label className="block">
            <span className="text-gray-700">What type of event is it?</span>
            <select className="block w-full mt-1">
              <option>Corporate event</option>
              <option>Wedding</option>
              <option>Birthday</option>
              <option>Other</option>
            </select>
          </label>
          <div className="block">
            <div className="mt-2">
              <div>
                <label className="inline-flex items-center" />
                <input type="checkbox" />
                <span className="ml-2">Email me news and special offers</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}