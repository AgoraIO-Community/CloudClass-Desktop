import React, { useReducer, useState } from 'react'
import {observer} from 'mobx-react'
import styles from './style.module.scss'
import { StudentVideo, TeacherVideo } from './containers/video'
import { ChatView } from './containers/chat'
import { Nav } from './containers/nav'
import { BoardView } from './containers/board'

export const AcadsocOneToOne = () => {
  return (
    <div className={styles.container}>
      <Nav />
      <div className={styles.flexBox}>
        <div className={styles.leftContainer}>
          <BoardView />
        </div>
        <div className={styles.rightContainer}>
          <TeacherVideo />
          <StudentVideo />
          <ChatView />
        </div>
      </div>
    </div>
  )
}