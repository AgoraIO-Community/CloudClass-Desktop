import React, { FC, useState } from 'react';
import { Meta } from '@storybook/react';
import { Icon } from '~components/icon'
import { Toolbar, ToolbarProps, Colors, ToolItem, Pens, CloudDisk, ToolCabinet, UserList } from '~components/toolbar';
import { clone } from 'lodash';
import { list } from '~utilities';

const meta: Meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
};

export const Docs: FC<ToolbarProps> = (props) => {
  const [activeColor, updateColor]= useState<string>('#7ed321')
  const [pen, updatePen]= useState<string>('pen')

  const [activeMap, updateMap] = useState<Record<string, boolean>>({})

  const handleClick = React.useCallback(async (type: string) => {
    const bool = activeMap[type]
    updateMap({
      ...activeMap,
      [`${type}`]: !bool
    })
  }, [activeMap, updateMap])
  const tools: ToolItem[] = [
    {
      value: 'selection',
      label: '选择',
      icon: 'select',
    },
    {
      value: 'pen',
      label: '铅笔',
      icon: 'pen',
      component: () => {
        return (
          <Pens
            value="pen"
            label="铅笔"
            icon="pen"
            activePen={pen}
            onClick={(color) => updatePen(color)}
          />
        )
        },
    },
    {
      value: 'text',
      label: '文本',
      icon: 'text',
    },
    {
      value: 'eraser',
      label: '橡皮',
      icon: 'eraser',
    },
    {
      value: 'color',
      label: '颜色',
      icon: 'color',
      component: () => {
        return (
          <Colors
            value='color'
            label='颜色'
            icon='color'
            activeColor={activeColor}
            onClick={(color) => updateColor(color)}
          />
        )
      },
    },
    {
      value: 'blank-page',
      label: '新增空白页',
      icon: 'blank-page',
    },
    {
      value: 'hand',
      label: '举手',
      icon: 'hand',
    },
    {
      value: 'cloud',
      label: '云盘',
      icon: 'cloud',
      component: () => {
        return (
          <CloudDisk
            value="cloud"
            label="云盘"
            icon="cloud"
          />
        )
      }
    },
    {
      value: 'follow',
      label: '视角跟随',
      icon: 'follow',
    },
    {
      value: 'tools',
      label: '工具箱',
      icon: 'tools',
      component: () => {
        return (
          <ToolCabinet
            value='tools'
            label='工具箱'
            icon='tools'
            cabinetList={[
              {
                id: 'screenShare',
                icon: <Icon type="tools"/>,
                name: '屏幕共享'
              },
              {
                id: 'laserPoint',
                icon: <Icon type="tools"/>,
                name: '激光笔'
              },
            ]}
          />
        )
      }
    },
    {
      value: 'register',
      label: '用户列表',
      icon: 'register',
      component: () => {
        return (
          <UserList
            value='register'
            label='用户列表'
            icon='register' 
            teacherName="Peter"
            dataSource={list(10).map((i: number) => ({
              uid: i,
              name: 'Lily True',
              onPodium: false,
              whiteboardGranted: true,
              cameraEnabled: false,
              micEnabled: true,
              stars: 2,
            }))}
          />
        )
      }
    }
  ];
  return <Toolbar {...props} onClick={handleClick} activeMap={activeMap} tools={tools}></Toolbar>;
};

export default meta;
