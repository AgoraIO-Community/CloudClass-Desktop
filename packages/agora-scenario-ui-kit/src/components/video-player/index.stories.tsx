import React, { FC, useState, useRef } from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button'
import { VideoMarqueeList, VideoPlayer, VideoPlayerProps } from '~components/video-player';
import { CameraPlaceHolder } from '~components';
import {changeLanguage} from '../../i18n'

const meta: Meta = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  args: {
    size: 10,
    username: 'Lily True',
    stars: 5,
    micEnabled: true,
    whiteboardGranted: true,
    micVolume: 0.95,
    controlPlacement: 'bottom',
    placeholder: (
      <img
        src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
        alt="placeholder"
        style={{
          display: 'inline-block',
          maxHeight: '100%',
          maxWidth: '100%',
          borderRadius: 4,
        }}
      />
    ),
  },
};

export const Docs: FC<VideoPlayerProps> = ({ children, ...restProps }) => {
  
  return (
    <div className="m-10">
      <Button onClick={() => {
        changeLanguage('zh')
      }}>中文</Button>
      <Button onClick={() => {
        changeLanguage('en')
      }}>英文</Button>
      <VideoPlayer {...restProps}>{children}</VideoPlayer>
    </div>
  );
};

const student = {
  isHost: true,
  username: 'Lily True',
  stars: 5,
  micEnabled: true,
  whiteboardGranted: true,
  cameraEnabled: true,
  micVolume: 0.95,
  controlPlacement: 'bottom',
  placeholder: (
    <CameraPlaceHolder />
    // <img
    //   src="https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF"
    //   alt="placeholder"
    //   style={{
    //     display: 'inline-block',
    //     maxHeight: '100%',
    //     maxWidth: '100%',
    //     borderRadius: 4,
    //   }}
    // />
  ),
}

export const DocsSmall: FC<VideoPlayerProps & {size: number}> = ({ children, size, ...restProps }) => {

  const list = [...'.'.repeat(size)].map((_, i: number) => ({
    ...student,
    username: `${i}-${student.username}`,
    children: (<></>)
  })) as any[]
    
  return (
    //@ts-ignore
    <>
      <Button onClick={() => {
        changeLanguage('zh')
      }}>中文</Button>
      <Button onClick={() => {
        changeLanguage('en')
      }}>英文</Button>
      <VideoMarqueeList videoStreamList={list}>
      </VideoMarqueeList>
    </>
  )
}

export default meta;
