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
import './1v1.style.css'

const use1v1Store = () => {

  const roomStore = useRoomStore()

  useEffectOnce(() => {
    roomStore.join()
  })
}

const VideoList = observer(() => {
  const boardStore = useBoardStore()

  return (
    boardStore.isFullScreen ?
    <>
      <VideoPlayerTeacher/>
      <VideoPlayerStudent/>
    </> : null
  )
})

export const OneToOne = () => {

  use1v1Store()

  return (
    <Layout
      className="edu-room"
      direction="col"
      style={{
        height: '100vh'
      }}
    >
      <NavigationBar />
      <Layout className="bg-white" style={{ height: '100%' }}>
        <Content>
          <WhiteboardContainer />
        </Content>
        <Aside>
          <VideoList />
          <RoomChat />
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer />
    </Layout>
  )
}