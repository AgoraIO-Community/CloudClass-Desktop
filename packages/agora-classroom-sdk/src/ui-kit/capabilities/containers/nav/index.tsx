import { observer } from 'mobx-react'
import { BizHeader } from '~ui-kit'
import { BaseContainerProps } from '../../types'
import { NavigationBarUIKitStore } from './store'

export const NavigationBar: React.FC<BaseContainerProps<NavigationBarUIKitStore>> = observer(({store}) => {

  function handleClick (type: string) {
    store.showDialog(type)
  }

  return (
    <BizHeader
      isNative={store.isNative}
      classStatusText={store.classStatusText}
      isStarted={store.isStarted}
      isRecording={store.isRecording}
      title={store.title}
      signalQuality={store.signalQuality}
      monitor={{
        cpuUsage: store.cpuUsage,
        networkLatency: store.networkLatency,
        networkQuality: store.networkQuality,
        packetLostRate: store.packetLostRate,
      }}
      onClick={handleClick}
    />
  )
})