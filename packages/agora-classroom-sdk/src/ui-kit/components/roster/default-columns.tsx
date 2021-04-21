import classnames from 'classnames';
import React from 'react';
import { t } from '~components/i18n';
import { Icon, IconTypes } from '~components/icon';
import { Column, Profile } from '~components/roster';
import { getCameraState, getMicrophoneState } from './base';

export const defaultColumns: Column[] = [
  {
    key: 'name',
    name: 'roster.student_name',
  },
  {
    key: 'onPodium',
    name: 'roster.student_co_video',
    action: 'podium',
    render: (_, profile, hover, userType) => {
      const cls = classnames({
        'podium-svg': 1,
        [`${!!profile.onPodium ? 'on' : 'off'}-podium`]: 1,
        [`student-${!!profile.onPodium ? 'on' : 'off'}-podium`]: userType === 'student',
      })
      return (
        <div className={cls}></div>
      )
    }
  },
  {
    key: 'whiteboardGranted',
    name: 'roster.board',
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
        <span className="camera-enabled">
          <Icon
            hover={hover}
            className={cls}
            type={type}
          />
        </span>
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
      console.log('mic', hover)
      return (
        <span className="mic-enabled">
          <Icon
            hover={hover}
            className={cls}
            type={type}
          />
        </span>
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
      console.log('kick', hover)
      return (
        <span className="kick-out">
          <Icon hover={hover} type="exit" />
        </span>
      )
    },
  },
];
