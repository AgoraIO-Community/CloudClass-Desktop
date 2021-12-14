import React from 'react';
import { SvgImg } from '..';
import { Column, Profile, cameraIconType, microphoneIconType } from './index';

const Icon = ({ type }: { type: string }) => {
  return <SvgImg type={type} />;
};

export const defaultColumns: Column[] = [
  {
    key: 'name',
    order: 1,
    name: 'roster.student_name',
    render: (profile: Profile) => {
      return <React.Fragment>{profile.name}</React.Fragment>;
    },
  },
  {
    key: 'cameraState',
    order: 4,
    name: 'roster.camera_state',
    operation: 'camera',
    render: (profile: Profile) => {
      const iconType = cameraIconType[profile.cameraState];
      return <Icon type={iconType} />;
    },
    width: '12%',
  },
  {
    key: 'microphoneState',
    order: 5,
    name: 'roster.microphone_state',
    operation: 'microphone',
    render: (profile: Profile) => {
      const iconType = microphoneIconType[profile.microphoneState];
      return <Icon type={iconType} />;
    },
    width: '12%',
  },
];

export const podiumColumn: Column = {
  key: 'isOnPodium',
  order: 2,
  name: 'roster.student_co_video',
  operation: 'podium',
  render: (profile: Profile, hovered) => {
    const isActive = profile.isOnPodium;
    const iconType = isActive || hovered ? 'on-podium' : 'not-on-podium';

    return <Icon type={iconType} />;
  },
  width: '12%',
};

export const grantBoardColumn: Column = {
  key: 'isBoardGranted',
  order: 3,
  name: 'roster.granted',
  operation: 'grant-board',
  render: (profile: Profile, hovered) => {
    const isActive = profile.isBoardGranted;
    const iconType = isActive || hovered ? 'board-granted' : 'board-not-granted';
    return <Icon type={iconType} />;
  },
  width: '12%',
};

export const starsColumn: Column = {
  key: 'stars',
  order: 6,
  name: 'roster.reward',
  operation: 'star',
  render: (profile: Profile, hovered) => {
    return (
      <div className="star-wrap">
        <Icon type={hovered ? 'reward-hover' : 'reward'} />
        <span className="star-nums">&nbsp;x{profile.stars}</span>
      </div>
    );
  },
  width: '12%',
};

export const kickOutColumn: Column = {
  key: 'kick',
  order: 7,
  name: 'roster.kick',
  operation: 'kick',
  render: (profile: Profile, hovered) => {
    return <Icon type={hovered ? 'kick-out-hover' : 'kick-out'} />;
  },
  width: '12%',
};
