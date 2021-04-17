import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import {NavigationBar} from '~capabilities/containers/nav'
import {ScreenSharePlayerContainer} from '~capabilities/containers/screen-share-player'
import {WhiteboardContainer} from '~capabilities/containers/board'
import {DialogContainer} from '~capabilities/containers/dialog'
import {LoadingContainer} from '~capabilities/containers/loading'
import {VideoList} from '~capabilities/containers/video-player'
import {RoomChat} from '@/ui-kit/capabilities/containers/room-chat'
import './style.css'

export const OneToOneScenario = observer(() => {

  const cls = classnames({
    'edu-room': 1,
  })

  const className = 'normal'

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
          <ScreenSharePlayerContainer />
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