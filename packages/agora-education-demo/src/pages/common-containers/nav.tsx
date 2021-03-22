import { useRoomStore, useUIStore } from '@/hooks'
import { BizHeader, Modal, Button } from 'agora-scenario-ui-kit'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import React, { useCallback, useState } from 'react'
import { Exit } from './dialog'
import { SettingContainer } from './setting'

export const NavigationBar: React.FC<any> = observer(() => {

  const roomStore = useRoomStore()

  const navigationState = roomStore.navigationState

  const uiStore = useUIStore()

  const handleClick = useCallback(async (type: string) => {
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
        uiStore.setVisibleSetting(true)
        break
      }
      case 'courseControl': {
        console.log('courseControl')
        break
      }
    }
  }, [navigationState.isStarted, uiStore])

  return (
    <>
    <BizHeader
      classStatusText={navigationState.classTimeText}
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
    <SettingContainer />
    </>
  )
})