import classNames from 'classnames';
import { DeviceState, SvgImg } from '..';
import { Column, Profile, cameraIconType, microphoneIconType, BoardGrantIconType } from './index';

const Icon = ({
  type,
  canClick = true,
  children,
}: {
  type: string;
  canClick?: boolean;
  children?: React.ReactNode;
}) => {
  const cls = classNames('w-full h-full flex justify-center items-center', canClick && 'clickable');
  return (
    <div className={cls}>
      <SvgImg type={type} />
      {children}
    </div>
  );
};

export const defaultColumns: Column[] = [
  {
    key: 'name',
    order: 1,
    name: 'roster.student_name',
    render: (profile: Profile) => {
      return (
        <span title={profile.name} className="roster-username" style={{ paddingLeft: 25 }}>
          {profile.name}
        </span>
      );
    },
  },
  {
    key: 'cameraState',
    order: 4,
    name: 'roster.camera_state',
    operation: 'camera',
    render: (profile: Profile) => {
      const iconType = cameraIconType[profile.cameraState];
      return (
        <Icon
          type={iconType}
          canClick={
            ![DeviceState.unauthorized, DeviceState.unavailable].includes(profile.cameraState)
          }
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
      return (
        <Icon
          type={iconType}
          canClick={
            ![DeviceState.unauthorized, DeviceState.unavailable].includes(profile.microphoneState)
          }
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
  render: (profile: Profile, hovered) => {
    const isActive = profile.isOnPodium;
    const iconType = isActive || hovered ? 'on-podium' : 'not-on-podium';

    return <Icon type={iconType} />;
  },
};

export const grantBoardColumn: Column = {
  key: 'isBoardGranted',
  order: 3,
  name: 'roster.granted',
  operation: 'grant-board',
  render: (profile: Profile, hovered) => {
    const iconType = BoardGrantIconType[profile.boardGrantState];
    return <Icon type={iconType} />;
  },
};

export const starsColumn: Column = {
  key: 'stars',
  order: 6,
  name: 'roster.reward',
  operation: 'star',
  render: (profile: Profile, hovered) => {
    return (
      <Icon type={hovered ? 'reward-hover' : 'reward'}>
        <span className="star-nums">&nbsp;x{profile.stars}</span>
      </Icon>
    );
  },
};

export const kickOutColumn: Column = {
  key: 'kick',
  order: 7,
  name: 'roster.kick',
  operation: 'kick',
  render: (profile: Profile, hovered) => {
    return <Icon type={hovered ? 'kick-out-hover' : 'kick-out'} />;
  },
};
