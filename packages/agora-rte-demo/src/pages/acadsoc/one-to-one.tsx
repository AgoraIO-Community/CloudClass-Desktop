import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import styles from './style.module.scss'
import { StudentVideo, TeacherVideo } from './containers/video'
import { ChatView } from './containers/chat'
import { Nav } from './containers/nav'
import { BoardView } from './containers/board'
import { useAcadsocRoomStore, useAppStore, useUIStore, useBoardStore } from '@/hooks'
import { useHistory } from 'react-router-dom'
import { Loading } from '@/components/loading'
import { AutoplayToast } from '@/components/autoplay-toast'
import {Trophy} from './containers/trophy/trophy'
import { Setting } from '@/pages/acadsoc/containers/setting';
import { MinimizeTeacher, MinimizeStudent, MinimizeChat} from './containers/minimize/minimize'
import 'animate.css'

export const AcadsocOneToOne = observer(() => {

  const history = useHistory()
  const appStore = useAppStore()
  const uiStore = useUIStore()
  const acadsocStore = useAcadsocRoomStore()
  const boardStore = useBoardStore()

  useEffect(() => {
    if (appStore.userRole < 0) {
      uiStore.unblock()
      history.push('/')
      return
    }
    acadsocStore.join()
    // TODO: only for ui debug
    // acadsocStore.joinRoom()
  }, [])

  return (
    <div className={styles.container}>
      <>
        {uiStore.loading ? <Loading /> : null}
        <AutoplayToast />
      </>
      <Nav />
      <div className={!boardStore.isFullScreen ? styles.flexBox : styles.fullScreen}>
        <div className={styles.mainContainer}>
          <BoardView />
          <div className={styles.rightContainer}>
            {
              acadsocStore.showTrophyAnimation ? 
              <Trophy></Trophy>
              : null
            }
            {
              acadsocStore.minimizeView.filter(e => !e.isHidden).map((e:any) => (
                e.type === 'teacher' ?
                // <div className={e.animation} key={e.id}>
                  <TeacherVideo key={e.id}/>
                // </div>
                :e.type === 'student' ?
                // <div className={e.animation} key={e.id}>
                  <StudentVideo key={e.id}/>
                // </div>
                :e.type === 'chat' ?
                // <div className={e.animation} key={e.id}>
                  <ChatView key={e.id}/>
                // </div>
                : null
              ))
            }
            {
              acadsocStore.unwind.length !== 0 ?
              <div className={styles.minimizeContainer}>
                {
                  acadsocStore.unwind.map((e:any) => (
                    e.type === 'teacher' ?
                    // <div className={e.animationMinimize} key={e.id}>
                      <MinimizeTeacher key={e.id}></MinimizeTeacher> 
                    // </div>
                    :e.type === 'student' ?
                    // <div className={e.animationMinimize} key={e.id}>
                      <MinimizeStudent key={e.id}></MinimizeStudent>
                    // </div>
                    :e.type === 'chat' ?
                    // <div className={e.animationMinimize} key={e.id}>
                      <MinimizeChat key={e.id} unread={3}></MinimizeChat>
                    // </div>
                    : null
                  ))
                }
              </div> : null  
            }
          </div>
        </div>
      </div>
      <Setting />
    </div>
  )
})