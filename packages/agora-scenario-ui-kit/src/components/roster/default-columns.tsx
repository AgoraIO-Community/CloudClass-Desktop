import React from 'react';
import { Icon } from '~components/icon';
import { Column } from '~components/roster';

export const defaultColumns: Column[] = [
  {
    key: 'name',
    name: '学生姓名',
  },
  {
    key: 'onPodium',
    name: '上下台',
    action: 'podium',
    render: (_, profile) => <Icon className="on-podium" type="on-podium" />,
  },
  {
    key: 'whiteboardGranted',
    name: '授权',
    action: 'whiteboard',
    render: (_, profile) => (
      <Icon
        className={
          profile.whiteboardGranted
            ? 'whiteboard-granted'
            : 'whiteboard-ungranted'
        }
        type="whiteboard"
      />
    ),
  },
  {
    key: 'cameraEnabled',
    name: '摄像头',
    action: 'camera',
    render: (_, profile) => (
      <Icon
        className={profile.cameraEnabled ? 'camera-enabled' : 'camera-disabled'}
        type={profile.cameraEnabled ? 'camera' : 'camera-off'}
      />
    ),
  },
  {
    key: 'micEnabled',
    name: '麦克风',
    action: 'mic',
    render: (_, profile) => (
      <Icon
        className={profile.micEnabled ? 'mic-enabled' : 'mic-disabled'}
        type={
          profile.micEnabled
            ? 'microphone-on-outline'
            : 'microphone-off-outline'
        }
      />
    ),
  },
  {
    key: 'stars',
    name: '奖励',
    render: (text) => (
      <>
        <Icon className="star" type="star-outline" />
        <span className="star-nums">&nbsp;x{text}</span>
      </>
    ),
  },
  {
    key: 'kickOut',
    name: '踢人',
    action: 'kick-out',
    // FIXME: 不能点击时的样式
    render: (_, profile) => (
      <span className="kick-out">
        <Icon type="exit" />
      </span>
    ),
  },
];
