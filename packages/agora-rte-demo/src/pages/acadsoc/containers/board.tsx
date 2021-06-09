import { observer } from 'mobx-react'
import React, { useCallback, useRef, useState } from 'react'
import {
  PanelBackground,
  Board,
  ColorPalette,
  CustomizeSlider,
  ControlMenu,
  Tool,
  FileUploader,
  CustomMenuItemType,
  CustomMenuList,
  DiskManagerDialog,
  IToolItem,
  BrushToast
} from 'agora-aclass-ui-kit'
import {t} from '@/i18n'
import { useBoardStore,useAppStore, useSceneStore } from '@/hooks'
import { Progress } from '@/components/progress/progress'
import { ZoomController } from './zoom-controller'
import { noop } from 'lodash'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { BoardFrontSizeType, BoardStore } from '@/stores/app/board'
import { CourseWareMenuContainer } from './course-ware-menu'
import { NetworkDisk } from './disk'
import { EduRoleTypeEnum } from 'agora-rte-sdk'

const StrokeListPanel = observer(() => {

  const boardStore = useBoardStore()
  const currentStroke = boardStore.currentStroke

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      color: '#fff',
      fontSize: '12px',
    }}>
      <span style={{width: '30px', margin: '0 7px', textShadow: '1px 1px 1px rgb(0 0 0 / 30%)'}}>{t("aclass.board.size")}</span>
      <CustomMenuList
        itemList={[
          CustomMenuItemType.Thin,
          CustomMenuItemType.Small,
          CustomMenuItemType.Normal,
          CustomMenuItemType.Large,
        ]}
        active={
          currentStroke
        }
        onClick={(type: any) => {
          boardStore.changeStroke(type)
        }}
      />
    </div>
  )
})

const ArrowListPanel = observer(() => {

  const boardStore = useBoardStore()

  const currentArrow = boardStore.currentArrow

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      color: '#fff',
      fontSize: '12px',
    }}>
      <span style={{width: '30px', margin: '0 7px', textShadow: '1px 1px 1px rgb(0 0 0 / 30%)'}}>{t("aclass.board.stroke")}</span>
      <CustomMenuList
        itemList={[
          CustomMenuItemType.Pen,
          CustomMenuItemType.Arrow,
          CustomMenuItemType.Mark,
          CustomMenuItemType.Laser,
        ]}
        active={
          currentArrow
        }
        onClick={(type: any) => {
          boardStore.changeArrow(type)
        }}
      />
    </div>
  )
})

export const BoardView = () => {
  return (
    <EduWhiteBoard />
  )
}

export const EduWhiteBoard = observer(() => {
  const boardStore = useBoardStore()
  const ready = boardStore.ready
  const { isLoading, loadingStatus, enableStatus } = boardStore
  const boardRef = useRef<HTMLDivElement | null>(null)
  const mountToDOM = useCallback((dom: any) => {
    if (dom) {
      boardStore.mount(dom)
    } else {
      boardStore.unmount()
    }
  }, [boardRef.current, boardStore])

  return (
    <EducationBoard
      showPaginator={true}
      currentPage={boardStore.currentPage}
      totalPage={boardStore.totalPage}
      showScale={true}
      scale={Math.ceil(boardStore.scale * 100)}
      toolY={20}
      toolX={5}
      controlY={10}
      controlX={10}
      showControlScreen={true}
      isFullScreen={!boardStore.isFullScreen}
      width={'100%'}
      height={'100%'}
      toolbarName={t('tool.toolBarname')}
      prevText={t('tool.prev')}
      nextText={t('tool.next')}
      zoomInText={t('tool.zoomIn')}
      zoomOutText={t('tool.zoomOut')}
      fullScreenText={!boardStore.isFullScreen?t('tool.fullScreen'):t('tool.reduction')}
      moveCameraText={t('tool.reset')}
    >
      {
        loadingStatus ? <Progress
        title={loadingStatus.text}
        showSkip={loadingStatus.type === 'downloading'}
        onSkip={() => {
          boardStore.skipTask()
        }} ></Progress> : null
      }
      {
        ready ? 
        <div id="netless" style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}} ref={mountToDOM} ></div> : null
      }
    </EducationBoard>
  )
})

export interface FontSizeListProps {
  itemList: BoardFrontSizeType[],
  active: BoardFrontSizeType,
  handleClick: (type: BoardFrontSizeType) => any
}

const useFontStyles = makeStyles((theme: Theme) => ({
  root: {
    fontSize: '14px',
    fontFamily: theme.typography.fontFamily,
    display: 'flex',
    // justifyContent: 'flex-start',
    alignItems: 'center',
    background: 'white',
    borderRadius: '6px',
    flexWrap: 'wrap',
  },
  active: {
    color: 'white',
    backgroundColor: '#002591',
    border: '1px solid #002591',
    borderRadius: '5px',
    padding: '2px 7px',
    margin: '2px',
    cursor: 'pointer',
    width: '32px',
  },
  normal: {
    border: '1px solid #002591',
    borderRadius: '5px',
    padding: '2px 7px',
    margin: '2px',
    cursor: 'pointer',
    width: '32px',
  }
}));

