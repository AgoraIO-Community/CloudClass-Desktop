import { useBoardStore, useRoomStore } from '@/hooks'
import { useEffectOnce } from '@/hooks/utils'
import { Aside, Content, Layout } from 'agora-scenario-ui-kit'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'
import { WhiteboardContainer } from '../common-containers/board'
import { RoomChat } from '../common-containers/chat'
import { DialogContainer } from '../common-containers/dialog'
import { LoadingContainer } from '../common-containers/loading'
import { NavigationBar } from '../common-containers/nav'
import { ScreenSharePlayerContainer } from '../common-containers/screen-share-player'
import { VideoPlayerStudent, VideoPlayerTeacher } from '../common-containers/video-player'
import './1v1.style.css'

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
      <VideoPlayerTeacher />
      <VideoPlayerStudent controlPlacement="left" />
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