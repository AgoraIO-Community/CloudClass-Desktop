import { useBoardStore,  } from '@/hooks'
import { Icon, TabPane, Tabs, Toolbar, ZoomController, ZoomItemType, ToolItem } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React, { useCallback, useRef } from 'react'

export type WhiteBoardState = {
  zoomValue: number,
  currentPage: number,
  totalPage: number,

  items: ToolItem[],
  handleToolBarChange: (evt: any) => Promise<any> | any,
  handleZoomControllerChange: (e: any) => Promise<any> | any,
}

const useWhiteboardState = () => {
  const boardStore = useBoardStore()

  const boardRef = useRef<HTMLDivElement | null>(null)

  const mountToDOM = useCallback((dom: any) => {
    if (dom) {
      boardStore.mount(dom)
    } else {
      boardStore.unmount()
    }
  }, [boardRef.current, boardStore])

  const handleToolBarChange = (type: ZoomItemType) => {
    const toolbarMap: Record<ZoomItemType, CallableFunction> = {
      'forward': () => boardStore.changeFooterMenu('next_page'),
      'backward': () => boardStore.changeFooterMenu('prev_page'),
    }
    toolbarMap[type]
  }

  const handleZoomControllerChange = async () => {
      
  }

  return {
    zoomValue: 0,
    currentPage: boardStore.currentPage,
    totalPage: boardStore.totalPage,
    courseWareList: [],
    handleToolBarChange,
    handleZoomControllerChange,
    ready: boardStore.ready,
    mountToDOM,
  }
}

export const WhiteboardContainer = observer(() => {

  const {
    zoomValue,
    currentPage,
    totalPage,
    handleToolBarChange,
    handleZoomControllerChange,
    ready,
    mountToDOM,
  } = useWhiteboardState()

  return (
    <div className="whiteboard">
      {
        ready ? 
        <div id="netless" style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}} ref={mountToDOM} ></div> : null
      }
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
      </Tabs>
      <div className='toolbar-position'>
        <Toolbar className="toolbar-biz" />
      </div>
      <ZoomController
        className='zoom-position'
        zoomValue={zoomValue}
        currentPage={currentPage}
        totalPage={totalPage}
        clickHandler={handleToolBarChange}
      />
    </div>
  )
})