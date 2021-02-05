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
} from 'agora-aclass-ui-kit'
import {t} from '@/i18n'
import { useBoardStore } from '@/hooks'
import { Progress } from '@/components/progress/progress'

export const BoardView = observer(() => {
  const {ready} = useBoardStore()

  return (
    ready ? <EduWhiteBoard /> : <Progress title={t("whiteboard.loading")}></Progress>
  )
})

export const EduWhiteBoard = observer(() => {
  const boardStore = useBoardStore()
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
      currentPage={1}
      totalPage={100}
      showScale={true}
      scale={100}
      toolY={20}
      toolX={5}
      controlY={10}
      controlX={10}
      showControlScreen={true}
      isFullScreen={true}
      width={'100%'}
      toolbarName={'Tools'}
    >
      <div id="netless" style={{position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}} ref={mountToDOM} ></div>
    </EducationBoard>
    // <Board style={{flex: '1'}} />
  )
})

export const ColorPopover = observer(() => {

  const boardStore = useBoardStore()

  const [currentColor, setCurrentColor] = useState<string>('')

  const onClick = useCallback((color: string) => {
    if (boardStore.boardClient) {
      // TODO: need transform '#ffffff' to {r, g, b}
      // boardStore.changeColor(color as any)
      setCurrentColor(color)
    }
  }, [boardStore.boardClient])

  return (
    <PanelBackground style={{width: 150}}>
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
    <PanelBackground style={{width: 150}}>
      <FileUploader handleUploadFile={handleUploadFile}/>
    </PanelBackground>
  )
}

export const StrokePopover = observer(() => {

  const boardStore = useBoardStore()

  const [currentColor, setCurrentColor] = useState<string>('')

  const onClick = useCallback((color: string) => {
    if (boardStore.boardClient) {
      // TODO: need transform '#ffffff' to {r, g, b}
      const colorSlice = color.split('#')[1].split('')
      const r = `${colorSlice[0]}${colorSlice[1]}`
      const g = `${colorSlice[2]}${colorSlice[3]}`
      const b = `${colorSlice[4]}${colorSlice[5]}`
      
      // boardStore.changeColor({rgb: {r, g, b}})
      setCurrentColor(color)
    }
  }, [boardStore.boardClient])

  const onChange = useCallback((newValue: number) => {
    if (boardStore.boardClient) {
      boardStore.changeStroke(newValue)
    }
  }, [boardStore.boardClient])

  return (
    <PanelBackground style={{width: 150}}>
      <>
        <CustomizeSlider value={20} minWidth={100} style={{padding: '0 10px'}} onChange={onChange}/>
        <ColorPalette
          currentColor={currentColor}
          onClick={onClick}
        />
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

  const onClickPaginator = (type: string) => {
    console.log(`click paginator ${type}`)
  }

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
        boxSizing: 'border-box'
      }}>
        <ControlMenu
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
          onClick={onClickPaginator}
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
          }}
          items={
            toolItems
          }
         onClick={onClickTool} />
         {props.children ? props.children : null}
      </Board>
  )
})