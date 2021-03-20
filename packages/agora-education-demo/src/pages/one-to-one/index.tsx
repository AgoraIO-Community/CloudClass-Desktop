import { useBoardStore, useRoomStore, useUIStore } from '@/hooks'
import { useEffectOnce } from '@/hooks/utils'
import { Aside, Card, Content, Layout, Loading } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { WhiteboardContainer } from '../common-containers/board'
import { RoomChat } from '../common-containers/chat'
import { DialogContainer } from '../common-containers/dialog'
import { LoadingContainer } from '../common-containers/loading'
import { NavigationBar } from '../common-containers/nav'
import { VideoPlayerStudent, VideoPlayerTeacher } from '../common-containers/video-player'
import classnames from 'classnames';
import './1v1.style.css'
import { ScreenSharePlayerContainer } from '../common-containers/screen-share-player'

const use1v1Store = () => {
  const roomStore = useRoomStore()
  const boardStore = useBoardStore()
  useEffectOnce(() => {
    roomStore.join()
  })

  return {
    isFullScreen: boardStore.isFullScreen
  }
}

const VideoList = observer(() => {
  const boardStore = useBoardStore()

  return (
    !boardStore.isFullScreen ?
    <>
      <VideoPlayerTeacher/>
      <VideoPlayerStudent/>
    </> : null
  )
})

export const OneToOne = observer(() => {
  const store = use1v1Store()

  const cls = classnames({
    'edu-room': 1,
  })

  const className = store.isFullScreen ? 'fullscreen' : 'normal'

  const fullscreenCls = classnames({
    [`layout-aside-${className}`]: 1,
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
        <Content>
          <ScreenSharePlayerContainer/>
          <WhiteboardContainer />
        </Content>
        <Aside className={fullscreenCls}>
          <VideoList />
          <RoomChat />
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer />
    </Layout>
  )
})