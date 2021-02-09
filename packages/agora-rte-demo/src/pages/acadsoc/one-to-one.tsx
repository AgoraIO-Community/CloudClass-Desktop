import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import styles from './style.module.scss'
import { StudentVideo, TeacherVideo } from './containers/video'
import { ChatView } from './containers/chat'
import { Nav } from './containers/nav'
import { BoardView } from './containers/board'
import { useAcadsocRoomStore, useAppStore, useUIStore } from '@/hooks'
import { useHistory } from 'react-router-dom'
import { Loading } from '@/components/loading'
import { AutoplayToast } from '@/components/autoplay-toast'
import {Trophy} from './containers/trophy/trophy'
import { Setting } from '@/pages/acadsoc/containers/setting';

export const AcadsocOneToOne = observer(() => {

  const history = useHistory()
  const appStore = useAppStore()
  const uiStore = useUIStore()
  const acadsocStore = useAcadsocRoomStore()

  useEffect(() => {
    if (appStore.userRole < 0) {
      uiStore.unblock()
      history.push('/')
      return
    }
    acadsocStore.join()
  }, [])

  const [showTrophy, setShowTrophy] = useState(false)

  return (
    <div className={styles.container}>
      <>
        {uiStore.loading ? <Loading /> : null}
        <AutoplayToast />
      </>
      <Nav />
      <div className={styles.flexBox}>
        <div className={styles.leftContainer}>
          <BoardView />
        </div>
        <div className={styles.rightContainer}>
          <TeacherVideo />
          <StudentVideo />
          {/* <button onClick={() => {
            acadsocStore.sendReward('acds', 2)
            setShowTrophy(true)
            setTimeout(() => {
              setShowTrophy(false)
            }, 2000)
          }}>奖励</button>
          <button onClick={async () => {
            let content = await acadsocStore.getTranslationContent('你好呀 世界')
            console.log('-----', content)
          }}>翻译</button> */}
          {
            showTrophy ? 
            <Trophy></Trophy>
            : null
          }
          <ChatView />
        </div>
      </div>
      <Setting />
    </div>
  )
})