import { useBoardStore, useUIStore,  } from '@/hooks'
import { Icon, TabPane, Tabs, Toolbar, ZoomController, ZoomItemType } from 'agora-scenario-ui-kit'
import { ToolItem } from 'agora-scenario-ui-kit/lib/components/toolbar/tool'
import { observer } from 'mobx-react'
import React, { useCallback, useRef } from 'react'
import { ColorsContainer } from './colors'
import { CloseConfirm } from './dialog'
import { PensContainer } from './pens'
import { ToolCabinetContainer } from './tool-cabinet'

export const allTools: ToolItem[] = [
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
    component: () => {
      return <ToolCabinetContainer/>
    }
  }
]

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

  const handleToolBarChange = async (type: string) => {
    boardStore.setTool(type)
  }

  const handleZoomControllerChange = async (type: ZoomItemType) => {
    const toolbarMap: Record<ZoomItemType, CallableFunction> = {
      'max': () => {
        boardStore.zoomBoard('fullscreen')
      },
      'min': () => {
        boardStore.zoomBoard('fullscreenExit')
      },
      'zoom-out': () => {
        boardStore.setZoomScale('out')
      },
      'zoom-in': () => {
        boardStore.setZoomScale('in')
      },
      'forward': () => boardStore.changeFooterMenu('next_page'),
      'backward': () => boardStore.changeFooterMenu('prev_page'),
    }
    toolbarMap[type] && toolbarMap[type]()
  }

  return {
    zoomValue: boardStore.zoomValue,
    currentPage: boardStore.currentPage,
    totalPage: boardStore.totalPage,
    courseWareList: [],
    handleToolBarChange,
    handleZoomControllerChange,
    ready: boardStore.ready,
    mountToDOM,
    isFullScreen: boardStore.isFullScreen,
    currentSelector: boardStore.currentSelector,
    tools: boardStore.tools,
  }
}

const TabsContainer = observer(() => {

  const boardStore = useBoardStore()
  const uiStore = useUIStore()
  const resourcesList = boardStore.resourcesList

  const handleChange = (resourceName: string) => {
    boardStore.changeSceneItem(resourceName)
  }

  return (
    <Tabs activeKey={boardStore.activeSceneName} type="editable-card"
      onChange={handleChange}>
      {resourcesList.map((item: any, key: number) => (
        <TabPane
          key={item.resourceName}
          tab={
            <>
              {key === 0 && <Icon type="whiteboard" />}
              {item.file.name}
            </>
          }
          closeIcon={
            <Icon type="close"
              onClick={() => {
                uiStore.addDialog(CloseConfirm, {
                  resourceName: item.resourceName,
                })
              }}
            ></Icon>
          }
          closable={key !== 0}
        >
        </TabPane>
      ))}
    </Tabs>
  )
})

export const WhiteboardContainer = observer(() => {

  const {
    zoomValue,
    currentPage,
    totalPage,
    isFullScreen,
    handleToolBarChange,
    handleZoomControllerChange,
    ready,
    mountToDOM,
    currentSelector,
    tools
  } = useWhiteboardState()

  return (
    <div className="whiteboard">
      {
        ready ? 
        <div id="netless" style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}} ref={mountToDOM} ></div> : null
      }
      <TabsContainer />
      <div className='toolbar-position'>
        <Toolbar active={currentSelector} tools={tools} onClick={handleToolBarChange} className="toolbar-biz" />
      </div>
      <ZoomController
        className='zoom-position'
        zoomValue={zoomValue}
        currentPage={currentPage}
        totalPage={totalPage}
        maximum={!isFullScreen}
        clickHandler={handleZoomControllerChange}
      />
    </div>
  )
})