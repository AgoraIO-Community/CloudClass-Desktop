import React, { useEffect, useState, useRef } from 'react'
import { observer } from 'mobx-react'
import styles from './style.module.scss'
import { useRoomStore, useSceneStore } from '@/hooks'
import { debounce } from '@/utils/utils';

export const MinimizeTeacher = observer(() => {

  const roomStore = useRoomStore()
  const sceneStore = useSceneStore()

  const bindUnwind = (type:string) => {
    let t: any = roomStore.minimizeView.find((item) => item.type === type )
    t.isHidden = false
    let i = roomStore.unwind.findIndex((item: any) => item.type === type )
    roomStore.unwind.splice(i, 1)
    if(roomStore.unwind.length === 0) {
      roomStore.isBespread = true
    }
  }

  return (
    <div className={styles.teacherContainer}>
      <div className={styles.teacherContainer}>
        <div className={styles.mainIcon}></div>
        <span className={styles.name}>{sceneStore.teacherStream.account}</span>
        <div className={styles.packupBackground} onClick={() => {
          debounce(bindUnwind('teacher'), 500)
        }}>
          <div className={styles.packupIcon}></div>
        </div>
      </div>
    </div>
  )
})

export const MinimizeStudent = observer(() => {

  const roomStore = useRoomStore()
  const sceneStore = useSceneStore()

  const studentViewRef = useRef<any>()

  useEffect(() => {
    roomStore.trophyFlyout.endPosition = {
      x: studentViewRef.current?.getBoundingClientRect().left + 120,
      y: studentViewRef.current?.getBoundingClientRect().top 
    }
  }, [roomStore.windowWidth, roomStore.windowHeight, roomStore.trophyFlyout.minimizeTrigger])

  const bindUnwind = (type:string) => {
    let t: any = roomStore.minimizeView.find((item) => item.type === type )
    t.isHidden = false
    let i = roomStore.unwind.findIndex((item: any) => item.type === type )
    roomStore.unwind.splice(i, 1)
    if(roomStore.unwind.length === 0) {
      roomStore.isBespread = true
    }
  }

  return (
    <div className={styles.studentContainer} ref={studentViewRef}>
      <div className={styles.teacherContainer}>
        <div className={styles.mainIcon}></div>
        <span className={styles.name}>{sceneStore.studentStreams[0].account}</span>
        <div className={styles.packupBackground} onClick={() => {
          debounce(bindUnwind('student'), 500)
        }}>
          <div className={styles.packupIcon}></div>
        </div>
      </div>
    </div>
  )
})

export interface ChatProps {
  unread: number | string
}

export const MinimizeChat = observer((props: ChatProps) => {

  const roomStore = useRoomStore()

  const bindUnwind = (type:string) => {
    let t: any = roomStore.minimizeView.find((item) => item.type === type )
    t.isHidden = false
    roomStore.resetUnreadMessageCount()
    let i = roomStore.unwind.findIndex((item: any) => item.type === type )
    roomStore.unwind.splice(i, 1)
    if(roomStore.unwind.length === 0) {
      roomStore.isBespread = true
    }
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.teacherContainer}>
        <div className={styles.mainIcon}></div>
          <span className={styles.name}>{roomStore.minimizeView[2].content}</span>
        {
          roomStore.unreadMessageCount > 0 ?
          <div className={styles.unreadContainer}>
            <span className={styles.count}>{props.unread}</span>
          </div>
          : null
        }
        <div className={styles.packupBackground} onClick={() => {
          debounce(bindUnwind('chat'), 500)
        }}>
          <div className={styles.packupIcon}></div>
        </div>
      </div>
    </div>
  )
})