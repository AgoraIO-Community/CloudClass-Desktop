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

  return (
    <Layout
      className={cls}
      direction="col"
      style={{
        height: '100vh'
      }}
    >
      <BizHeader
        classStatusText={}
        isStarted={}
        title={}
        signalQuality={}
        monitor={}
        onClick={handleClick}
      />
    </Layout>
  )
}