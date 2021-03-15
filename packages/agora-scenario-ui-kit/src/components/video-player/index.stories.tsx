import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { VideoPlayer, VideoPlayerProps } from '~components/video-player';

const meta: Meta = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  args: {
    username: 'Lily True',
    stars: 5,
    micEnabled: true,
    whiteboardGranted: true,
    micVolume: 0.95,
    poster: 'https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF',
  },
};

export const Docs: FC<VideoPlayerProps> = ({ children, ...restProps }) => {
  return (
    <div className="m-10">
      <VideoPlayer {...restProps}>{children}</VideoPlayer>
    </div>
  );
};

export default meta;
