import { Story } from '@storybook/react'
import React, { useState } from 'react'
import { VideoPlayer, Chat, Toolbar } from '~components'
import { BizHeader } from '~components/biz-header'
import { Aside, Content, Layout } from '~components/layout'
import { ZoomController } from '~components/zoom-controller'
import './1v1.style.css'

export default {
  title: 'Scaffold/1v1',
}

const ChatContainer: React.FC<any> = () => {

  const [text, setText] = useState<string>()
  return (
    <Chat
      onCanChattingChange={(evt: any) => {
        console.log('handle chatting ', evt)
      }}
      canChatting={true}
      isHost={true}
      uid={'2'}
      messages={[
        {
          id: 'fjdjjdjd1',
          uid: '1',
          username: 'Lily True',
          timestamp: Date.now(),
          content: '你好',
        },
        {
          id: 'fjdjjdjd2',
          uid: '1',
          username: 'Lily True',
          timestamp: Date.now(),
          content: '有人吗',
        },
        {
          id: 'fjdjjdjd3',
          uid: '1',
          username: 'Lily True',
          timestamp: Date.now(),
          content: '今天讲什么？',
        },
        {
          id: 'fjdjjdjd4',
          uid: '2',
          username: 'Victor Tsoi',
          timestamp: Date.now(),
          content:
            '今天随便讲讲,今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲',
        },
        {
          id: 'fjdjjdjd4',
          uid: '2',
          username: 'Victor Tsoi',
          timestamp: Date.now(),
          content:
            '今天随便讲讲,今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲',
        },
        {
          id: 'fjdjjdjd4',
          uid: '2',
          username: 'Victor Tsoi',
          timestamp: Date.now(),
          content:
            '今天随便讲讲,今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲',
        },
        {
          id: 'fjdjjdjd4',
          uid: '2',
          username: 'Victor Tsoi',
          timestamp: Date.now(),
          content:
            '今天随便讲讲,今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲今天随便讲讲',
        }
      ]}
      chatText={text}
      onText={(val) => setText(val)}
      onSend={() => setText('')}
    />  
  )
}

const BizHeaderContainer: React.FC<any> = () => {
  return (
    <BizHeader
      isStarted={true}
      title="声网云课堂"
      signalQuality='unknown'
      monitor={{
        cpuUsage: 0,
        networkLatency: 10,
        networkQuality: 'good',
        packetLostRate: 0
      }}
      onClick={(itemType: string) => {}}
     />
  )
}

const WhiteboardContainer = () => {

  const zoomValue = 20
  const currentPage = 1
  const totalPage = 21

  return (
    <div className="whiteboard" id="netless-board">
      <div className='toolbar-position'>
        <Toolbar className="toolbar-biz" />
      </div>
      <ZoomController
        className='zoom-position'
        zoomValue={zoomValue}
        currentPage={currentPage}
        totalPage={totalPage}
        clickHandler={e => {
          console.log('user', e.target)
        }}
      />
    </div>
  )
}

export const OneToOne: Story<any> = () => {

  return (
    <Layout
      direction="col"
      style={{
        height: '100vh'
      }}
    >
      <BizHeaderContainer />
      <Layout className="bg-white" style={{ height: '100%' }}>
        <Content>
          <WhiteboardContainer />
        </Content>
        <Aside>
          <VideoPlayer
            username={'Lily True'}
            stars={0}
            uid={1}
            micEnabled={true}
            whiteboardGranted={ true}
            micVolume={0.95}
            onCameraClick={async (uid: any) => {

            }}
            onMicClick={async (uid: any) => {

            }}
            onWhiteboardClick={async (uid: any) => {

            }}
            onSendStar={async (uid: any) => {

            }}
            placeholder={
              <img
                src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
                alt="placeholder"
                style={{
                  display: 'inline-block',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  borderRadius: 4,
                }}
              />
            }
          ></VideoPlayer>
          <VideoPlayer
            username={'Lily True'}
            stars={5}
            uid={1}
            micEnabled={true}
            whiteboardGranted={ true}
            micVolume={0.95}
            onCameraClick={async (uid: any) => {

            }}
            onMicClick={async (uid: any) => {

            }}
            onWhiteboardClick={async (uid: any) => {

            }}
            onSendStar={async (uid: any) => {

            }}
            placeholder={
              <img
                src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
                alt="placeholder"
                style={{
                  display: 'inline-block',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  borderRadius: 4,
                }}
              />
            }
          ></VideoPlayer>
          <ChatContainer />
        </Aside>
      </Layout>
    </Layout>
  )
}

OneToOne.parameters = {
  layout: 'fullscreen'
}