import React, { useEffect, useRef } from 'react'
import { IMediaRenderer } from '@/sdk/education/core/media-service/renderer'

interface RendererPlayerProps {
  preview?: boolean
  track?: IMediaRenderer
  id?: string
  className?: string
  fitMode?: boolean
}

export const RendererPlayer = (props: RendererPlayerProps) => {

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref.current && props.track) {
      props.track.play && props.track.play(ref.current, props.fitMode)
    }
    return () => props.track && props.track.stop && props.track.stop(props.preview)
  }, [ref, props.track, props.fitMode, props.preview])


  return (
    <div key={props.track && props.track.videoTrack ? props.track.videoTrack.getTrackId() : ''} id={props.id ? props.id : ''} className={props.className} ref={ref}>
    </div>
  )
}