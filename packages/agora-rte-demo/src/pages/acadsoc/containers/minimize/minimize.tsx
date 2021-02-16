import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import 'animate.css'
import styles from './style.module.scss'
import { useAcadsocRoomStore } from '@/hooks'
import { debounce } from '@/utils/utils';

export const MinimizeTeacher = observer(() => {

  const acadsocStore = useAcadsocRoomStore()

  const bindUnwind = (type:string) => {
    let t: any = acadsocStore.minimizeView.find((item) => item.type === type )
    // t.animation = ''
    // t.animationMinimize = 'animate__animated animate__backOutUp'
    // setTimeout(() => {
    //   t.isHidden = false
    //   let i = acadsocStore.unwind.findIndex((item: any) => item.type === type )
    //   acadsocStore.unwind.splice(i, 1)
    // }, 1000)
    t.isHidden = false
    let i = acadsocStore.unwind.findIndex((item: any) => item.type === type )
    acadsocStore.unwind.splice(i, 1)
    if(acadsocStore.unwind.length === 0) {
      acadsocStore.isBespread = true
    }
  }

  return (
    <div className={styles.teacherContainer}>
      <div className={styles.teacherContainer}>
        <div className={styles.mainIcon}></div>
        <span className={styles.name}>{acadsocStore.minimizeView[0].content}</span>
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

  const acadsocStore = useAcadsocRoomStore()

  const bindUnwind = (type:string) => {
    let t: any = acadsocStore.minimizeView.find((item) => item.type === type )
    // t.animation = ''
    // t.animationMinimize = 'animate__animated animate__backOutUp'
    // setTimeout(() => {
    //   t.isHidden = false
    //   let i = acadsocStore.unwind.findIndex((item: any) => item.type === type )
    //   acadsocStore.unwind.splice(i, 1)
    // }, 1000)
    t.isHidden = false
    let i = acadsocStore.unwind.findIndex((item: any) => item.type === type )
    acadsocStore.unwind.splice(i, 1)
    if(acadsocStore.unwind.length === 0) {
      acadsocStore.isBespread = true
    }
  }

  return (
    <div className={styles.studentContainer}>
      <div className={styles.teacherContainer}>
        <div className={styles.mainIcon}></div>
        <span className={styles.name}>{acadsocStore.minimizeView[1].content}</span>
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

  const acadsocStore = useAcadsocRoomStore()

  const bindUnwind = (type:string) => {
    let t: any = acadsocStore.minimizeView.find((item) => item.type === type )
    // t.animation = ''
    // t.animationMinimize = 'animate__animated animate__backOutUp'
    // setTimeout(() => {
    //   t.isHidden = false
    //   let i = acadsocStore.unwind.findIndex((item: any) => item.type === type )
    //   acadsocStore.unwind.splice(i, 1)
    // }, 1000)
    t.isHidden = false
    acadsocStore.resetUnreadMessageCount()
    let i = acadsocStore.unwind.findIndex((item: any) => item.type === type )
    acadsocStore.unwind.splice(i, 1)
    if(acadsocStore.unwind.length === 0) {
      acadsocStore.isBespread = true
    }
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.teacherContainer}>
        <div className={styles.mainIcon}></div>
          <span className={styles.name}>{acadsocStore.minimizeView[2].content}</span>
        {
          acadsocStore.unreadMessageCount > 0 ?
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