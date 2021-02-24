import React, { useEffect, useState, useRef, useMemo} from 'react'
import { observer } from 'mobx-react'
import {useAcadsocRoomStore} from '@/hooks'
import './trophy.scss';

export const Trophy = observer(() => {

  const acadsocStore = useAcadsocRoomStore()
  const [trophyState, setTrophyState] = useState<'none' | 'appear' | 'move'>('none')

  const giftRef = useRef<HTMLDivElement | null>(null)
  const trophyRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null) 

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.play()
    setTimeout(() => {
      if(audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }, 1500)
  }, [audioRef.current])

  useEffect(() => {
    trophyRef.current?.addEventListener('transitionend', () => {
      acadsocStore.showTrophyAnimation = false
      setTrophyState('none')
    })
    giftRef.current?.addEventListener('animationend', () => {
      setTrophyState('move')
      
    })
  }, [])

  useEffect(() => {
    if (acadsocStore.showTrophyAnimation) {
      setTrophyState('appear')
    }
  }, [acadsocStore.showTrophyAnimation])

  const animationStyle = useMemo(() => {
    let display = 'none'
    if(trophyState !== 'none') {
      display = 'block'
    } 
    if (trophyState !== 'move') {
      return {
        left: acadsocStore.trophyFlyoutStart.x + 'px',
        top: acadsocStore.trophyFlyoutStart.y + 'px',
        display,
      }
    } else {
      return {
        left: acadsocStore.trophyFlyoutEnd.x + 'px',
        top: acadsocStore.trophyFlyoutEnd.y + 'px',
        display,
        animation: 'trophyContainer 5s ease infinite'
      }
    }
  }, [trophyState,JSON.stringify(acadsocStore.trophyFlyoutStart), JSON.stringify(acadsocStore.trophyFlyoutEnd)])

  return(
    <div 
      className="trophy-container"
      style={animationStyle}
      ref={trophyRef}
    >
      <section className="gift-animation-container" id="gift_animation_container">
        <div className="gift-animation scalc giftAnimationBig" ref={giftRef}>

        </div>
      </section>
      <div>
        <audio id={"gift_audio"}              
            controls
            src="https://webdemo.agora.io/effect_trophy.wav"
            ref={audioRef}
            style={{"width":"1px","height":"1px","display":"none"}} 
        >
        </audio>
      </div>
    </div>
  )
})