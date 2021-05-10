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

export const MidClassScenario = observer(() => {

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
        {isFullScreen ? <RoomChat /> : (
          <Aside className="mid-class-aside">
            <div className={isFullScreen ? 'full-video-wrap' : 'video-wrap'}>
              <VideoPlayerTeacher className="mid-class-teacher"/>
            </div>
            <RoomChat/>
          </Aside>
        )}
      </Layout>
      <DialogContainer />
      <LoadingContainer />
    </Layout>
  )
})