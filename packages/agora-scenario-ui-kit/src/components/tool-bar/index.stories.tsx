import React, {useState} from 'react';
import { Meta } from '@storybook/react';
import { ToolBar } from '~components/tool-bar';

const meta: Meta = {
  title: 'Components/ToolBar',
  component: ToolBar,
};

const iconList = ['select', 'pen', 'text', 'eraser', 'color', 'blank-page', 'hand', 'cloud', 'follow', 'tools', 'register']
const extendList = ['color', 'pen', 'tools']
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

export const Docs = () => (
  <>
    <ToolBar 
      iconList={iconList}
      minimize={minimize}
      handleClickEvent={clickEvent} 
      mouseSelectorClose={mouseSelectorClose}
      mouseSelectorOpen={mouseSelectorOpen}
      extendList={extendList}
      >
    </ToolBar>
  </>
);

export default meta;

