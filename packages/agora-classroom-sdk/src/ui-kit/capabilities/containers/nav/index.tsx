//import { observer } from 'mobx-react'
//import { BizHeader } from '~ui-kit'
// import { useRoomContext, useMediaContext, useRecordingContext } from 'agora-edu-sdk'
import { useRecordingContext, useGlobalContext, useRoomContext, useMediaContext } from 'agora-edu-sdk'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import { useMemo } from 'react'
import { BizHeader, transI18n } from '~ui-kit'
import { Exit, Record } from '../dialog'
import { SettingContainer } from '../setting'
import duration from 'dayjs/plugin/duration'


enum TimeFormatType {
  Timeboard,
  Message
}

const formatCountDown = (time: number, mode: TimeFormatType): string => {
    let seconds = Math.floor(time / 1000)
    let duration = dayjs.duration(time);
    let formatItems:string[] = []

    let hours_text = duration.hours() === 0 ? '' : `HH [${transI18n('nav.hours')}]`;
    let mins_text = duration.minutes() === 0 ? '' : `mm [${transI18n('nav.minutes')}]`;
    let seconds_text = duration.seconds() === 0 ? '' : `ss [${transI18n('nav.seconds')}]`;
    let short_hours_text = `HH [${transI18n('nav.short.hours')}]`;
    let short_mins_text = `mm [${transI18n('nav.short.minutes')}]`;
    let short_seconds_text = `ss [${transI18n('nav.short.seconds')}]`;
    if(mode === TimeFormatType.Timeboard) {
      // always display all time segment
      if(seconds < 60 * 60) {
        // less than a min
        formatItems = [short_mins_text, short_seconds_text]
      } else {
        formatItems = [short_hours_text, short_mins_text, short_seconds_text]
      }
    } else {
      // do not display time segment if it's 0
      if(seconds < 60) {
        // less than a min
        formatItems = [seconds_text]
      } else if (seconds < 60 * 60) {
        [mins_text, seconds_text].forEach(item => item && formatItems.push(item))
      } else {
        [hours_text, mins_text, seconds_text].forEach(item => item && formatItems.push(item))
      }
    }
    return duration.format(formatItems.join(' '))
}

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