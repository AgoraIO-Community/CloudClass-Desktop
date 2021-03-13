import React, {useState} from 'react';
import { Meta } from '@storybook/react';
import { ToolBar } from '~components/toolbar';
import { ToolBarMinimize } from '~components/toolbar';
import { IconListType } from './index'

const meta: Meta = {
  title: 'Components/Toolbar',
  component: ToolBar,
};

const iconList: IconListType[] = [
  {
    id: 'icon-select', 
    type: 'select',
    isCanExtend: false,
  },
  {
    id: 'icon-pen', 
    type: 'pen',
    isCanExtend: true,
  },
  {
    id: 'icon-text', 
    type: 'text',
    isCanExtend: false,
  },
  {
    id: 'icon-eraser', 
    type: 'eraser',
    isCanExtend: false,
  },
  {
    id: 'icon-color', 
    type: 'color',
    isCanExtend: true,
  },
  {
    id: 'icon-blank-page', 
    type: 'blank-page',
    isCanExtend: false,
  },
  {
    id: 'icon-hand', 
    type: 'hand',
    isCanExtend: false,
  },
  {
    id: 'icon-cloud', 
    type: 'cloud',
    isCanExtend: false,
  },
  {
    id: 'icon-follow', 
    type: 'follow',
    isCanExtend: false,
  },
  {
    id: 'icon-tools', 
    type: 'tools',
    isCanExtend: true,
  },
  {
    id: 'icon-register', 
    type: 'register',
    isCanExtend: false,
  },
]

export const Docs = () => {

  const [minimize, setMinimize] = useState<boolean>(false)

  const mouseSelectorOpen = () => {
    setMinimize(false)
  }

  const mouseSelectorClose = () => {
    setMinimize(true)
  }

  const clickEvent = (e: any) => {
    console.log('图标被点击了', e)
  }


  return (
    <>
    {
      minimize ?
      <ToolBarMinimize mouseSelectorOpen={mouseSelectorOpen}></ToolBarMinimize>
      :
      <ToolBar 
        iconList={iconList}
        handleClickEvent={clickEvent} 
        mouseSelectorClose={mouseSelectorClose}
        >
      </ToolBar>
    }
    </>
  )
}

export default meta;

