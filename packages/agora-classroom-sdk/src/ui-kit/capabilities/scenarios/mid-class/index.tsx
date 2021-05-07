import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useRoomContext, useGlobalContext } from 'agora-edu-core'
import {NavigationBar} from '~capabilities/containers/nav'
import {ScreenSharePlayerContainer} from '~capabilities/containers/screen-share-player'
import {WhiteboardContainer} from '~capabilities/containers/board'
import {DialogContainer} from '~capabilities/containers/dialog'
import {LoadingContainer} from '~capabilities/containers/loading'
import {VideoMarqueeStudentContainer, VideoPlayerTeacher} from '~capabilities/containers/video-player'
import {HandsUpContainer} from '~capabilities/containers/hands-up'
import {RoomChat} from '@/ui-kit/capabilities/containers/room-chat'
//@ts-ignore
import {AgoraChatWidget} from 'agora-widget-gallery'
import './style.css'
import { useEffectOnce } from '@/infra/hooks/utils'
import { Widget } from '../../containers/widget'

const chatWidget = new AgoraChatWidget()

export const MidClassScenario = observer(() => {
  const {joinRoom} = useRoomContext()

  const {
    isFullScreen,
  } = useGlobalContext()

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
          <div style={{height: isFullScreen ? 300 : 'auto', opacity: isFullScreen ? 0 : 1, transform: isFullScreen ? 'scale(0.9)' : 'scale(1)', transition: '.5s'}}>
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