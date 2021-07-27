import React from 'react'
import { useVolumeContext } from 'agora-edu-core'
import { VolumeIndicator } from '~ui-kit/components/video-player/volume-indicator'
import { observer } from 'mobx-react'

export const StreamVolumeIndicator = observer(({streamUuid}: {streamUuid: any}) => {

  const {speakers} = useVolumeContext()

  const speaker = speakers.get(+streamUuid)

  const currentVolume = speaker ?? 0

  return (
    <VolumeIndicator volume={currentVolume} />
  )
})