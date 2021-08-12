import { Layout, Content, Aside } from '~components/layout'
import { observer } from 'mobx-react'
import classnames from 'classnames'
import { useRoomContext, useGlobalContext, useChatContext, useWidgetContext, useAppPluginContext } from 'agora-edu-core'
import {NavigationBar} from '~capabilities/containers/nav'
import {ScreenSharePlayerContainer} from '~capabilities/containers/screen-share-player'
import {WhiteboardContainer} from '~capabilities/containers/board'
import {DialogContainer} from '~capabilities/containers/dialog'
import {LoadingContainer} from '~capabilities/containers/loading'
import {MidVideoMarqueeContainer, VideoMarqueeStudentContainer, VideoPlayerTeacher} from '~capabilities/containers/video-player'
import {HandsUpContainer} from '~capabilities/containers/hands-up'
import { useEffectOnce } from '@/infra/hooks/utils'
import React, { useEffect, useState } from 'react'
import { Widget } from '~capabilities/containers/widget'
import { useLayoutEffect } from 'react'
import { useUIStore } from '@/infra/hooks'
import { EduRoleTypeEnum } from 'agora-rte-sdk'
import { get } from 'lodash'
import { ToastContainer } from "~capabilities/containers/toast"
import { AgoraExtAppAnswer } from 'agora-plugin-gallery'


export const MidClassScenario = observer(() => {
  const { joinRoom, roomProperties, isJoiningRoom } = useRoomContext()

  const {
    onLaunchAppPlugin,
    onShutdownAppPlugin,
    activeAppPlugins
  } = useAppPluginContext()


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
        return app.store?.status !== 'config'
      })
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

  const {
    widgets
  } = useWidgetContext()
  const chatWidget = widgets['chat']

  // const { 
  //   chatCollapse 
  // }  = useUIStore()

  const [chatCollapse, setChatCollapse] = useState(false)

  useEffectOnce(() => {
    joinRoom()
  })

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
      <Layout className="layout layout-row layout-video">
        <MidVideoMarqueeContainer />
      </Layout>
      <Layout className="horizontal">
        <Content className="column">
          <div className="board-box">
            <WhiteboardContainer>
              <ScreenSharePlayerContainer />
            </WhiteboardContainer>
          </div>
          <div
            className={classnames({
              'pin-right': 1
            })}
            style={{display:'flex'}}
          >
            <HandsUpContainer />
          </div>
        </Content>
        <Aside className={classnames({
          "mid-class-aside": 1,
          // "mid-class-aside-full-not-collapse": (isFullScreen && !chatCollapse),
          // "mid-class-aside-full-collapse": (isFullScreen && chatCollapse),
          "mid-class-aside-full-collapse": isFullScreen,
        })}>
          {chatroomId ? (
          <Widget 
            className="chat-panel" 
            widgetComponent={chatWidget} 
            widgetProps={{chatroomId, orgName, appName}}
            onReceivedMsg={(msg: any) => {
              setChatCollapse(!msg.isShowChat)
            }}
            sendMsg={{isFullScreen}}
          />) : null}
        </Aside>
      </Layout>
      <DialogContainer />
      <LoadingContainer loading={isJoiningRoom} />
      <ToastContainer />
    </Layout>
  )
})