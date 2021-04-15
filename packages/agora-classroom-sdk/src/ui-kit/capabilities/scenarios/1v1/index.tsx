import { Layout } from '~components/layout'
import { observer } from 'mobx-react'

export const OneToOneScenario = observer(() => {



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