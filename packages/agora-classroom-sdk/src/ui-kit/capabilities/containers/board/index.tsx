import { useBoardStore, useUIStore } from '@/hooks'
import { Icon, TabPane, Tabs, Toolbar, ToolItem, transI18n, ZoomController } from '~ui-kit'
import { observer } from 'mobx-react'
import { ColorsContainer } from '~capabilities/containers/board/colors'
import { CloseConfirm } from '~capabilities/containers/dialog'
import { PensContainer } from '~capabilities/containers/board/pens'
import { ToolCabinetContainer } from '~capabilities/containers/board/tool-cabinet'
import { BaseContainerProps } from '../../types'
import { Resource, WhiteboardUIKitStore } from './store'
import { useCallback } from 'react'
import { ZoomItemType } from '@/ui-kit/components'

export const allTools: ToolItem[] = [
  {
    value: 'selection',
    label: 'scaffold.selector',
    icon: 'select',
  },
  {
    value: 'pen',
    label: 'scaffold.pencil',
    icon: 'pen',
    component: (props: any) => {
      return <PensContainer {...props}/>
    }
  },
  {
    value: 'text',
    label: 'scaffold.text',
    icon: 'text',
  },
  {
    value: 'eraser',
    label: 'scaffold.eraser',
    icon: 'eraser',
  },
  {
    value: 'color',
    label: 'scaffold.color',
    icon: 'color',
    component: (props: any) => {
      return <ColorsContainer {...props}/>
    }
  },
  {
    value: 'blank-page',
    label: 'scaffold.blank_page',
    icon: 'blank-page',
  },
  {
    value: 'hand',
    label: 'scaffold.move',
    icon: 'hand',
  },
  {
    value: 'cloud',
    label: 'scaffold.cloud_storage',
    icon: 'cloud',
    // component: () => {
    //   return <CloudDiskContainer />
    // }
  },
  {
    value: 'tools',
    label: 'scaffold.tools',
    icon: 'tools',
    component: () => {
      return <ToolCabinetContainer/>
    }
  },
  {
    value: 'register',
    label: 'scaffold.user_list',
    icon: 'register',
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

const TabsContainer = observer(() => {

  const boardStore = useBoardStore()
  const uiStore = useUIStore()
  const resourcesList = boardStore.resourcesList

  const handleChange = (resourceUuid: string) => {
    boardStore.changeSceneItem(resourceUuid)
  }
  return (
    <Tabs activeKey={boardStore.activeSceneName} type="editable-card"
      onChange={handleChange}>
      {resourcesList.map((item: Resource, key: number) => (
        <TabPane
          key={item.resourceUuid}
          tab={
            <>
              {key === 0 && <Icon type="whiteboard" />}
              {key === 0 ? transI18n("tool.board_name") : item.file.name}
            </>
          }
          closeIcon={
            <Icon type="close"
              onClick={() => {
                uiStore.addDialog(CloseConfirm, {
                  resourceUuid: item.resourceUuid,
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

export const WhiteboardContainer: React.FC<BaseContainerProps<WhiteboardUIKitStore>> = observer(({store}) => {

  const {
    zoomValue,
    currentPage,
    totalPage,
    isFullScreen,
    ready,
    currentSelector,
    activeMap,
    items: tools,
    showTab,
    showToolBar,
    showZoomControl,
  } = store

  async function handleZoomControllerChange(type: ZoomItemType) {
    await store.handleZoomControllerChange(type)
  }

  const mountToDOM = useCallback((dom: any) => {
    if (dom) {
      store.mount(dom)
    } else {
      store.unmount()
    }
  }, [store])

  function handleToolBarChange() {

  }

  return (
    <div className="whiteboard">
      {
        ready ? 
        <div id="netless" style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}} ref={mountToDOM} ></div> : null
      }
      {showTab ? 
      <TabsContainer /> : null}
      {showToolBar ? <div className='toolbar-position'>
        <Toolbar active={currentSelector} activeMap={activeMap} tools={tools} onClick={handleToolBarChange} className="toolbar-biz" />
      </div> : null}
      {showZoomControl ? <ZoomController
        className='zoom-position'
        zoomValue={zoomValue}
        currentPage={currentPage}
        totalPage={totalPage}
        maximum={!isFullScreen}
        clickHandler={handleZoomControllerChange}
      /> : null}
    </div>
  )
})