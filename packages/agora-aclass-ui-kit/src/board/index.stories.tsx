import { Box } from '@material-ui/core'
import React, { useState } from 'react'
import { action } from '@storybook/addon-actions';
import {Board, ControlMenu, PanelBackground, Tool, FileUploader} from '.'
import { CustomizeSlider } from './panel/slider';
import { ColorPalette } from './panel/palette';
import { IToolItem } from './tool';
import { AClassTheme } from '../theme';
import { CustomMenuItemType, CustomMenuList } from './panel';
import { DiskManagerDialog } from '../disk/dialog/manager'

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
    iconTooltipText: 'mouse',
  },
  {
    itemName: 'pencil',
    toolTip: true,
    popoverType: 'stroke',
    iconTooltipText: 'pencil',
  },
  {
    itemName: 'text',
    toolTip: true,
    popoverType: 'font',
    iconTooltipText: 'text',
  },
  {
    itemName: 'rectangle',
    toolTip: true,
    popoverType: 'stroke',
    iconTooltipText: 'mouse',
  },
  {
    itemName: 'elliptic',
    toolTip: true,
    popoverType: 'stroke',
    iconTooltipText: 'elliptic',
  },
  {
    itemName: 'eraser',
    toolTip: true,
    iconTooltipText: 'eraser',
  },
  {
    itemName: 'palette',
    toolTip: true,
    popoverType: 'color',
    iconTooltipText: 'palette',
  },
  {
    itemName: 'new-page',
    toolTip: true,
    iconTooltipText: 'new-page',
  },
  {
    itemName: 'move',
    toolTip: true,
    iconTooltipText: 'move',
  },
  {
    itemName: 'upload',
    toolTip: true,
    popoverType: 'upload',
    iconTooltipText: 'upload',
  },
  {
    itemName: 'clear',
    toolTip: true,
    iconTooltipText: 'clear',
  },
  {
    itemName: 'disk',
    toolTip: true,
    iconTooltipText: 'disk',
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
  const [openDisk, setOpenDisk] = React.useState(false);

  const NetworkDisk = () => {  
    const handleClose = () => {
      console.log('close network disk', openDisk)
      setOpenDisk(false)
    }
  
    const onReload = () => {
      console.log('reload network disk')
    }
  
    const onUpload = () => {
      console.log('upload file')
    }
  
    return (
      <DiskManagerDialog
        fullWidth={false}
        visible={openDisk}
        onClose={handleClose}
        dialogHeaderStyle={{
          minHeight: 40,
        }}
        paperStyle={{
          minWidth: 800,
          minHeight: 587,
          // padding: 20,
          // paddingTop: 0,
          borderRadius: 20,
          overflowY: 'hidden',
        }}
        dialogContentStyle={{
          background: 'transparent',
          borderRadius: 20,
          // display: 'flex',
          // flexDirection: 'column',
          // background: '#DEF4FF',
          // padding: 25
        }}
        questionBtnStyle={{
          top: 16,
          right: 80,
          color: 'white'
        }}
        closeBtnStyle={{
          top: 16,
          right: 18,
          color: 'white'
        }}
      />
    )
  }
  

  const onClickPaginator = (type: string) => {
    action('paginator')
    console.log(`click paginator ${type}`)
  }

  const onClickTool = (type: string) => {
    // disk can't be a popover
    if (type === 'disk') {
      setOpenDisk(true)
      console.log('open disk', openDisk)
    }
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
        <NetworkDisk />
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
      <span style={{lineHeight: '30px', width: '30px', height: '30px', margin: '0 7px'}}>Pen</span>
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