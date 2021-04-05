import classnames from 'classnames'
import React from 'react'
import { BizHeader } from '~components/biz-header'
import { Layout } from '~components/layout'

export const OneToOnePage = () => {
  const cls = classnames({
    'edu-room': 1,
  })

  const className = '1'

  // const className = store.isFullScreen ? 'fullscreen' : 'normal'

  const fullscreenCls = classnames({
    [`layout-aside-${className}`]: 1,
  })

  const handleClick = (itemType: string) => {
    
  }

  return (
    <Layout
      className={cls}
      direction="col"
      style={{
        height: '100vh'
      }}
    >
      <BizHeader
        isRecording={false}
        classStatusText={""}
        isStarted={false}
        title={"test"}
        signalQuality={'excellent'}
        monitor={{cpuUsage:0, networkLatency: 0, networkQuality:'excellent', packetLostRate:0}}
        onClick={handleClick}
      />
    </Layout>
  )
}