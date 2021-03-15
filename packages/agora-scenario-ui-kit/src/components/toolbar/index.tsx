import React, { FC, useState } from 'react';
import { BaseProps } from '~components/interface/base-props';
import './index.css';
import { Icon, IconTypes } from '~components/icon';

export interface IconListType {
  id: string,
  type: IconTypes,
  isCanExtend?: boolean,
}

export interface ToolBarProps extends BaseProps {
  iconList: Array<IconListType>,
  handleClickEvent: (event: IconListType) => void,
  mouseSelectorClose: () => void,
  color?: string,
  palletColor?: string,
}

export interface ToolBarMinimizeProps extends BaseProps {
  mouseSelectorOpen: () => void,
}

export const ToolBarMinimize: FC<ToolBarMinimizeProps> = ({mouseSelectorOpen}) => {
  return (
    <div className='minimize shadow'>
      <div className='control-minimize' onClick={mouseSelectorOpen}>
        
      </div>
    </div>
  )
} 

export const ToolBar: FC<ToolBarProps> = ({
  color,
  iconList,
  palletColor,
  mouseSelectorClose,
  handleClickEvent,
}) => {

  const [selectedElement, setSelectedElement] = useState<string>('')

  const handleEvent = (e: IconListType) => {
    setSelectedElement(e.type)
    handleClickEvent(e)
  }

  const settingIconColor = (e: string) => {
    if(selectedElement === e) {
      // 图标为调色盘时特殊处理
      if(e === 'color') {
        return palletColor
      }
      return '#357BF6'
    }
    return '#7B88A0'
  }
  
  return (
    <>
      <div className='tool-bar' style={{backgroundColor: color}}>
        <div className='mx-auto'>
          <div className='control-unwind' onClick={mouseSelectorClose}>
        
          </div>
        </div>
        <div className='tool-bar-box' style={{marginTop: '10px'}}>
          {
            iconList.map((item: IconListType) =>{
              return (
                <div className='mx-auto' key={item.id} onClick={() => {handleEvent(item)}}>
                  <div>
                    <Icon type={item.type} size={28} className={'mouse-hover pointer'} color={settingIconColor(item.type)}/>
                  </div> 
                  {
                    item.isCanExtend ?
                    <div style={{marginTop: '-38px'}}> 
                      <Icon type={'triangle-down'} size={24} className={'pointer'} color={'#7B88A0'}/>
                    </div> : null
                  }
                </div>
              )
            })
          }
        </div>
      </div>  
    </>
  )
}

