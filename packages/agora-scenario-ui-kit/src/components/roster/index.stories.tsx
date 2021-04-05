import { Meta, Story } from '@storybook/react';
import React, { FC, useCallback, useState } from 'react';
import { ActionTypes, Profile, Roster, RosterProps } from '~components/roster';
import { list } from '~utilities';
import { defaultColumns } from './default-columns';

const meta: Meta = {
  title: 'Components/Roster',
  component: Roster,
  args: {
    onClick: (action: ActionTypes, uid: string | number) => console.log(action, uid),
    teacherName: 'Lily Chou',
    role: 'teacher',
    columns: defaultColumns,
    dataSource: list(10).map((i: number) => ({
      uid: i,
      name: 'Lily True',
      onPodium: false,
      whiteboardGranted: true,
      cameraEnabled: false,
      micEnabled: true,
      stars: 2,
      disabled: i === 0 ? false : true,
      micDevice: true,
      cameraDevice: true,
      onlineState: true,
      canCoVideo: true,
      canGrantBoard: true,
    })),
  }
};

export const Docs: Story<RosterProps> = ({dataSource, ...restProps}) => {

  const [list, updateList] = useState<Profile[]>(dataSource!)

  const handleClick = useCallback((action: string, uid: any) => {
    const newList = list.map((item) => (
      item.uid === uid ? {...item, ...handleActionState(item, action)} : {...item}
    ))
    updateList(newList)
  }, [list, updateList])

  const handleActionState = (item: Profile, action: string) => {
    switch (action) {
      case 'podium': {
        item.onPodium = !item.onPodium
        break;
      }
      case 'whiteboard': {
        item.whiteboardGranted = !item.whiteboardGranted
        break;
      }
      case 'camera': {
        item.cameraEnabled = !item.cameraEnabled
        console.log('cameraEnable', item)
        break;
      }
      case 'mic': {
        item.micEnabled = !item.micEnabled
        break;
      }
    }
    return item
  }

  return (
    <Roster dataSource={list} {...restProps} onClick={handleClick} />
  )
};

Docs.parameters = {
  layout: 'fullscreen'
}

export default meta;
