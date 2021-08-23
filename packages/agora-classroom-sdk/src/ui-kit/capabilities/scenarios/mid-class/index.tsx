import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useRoomContext, useGlobalContext, useChatContext, useWidgetContext, useAppPluginContext, useBoardContext, useScreenShareContext } from 'agora-edu-core'
import {NavigationBar} from '~capabilities/containers/nav'
import {ScreenSharePlayerContainer} from '~capabilities/containers/screen-share-player'
import {WhiteboardContainer} from '~capabilities/containers/board'
import {DialogContainer} from '~capabilities/containers/dialog'
import {LoadingContainer} from '~capabilities/containers/loading'
import {MidVideoMarqueeContainer, VideoMarqueeStudentContainer, VideoPlayerTeacher} from '~capabilities/containers/video-player'
import {HandsUpContainer} from '~capabilities/containers/hands-up'
import { useEffectOnce } from '@/infra/hooks/utils'
import React, { useState, useLayoutEffect, useCallback } from 'react'
import { Widget } from '~capabilities/containers/widget'
import { useUIStore } from '@/infra/hooks'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { get, debounce } from 'lodash'
import { ToastContainer } from "~capabilities/containers/toast"
import { AgoraExtAppAnswer } from 'agora-plugin-gallery'
import { Icon, IconButton } from '~ui-kit'

// keep aspect ratio to 16:9
const windowAspectRatio = 9 / 16
// minimum size of window
const _minimumSize = { width: 1280, height: 720 }
// keep the height of the whiteboard to be 59/72 of the window height accroding to UI design
const _whiteboardHeightRatio = 59 / 72

const useFixedAspectRatio = (aspectRatio: number, minimumSize: typeof _minimumSize, whiteboardHeightRatio: typeof _whiteboardHeightRatio, debounceMs = 500) => {
  const { windowSize, updateWindowSize } = useUIStore()

  useEffectOnce(() => {
    const checkAndUpdate = ({ width, height }: typeof windowSize) => {
      if(width >= minimumSize.width || height >= minimumSize.height) {
        updateWindowSize({ width, height })
      } else {
        updateWindowSize(minimumSize)
      }
    }
    
    const recalculateDimension = () => {
      const curAspectRatio = window.innerHeight / window.innerWidth

      const windowSize = { height: window.innerHeight, width: window.innerWidth }
      
      if(curAspectRatio > aspectRatio) {
        // shrink height
        windowSize.height = window.innerWidth * aspectRatio;
      } else if(curAspectRatio < aspectRatio) {
        // shrink width
        windowSize.width = window.innerHeight / aspectRatio
      }
      checkAndUpdate(windowSize)
    }

    recalculateDimension()

    const handleResize = debounce(() => {
      recalculateDimension()
    }, debounceMs)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  })
  const whiteboardHeight = windowSize.height * whiteboardHeightRatio
  // const whiteboardWidth = whiteboardHeight / (9 / 16)
  return {
    containerStyle: {
      height: windowSize.height,
      width: windowSize.width,
      transition: 'all .3s'
    },
    whiteboardStyle: {
      height: whiteboardHeight,
      // width: whiteboardWidth,
      transition: 'all .3s'
    }
  }
}


