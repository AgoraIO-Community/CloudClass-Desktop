import React, { FC } from 'react'
import { Meta } from '@storybook/react'
import { BizHeader, BizHeaderProps, MonitorInfo } from '.'
import dayjs from 'dayjs'

const monitor: MonitorInfo = {
  cpuUsage: 20,
  networkLatency: 200,
  networkQuality: '良好',
  packetLostRate: 20,
};

const devices: Omit<MediaDeviceInfo, 'toJSON'>[] = [
  {
    deviceId: 'fgaskdhfasdkjfdsfj',
    label: 'Camera HD',
    kind: 'videoinput',
    groupId: 'sjodsjfdsj',
  },
  {
    deviceId: 'fsdafdsafdshkjyuu',
    label: 'Mic HD',
    kind: 'audioinput',
    groupId: 'sjodsjfdsj',
  },
];

const meta: Meta = {
  title: 'Biz/BizHeader',
  component: BizHeader,
  args: {
    signalQuality: 'excellent',
    isStarted: false,
    classStatusText: 'pre-class 22:11',
    title: '一对一课堂',
    monitor,
    devices,
    // formatTime: dayjs(+Date.now()).format("mm:ss")
  },
};

export const Docs: FC<BizHeaderProps> = (props) => (
  <div className="bg-black h-40 p-5">
    <BizHeader {...props} />
  </div>
);

export default meta;
