import React, { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { useAcadsocRoomStore } from '@/hooks'
import { StudentVideo, TeacherVideo } from '../video'
import { ChatView } from '../chat'
import { MinimizeTeacher, MinimizeStudent, MinimizeChat} from '../minimize/minimize'
import styles from './style.module.scss'


export const RightContainer = observer(() => {
  const acadsocStore = useAcadsocRoomStore()
  const rightContainerRef = useRef<any>()
  const [resizeTrigger, setResizeTrigger] = useState<number>(0)

  useEffect(() => {
    const onResize = () => {
      setResizeTrigger(resizeTrigger+1)
      console.log('window resize')
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [window, resizeTrigger])

  const rightContainerHeight = useMemo(() => {
    return rightContainerRef.current? rightContainerRef.current.clientHeight : 0
  }, [rightContainerRef, rightContainerRef.current, resizeTrigger])

  const viewTopMap = useMemo(() => {
    let top = 10
    let topMap = {}
    let views = acadsocStore.minimizeView.filter(e => !e.isHidden)
    for(let i = 0; i < views.length; i++) {
      let view = views[i]
      topMap[view.id] = top
      top = top + view.height + 10   
    }
    return topMap
  }, [acadsocStore, acadsocStore.minimizeView, acadsocStore.minimizeView.filter(e => !e.isHidden).length])

  const unwindTopMap = useMemo(() => {
    let top = rightContainerHeight - 50
    let topMap = {}
    for(let i = acadsocStore.unwind.length - 1; i >= 0; i--) {
      let one = acadsocStore.unwind[i]
      topMap[one.id] = top
      top = top - 50
    }
    return topMap
  }, [acadsocStore, acadsocStore.unwind, acadsocStore.unwind.length, rightContainerHeight])

  const chatHeight = useMemo(() => {
    let chatView = acadsocStore.minimizeView.find(e => e.type === 'chat') as any
    let chatTop = viewTopMap[chatView.id]
    let count = acadsocStore.unwind.length
    let chatBottomMargin
    if (count === 0) {
      chatBottomMargin = 0
    } else if (count === 1) {
      chatBottomMargin = 100
    } else {
      chatBottomMargin = 150
    }

    return rightContainerHeight - chatTop - chatBottomMargin
  }, [viewTopMap, acadsocStore.minimizeView, acadsocStore.unwind.length, rightContainerHeight])

  return (
    <div className={styles.rightContainer} ref={rightContainerRef}>
      {
        acadsocStore.minimizeView.map((e:any) => (
          <div 
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
                  <MinimizeChat unread={acadsocStore.unreadMessageCount>99?'99+':acadsocStore.unreadMessageCount}></MinimizeChat>
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