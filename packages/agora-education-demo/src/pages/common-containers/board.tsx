import { Icon, TabPane, Tabs, Toolbar, ZoomController } from 'agora-scenario-ui-kit'
import { range } from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'

const useWhiteboardState = () => {

  // const [state]
}

export const WhiteboardContainer = observer(() => {

  const zoomValue = 20
  const currentPage = 1
  const totalPage = 21

  return (
    <div className="whiteboard" id="netless-board">
      <Tabs type="editable-card">
        <TabPane
          tab={
            <>
              <Icon type="whiteboard" />
              白板
            </>
          }
          closable={false}
        key="0">
        </TabPane>
        {/* {
          range(5).map((i: number) => (
            <TabPane tab="PPT课件制作规范" key={i+1}>
            </TabPane>
          ))
        } */}
      </Tabs>
      <div className='toolbar-position'>
        <Toolbar className="toolbar-biz" />
      </div>
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
})