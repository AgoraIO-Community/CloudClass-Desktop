import React, { useState } from 'react'
import { Aside, Content, Layout } from 'agora-scenario-ui-kit'
import { WhiteboardContainer } from '../common-containers/board'
import { NavigationBar } from '../common-containers/nav'
import { VideoPlayerTeacher, VideoPlayerStudent, VideoMarqueeStudentContainer } from '../common-containers/video-player'
import { RoomChat } from '../common-containers/chat'
import { HandsUpContainer } from '../common-containers/hands-up'
import './small.style.css'
import { useRoomStore, useBoardStore } from '@/hooks'
import { useEffectOnce } from '@/hooks/utils'
import { observer } from 'mobx-react'
import { DialogContainer } from '../common-containers/dialog'
import { LoadingContainer } from '../common-containers/loading'
import { ScreenSharePlayerContainer } from '../common-containers/screen-share-player'
import classnames from 'classnames';

const useMidStore = () => {
  const roomStore = useRoomStore()
  const boardStore = useBoardStore()
  useEffectOnce(() => {
    roomStore.join()
  })

  return {
    isFullScreen: boardStore.isFullScreen
  }
}

export const SmallClassRoom = observer(() => {

  const store = useMidStore()

  const cls = classnames({
    'edu-room': 1,
    'fullscreen': !!store.isFullScreen
  })

  return (
    <Layout
      className={cls}
      direction="col"
      style={{
        height: '100vh'
      }}
    >
      <NavigationBar />
      <Layout className="bg-white" style={{ height: '100%' }}>
        <Content className="column">
          <VideoMarqueeStudentContainer />
          <div className="board-box">
            <ScreenSharePlayerContainer />
            <WhiteboardContainer />
          </div>
          <div className="pin-right">
            <HandsUpContainer/>
          </div>
        </Content>
        <Aside>
          <VideoPlayerTeacher/>
          <RoomChat />
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer />
    </Layout>
  )
})