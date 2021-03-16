import React from 'react'
import { Icon, IconTypes, Button, Modal } from '~components'
import { BizHeader } from '~components/biz-header'
import { SignalContent } from '~components/biz-header/signal-content'
import { Aside, Content, Header, Layout } from '~components/layout'
import { Popover } from '~components/popover'

export default {
  title: 'Scaffold/1v1',
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
      onClick={(itemType: string) => {
        console.log('item Type', itemType)
      }}
     />
  )
}

export const OneToOne = () => {
  return (
    <Layout
      direction="col"
      className="bg-green-300"
      style={{
        height: '100vh'
      }}
    >
      <BizHeaderContainer />
      <Layout className="bg-green-500" style={{ height: '100%' }}>
        <Content className="bg-green-600 min-h-0">
          
        </Content>
        <Aside className="bg-green-700"></Aside>
      </Layout>
    </Layout>
  )
}