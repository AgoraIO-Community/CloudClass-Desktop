import React, { useState } from 'react'
import { VideoPlayer } from 'agora-scenario-ui-kit'


export const VideoPlayerTeacher = () => {

  // 这里，去接入老师视频数据流

  return (
    <>
      <VideoPlayer
        username={'Lily True'}
        stars={0}
        uid={1}
        micEnabled={true}
        whiteboardGranted={ true}
        micVolume={0.95}
        onCameraClick={async (uid: any) => {

        }}
        onMicClick={async (uid: any) => {

        }}
        onWhiteboardClick={async (uid: any) => {

        }}
        onSendStar={async (uid: any) => {

        }}
        placeholder={
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
        }
        controlPlacement={'top'}
        onOffPodiumClick={
          async (uid: any) => {

          }
        }
      ></VideoPlayer>
    </>
  )
}

export const VideoPlayerStudent = () => {

  // 这里，去接入学生视频数据流
  
  return (
    <>
      <VideoPlayer
        username={'Lily True'}
        stars={5}
        uid={1}
        micEnabled={true}
        whiteboardGranted={ true}
        micVolume={0.95}
        onCameraClick={async (uid: any) => {

        }}
        onMicClick={async (uid: any) => {

        }}
        onWhiteboardClick={async (uid: any) => {

        }}
        onSendStar={async (uid: any) => {

        }}
        placeholder={
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
        }
        controlPlacement={'top'}
        onOffPodiumClick={
          async (uid: any) => {

          }
        }
      >
      </VideoPlayer>
    </>
  )
}
  