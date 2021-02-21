import { RoomContainer } from '@/containers/app-container'
import { DelegateType } from '@/edu-sdk'
import { RoomComponentConfigProps, RoomConfigProps } from '@/edu-sdk/declare'
import React from 'react'
import {render} from 'react-dom'

const routes: string[] = [
  "setting",
  "1v1",
  "smallClass",
  "bigClass",
  "replayPage",
  // "home"
]

export const LiveRoom = ({store}: RoomConfigProps) => {
  return (
    <RoomContainer
      mainPath={store.params.mainPath}
      routes={routes}
      store={store}
    />
  )
}

export const RenderLiveRoom = ({dom, store}: RoomComponentConfigProps, delegate: DelegateType) => (
  render(
    <LiveRoom store={store} />,
    dom
  )
)