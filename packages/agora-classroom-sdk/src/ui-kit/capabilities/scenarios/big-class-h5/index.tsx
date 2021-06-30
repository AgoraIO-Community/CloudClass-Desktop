import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useRoomContext, useGlobalContext, useChatContext, useWidgetContext, useAppPluginContext } from 'agora-edu-core'
import { NavigationBar } from '~capabilities/containers/nav'
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player'
import { WhiteboardContainer } from '~capabilities/containers/board'
import { DialogContainer } from '~capabilities/containers/dialog'
import { LoadingContainer } from '~capabilities/containers/loading'
import { VideoMarqueeStudentContainer, VideoPlayerTeacher } from '~capabilities/containers/video-player'
import { HandsUpContainer } from '~capabilities/containers/hands-up'
import { RoomChat } from '~capabilities/containers/room-chat'
import { useEffectOnce } from '@/infra/hooks/utils'
import React, { useLayoutEffect, useState } from 'react'
import { Widget } from '~capabilities/containers/widget'
import { ToastContainer } from "~capabilities/containers/toast"
import { useUIStore } from '@/infra/hooks'
import AgoraRTC from 'agora-rtc-sdk-ng'
import {transI18n} from '~ui-kit'


export const BigClassH5Scenario = observer(() => {

  const { joinRoom, roomProperties, isJoiningRoom } = useRoomContext()
  const [showBoard, setShowBoard] = useState<boolean>(false)
  const [paly, setPaly] = useState<boolean>(true)

  useEffectOnce(()=>{
    AgoraRTC.onAutoplayFailed = ()=>{
      setPaly(false)
    }
  })

  const {
    isFullScreen,
  } = useGlobalContext()

  const {
    widgets
  } = useWidgetContext()
  const chatWidget = widgets['chat']

  useEffectOnce(() => {
    joinRoom()
  })

  const cls = classnames({
    'edu-room': 1,
    'fullscreen': !!isFullScreen
  })

  const switchImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFqADAAQAAAABAAAAFgAAAAAcITNaAAAEOUlEQVQ4EdWVa2gcVRTH72tm9um2aZNgyTsbUxqwmoghVXTbhNp+SCm2PrCgYEVFEaoVrCg0CqJFKKFQpdAIoqKCtZYUWtAl20DapmlNSdmYVq15tCHJpvtINsnO7Nx7vWd11gRTxY8emJ37OOd3z73nf2cR+r8ZhoTb2tpINBrFg4OIzs3FiG0X5sb/bTOMxaTXWyjWrUO8rq5OKo7IxwA0GNxqDF0fedy27XH5Hw1iIBYYwHLADDKdZJavqmTNoZ+uDXcdOxHugUmMiUTojwQwxqq91NT6uV09uq35wdpg+SHFCCtW0vFisH2a4X5NY8VfH//hfCKemg09VF95ffjGxKX+oZunIxemsEC2WmkpXIEJkm6OJHnnjReeBIZizSowBziDM+WE6tAxNGptaLq7YOe2lv3QV1llu7ov7d713GunFyxpY8LycMENIrWs3+/y1IIvMIAFbTAGhTK06dy2KMWi59zlqad2bMlNDkR/Prn92X29Ljdd2Hxv4QIUKDehfiKRCPnxFwN5PO4MjBlS4MVFz68AkwRRceLUmQnOuXmsM/zdXdXlG09+eqCVm27iVB0qD08oFBKEmX+pAACLbAlY15mdTpvJdw907N39ynuf7//gyNtNjev3tb3+TOXH3551l5Q8ln+gr2NqmHaWAY/bUjMDMZpXBjivrtxYCyprP/zF0ysqQhWBspaqVRWhtap9T03Djsaha7+1CyEWwOd2pnaZuTk+8T7wAJ5bzdmBpunco6M08rvnedbE2jz13IolC2uqy14Md/d9os5/EGMkQX7KsC0EtSzLZZlc39zcWP7IpqY9lhZv7+wcjy8BwwLpeUPU+O/MVtUmRPfVFCJccEKIcabn4tXDR77pV4eayUtPwaWwKUHM7fV5Zrc0b3CZHHtTqbEkg2tpYiozGTO2KdSw9bOy4mTx6qJ5Xafi5ZmkHh0cLoIFA15/GjE6Ji2azhdNaUkKD8E69630+6rBT6NcU7cRM7jrybmY9dXx7w8+sb1l79qayl3g4NjDD9yXa6pjynIFrQ+aM6AIZ96RnctlmM4YyI7BB2T0Cp199a2Dp/a8+eEFKaSGkbplcI5YakiQO1KjXV/ChYJMAQpycyCqjS4PR/J9Z5yBPvv7e9OThnWDZmRKaFTXldjBgWe5LgjOHQX0hW0QyBBgjkEfxp2+884BQB7LfTbTLGao0pdOj3T19V688lEsMRN2zt8BWBYnk9NTnqJVK5rvr697qTjYst4n5Ygzv+wbPoWg6fN9Ax2g09tpGMZh/mzvQAf4Q1wu42WparCh4XltLP5rQca2y5R8V0pJCMZC5OUGgVCJP8dVYRIuxkZLC6r/ruPFi7S2ruFHjyZmkBYfVfq8pTOuIUQXu+TbqhxZF5VzerZgBuL+MWOIgvNXN4kq0au/rIUlXzCHCneBMbcMBEoFQFWM+B3Eq4eXsEDw4QAAAABJRU5ErkJggg=="

  return (
    <Layout
      className={cls}
      direction="row"
      style={{
        height: '100vh',
        width: '100vw'
      }}
    >
      <div className="white-board-box" ></div>
      <Aside className="big-class-aside aside-no-offset">
        <div className='video-wrap-h5'>
          <VideoPlayerTeacher className="big-class-teacher" style={{ zIndex: showBoard ? 0 : 2 }} />
          <WhiteboardContainer h5share >
            <ScreenSharePlayerContainer />
          </WhiteboardContainer>
          <img src={switchImage} alt="" className="switch-btn" onClick={() => { setShowBoard(!showBoard) }} />
        </div>
        <Widget className="chat-panel chat-border" widgetComponent={chatWidget} />
      </Aside>
      <DialogContainer />
      <LoadingContainer loading={isJoiningRoom} />
      <ToastContainer />
      <div className='video-auto-play-tip' onClick={() => { setPaly(true) }} style={{ display: paly ? 'none' : 'block' }} >
        <span>{transI18n('toast.media_auto_play_tip')}</span>
      </div>
    </Layout>
  )
})