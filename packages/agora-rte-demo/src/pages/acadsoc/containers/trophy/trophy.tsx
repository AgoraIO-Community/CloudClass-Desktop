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
      if (!audioRef.current) return
      audioRef.current.play().then(() => {
        setTimeout(() => {
          if(audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
        }, 1500)
      })
    }
  }, [acadsocStore.showTrophyAnimation, audioRef.current])

  const animationStyle = useMemo(() => {
    let display = 'none'
    if(trophyState !== 'none') {
      display = 'block'
    } 
    if (trophyState !== 'move') {
      return {
        left: acadsocStore.trophyFlyout.startPosition.x + 'px',
        top: acadsocStore.trophyFlyout.startPosition.y + 'px',
        display,
      }
    } else {
      return {
        left: acadsocStore.trophyFlyout.endPosition.x + 'px',
        top: acadsocStore.trophyFlyout.endPosition.y + 'px',
        display,
        animation: 'trophyContainer 5s ease infinite'
      }
    }
  }, [trophyState, JSON.stringify(acadsocStore.trophyFlyout.startPosition), JSON.stringify(acadsocStore.trophyFlyout.endPosition)])

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
            src="https://webdemo.agora.io/effect_trophy.mp3"
            ref={audioRef}
            style={{"width":"1px","height":"1px","display":"none"}} 
        >
        </audio>
      </div>
    </div>
  )
})