const FontSizeListView: React.FC<FontSizeListProps> = (props) => {

  const fontClasses = useFontStyles()

  return (
    <div className={fontClasses.root}>
      {props.itemList.map((item: BoardFrontSizeType, idx: number) => (
        <span key={`${item}${idx}`}
          className={item === props.active ? fontClasses.active : fontClasses.normal}
          onClick={() => {
            props.handleClick(item)
          }}>
          {item}px
        </span>
      ))}
    </div>
  )
}

export const FontSizeList = observer(() => {

  const boardStore = useBoardStore()
  const {currentFontSize} = boardStore

  return (
    <FontSizeListView
      itemList={[
        BoardFrontSizeType.size12,
        BoardFrontSizeType.size14,
        BoardFrontSizeType.size18,
        BoardFrontSizeType.size24,
        BoardFrontSizeType.size26,
        BoardFrontSizeType.size36,
        BoardFrontSizeType.size48,
        BoardFrontSizeType.size72,
      ]}
      active={currentFontSize}
      handleClick={(type: BoardFrontSizeType) => {
        boardStore.changeFontSize(type)
      }}
    />
  )
})


export const FontPopover = observer(() => {

  const boardStore = useBoardStore()

  const {currentColor} = boardStore

  const onClick = useCallback((color: string) => {
    if (boardStore.boardClient) {
      boardStore.changeHexColor(color)
    }
  }, [boardStore.boardClient])

  return (
    <PanelBackground style={{
      width: 210,
      padding: '5px',
    }}>
      <ColorPalette
        currentColor={currentColor}
        onClick={onClick}
      />
      <h2 style={{textAlign: 'center', color: 'white', fontSize: '14px', textShadow: '1px 1px 1px rgb(0 0 0 / 30%)'}}>字体大小</h2>
      <FontSizeList />
    </PanelBackground>
  )
})

export const ColorPopover = observer(() => {

  const boardStore = useBoardStore()

  const {currentColor} = boardStore

  const onClick = useCallback((color: string) => {
    if (boardStore.boardClient) {
      boardStore.changeHexColor(color)
    }
  }, [boardStore.boardClient])

  return (
    <PanelBackground style={{
      width: 210,
      padding: '5px',
    }}>
      <ColorPalette
        currentColor={currentColor}
        onClick={onClick}
      />
    </PanelBackground>
  )
})

export const UploadFilePopover = (props: any) => {

  const handleUploadFile = async (evt: React.SyntheticEvent<HTMLInputElement>, type: string) => {
    if (evt.currentTarget.files) {
      const file = evt.currentTarget.files[0]
      console.log("file ", file, " type ", type)
    }
  }

  return (
    <PanelBackground>
      <FileUploader handleUploadFile={handleUploadFile}/>
    </PanelBackground>
  )
}

export const DrawerPopover = observer(() => {

  const boardStore = useBoardStore()

  const {currentColor} = boardStore

  const onClick = useCallback((color: string) => {
    if (boardStore.boardClient) {
      boardStore.changeHexColor(color)
    }
  }, [boardStore.boardClient])

  return (
    <PanelBackground style={{
      width: 210,
      padding: '5px',
    }}>
      <>
        <StrokeListPanel />
        <div style={{borderBottom: '2px solid #B98D00', margin: '7px 0'}}></div>
        <ColorPalette
          currentColor={currentColor}
          onClick={onClick}
        />
        <div style={{borderBottom: '2px solid #B98D00', margin: '7px 0'}}></div>
        <ArrowListPanel />
        {/* <CustomizeSlider value={20} minWidth={100} style={{padding: '0 10px'}} onChange={onChange}/>
        <ColorPalette
          currentColor={currentColor}
          onClick={onClick}
        /> */}
      </>
    </PanelBackground>
  )
})

export const StrokePopover = observer(() => {

  const boardStore = useBoardStore()

  const {currentColor} = boardStore

  const onClick = useCallback((color: string) => {
    if (boardStore.boardClient) {
      boardStore.changeHexColor(color)
    }
  }, [boardStore.boardClient])

  return (
    <PanelBackground style={{
      width: 210,
      padding: '5px',
    }}>
      <>
        <StrokeListPanel />
        <div style={{borderBottom: '2px solid #B98D00', margin: '7px 0'}}></div>
        <ColorPalette
          currentColor={currentColor}
          onClick={onClick}
        />
      </>
    </PanelBackground>
  )
})

const useEduBoardStyles = makeStyles((theme: Theme) => ({
  boardBoxContainer: {
    position: 'relative',
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  }
}));

const shouldVisibleMenu = (role: EduRoleTypeEnum) => {
  if ([EduRoleTypeEnum.assistant, EduRoleTypeEnum.teacher].includes(role)) {
    return true
  }
  return false
}

