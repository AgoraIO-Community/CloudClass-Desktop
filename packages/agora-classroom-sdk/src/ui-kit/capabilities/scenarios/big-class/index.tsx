import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useRoomContext, useGlobalContext, useChatContext } from 'agora-edu-core'
import { NavigationBar } from '~capabilities/containers/nav'
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player'
import { WhiteboardContainer } from '~capabilities/containers/board'
import { DialogContainer } from '~capabilities/containers/dialog'
import { LoadingContainer } from '~capabilities/containers/loading'
import { VideoMarqueeStudentContainer, VideoPlayerTeacher } from '~capabilities/containers/video-player'
import { HandsUpContainer } from '~capabilities/containers/hands-up'
import { RoomChat } from '@/ui-kit/capabilities/containers/room-chat'
import './style.css'
import { useEffectOnce } from '@/infra/hooks/utils'
import { AgoraChatWidget } from 'agora-widget-gallery'
import React from 'react'
import { Widget } from '~capabilities/containers/widget'

const chatWidget = new AgoraChatWidget()

export const BigClassScenario = observer(() => {

  const { joinRoom } = useRoomContext()

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
              ['pin-right']: 1,
              ['pin-right-full-not-collapse']: (isFullScreen && !chatCollapse),
              ['pin-right-full-collapse']: (isFullScreen && chatCollapse)
            })}
          >
            <HandsUpContainer />
          </div>
        </Content>
        <Aside>
          <div style={{ height: isFullScreen ? 300 : 'auto', opacity: isFullScreen ? 0 : 1, transform: isFullScreen ? 'scale(0.9)' : 'scale(1)', transition: '.5s' }}>
            <VideoPlayerTeacher />
          </div>
          {/* <RoomChat /> */}
          <Widget className="chat-panel" widgetComponent={chatWidget}/>
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer />
    </Layout>
  )
})