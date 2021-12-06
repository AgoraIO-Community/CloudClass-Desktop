import classNames from 'classnames';
import React from 'react';
import { SvgImg } from '..';
import { Column, Profile, cameraIconType, microphoneIconType } from './index';

const Icon = ({
  type,
  className,
  canOperate,
  isActive,
}: {
  type: string;
  className?: string;
  canOperate: boolean;
  isActive: boolean;
}) => {
  const cls = classNames('operate-status', className, isActive ? 'icon-active' : 'un-active');

  return <SvgImg type={type} canHover={canOperate} className={cls} />;
};

const deviceStateKeys = [, 'available'];

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
      const canOperate = profile.operations.includes('camera');
      const className = classNames(
        { 'icon-cursor-default': !canOperate },
        `rtc-state-${deviceStateKeys[profile.cameraState]}`,
      );
      return (
        <Icon
          type={iconType}
          canOperate={canOperate && profile.isOnPodium}
          isActive={profile.isOnPodium}
          className={className}
        />
      );
    },
  },
  {
    key: 'microphoneState',
    order: 5,
    name: 'roster.microphone_state',
    operation: 'microphone',
    render: (profile: Profile) => {
      const iconType = microphoneIconType[profile.microphoneState];
      const canOperate = profile.operations.includes('microphone');
      const className = classNames(
        { 'icon-cursor-default': !canOperate },
        `rtc-state-${deviceStateKeys[profile.microphoneState]}`,
      );
      return (
        <Icon
          type={iconType}
          canOperate={canOperate && profile.isOnPodium}
          isActive={profile.isOnPodium}
          className={className}
        />
      );
    },
  },
];

export const podiumColumn: Column = {
  key: 'isOnPodium',
  order: 2,
  name: 'roster.student_co_video',
  operation: 'podium',
  render: (profile: Profile) => {
    const isActive = profile.isOnPodium;
    const iconType = isActive ? 'on-podium' : 'invite-to-podium';
    const canOperate = profile.operations.includes('podium');
    return <Icon type={iconType} canOperate={canOperate} isActive={isActive} />;
  },
};

export const grantBoardColumn: Column = {
  key: 'isBoardGranted',
  order: 3,
  name: 'roster.granted',
  operation: 'grant-board',
  render: (profile: Profile) => {
    const isActive = profile.isBoardGranted;
    const iconType = isActive ? 'authorized' : 'no-authorized';
    const canOperate = profile.operations.includes('grant-board');
    return <Icon type={iconType} canOperate={canOperate} isActive={isActive} />;
  },
};

export const starsColumn: Column = {
  key: 'stars',
  order: 6,
  name: 'roster.reward',
  render: (profile: Profile) => {
    return (
      <div className="star-wrap">
        <Icon type="star-outline" canOperate={false} isActive={false} />
        <span className="star-nums">&nbsp;x{profile.stars}</span>
      </div>
    );
  },
};

export const kickOutColumn: Column = {
  key: 'kick',
  order: 7,
  name: 'roster.kick',
  operation: 'kick',
  render: (profile: Profile) => {
    const canOperate = profile.operations.includes('kick');

    return <Icon type="exit" canOperate={canOperate} isActive={false} />;
  },
};
