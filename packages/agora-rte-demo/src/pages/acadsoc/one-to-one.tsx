import React, { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import styles from './style.module.scss'
import { Nav } from './containers/nav'
import { BoardView } from './containers/board'
import { useAcadsocRoomStore, useAppStore, useUIStore, useBoardStore } from '@/hooks'
import { useHistory } from 'react-router-dom'
import { Loading } from '@/components/loading'
import { AutoplayToast } from '@/components/autoplay-toast'
import {Trophy} from './containers/trophy/trophy'
import { Setting } from '@/pages/acadsoc/containers/setting';
import { RightContainer } from '@/pages/acadsoc/containers/right-container'
import { reportService } from '@/services/report-service'

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
    acadsocStore.setHistory(history)
    // REPORT
    reportService.startTick('joinRoom', 'end')
    // acadsocStore.join().then(() => {
    //   reportService.reportElapse('joinRoom', 'end', {result: true})
    // }).catch(e => {
    //   reportService.reportElapse('joinRoom', 'end', {result: false, errCode: `${e.message}`})
    //   throw e
    // })
    // TODO: only for ui debug
    acadsocStore.joinRoom()
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
          {
            acadsocStore.showTrophyAnimation ? 
            <Trophy></Trophy>
            : null
          }
          <RightContainer/>
        </div>
      </div>
      <Setting />
    </div>
  )
})