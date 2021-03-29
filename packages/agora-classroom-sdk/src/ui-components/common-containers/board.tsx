import { useBoardStore, useUIStore } from '@/hooks'
import { Icon, t, TabPane, Tabs, Toolbar, ToolItem, useI18nContext, ZoomController, ZoomItemType } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React, { useCallback, useRef } from 'react'
import { useWhiteboardState } from '../hooks'
import { CloudDiskContainer } from './cloud-driver'
import { ColorsContainer } from './colors'
import { CloseConfirm } from './dialog'
import { PensContainer } from './pens'
import { ToolCabinetContainer } from './tool-cabinet'
import { UserListContainer } from './user-list'

export const allTools: ToolItem[] = [
  {
    value: 'selection',
    label: t('scaffold.selector'),
    icon: 'select',
  },
  {
    value: 'pen',
    label: t('scaffold.pencil'),
    icon: 'pen',
    component: () => {
      return <PensContainer />
    }
  },
  {
    value: 'text',
    label: t('scaffold.text'),
    icon: 'text',
  },
  {
    value: 'eraser',
    label: t('scaffold.eraser'),
    icon: 'eraser',
  },
  {
    value: 'color',
    label: t('scaffold.color'),
    icon: 'color',
    component: () => {
      return <ColorsContainer />
    }
  },
  {
    value: 'blank-page',
    label: t('scaffold.blank_page'),
    icon: 'blank-page',
  },
  {
    value: 'hand',
    label: t('scaffold.move'),
    icon: 'hand',
  },
  {
    value: 'cloud',
    label: t('scaffold.cloud_storage'),
    icon: 'cloud',
    component: () => {
      return <CloudDiskContainer />
    }
  },
  {
    value: 'follow',
    label: t('scaffold.follow'),
    icon: 'follow',
  },
  {
    value: 'tools',
    label: t('scaffold.tools'),
    icon: 'tools',
    component: () => {
      return <ToolCabinetContainer/>
    }
  },
  {
    value: 'register',
    label: t('scaffold.user_list'),
    icon: 'register',
    component: () => {
      return <UserListContainer/>
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
    activeMap,
    tools,
    hasBoardPermission,
    showTab,
    showToolBar,
    showZoomControl,
  } = useWhiteboardState()

  return (
    <div className="whiteboard">
      {
        ready ? 
        <div id="netless" style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}} ref={mountToDOM} ></div> : null
      }
      {showTab ? 
      <TabsContainer /> : null}
      {showToolBar ? <div className='toolbar-position'>
        <Toolbar active={currentSelector} activeMap={activeMap} tools={allTools} onClick={handleToolBarChange} className="toolbar-biz" />
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