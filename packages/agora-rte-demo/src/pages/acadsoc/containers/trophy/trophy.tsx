import React, { useEffect, useState, useRef} from 'react'
import { observer } from 'mobx-react'
import {useAcadsocRoomStore} from '@/hooks'
import './trophy.scss';

export const Trophy = observer(() => {

  const acadsocStore = useAcadsocRoomStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.play()
    setTimeout(() => {
      if(audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        acadsocStore.showTrophyAnimation = false
      }
    }, 1500)
  }, [audioRef.current])

  return(
    <div>
      <section className="gift-animation-container" id="gift_animation_container">
        <div className="gift-animation scalc giftAnimationBig">

        </div>
      </section>
      <div>
        <audio id={"gift_audio"}              
            controls
            src="https://agoracategroy.acadsoc.com.cn/uploadFile/video/9808.wav"
            ref={audioRef}
            style={{"width":"1px","height":"1px","display":"none"}} 
        >
        </audio>
      </div>
    </div>
  )
})