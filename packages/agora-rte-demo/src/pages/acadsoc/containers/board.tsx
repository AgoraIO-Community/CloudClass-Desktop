import { observer } from 'mobx-react'
import React, { useCallback, useRef, useState } from 'react'
import {
  PanelBackground,
  Board,
  ColorPalette,
  CustomizeSlider,
  IToolItem,
  ControlMenu,
  Tool,
  FileUploader,
  CustomMenuItemType,
  CustomMenuList,
} from 'agora-aclass-ui-kit'
import {t} from '@/i18n'
import { useBoardStore } from '@/hooks'
import { Progress } from '@/components/progress/progress'
import { ZoomController } from './zoom-controller'
import { noop } from 'lodash'

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
      <span style={{lineHeight: '30px', width: '30px', height: '30px', margin: '0 7px'}}>Size</span>
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

  const [active, setActive] = useState<any>(CustomMenuItemType.Pen);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      color: '#fff',
      fontSize: '12px',
    }}>
      <span style={{lineHeight: '30px', width: '30px', height: '30px', margin: '0 7px'}}>Size</span>
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
  const isLoading = boardStore.isLoading
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
      toolbarName={'Tools'}
    >
      {/* {
        isLoading ? <Progress title={t("whiteboard.loading")}></Progress> : null
      } */}
      {
        ready ? 
        <div id="netless" style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}} ref={mountToDOM} ></div> : null
      }
    </EducationBoard>
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
      width: 225,
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

export const StrokePopover = observer(() => {

  const boardStore = useBoardStore()

  const {currentColor} = boardStore

  const onClick = useCallback((color: string) => {
    if (boardStore.boardClient) {
      boardStore.changeHexColor(color)
    }
  }, [boardStore.boardClient])

  // const onChange = useCallback((newValue: number) => {
  //   if (boardStore.boardClient) {
  //     boardStore.changeStroke(newValue)
  //   }
  // }, [boardStore.boardClient])

  return (
    <PanelBackground style={{
      width: 225,
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

const toolItems: IToolItem[] = [
  {
    itemName: 'mouse',
    toolTip: true,
  },
  {
    itemName: 'pencil',
    toolTip: true,
    popoverType: 'stroke',
  },
  {
    itemName: 'text',
    toolTip: true,
    popoverType: 'color',
  },
  {
    itemName: 'rectangle',
    toolTip: true,
    popoverType: 'stroke',
  },
  {
    itemName: 'elliptic',
    toolTip: true,
    popoverType: 'stroke',
  },
  {
    itemName: 'eraser',
    toolTip: true,
  },
  {
    itemName: 'palette',
    toolTip: true,
    popoverType: 'color',
  },
  {
    itemName: 'new-page',
    toolTip: true,
  },
  {
    itemName: 'move',
    toolTip: true,
  },
  {
    itemName: 'upload',
    toolTip: true,
    popoverType: 'upload',
  },
  {
    itemName: 'clear',
    toolTip: true,
  }
]

export const EducationBoard = observer((props: any) => {
  const boardStore = useBoardStore()

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
    }
  }, [boardStore.boardClient])
  
  return (
    <Board style={{
      width: props.width,
      height: props.height,
      position: 'relative',
      boxSizing: 'border-box',
      background: 'white'
    }}>
      <ZoomController
        style={{
          position: 'absolute',
          bottom: props.controlY,
          right: props.controlX,
          zIndex: 10,
        }}
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
      />
      <Tool
        strokeComponent={<StrokePopover />}
        colorComponent={<ColorPopover />}
        uploadComponent={<UploadFilePopover />}
        headerTitle={props.toolbarName}
        style={{
          top: props.toolY,
          left: props.toolX,
          zIndex: 10,
          position: 'absolute'
        }}
        items={
          toolItems
        }
        onClick={onClickTool} />
        {props.children ? props.children : null}
    </Board>
  )
})