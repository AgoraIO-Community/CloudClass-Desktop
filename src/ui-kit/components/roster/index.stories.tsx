import React from 'react';
import { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { Roster, RosterProps } from './';

const meta: Meta = {
  title: 'Components/Roster',
  component: Roster,
  args: {
    teacherName: 'Lily Chou',
    role: 'teacher', // teacher和student的icon不同
    localUserUuid: 'webzzz2',
    // dataSource: JSON.parse('[{"uid":"webzzz2","name":"webzzz","onPodium":false,"onlineState":true,"micDevice":false,"cameraDevice":false,"cameraEnabled":true,"micEnabled":false,"whiteboardGranted":false,"canGrantBoard":false,"stars":0},{"name":"maczzz","uid":"maczzz2","onlineState":true,"onPodium":false,"micDevice":false,"cameraDevice":false,"cameraEnabled":false,"micEnabled":false,"whiteboardGranted":false,"canCoVideo":false,"canGrantBoard":false,"stars":34},{"name":"winzzz","uid":"winzzz2","onlineState":true,"onPodium":true,"micDevice":false,"cameraDevice":false,"cameraEnabled":true,"micEnabled":false,"whiteboardGranted":false,"canCoVideo":false,"canGrantBoard":false,"stars":3},{"name":"winz1zz","uid":"win1zzz2","onlineState":true,"onPodium":true,"micDevice":false,"cameraDevice":false,"cameraEnabled":true,"micEnabled":false,"whiteboardGranted":false,"canCoVideo":false,"canGrantBoard":false,"stars":3}]')
    dataSource: '.'
      .repeat(11)
      .split('.')
      .map((_: any, i: number) => ({
        uid: i,
        name: 'Lily True',
        onPodium: i < 5 ? true : false,
        whiteboardGranted: true,
        cameraEnabled: false,
        micEnabled: true,
        cameraDevice: 1,
        micDevice: 1,
        stars: 2,
        disabled: i === 0 ? false : true,
        online: true,
        canCoVideo: true,
        canGrantBoard: true,
        chatEnabled: true,
        userType: 'student',
        hasStream: i < 5 ? true : false,
        isLocal: i === 0 ? true : false,
      })),
  },
};

export const Docs: Story<RosterProps> = ({ ...restProps }) => {
  const [carouselState, setCarouselState] = useState<any>({
    modeValue: 1,
    randomValue: 1,
    times: 10,
  });

  return (
    <Roster
      {...restProps}
    />
  );
};

Docs.parameters = {
  layout: 'fullscreen',
};

export default meta;
