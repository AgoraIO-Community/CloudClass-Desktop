import React, { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { useRoomStore } from '@/hooks'
import { StudentVideo, TeacherVideo } from '../video'
import { ChatView } from '../chat'
import { MinimizeTeacher, MinimizeStudent, MinimizeChat} from '../minimize/minimize'
import styles from './style.module.scss'


export const RightContainer = observer(() => {
  const roomStore = useRoomStore()
  const rightContainerRef = useRef<any>()

  const [rightContainerHeight, setRightContainerHeight] = useState<number>(0)

  // 监听窗口变化
  useEffect(() => {
    const onResize = () => {
      let t = rightContainerRef.current ? rightContainerRef.current.clientHeight : 0
      setRightContainerHeight(t)
      roomStore.windowWidth = window.innerWidth
      roomStore.windowHeight = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    onResize()
    // 初始化窗口宽高
    roomStore.windowWidth = window.innerWidth
    roomStore.windowHeight = window.innerHeight
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    const event = () => {
      roomStore.trophyFlyout.minimizeTrigger = !roomStore.trophyFlyout.minimizeTrigger
    }
    rightContainerRef.current?.addEventListener('transitionend', event)
    return () => {
      rightContainerRef.current.removeEventListener('transitionend', event)
    }
  }, [])

  useEffect(() => {
    roomStore.trophyFlyout.startPosition = {
      x: roomStore.windowWidth / 2,
      y: roomStore.windowHeight / 2
    }
  }, [roomStore.windowWidth, roomStore.windowHeight])

  const viewTopMap = useMemo(() => {
    let top = 10
    let topMap = {}
    let views = roomStore.minimizeView.filter(e => !e.isHidden)
    for(let i = 0; i < views.length; i++) {
      let view = views[i]
      topMap[view.id] = top
      top = top + view.height + 10   
    }
    return topMap
  }, [JSON.stringify(roomStore.minimizeView)])

  const unwindTopMap = useMemo(() => {
    let top = rightContainerHeight - 50
    let topMap = {}
    for(let i = roomStore.unwind.length - 1; i >= 0; i--) {
      let one = roomStore.unwind[i]
      topMap[one.id] = top
      top = top - 50
    }
    return topMap
  }, [roomStore, roomStore.unwind, roomStore.unwind.length, rightContainerHeight])

  const chatHeight = useMemo(() => {
    let chatView = roomStore.minimizeView.find(e => e.type === 'chat') as any
    let chatTop = viewTopMap[chatView.id]
    let count = roomStore.unwind.length
    let chatBottomMargin
    if (count === 0) {
      chatBottomMargin = 0
    } else if (count === 1) {
      chatBottomMargin = 100
    } else {
      chatBottomMargin = 150
    }

    return rightContainerHeight - chatTop - chatBottomMargin
  }, [viewTopMap, roomStore.minimizeView, roomStore.unwind.length, rightContainerHeight])

  return (
    <div className={styles.container} ref={rightContainerRef}>
      {
        roomStore.minimizeView.map((e:any) => (
          <div 
           // TODO: need refactor
            className={e.isHidden? styles.animationMinimize : styles.animation} 
            key={e.id} 
            style={
              e.isHidden?
                {top: unwindTopMap[e.id]+'px'}
              : {
                  top: viewTopMap[e.id]+'px', 
                  height: e.type === 'chat'? chatHeight+'px' : e.height+'px'
                }
            }
          >
            {
              e.isHidden? 
              (
                e.type === 'teacher' ?
                  <MinimizeTeacher/> 
                : e.type === 'student' ?
                  <MinimizeStudent/>
                : e.type === 'chat'?
                  <MinimizeChat unread={roomStore.unreadMessageCount>99?'99+':roomStore.unreadMessageCount}></MinimizeChat>
                : null
              )
              :
              (
                e.type === 'teacher' ?
                  <TeacherVideo/> 
                : e.type === 'student' ?
                  <StudentVideo/>
                : e.type === 'chat'?
                  <div style={{width: '100%', height: '100%', display: 'flex'}}>
                    <ChatView/>
                  </div>
                : null
              )
            }
          </div>
        ))
      }
    </div>
  )
})