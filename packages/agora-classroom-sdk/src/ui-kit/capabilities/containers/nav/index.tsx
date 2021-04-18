import { useGlobalContext, useMediaContext, useRecordingContext, useRoomContext } from 'agora-edu-core'
import { observer } from 'mobx-react'
import { useMemo } from 'react'
import { BizHeader, transI18n } from '~ui-kit'
import { Exit, Record } from '../dialog'
import { SettingContainer } from '../setting'

export const NavigationBar = observer(() => {
  const {
    isRecording
  } = useRecordingContext()
  const {
    roomInfo,
    isCourseStart,
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

  const bizHeaderDialogs = {
    'setting': () => addDialog(SettingContainer),
    'exit': () => addDialog(Exit),
    'record': () => addDialog(Record, {starting: isRecording}),
  }

  function handleClick (type: string) {
    const showDialog = bizHeaderDialogs[type]
    showDialog && showDialog(type)
  }

  const classStatusText = useMemo(() => {
    const {classState, duration} = liveClassStatus

    const stateMap = {
      'default': () => `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`,
      'beforeStart': () => `${transI18n('nav.to_start_in')}${formatCountDown(duration, TimeFormatType.Timeboard)}`,
      'StartOrEnd': () => `${transI18n('nav.started_elapse')}${formatCountDown(duration, TimeFormatType.Timeboard)}`,
    }

    if (stateMap[classState]) {
      return stateMap[classState]()
    }

    return stateMap['default']()
  }, [JSON.stringify(liveClassStatus), formatCountDown])

  return (
    <BizHeader
      isNative={isNative}
      classStatusText={classStatusText}
      isStarted={isCourseStart}
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