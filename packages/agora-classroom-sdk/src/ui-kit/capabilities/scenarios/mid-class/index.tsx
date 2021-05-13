import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useRoomContext, useGlobalContext, useChatContext } from 'agora-edu-core'
import {NavigationBar} from '~capabilities/containers/nav'
import {ScreenSharePlayerContainer} from '~capabilities/containers/screen-share-player'
import {WhiteboardContainer} from '~capabilities/containers/board'
import {DialogContainer} from '~capabilities/containers/dialog'
import {LoadingContainer} from '~capabilities/containers/loading'
import {VideoMarqueeStudentContainer, VideoPlayerTeacher} from '~capabilities/containers/video-player'
import {HandsUpContainer} from '~capabilities/containers/hands-up'
import {RoomChat} from '@/ui-kit/capabilities/containers/room-chat'
import {AgoraChatWidget} from 'agora-widget-gallery'
import './style.css'
import { useEffectOnce } from '@/infra/hooks/utils'
import React from 'react'
import { Widget } from '~capabilities/containers/widget'
import { ChatMin } from '@/ui-kit/components/chat/chat-min'

const chatWidget = new AgoraChatWidget()

export const MidClassScenario = observer(() => {
  const {joinRoom} = useRoomContext()

  const {
    isFullScreen,
  } = useGlobalContext()

  const { chatCollapse }  = useChatContext()

  useEffectOnce(() => {
    joinRoom()
  })

  const cls = classnames({
    'edu-room': 1,
    'fullscreen': !!isFullScreen
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
      <Layout className="bg-white">
        <Content className="column">
          <VideoMarqueeStudentContainer />
          <div className="board-box">
            <ScreenSharePlayerContainer />
            <WhiteboardContainer />
          </div>
          <div
            className={classnames({
              'pin-right': 1
            })}
            style={{display:'flex'}}
          >
            <HandsUpContainer />
            {(isFullScreen && chatCollapse) ? <ChatMin style={{marginLeft: 10}} onClick={() => {}} /> : null}
            
          </div>
        </Content>
        <Aside className={classnames({
          "mid-class-aside": 1,
          "mid-class-aside-full-not-collapse": (isFullScreen && !chatCollapse),
          "mid-class-aside-full-collapse": (isFullScreen && chatCollapse)
        })}>
          <div className={isFullScreen ? 'full-video-wrap' : 'video-wrap'}>
            <VideoPlayerTeacher className="mid-class-teacher"/>
          </div>
          <Widget className="chat-panel" widgetComponent={chatWidget}/>
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer />
    </Layout>
  )
})