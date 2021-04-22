import { formatCountDown, TimeFormatType } from '@/infra/utils'
import { useGlobalContext, useMediaContext, useRecordingContext, useRoomContext } from 'agora-edu-core'
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
    liveClassStatus
  } = useRoomContext()

  const {
    isNative,
    cpuUsage,
    networkQuality,
    networkLatency,
    packetLostRate
  } = useMediaContext()

  const {
    addDialog
  } = useGlobalContext()

  const addRecordDialog = useCallback(() => {
    return addDialog(Record, {starting: isRecording})
  }, [addDialog, Record, isRecording])

  const bizHeaderDialogs = {
    'setting': () => addDialog(SettingContainer),
    'exit': () => addDialog(Exit),
    'record': () => addRecordDialog(),
  }

  function handleClick (type: string) {
    const showDialog = bizHeaderDialogs[type]
    showDialog && showDialog(type)
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
      }}
      onClick={handleClick}
    />
  )
})