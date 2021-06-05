import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useAppPluginContext, useGlobalContext, useRoomContext, useWidgetContext } from 'agora-edu-core'
import { NavigationBar } from '~capabilities/containers/nav'
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player'
import { WhiteboardContainer } from '~capabilities/containers/board'
import { DialogContainer } from '~capabilities/containers/dialog'
import { LoadingContainer } from '~capabilities/containers/loading'
import { VideoList } from '~capabilities/containers/video-player'
import { useEffectOnce } from '@/infra/hooks/utils'
import { ToastContainer } from "~capabilities/containers/toast"
import { Widget } from '~capabilities/containers/widget'
import { useLayoutEffect } from 'react'


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
    roomProperties,
    isJoiningRoom
  } = useRoomContext()

  const {
    onLaunchAppPlugin,
    onShutdownAppPlugin
  } = useAppPluginContext()


  useLayoutEffect(() => {
    if (roomProperties?.extAppsCommon?.io_agora_countdown?.state === 1) {
      // 开启倒计时
      onLaunchAppPlugin('io.agora.countdown')
    } else if (roomProperties?.extAppsCommon?.io_agora_countdown?.state === 0) {
      // 关闭倒计时
      onShutdownAppPlugin('io.agora.countdown')
    }
  }, [roomProperties])

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
      <Layout className="horizontal">
        <Content>
          <WhiteboardContainer>
            <ScreenSharePlayerContainer />
          </WhiteboardContainer>
        </Content>
        <Aside className={classnames({
          "one-class-aside": 1,
          "one-class-aside-full": isFullScreen,
        })}>
          <VideoList />
          <Widget className="chat-panel chat-border" widgetComponent={chatWidget} />
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer loading={isJoiningRoom}/>
      <ToastContainer />
    </Layout>
  )
})