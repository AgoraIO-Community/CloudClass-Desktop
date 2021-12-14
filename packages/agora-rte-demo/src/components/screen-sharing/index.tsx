import React from 'react'
import { observer } from 'mobx-react'
import {  useBoardStore, useSceneStore } from '@/hooks'
import { useLocation } from 'react-router-dom';
import { VideoPlayer } from '@/components/video-player'
import classnames from 'classnames';
export const ScreenSharing = () => {
  const location = useLocation()

  // const isBreakoutClass = location.pathname.match('breakout-class')

  return (
   <BasicSceneScreenSharing />
  )
}
const BasicSceneScreenSharing = observer(() => {
  const sceneStore = useSceneStore()
  const boardStore = useBoardStore()
  const cls = classnames({
    [`screen-sharing`]: 1,
    [`screen-share-active`]: boardStore.isBoardScreenShare
  });
  return (
    sceneStore.sharing ? 
    <VideoPlayer 
      type="screen-share"
      showClose={false}
      role="teacher"
      share={true}
      className={cls}
      {...sceneStore.screenShareStream}
    /> : null
  )
})