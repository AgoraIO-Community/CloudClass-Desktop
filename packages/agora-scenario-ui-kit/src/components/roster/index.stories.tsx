import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { ActionTypes, Roster, RosterProps } from '~components/roster';
import { list } from '~utilities';

const meta: Meta = {
  title: 'Components/Roster',
  component: Roster,
  args: {
    onClick: (action: ActionTypes, uid: string | number) =>
    console.log(action, uid),
    teacherName: 'Lily Chou',
    dataSource: list(10).map((i: number) => ({
      uid: i,
      name: 'Lily True',
      onPodium: false,
      whiteboardGranted: true,
      cameraEnabled: false,
      micEnabled: true,
      stars: 2,
      canTriggerAction: true,
    })),
  }
};

export const Docs: FC<RosterProps> = (props) => <Roster {...props} />;

export default meta;
