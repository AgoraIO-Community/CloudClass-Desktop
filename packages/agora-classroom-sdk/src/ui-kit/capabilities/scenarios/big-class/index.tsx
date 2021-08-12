import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useRoomContext, useGlobalContext, useChatContext, useWidgetContext, useAppPluginContext, usePretestContext, useStreamListContext, useBoardContext } from 'agora-edu-core'
import { NavigationBar } from '~capabilities/containers/nav'
import { ScreenSharePlayerContainer } from '~capabilities/containers/screen-share-player'
import { WhiteboardContainer } from '~capabilities/containers/board'
import { DialogContainer } from '~capabilities/containers/dialog'
import { LoadingContainer } from '~capabilities/containers/loading'
import { VideoMarqueeStudentContainer, VideoPlayerTeacher } from '~capabilities/containers/video-player'
import { HandsUpContainer } from '~capabilities/containers/hands-up'
import { RoomChat } from '~capabilities/containers/room-chat'
import { useEffectOnce } from '@/infra/hooks/utils'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Widget } from '~capabilities/containers/widget'
import { ToastContainer } from "~capabilities/containers/toast"
import { useUIStore } from '@/infra/hooks'
import { useEffect } from 'react'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { get } from 'lodash'
import { EduClassroomStateEnum } from '../../../../../../agora-edu-core/src/stores/scene'


export const BigClassScenario = observer(() => {

  const {
    joinRoom,
    updateFlexRoomProperties,
    roomProperties,
    isJoiningRoom,
    flexRoomProperties,
    joinRoomRTC,
    leaveRoomRTC,
    roomInfo,
    prepareStream,
  } = useRoomContext()

  const {
    unmuteVideo,
    unmuteAudio
  } = useStreamListContext()

  const {
    onLaunchAppPlugin,
    onShutdownAppPlugin
  } = useAppPluginContext()

  const {
    startPretestCamera,
    startPretestMicrophone
  } = usePretestContext()


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
      onShutdownAppPlugin('io.agora.answer')
    }

    if (roomProperties?.extAppsCommon?.io_agora_vote?.state === 1) {
      // 开启投票
      onLaunchAppPlugin('io.agora.vote')
    } else if (roomProperties?.extAppsCommon?.io_agora_vote?.state === 0) {
      // 关闭投票
      onShutdownAppPlugin('io.agora.vote')
    }
  }, [roomProperties])

  const {
    isFullScreen,
  } = useGlobalContext()

  // useEffect(() => {
  //   if (roomInfo.userRole !== EduRoleTypeEnum.teacher) return
  //   Promise.all([
  //     startPretestCamera(),
  //     startPretestMicrophone({enableRecording: false})
  //   ])
  //   .then(() => {
  //       console.log('打开媒体设备成功')
  //   })
  //   .catch((err: any) => {
  //       console.log('打开媒体设备失败', err)
  //   })
  // }, [roomInfo.userRole])

  const {
    widgets
  } = useWidgetContext()
  const chatWidget = widgets['chat']

  const { chatCollapse }  = useUIStore()

  const {
    joinBoard
  } = useBoardContext()

  useEffectOnce(async () => {
    await joinRoom()
    if (roomInfo.userRole === EduRoleTypeEnum.teacher) {
      prepareStream()
    }
    joinBoard()
  })

  //发送流调用 joinRoomRTC();
  //停止发送调用 leaveRoomRTC();

  const cls = classnames({
    'edu-room': 1,
    'fullscreen': !!isFullScreen
  })

  const chatroomId = get(roomProperties, 'im.huanxin.chatRoomId')
  const orgName = get(roomProperties, 'im.huanxin.orgName')
  const appName = get(roomProperties, 'im.huanxin.appName')

  const { roomInfo : {userRole}} = useRoomContext()

  const visible = userRole !== EduRoleTypeEnum.invisible

  return (
    <Layout
      className={cls}
      direction="col"
      style={{
        height: '100vh'
      }}
    >
      <NavigationBar />
      <Layout className="horizontal">
        <Content className="column">
          <VideoMarqueeStudentContainer />
          <div className="board-box">
            <WhiteboardContainer>
              <ScreenSharePlayerContainer />
            </WhiteboardContainer>
          </div>
          <div 
            className={classnames({
              'pin-right': 1
            })}
          >
            <HandsUpContainer />
          </div>
        </Content>
        <Aside className={classnames({
          "big-class-aside": 1,
          "big-class-aside-full-not-collapse": (isFullScreen && !chatCollapse),
          "big-class-aside-full-collapse": (isFullScreen && chatCollapse)
        })}>
          <div className={isFullScreen ? 'full-video-wrap' : 'video-wrap'}>
            <VideoPlayerTeacher className="big-class-teacher"/>
          </div>
          {visible && chatroomId ? <Widget className="chat-panel" widgetComponent={chatWidget} widgetProps={{chatroomId, orgName, appName}}/> : null}
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer loading={isJoiningRoom} />
      <ToastContainer />
    </Layout>
  )
})