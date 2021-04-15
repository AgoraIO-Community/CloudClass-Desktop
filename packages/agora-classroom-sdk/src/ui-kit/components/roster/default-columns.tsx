import classnames from 'classnames';
import { t } from '~components/i18n';
import { Icon, IconTypes } from '~components/icon';
import { Column, Profile } from '~components/roster';

const getCameraState = (profile: Profile) => {
  const defaultType = 'camera-off'
  // const hover = !!profile.onlineState || profile.disabled === false || !!profile.cameraDevice === true 

  const type = !!profile.cameraEnabled === true ? 'camera' : defaultType

  const className = !!profile.cameraEnabled === true ? 'un-muted' : 'muted'

  return {
    type: type as IconTypes,
    className: className
  }
}

const getMicrophoneState = (profile: Profile): any => {
  const defaultType = 'microphone-off-outline'

  const type = !!profile.micEnabled === true ? 'microphone-on-outline' : defaultType

  const className = !!profile.micEnabled === true ? 'un-muted' : 'muted'

  return {
    type: type as IconTypes,
    className: className
  }
}

export const defaultColumns: Column[] = [
  {
    key: 'name',
    name: 'roster.student_name',
  },
  {
    key: 'onPodium',
    name: 'roster.student_co_video',
    action: 'podium',
    render: (_, profile, hover) => {
      const cls = classnames({
        [`${!!profile.onPodium ? 'on' : 'off'}-podium`]: 1,
      })
      return (
        <Icon
          hover={hover}
          className={cls}
          type="on-podium"
        />
      )
    }
  },
  {
    key: 'whiteboardGranted',
    name: 'roster.board_state',
    action: 'whiteboard',
    render: (_, profile, hover, userType) => {
      const cls = classnames({
        'whiteboard-granted-svg': 1,
        [`whiteboard-${!!profile.whiteboardGranted ? 'granted' : 'no_granted'}`]: 1,
        [`student-${!!profile.whiteboardGranted ? 'granted' : 'no_granted'}`]: userType === 'student'
      })
      return (
        <div className={cls}></div>
      )
    },
  },
  {
    key: 'cameraEnabled',
    name: 'roster.camera_state',
    action: 'camera',
    render: (_, profile, hover) => {
      const {
        className,
        type,
      } = getCameraState(profile)

      const cls = classnames({
        [`${className}`]: 1,
        // [`disabled`]: profile.disabled
      })
      return (
        <Icon
          hover={hover}
          className={cls}
          type={type}
        />
      )
    },
  },
  {
    key: 'micEnabled',
    name: 'roster.microphone_state',
    action: 'mic',
    render: (_, profile, hover) => {
      const {
        className,
        type,
      } = getMicrophoneState(profile)

      const cls = classnames({
        [`${className}`]: 1,
        // [`disabled`]: profile.disabled
      })
      return (
        <Icon
          hover={hover}
          className={cls}
          type={type}
        />
      )
    },
  },
  {
    key: 'stars',
    name: 'roster.reward',
    render: (text, profile: Profile, hover) => {
      const cls = classnames({
        'inline-flex': 1,
      })

      return (
        <div className={cls}>
          <Icon className="star" type="star-outline" />
          <span className="star-nums">&nbsp;x{text}</span>
        </div>
      )
    },
  },
  {
    key: 'kickOut',
    name: 'roster.kick',
    action: 'kick-out',
    visibleRoles: ['assistant', 'teacher'],
    // FIXME: 不能点击时的样式
    render: (_, profile, hover) => {
      return (
        <span className="kick-out">
          <Icon hover={hover} type="exit" />
        </span>
      )
    },
  },
];