export const EducationBoard = observer((props: any) => {
  const boardStore = useBoardStore()
  const sceneStore = useSceneStore()

  // const [openDisk, setOpenDisk] = React.useState(false);

  const showCourseMenuItem = shouldVisibleMenu(sceneStore.roomInfo.userRole)

  const classes = useEduBoardStyles()

  const currentActiveToolItem = boardStore.currentActiveToolItem

  const toolItems = useBoardStore().toolItems

  const onClickTool = useCallback((type: string) => {
    if (!boardStore.boardClient) {
      return
    }
    switch(type) {
      case 'pencil':
      case 'text':
      case 'rectangle':
      case 'eraser': {
        boardStore.setTool(type)
        break;
      }
      case 'palette':  {
        boardStore.setTool('color_picker')
        break;
      }
      case 'mouse': {
        boardStore.setTool('selector')
        break;
      }
      case 'elliptic': {
        boardStore.setTool('ellipse')
        break;
      }
      case 'new-page': {
        boardStore.setTool('add')
        break;
      }
      case 'move': {
        boardStore.setTool('hand_tool')
        break;
      }
      case 'clear': {
        boardStore.clearScene()
        // boardStore.toggleAClassLockBoard()
        break;
      }
      case 'disk': {
        boardStore.setOpenDisk()
        break;
      }
    }
    boardStore.currentActiveToolItem = type
  }, [boardStore.boardClient])

  const appStore = useAppStore()

  const getBoardItemsBy = useCallback((role: EduRoleTypeEnum) => {
    switch (role) {
      case EduRoleTypeEnum.student: {
        const removeItem = ['new-page', 'clear', 'disk']
        return toolItems.filter((item: IToolItem) => !removeItem.includes(item.itemName))
      }
      case EduRoleTypeEnum.invisible:
      case EduRoleTypeEnum.teacher: {
        return toolItems
      }
      case EduRoleTypeEnum.assistant: {
        return toolItems.filter((item: IToolItem) => item.itemName === 'disk')
      }
    }
    return []
  }, [toolItems])

  return (
    <div className={classes.boardBoxContainer}>
      {showCourseMenuItem ? <CourseWareMenuContainer /> : null}
      <Board style={{
        width: "auto",
        height: props.height,
        position: 'relative',
        boxSizing: 'border-box',
        background: 'white',
        marginTop: boardStore.roleIsTeacher ? 49 : boardStore.isFullScreen ? 0 : 10,
        marginBottom: !boardStore.isFullScreen ? (boardStore.aClassHasPermission ? 49 : 10) : 0,
        marginLeft: boardStore.isFullScreen ? 0 : 10
      }} borderless={boardStore.isFullScreen}>
        {boardStore.aClassHasPermission ? <NetworkDisk /> : null }
        {boardStore.aClassHasPermission ? 
        <Tool
          activeItem={currentActiveToolItem}
          drawerComponent={<DrawerPopover />}
          strokeComponent={<StrokePopover />}
          colorComponent={<ColorPopover />}
          uploadComponent={<UploadFilePopover />}
          fontComponent={<FontPopover />}
          headerTitle={props.toolbarName}
          style={{
            top: props.toolY,
            left: props.toolX,
            zIndex: 10,
            position: 'absolute'
          }}
          items={
            getBoardItemsBy(appStore.roomInfo.userRole)
          }
          onClick={onClickTool}
        /> : null}
          {props.children ? props.children : null}
      </Board>
      {boardStore.aClassHasPermission ? 
        <ZoomController
          style={{
            position: 'absolute',
            bottom: boardStore.isFullScreen ? props.controlY + 44 : props.controlY,
            left: props.controlX,
            zIndex: 10,
            fontSize: '18px',
            lineHeight: '20px',
          }}
          prevText={props.prevText}
          nextText={props.nextText}
          zoomInText={props.zoomInText}
          zoomOutText={props.zoomOutText}
          moveCameraText={props.moveCameraText}
          fullScreenText={props.fullScreenText}
          showPaginator={props.showPaginator}
          currentPage={props.currentPage}
          totalPage={props.totalPage}
          showScale={props.showScale}
          scale={props.scale}
          showControlScreen={props.showControlScreen}
          isFullScreen={props.isFullScreen}
          onClick={noop}
          zoomScale={boardStore.scale}
          zoomChange={(scale: number) => {
            console.log(" zoomChange scale ", scale)
            boardStore.updateScale(scale)
          }}
          changeFooterMenu={(type: string) => {
            boardStore.changeFooterMenu(type)
          }}
          onFullScreen={() => {
            boardStore.zoomBoard('fullscreen')
          }}
          onExitFullScreen={() => {
            boardStore.zoomBoard('fullscreenExit')
          }}
          onMoveCamera={() => {
            boardStore.moveCamera()
          }}
        /> : null}
    </div>
  )
})