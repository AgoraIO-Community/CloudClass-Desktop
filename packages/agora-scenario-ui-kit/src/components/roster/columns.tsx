import classNames from 'classnames';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';
import { DeviceState, SvgIconEnum, SvgImg } from '..';
import { IconWithState } from '../util/type';
import { Column, Profile, cameraIconType, microphoneIconType, BoardGrantIconType, BoardGrantState } from './index';

const Icon = ({
  type,
  canClick = true,
  children,
}: {
  type: IconWithState;
  canClick?: boolean;
  children?: React.ReactNode;
}) => {
  const cls = classNames('w-full h-full flex justify-center items-center', canClick && 'clickable');
  return (
    <div className={cls}>
      <SvgImg type={type.icon} colors={{ iconPrimary: type.color }} />
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
    const iconType = isActive || hovered ? { icon: SvgIconEnum.ON_PODIUM, color: InteractionStateColors.allow } : { icon: SvgIconEnum.ON_PODIUM, color: InteractionStateColors.half };

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
    const isActive = profile.boardGrantState === BoardGrantState.Granted;

    iconType.color = isActive || hovered ? InteractionStateColors.allow : InteractionStateColors.half;

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
      <Icon type={hovered ? { icon: SvgIconEnum.REWARD, color: InteractionStateColors.allow } : { icon: SvgIconEnum.REWARD, color: InteractionStateColors.half }} >
        <span className="star-nums">&nbsp;x{profile.stars}</span>
      </Icon >
    );
  },
};

export const kickOutColumn: Column = {
  key: 'kick',
  order: 7,
  name: 'roster.kick',
  operation: 'kick',
  render: (profile: Profile, hovered) => {
    return <Icon type={hovered ? { icon: SvgIconEnum.KICK_OUT, color: InteractionStateColors.allow } : { icon: SvgIconEnum.KICK_OUT, color: InteractionStateColors.half }} />;
  },
};

export const superviseColumn: Column = {
  key: 'superviseStudent',
  order: 8,
  name: 'roster.supervise_student',
  operation: 'supervise-student',
  render: (profile: Profile, hovered) => {
    return <Icon type={{ icon: SvgIconEnum.TRIANGLE, }} />;
  },
};
