import { Meta } from '@storybook/react';
import React, { FC } from 'react';
import { ActionTypes, Roster, RosterProps } from '~components/roster';
import { list } from '~utilities';

const meta: Meta = {
  title: 'Components/Roster',
  component: Roster,
  args: {
    onClick: (action: ActionTypes, uid: string | number) =>
    console.log(action, uid),
    teacherName: 'Lily Chou',
    role: 'teacher',
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

export const Docs: FC<RosterProps> = (props) => {
  return (
    <Roster {...props} />
  )
};

export default meta;
