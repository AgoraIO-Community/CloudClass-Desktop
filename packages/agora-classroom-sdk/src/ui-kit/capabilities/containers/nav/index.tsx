import { useRecordingContext, useRoomDiagnosisContext, useGlobalContext } from 'agora-edu-sdk'
import { observer } from 'mobx-react'
import { BizHeader } from '~ui-kit'

export const NavigationBar = observer(() => {

  const {
    navigationState
  } = useRoomDiagnosisContext()

  const {
    isRecording
  } = useRecordingContext()

  const {
    dialogEventObserver
  } = useGlobalContext()

  function handleClick (type: string) {
    console.log('dialog type', type)
    // store.showDialog(type)
  }

  return (
    <BizHeader
      isNative={navigationState.isNative}
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