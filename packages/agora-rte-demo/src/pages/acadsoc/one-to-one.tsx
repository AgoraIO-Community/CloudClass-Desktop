import React, { useEffect } from 'react'
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
import { Setting } from '@/pages/acadsoc/containers/setting';

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
            <TeacherVideo />
            <div style={{marginBottom: '10px'}}></div>
            <StudentVideo />
            <div style={{marginBottom: '10px'}}></div>
            <ChatView />
          </div>
        </div>
      </div>
      <Setting />
    </div>
  )
})