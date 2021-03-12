import React, { FC, useEffect, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';
import { Icon } from '~components/icon';

export interface LeftToolBarProps extends BaseProps {
  color?: string,
  palletColor?: string,
  // mouseSelectorOpen?: () => void,
  // mouseSelectorClose?: () => void,
  handleClickEvent: (event: string) => void,
  // minimize?: boolean,  // 控制收起
}

const iconList = ['select', 'pen', 'text', 'eraser', 'color', 'blank-page', 'hand', 'cloud', 'follow', 'tools', 'register']

export const LeftToolBar: FC<LeftToolBarProps> = ({
  color,
  // minimize,
  // mouseSelectorOpen,
  // mouseSelectorClose,
  handleClickEvent,
}) => {

  const [minimize, setMinimize] = useState<boolean>(false)
  const [selectedElement, setSelectedElement] = useState<string>('')


  const mouseSelectorOpen = () => {
    setMinimize(false)
  }

  const mouseSelectorClose = () => {
    setMinimize(true)
  }

  const handleEvent = (e: string) => {
    setSelectedElement(e)
    handleClickEvent(e)
  }

  const settingIconColor = (e: string) => {
    // 图标为调色盘时特殊处理
    if(selectedElement === e) {
      if(e === 'color') {
        return ''
      }
      return '#357BF6'
    }
    return '#7B88A0'
  }
  
  return (
    <>
    {
      minimize ?
      <div className='minimize shadow'>
        <div className='control-minimize' onClick={mouseSelectorOpen}>
          
        </div>
      </div> :
      <div className='tool-bar' style={{backgroundColor: color}}>
        <div className='mx-auto'>
          <div className='control-unwind' onClick={mouseSelectorClose}>
        
          </div>
        </div>
        <div className='tool-bar-box' style={{marginTop: '10px'}}>
          {
            iconList.map((item: string) =>{
              return (
                <div className='mx-auto' key={item}>
                  <div onClick={() => {handleEvent(item)}}>
                    <Icon type={item} size={28} className={'mouse-hover pointer'} color={settingIconColor(item)}/>
                  </div> 
                  {
                    ['color', 'pen', 'tools'].includes(item) ?
                    <div style={{marginTop: '-38px'}} onClick={() => {handleEvent(item)}}> 
                      <Icon type={'triangle-down'} size={24} className={'pointer'} color={'#7B88A0'}/>
                    </div> : null
                  }
                </div>
              )
            })
          }
        </div>
      </div>  
    }
    </>
  )
}

