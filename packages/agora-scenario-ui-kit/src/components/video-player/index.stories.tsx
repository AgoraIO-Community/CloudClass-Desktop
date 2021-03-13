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
