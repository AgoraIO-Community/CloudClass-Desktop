import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { ActionTypes, Roster, RosterProps } from '~components/roster';

const meta: Meta = {
  title: 'Components/Roster - 花名册',
  component: Roster,
  args: {
    onClick: (action: ActionTypes, uid: string | number) =>
      console.log(action, uid),
    teacherName: 'Lily Chou',
    dataSource: [
      {
        uid: 1,
        name: 'Lily True',
        onPodium: false,
        whiteboardGranted: true,
        cameraEnabled: false,
        micEnabled: true,
        stars: 2,
        canTriggerAction: true,
      },
      {
        uid: 2,
        name: 'Jay',
        onPodium: false,
        whiteboardGranted: false,
        cameraEnabled: true,
        micEnabled: false,
        stars: 0,
      },
    ],
  },
};

export const Docs: FC<RosterProps> = (props) => <Roster {...props} />;

export default meta;
