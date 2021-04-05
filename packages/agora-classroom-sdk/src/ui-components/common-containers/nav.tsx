import { useAppStore, useRoomStore, useUIStore } from '@/hooks'
import { eduSDKApi } from '@/services/edu-sdk-api'
import { homeApi } from '@/services/home-api'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { BizHeader } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React, { useCallback } from 'react'
import { useRecordingContext } from '../hooks'
import { Exit, Record } from './dialog'
import { SettingContainer } from './setting'
import {v4 as uuidv4} from 'uuid';

export const NavigationBar: React.FC<any> = observer(() => {

  const roomStore = useRoomStore()

  const navigationState = roomStore.navigationState

  const uiStore = useUIStore()

  const {
    isRecording
  } = useRecordingContext()

  const handleClick = useCallback(async (type: string) => {
    switch (type) {
      case 'exit': {
        uiStore.addDialog(Exit)
        break
      }
      case 'record': {
        uiStore.addDialog(Record, {id: uuidv4(), starting: !isRecording})
        break
      }
      case 'setting': {
        uiStore.addDialog(SettingContainer)
        // uiStore.setVisibleSetting(true)
        break
      }
      case 'courseControl': {
        console.log('courseControl')
        break
      }
    }
  }, [navigationState.isStarted, uiStore, isRecording])

  return (
    <BizHeader
      classStatusText={navigationState.classTimeText}
      isStarted={navigationState.isStarted}
      isRecording={isRecording}
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