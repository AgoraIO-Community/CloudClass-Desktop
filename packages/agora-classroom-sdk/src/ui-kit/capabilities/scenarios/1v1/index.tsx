import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useGlobalContext, useRoomContext, useWidgetContext } from 'agora-edu-core'
import { NavigationBar } from '~capabilities/containers/nav'
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player'
import { WhiteboardContainer } from '~capabilities/containers/board'
import { DialogContainer } from '~capabilities/containers/dialog'
import { LoadingContainer } from '~capabilities/containers/loading'
import { VideoList } from '~capabilities/containers/video-player'
import './style.css'
import { useEffectOnce } from '@/infra/hooks/utils'
import { Widget } from '~capabilities/containers/widget'


export const OneToOneScenario = observer(() => {

  const {
    isFullScreen,
  } = useGlobalContext()

  const {
    widgets
  } = useWidgetContext()
  const chatWidget = widgets['chat']

  const { 
    joinRoom,
    isJoiningRoom
  } = useRoomContext()

  useEffectOnce(() => {
    joinRoom()
  })

  const cls = classnames({
    'edu-room': 1,
  })

  const className = 'normal'


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
        <Content>
          <ScreenSharePlayerContainer />
          <WhiteboardContainer />
        </Content>
        <Aside className={classnames({
          "one-class-aside": 1,
          "one-class-aside-full": isFullScreen,
        })}>
          <VideoList />
          <Widget className="chat-panel" widgetComponent={chatWidget}/>
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer loading={isJoiningRoom} />
    </Layout>
  )
})