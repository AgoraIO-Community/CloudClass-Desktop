import React from 'react';
import {CustomIcon} from '@/components/icon';
import { Tooltip, ClickAwayListener } from '@material-ui/core';
import {UploadBtn} from './upload/upload-btn'
import {ExtensionCard} from '../extension-card'
import { observer } from 'mobx-react';
import { useBoardStore, useSceneStore } from '@/hooks';
import { BoardStore } from '@/stores/app/board';
import { SketchPicker } from 'react-color';
import { get } from 'lodash';
import { useLocation } from 'react-router-dom';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

const ToolItem = (props: any) => {
  const onClick = (evt: any) => {
    props.onClick(props.name);
  }
  return (
    <Tooltip title={props.text} placement="right">
      <span>
      <CustomIcon data={props.name}
        onClick={onClick} className={`items ${props.name} ${props.active ? 'active' : ''}`} />
      </span>
    </Tooltip>
  )
}

export const Tools = observer(() => {

  const location = useLocation()

  const isMiddleClass = location.pathname.match(/middle-class/) ? true : false

  const items: any[] = BoardStore.items

  const boardStore = useBoardStore()

  const sceneStore = useSceneStore()

  const handleClickOutSide = () => {
    switch(boardStore.selector) {
      case 'upload': {
        boardStore.setTool('')
        break;
      }
      case 'color_picker': {
        boardStore.setTool('pencil')
        break;
      }
      case 'text': {
        boardStore.setTool('')
        break;
      }
      case 'extension_tool': {
        boardStore.hideExtension()
        break;
      }
    }
  }

  return (
    <ClickAwayListener onClickAway={handleClickOutSide}>
      <div className="tools">
          <div className="board-tools-menu">
            {items
              .filter((it: any) => {
                if (get(sceneStore, 'roomInfo.userRole', EduRoleTypeEnum.student) === EduRoleTypeEnum.student) {
                  if (['add', 'upload', 'hand_tool', 'extension_tool'].indexOf(it.name) !== -1) return false
                }
                if (it.name === 'extension_tool' && !isMiddleClass) {
                  return false
                }
                return true
              })
              .map((item: any, key: number) => (
              <ToolItem
                key={key}
                text={item.text}
                name={item.name}
                onClick={(name: string) => {
                  boardStore.setTool(name)
                }}
                active={boardStore.selector === item.name}
              >
              </ToolItem>
            ))}
          </div>
        {boardStore.showColorPicker ? 
          <SketchPicker
            color={boardStore.strokeColor}
            onChangeComplete={(color: any) => {
              boardStore.changeColor(color)
            }}
          />
        : null
        }  
        {boardStore.showUpload ?
          <UploadBtn />
          : null
        }
        {boardStore.showExtension ?
          <ExtensionCard />
          : null
        }
      </div>
    </ClickAwayListener>

  )
})