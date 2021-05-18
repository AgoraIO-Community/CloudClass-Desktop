import { useBoardContext, useGlobalContext, useRoomContext, Resource, useScreenShareContext } from 'agora-edu-core'
import { ZoomItemType } from '@/ui-kit/components'
import { EduRoleTypeEnum, EduRoomType } from 'agora-rte-sdk'
import { observer } from 'mobx-react'
import { useCallback, useMemo } from 'react'
import { ColorsContainer } from '~capabilities/containers/board/colors'
import { PensContainer } from '~capabilities/containers/board/pens'
import { ToolCabinetContainer } from '~capabilities/containers/board/tool-cabinet'
import { CloseConfirm, StudentUserListDialog, UserListDialog } from '~capabilities/containers/dialog'
import { CloudDriverContainer } from '~capabilities/containers/board/cloud-driver'
import { Icon, TabPane, Tabs, Toolbar, ToolItem, transI18n, ZoomController } from '~ui-kit'
import { useEffect } from 'react'
import classnames from 'classnames'

export const allTools: ToolItem[] = [
  {
    value: 'selection',
    label: 'scaffold.selector',
    icon: 'select'
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
    icon: 'text'
  },
  {
    value: 'eraser',
    label: 'scaffold.eraser',
    icon: 'eraser'
    
  },
  {
    value: 'color',
    label: 'scaffold.color',
    icon: 'circle',
    component: (props: any) => {
      return <ColorsContainer {...props}/>
    }
  },
  {
    value: 'blank-page',
    label: 'scaffold.blank_page',
    icon: 'blank-page'
  },
  {
    value: 'hand',
    label: 'scaffold.move',
    icon: 'hand'
  },
  {
    value: 'cloud',
    label: 'scaffold.cloud_storage',
    icon: 'cloud'
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
    icon: 'register'
  },
  {
    value: 'student_list',
    label: 'scaffold.student_list',
    icon: 'register'
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

  const {
    resourcesList,
    changeSceneItem,
    activeSceneName,
  } = useBoardContext()

  const {
    addDialog,
  } = useGlobalContext()


  const {
    isScreenSharing
  } = useScreenShareContext()

  const TabPaneIcon = useCallback((name: string, resourceUuid: string, key: number) => {

    const panelCls = classnames({
      [`icon-share-active`]: !!isScreenSharing === true,
      [`icon-share-inactive`]: !!isScreenSharing === false,
    })

    if (key === 0) {
      return (
        <>
          <Icon type="whiteboard" />
          {transI18n("tool.board_name")}
        </>
      )
    }

    if (resourceUuid === 'screenShare') {
      return (
        <>
          <Icon className={panelCls} type="share-screen" />
          {transI18n("tool.screen_share")}
        </>
      )
    }

    return (
      <>
        {name}
      </>
    )
  }, [isScreenSharing])

  return (
    <Tabs activeKey={activeSceneName} type="editable-card"
      onChange={changeSceneItem}>
      {resourcesList.map((item: Resource, key: number) => (
        <TabPane
          key={item.resourceUuid}
          tab={
            TabPaneIcon(item.file.name, item.resourceUuid, key)
          }
          closeIcon={
            <Icon type="close"
              onClick={() => {
                addDialog(CloseConfirm, {
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

export const WhiteboardContainer = observer(() => {

  const {
    isFullScreen,
    addDialog,
    removeDialog
  } = useGlobalContext()

  const {
    roomInfo
  } = useRoomContext()

  const {
    zoomValue,
    currentPage,
    totalPage,
    ready,
    currentSelector,
    activeMap,
    tools,
    hasPermission,
    mountToDOM,
    zoomBoard,
    setZoomScale,
    changeFooterMenu,
    setTool,
    installTools,
    showBoardTool
  } = useBoardContext()

  const handleToolClick = (type: string) => {
    console.log('handleToolClick tool click', type)
    switch(type) {
      case 'cloud': {
        setTool(type)
        addDialog(CloudDriverContainer)
        break
      }
      case 'register': {
        setTool(type)
        addDialog(UserListDialog)
        break
      }
      case 'student_list': {
        setTool(type)
        addDialog(StudentUserListDialog)
        break
      }
      default: {
        setTool(type)
        break
      }
    }
  }

  useEffect(() => {
    installTools(allTools)
  }, [allTools])

  const showTab = roomInfo.userRole === EduRoleTypeEnum.student ? false : true

  const [showToolBar, showZoomControl] = showBoardTool

  // const [showToolBar, showZoomControl] = useMemo(() => {
  //   if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(roomInfo.userRole)) {
  //     return [true, true]
  //   }
  //   if (roomInfo.roomType === EduRoomType.SceneType1v1 && roomInfo.userRole === EduRoleTypeEnum.student) {
  //     return [true, hasPermission]
  //   }

  //   if ([EduRoomType.SceneTypeMiddleClass, EduRoomType.SceneTypeBigClass].includes(roomInfo.roomType) && roomInfo.userRole === EduRoleTypeEnum.student) {
  //     return [true, hasPermission]
  //   }

  //   return [false, false]
  // }, [roomInfo.roomType, hasPermission, roomInfo.userRole, roomInfo.roomType, isShareScreen])

  const handleZoomControllerChange = async (type: ZoomItemType) => {
    const toolbarMap: Record<ZoomItemType, CallableFunction> = {
      'max': () => {
        zoomBoard('fullscreen')
      },
      'min': () => {
        zoomBoard('fullscreenExit')
      },
      'zoom-out': () => {
        setZoomScale('out')
      },
      'zoom-in': () => {
        setZoomScale('in')
      },
      'forward': () => changeFooterMenu('next_page'),
      'backward': () => changeFooterMenu('prev_page'),
    }
    toolbarMap[type] && toolbarMap[type]()
  }

  return (
    <div className="whiteboard">
      {
        ready ? 
        <div id="netless" ref={mountToDOM} ></div> : null
      }
      {showTab ? 
      <TabsContainer /> : null}
      {showToolBar ?
        <Toolbar 
          active={currentSelector} 
          activeMap={activeMap} 
          tools={tools} 
          onClick={handleToolClick} 
          className="toolbar-biz"
          defaultOpened={roomInfo.userRole === EduRoleTypeEnum.student ? false : true} 
        />
      : null}
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