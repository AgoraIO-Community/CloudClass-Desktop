import React, { FC, useState, useRef } from 'react';
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
      <VideoPlayer {...restProps}>{children}</VideoPlayer>
    </div>
  );
};

export const DocsSmall: FC<VideoPlayerProps> = ({ children, ...restProps }) => {
  const stuList = ['stu1', 'stu2', 'stu3', 'stu4', 'stu5']
  const videoItemRef = useRef<any>()
  const videoContainerRef = useRef<any>()
  
  const offsetVideo = (direction: string) => {
    let videoWidth = videoItemRef.current.offsetWidth + 5
    if(direction === 'left') {
      videoContainerRef.current.scrollLeft -= videoWidth
    }
    if(direction === 'right') {
      videoContainerRef.current.scrollLeft += videoWidth
    }
  }

  return (
    <>
      <div className="container">
        <div className="video-container" ref={videoContainerRef}>
          <div className="left-container" onClick={() => {offsetVideo('left')}}>
          <span className="offset">{"<"}</span> 
          </div>
          {
            stuList.map((item: string) => {
              return (
                <div className="videoItem" key={item} ref={videoItemRef}>
                  <VideoPlayer {...restProps} username={item}>{children}</VideoPlayer>
                </div>
              )
            })
          }
          <div className="right-container" onClick={() => {offsetVideo('right')}}>
            <span className="offset">{">"}</span> 
          </div>
        </div>
      </div>
    </>
  )
}

export default meta;
