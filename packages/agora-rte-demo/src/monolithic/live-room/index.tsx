import { RoomContainer } from '@/containers/app-container'
import { DelegateType } from '@/edu-sdk'
import { RoomComponentConfigProps, RoomConfigProps } from '@/edu-sdk/declare'
import { AppStore } from '@/stores/app'
import React from 'react'
import {render} from 'react-dom'
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles'

const routes: string[] = [
  "setting",
  "1v1",
  "smallClass",
  "bigClass",
  "replayPage",
  "pretest",
  "aClass"
  // "home"
]

const generateClassName = createGenerateClassName({
  productionPrefix: `room`,
  disableGlobal: false,
  seed: 'live',
})

export const LiveRoom = ({store}: RoomConfigProps<AppStore>) => {
  
  return (
    <StylesProvider injectFirst>
      <RoomContainer
        mainPath={store.params.mainPath}
        routes={routes}
        store={store}
      />
    </StylesProvider>
  )
}