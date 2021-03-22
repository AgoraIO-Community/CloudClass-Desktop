import { Story } from '@storybook/react'
import React, {useState} from 'react'
import { VideoPlayer, Chat, Toolbar, ToolItem, Pens, Colors } from '~components'
import { BizHeader } from '~components/biz-header'
import { Aside, Content, Layout } from '~components/layout'
import { ZoomController } from '~components/zoom-controller'
import { Button } from '~components/button'
import { Card } from '~components/card'
import { Loading } from '~components/loading'
import './1v1.style.css'

export default {
  title: 'Scaffold/1v1',
}

export const PensContainer = () => {
  const [lineSelector, updateSelector] = useState<string>('pen')
  return (
    <Pens
      value='pen'
      label='画笔'
      icon='pen'
      activePen={lineSelector}
      onClick={(pen: any) => updateSelector(pen)}
    />
  )
}

export const ColorsContainer = () => {
  const [activeColor, setActiveColor] = useState<string>('#000000')
  return (
    <Colors
      value='color'
      label='颜色'
      icon='color'
      activeColor={activeColor}
      onClick={(color) => setActiveColor(color)}
    />
  )
}

const allTools: ToolItem[] = [
  {
    value: 'selection',
    label: '选择',
    icon: 'select',
  },
  {
    value: 'pen',
    label: '画笔',
    icon: 'pen',
    component: () => {
      return <PensContainer />
    }
  },
  {
    value: 'text',
    label: '文本',
    icon: 'text',
  },
  {
    value: 'eraser',
    label: '橡皮',
    icon: 'eraser',
  },
  {
    value: 'color',
    label: '颜色',
    icon: 'color',
    component: () => {
      return <ColorsContainer />
    }
  },
  {
    value: 'blank-page',
    label: '新增空白页',
    icon: 'blank-page',
  },
  {
    value: 'hand',
    label: '手抓工具',
    icon: 'hand',
  },
  {
    value: 'cloud',
    label: '云盘',
    icon: 'cloud',
  },
  {
    value: 'follow',
    label: '视角跟随',
    icon: 'follow',
  },
  {
    value: 'tools',
    label: '工具箱',
    icon: 'tools',
  }
]

const ChatContainer: React.FC<any> = () => {

  const [text, setText] = useState<string>('')
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
        }
      ]}
      chatText={text}
      onText={(val: any) => setText(val)}
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
      onClick={(itemType: string) => { }}
    />
  )
}

const WhiteboardContainer = () => {

  const zoomValue = 20
  const currentPage = 1
  const totalPage = 21

  return (
    <div className="whiteboard" id="netless-board">
      <Button>show loading</Button>
      <div className='toolbar-position'>
        <Toolbar tools={allTools} className="toolbar-biz" />
      </div>
      <Card width={258} height={113} className="card-loading-position">
        <Loading hasLoadingGif={false} loadingText="课件加载中，请稍候…" hasProgress></Loading>
      </Card>
      <Card width={110} height={114} className="card-loading-position">
        <Loading loadingText="加载中..."></Loading>
      </Card>
      <ZoomController
        className='zoom-position'
        zoomValue={zoomValue}
        currentPage={currentPage}
        totalPage={totalPage}
        clickHandler={(e: any) => {
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
            whiteboardGranted={true}
            micVolume={0.95}
            onCameraClick={async (uid: any) => {

            }}
            onMicClick={async (uid: any) => {

            }}
            onOffPodiumClick={async () => {

            }}
            onWhiteboardClick={async (uid: any) => {

            }}
            onSendStar={async (uid: any) => {

            }}
            controlPlacement={'left'}
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
            whiteboardGranted={true}
            micVolume={0.95}
            onCameraClick={async (uid: any) => {

            }}
            onMicClick={async (uid: any) => {

            }}
            onWhiteboardClick={async (uid: any) => {

            }}
            onSendStar={async (uid: any) => {

            }}
            onOffPodiumClick={async () => {

            }}
            controlPlacement={'left'}
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
      <Card width={90} height={90} className="card-loading-position">
        <Loading></Loading>
      </Card>
    </Layout>
  )
}

OneToOne.parameters = {
  layout: 'fullscreen'
}