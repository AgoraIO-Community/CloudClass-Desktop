import React from 'react'
import { observer } from 'mobx-react'
import {  useSceneStore } from '@/hooks'
import { useLocation } from 'react-router-dom';
import { VideoPlayer } from '@/components/video-player'
export const ScreenSharing = () => {
  const location = useLocation()

  const isBreakoutClass = location.pathname.match('breakout-class')

  return (
   <BasicSceneScreenSharing />
  )
}
const BasicSceneScreenSharing = observer(() => {
  const sceneStore = useSceneStore()
  return (
    sceneStore.sharing ? 
    <VideoPlayer 
      showClose={false}
      role="teacher"
      share={true}
      className="screen-sharing"
      {...sceneStore.screenShareStream}
    /> : null
  )
})