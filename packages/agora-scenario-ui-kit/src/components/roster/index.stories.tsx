import { Meta, Story } from '@storybook/react';
import React, { FC, useCallback, useMemo, useState } from 'react';
import {
  ActionTypes,
  Profile,
  Roster,
  RosterProps,
  StudentRosterProps,
  StudentRoster,
} from '~components/roster';
import { defaultColumns } from './default-columns';

const meta: Meta = {
  title: 'Components/Roster',
  component: Roster,
  args: {
    onClick: (action: ActionTypes, uid: string | number) =>
      console.log(action, uid),
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

export const Docs: Story<RosterProps> = ({ dataSource, ...restProps }) => {
  const [list, updateList] = useState<Profile[]>(dataSource!);

  const handleClick = useCallback(
    (action: string, uid: any) => {
      const newList = list.map((item) =>
        item.uid === uid
          ? { ...item, ...handleActionState(item, action) }
          : { ...item },
      );
      updateList(newList);
    },
    [list, updateList],
  );

  const handleActionState = (item: Profile, action: string) => {
    switch (action) {
      case 'podium': {
        item.onPodium = !item.onPodium;
        break;
      }
      case 'whiteboard': {
        item.whiteboardGranted = !item.whiteboardGranted;
        break;
      }
      case 'camera': {
        item.cameraEnabled = !item.cameraEnabled;
        // item.cameraDevice = (item.cameraDevice + 1) % 3
        break;
      }
      case 'mic': {
        item.micEnabled = !item.micEnabled;
        // item.micDevice = (item.micDevice + 1) % 3
        break;
      }
      case 'chat': {
        item.chatEnabled = !item.chatEnabled;
        break;
      }
    }
    return item;
  };

  const [carouselState, setCarouselState] = useState<any>({
    modeValue: 1,
    randomValue: 1,
    times: 10,
  });

  return (
    <Roster
      userType="student"
      dataSource={list}
      columns={defaultColumns}
      {...restProps}
      carousel
      carouselProps={{
        modeValue: carouselState.modeValue,
        changeModeValue: (value: any) => {
          setCarouselState({
            ...carouselState,
            modeValue: value,
          });
        },
        randomValue: carouselState.randomValue,
        changeRandomValue: (value: any) => {
          setCarouselState({
            ...carouselState,
            randomValue: value,
          });
        },
        times: carouselState.times,
        changeTimes: (value: any) => {
          setCarouselState({
            ...carouselState,
            times: value,
          });
        },
        startCarousel() {
          console.log('sendCarousel');
        },
        stopCarousel() {
          console.log('stopCarousel');
        },
      }}
      onClick={handleClick}
    />
  );
};

Docs.parameters = {
  layout: 'fullscreen',
};

export const DocsUserList: Story<StudentRosterProps> = ({
  dataSource,
  ...restProps
}) => {
  const [list, updateList] = useState<Profile[]>(dataSource!);

  const handleClick = useCallback(
    (action: string, uid: any) => {
      const newList = list.map((item) =>
        item.uid === uid
          ? { ...item, ...handleActionState(item, action) }
          : { ...item },
      );
      updateList(newList);
    },
    [list, updateList],
  );

  const handleActionState = (item: Profile, action: string) => {
    switch (action) {
      case 'camera': {
        item.cameraEnabled = !item.cameraEnabled;
        break;
      }
      case 'mic': {
        item.micEnabled = !item.micEnabled;
        break;
      }
    }
    return item;
  };

  const [keyword, setKeyword] = useState<string>('');

  const dataList = useMemo(() => {
    return list.filter((item: any) => item.name.includes(keyword));
  }, [keyword, list]);

  const handleChange = useCallback(
    (value: any) => {
      setKeyword(value);
    },
    [list, setKeyword],
  );

  return (
    <StudentRoster
      onChange={handleChange}
      dataSource={dataList}
      {...restProps}
      onClick={handleClick}
      userType="student"
    />
  );
};

Docs.parameters = {
  layout: 'fullscreen',
};

export default meta;
