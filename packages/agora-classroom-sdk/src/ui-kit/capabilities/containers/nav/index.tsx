import { useUIStore } from '@/infra/hooks'
import { formatCountDown, TimeFormatType } from '@/infra/utils'
import { useClassroomStatsContext, useGlobalContext, useMediaContext, useRecordingContext, useRoomContext, useStreamListContext, useUserListContext } from 'agora-edu-core'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { observer } from 'mobx-react'
import { useCallback } from 'react'
import { useMemo } from 'react'
import { BizHeader, transI18n, BizClassStatus } from '~ui-kit'
import { Exit, Record } from '../dialog'
import { SettingContainer } from '../setting'

export const NavigationBar = observer(() => {
  const {
    isRecording
  } = useRecordingContext()
  const {
    roomInfo,
    liveClassStatus,
    updateFlexRoomProperties
  } = useRoomContext()

  const {
    isNative
  } = useMediaContext()

  const {
    cpuUsage,
    networkQuality,
    networkLatency,
    packetLostRate,
    txPacketLossRate,
    rxPacketLossRate,
    rxNetworkQuality,
    txNetworkQuality,
  } = useClassroomStatsContext()

  const {
    addDialog
  } = useUIStore()

  const addRecordDialog = useCallback(() => {
    return addDialog(Record, {starting: isRecording})
  }, [addDialog, Record, isRecording])

  const bizHeaderDialogs = {
    'setting': () => addDialog(SettingContainer),
    'exit': () => addDialog(Exit),
    'record': () => addRecordDialog(),
  }

  const {
    localUserInfo
  } = useUserListContext()

  const {
    muteVideo,
    muteAudio,
    unmuteAudio,
    unmuteVideo,
    enableLocalVideo,
    enableLocalAudio,
    disableLocalVideo,
    disableLocalAudio,
} = useStreamListContext()

  const startClass = useCallback(async () => {
    await updateFlexRoomProperties(
      {ClassIsBgin: true},
      {}
    )
  }, [])

  const stopClass =  useCallback(async () => {
    await updateFlexRoomProperties(
      {ClassIsBgin: false},
      {}
    )
  }, [])

  const enableLocalVideoCallback = useCallback(async () => {
    await enableLocalVideo()
  }, [])

  const enableLocalAudioCallback = useCallback(async () => {
    await enableLocalAudio()
  }, [])

  const disableLocalVideoCallback = useCallback(async () => {
    await disableLocalVideo()
  }, [])

  const disableLocalAudioCallback = useCallback(async () => {
    await disableLocalAudio()
  }, [])

  const unmuteVideoCallback = useCallback(async () => {
    await unmuteVideo(localUserInfo.userUuid, true)
  }, [localUserInfo.userUuid])

  const muteVideoCallback = useCallback(async () => {
    await muteVideo(localUserInfo.userUuid, true)
  }, [localUserInfo.userUuid])

  const unmuteAudioCallback = useCallback(async () => {
    await  unmuteAudio(localUserInfo.userUuid, true)
  }, [localUserInfo.userUuid])

  const muteAudioCallback = useCallback(async () => {
    await  muteAudio(localUserInfo.userUuid, true)
  }, [localUserInfo.userUuid])

  async function handleClick (type: string) {
    const showDialog = bizHeaderDialogs[type]
    if (showDialog) {
      showDialog(type)
    } else {
      if (type === 'start_preview') {
        await Promise.all([enableLocalVideoCallback(), enableLocalAudioCallback()])
      }
      if (type === 'stop_preview') {
        await Promise.all([disableLocalVideoCallback(), disableLocalAudioCallback()])
      }
      if (type === 'start') {
        await startClass()
        await Promise.all([unmuteVideoCallback(), unmuteAudioCallback()])
      }
      if (type === 'stop') {
        await stopClass()
        await Promise.all([muteVideoCallback(), muteAudioCallback()])
      }
    }
  }

  const classStatusText = useMemo(() => {
    const {classState, duration} = liveClassStatus

    const stateMap = {
      'default': () => `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`,
      'pre-class': () => `${transI18n('nav.to_start_in')}${formatCountDown(duration, TimeFormatType.Timeboard)}`,
      'in-class': () => `${transI18n('nav.started_elapse')}${formatCountDown(duration, TimeFormatType.Timeboard)}`,
      'end-class': ()=> `${transI18n('nav.ended_elapse')}${formatCountDown(duration, TimeFormatType.Timeboard)}`
    }

    if (stateMap[classState]) {
      return stateMap[classState]()
    }

    return stateMap['default']()
  }, [JSON.stringify(liveClassStatus), formatCountDown])

  const userType = useMemo(() => {
    if (roomInfo.userRole === EduRoleTypeEnum.teacher) {
      return 'teacher'
    }
    return 'student'
  }, [roomInfo.userRole])

  return (
    <BizHeader
      userType={userType}
      isNative={isNative}
      classStatusText={classStatusText}
      classState={liveClassStatus.classState as BizClassStatus}
      isRecording={isRecording}
      title={roomInfo.roomName}
      signalQuality={networkQuality as any}
      monitor={{
        cpuUsage: cpuUsage,
        networkLatency: networkLatency,
        networkQuality: networkQuality,
        packetLostRate: packetLostRate,
        rxPacketLossRate: rxPacketLossRate,
        txPacketLossRate: txPacketLossRate,
        rxNetworkQuality: rxNetworkQuality,
        txNetworkQuality: txNetworkQuality,
      }}
      onClick={handleClick}
    />
  )
})