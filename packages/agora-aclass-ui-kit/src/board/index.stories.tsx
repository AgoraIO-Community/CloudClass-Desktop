import { Box } from '@material-ui/core'
import React, { useState } from 'react'
import { action } from '@storybook/addon-actions';
import {Board, ControlMenu, PanelBackground, Tool, FileUploader} from '.'
import { CustomizeSlider } from './panel/slider';
import { ColorPalette } from './panel/palette';
import { IToolItem } from './tool';
import { AClassTheme } from '../theme';
import { CustomMenuItemType, CustomMenuList } from './panel';

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
    <PanelBackground style={{
      width: 225,
      padding: '5px',
      backgroundPosition: 'center'
    }}>
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
    <PanelBackground style={{
      width: 225,
      padding: '5px',
      backgroundPosition: 'center'
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
    popoverType: 'font',
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
  },
  {
    itemName: 'disk',
    toolTip: true,
  },
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
  height: 525,
  toolbarName: 'Tools',
}

const StrokeListPanel = () => {

  const [active, setActive] = useState<any>(CustomMenuItemType.Thin);

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
          active
        }
        onClick={(type: any) => {
          setActive(type)
        }}
      />
    </div>
  )
}

const ArrowListPanel = () => {

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
          active
        }
        onClick={(type: any) => {
          setActive(type)
        }}
      />
    </div>
  )
}