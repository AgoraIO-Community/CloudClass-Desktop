import React, { useState } from 'react'
import { Aside, Content, Layout, Card, Loading } from 'agora-scenario-ui-kit'
import { WhiteboardContainer } from '../common-containers/board'
import { NavigationBar } from '../common-containers/nav'
import { VideoPlayerTeacher, VideoPlayerStudent } from '../common-containers/video-player'
import { RoomChat } from '../common-containers/chat'
import './1v1.style.css'

export const OneToOne = () => {

  return (
    <Layout
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
          <VideoPlayerTeacher/>
          <VideoPlayerStudent/>
          <RoomChat />
        </Aside>
      </Layout>
      <Card width={90} height={90} className="card-loading-position">
        <Loading></Loading>
      </Card>
    </Layout>
  )
}