import { useRoomStore, useUIStore } from '@/hooks'
import { BizHeader, Modal, Button } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React, { useCallback, useState } from 'react'
import { Exit } from './dialog'

export const NavigationBar: React.FC<any> = observer(() => {

  const roomStore = useRoomStore()

  const navigationState = roomStore.navigationState

  const uiStore = useUIStore()

  const handleClick = useCallback(async (type: string) => {
    console.log(' nav handleClick ', type)
    switch (type) {
      case 'exit': {
        uiStore.addDialog(Exit)
        break
      }
      case 'record': {
        console.log('record')
        break
      }
      case 'setting': {
        console.log('setting')
        break
      }
      case 'courseControl': {
        console.log('courseControl')
        break
      }
    }
  }, [navigationState.isStarted])

  const onClick = (type: string) => {
    console.log(' nav ', type)
  }

  return (
    <BizHeader
      isStarted={navigationState.isStarted}
      title={navigationState.title}
      signalQuality={navigationState.signalQuality}
      monitor={{
        cpuUsage: navigationState.cpuUsage,
        networkLatency: navigationState.networkLatency,
        networkQuality: navigationState.networkQuality,
        packetLostRate: navigationState.packetLostRate,
      }}
      onClick={handleClick}
    />
  )
})