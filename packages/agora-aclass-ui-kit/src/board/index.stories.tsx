import { Box } from '@material-ui/core'
import React, { useState } from 'react'
import { action } from '@storybook/addon-actions';
import {Board, ControlMenu, PanelBackground, Tool, FileUploader} from '.'
import { CustomizeSlider } from './panel/slider';
import { ColorPalette } from './panel/palette';
import { IToolItem } from './tool';

export default {
  title: '白板'
}


export const ColorPopover = () => {
  const [currentColor, setCurrentColor] = useState<string>('')

  const onClick = (color: string) => {
    setCurrentColor(color)
    console.log('color ', color)
  }

  return (
    <PanelBackground style={{width: 150}}>
      <ColorPalette
        currentColor={currentColor}
        onClick={onClick}
      />
    </PanelBackground>
  )
}

export const StrokePopover = () => {

  const [currentColor, setCurrentColor] = useState<string>('')

  const onClick = (color: string) => {
    setCurrentColor(color)
    console.log('color ', color)
  }

  const onChange = (newValue: number) => {
  }

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
}


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

export const EducationBoard = (props: any) => {

  const onClickPaginator = (type: string) => {
    action('paginator')
    console.log(`click paginator ${type}`)
  }

  const onClickTool = (type: string) => {
    action('tool')
    console.log(`click tool ${type}`)
  }
  
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
          }}
          items={
            toolItems
          }
         onClick={onClickTool} />
      </Board>
  )
}

EducationBoard.args = {
  showPaginator: true,
  currentPage: 1,
  totalPage: 100,
  showScale: true,
  scale: 100,
  toolY: 5,
  toolX: 5,
  controlY: 10,
  controlX: 10,
  showControlScreen: true,
  isFullScreen: true,
  width: 640,
  height: 480,
  toolbarName: 'Tools',
}