export const MidClassScenario = observer(() => {
  const { 
    joinRoom,
    roomProperties,
    isJoiningRoom,
    joinRoomRTC,
    roomInfo,
    prepareStream,
  } = useRoomContext()

  const {
    onLaunchAppPlugin,
    onShutdownAppPlugin,
    activeAppPlugins
  } = useAppPluginContext()

  const {
    joinBoard
  } = useBoardContext()


  useLayoutEffect(() => {
    if (roomProperties?.extAppsCommon?.io_agora_countdown?.state === 1) {
      // 开启倒计时
      onLaunchAppPlugin('io.agora.countdown')
    } else if (roomProperties?.extAppsCommon?.io_agora_countdown?.state === 0) {
      // 关闭倒计时
      onShutdownAppPlugin('io.agora.countdown')
    }
    
    if (roomProperties?.extAppsCommon?.io_agora_answer?.state === 1) {
      // 开启答题器
      onLaunchAppPlugin('io.agora.answer')
    } else if (roomProperties?.extAppsCommon?.io_agora_answer?.state === 0) {
      // 关闭答题器
      onShutdownAppPlugin('io.agora.answer', () => {
        let app = activeAppPlugins.find(p => p.appIdentifier === 'io.agora.answer') as AgoraExtAppAnswer
        if(!app) {
          return true
        }
        return app.store?.status !== 'config' || roomInfo.userRole === EduRoleTypeEnum.student
      })
    }

    if (roomProperties?.extAppsCommon?.io_agora_vote?.state === 1) {
      // 开启投票
      onLaunchAppPlugin('io.agora.vote')
    } else if (roomProperties?.extAppsCommon?.io_agora_vote?.state === 0) {
      // 关闭投票
      onShutdownAppPlugin('io.agora.vote')
    }
  }, [
    roomProperties?.extAppsCommon?.io_agora_countdown?.state,
    roomProperties?.extAppsCommon?.io_agora_answer?.state,
    roomProperties?.extAppsCommon?.io_agora_vote?.state
  ])

  const {
    isFullScreen,
  } = useGlobalContext()

  const {
    widgets
  } = useWidgetContext()
  const chatWidget = widgets['chat']

  useEffectOnce(async () => {
    await joinRoom()
    joinBoard()
    if (roomInfo.userRole === EduRoleTypeEnum.teacher) {
      await prepareStream()
    }
    joinRoomRTC()
  })

  const { containerStyle, whiteboardStyle } = useFixedAspectRatio(windowAspectRatio, _minimumSize, _whiteboardHeightRatio)

  const cls = classnames({
    'edu-room': 1,
    'fullscreen': !!isFullScreen,
    'justify-center': 1,
    'items-center': 1,
    'bg-black': 1,
    'h-screen': 1
  })

  const chatroomId = get(roomProperties, 'im.huanxin.chatRoomId')
  const orgName = get(roomProperties, 'im.huanxin.orgName')
  const appName = get(roomProperties, 'im.huanxin.appName')

  const { roomInfo : {userRole}} = useRoomContext()

  const visible = userRole !== EduRoleTypeEnum.invisible


  const {
    screenEduStream,
    startOrStopSharing,
} = useScreenShareContext()


  const handleStopSharing = useCallback(async () => {
      await startOrStopSharing()
  }, [startOrStopSharing])

  return (
    <Layout
      className={cls}
      direction="col"
    >
      <div className="mid-class-container flex flex-col" style={containerStyle}>
        <NavigationBar />
        <Layout className="layout layout-row layout-video flex-grow">
          <MidVideoMarqueeContainer />
        </Layout>
        <Layout className="horizontal" style={{ height: 'unset' }}>
          <Content className="column flex-grow-1" style={whiteboardStyle}>
            <div className="board-box">
              <WhiteboardContainer>
                {screenEduStream ? (<IconButton icon={<Icon type="share-screen" color="#357BF6"/>} buttonText="停止共享" buttonTextColor="#357BF6" style={{position: 'absolute', zIndex: 999}} onClick={handleStopSharing}/>) : ""}
                <ScreenSharePlayerContainer />
              </WhiteboardContainer>
            </div>
          </Content>
          
          <Aside className={classnames({
            "mid-class-aside": 1,
            // "mid-class-aside-full-not-collapse": (isFullScreen && !chatCollapse),
            // "mid-class-aside-full-collapse": (isFullScreen && chatCollapse),
            "mid-class-aside-full-collapse": isFullScreen,
            "absolute": 1,
            "flex-row": 1,
            "items-end": 1

          })}>
            <div className="mr-1">
              <HandsUpContainer />
            </div>
            {chatroomId ? (
            <Widget 
              className="chat-panel" 
              widgetComponent={chatWidget} 
              widgetProps={{chatroomId, orgName, appName}}
              sendMsg={{ isFullScreen, showMinimizeBtn: true, width: 340, height: 480 }}
            />) : null}
          </Aside>
        </Layout>
        <DialogContainer />
        <LoadingContainer loading={isJoiningRoom} />
        <ToastContainer />
      </div>
    </Layout>
  )
})