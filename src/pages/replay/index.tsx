import React from 'react';
import { isElectron } from '@/utils/platform';
import {CustomIcon} from '@/components/icon';
import { useReplayUIStore, useUIStore } from '@/hooks';
import {observer} from 'mobx-react';
import { ReplayController, PlayerController } from './replay';
import { ToastContainer } from '@/components/toast';

const ReplayWrapper = observer((props: any) => {

  const uiStore = useUIStore()

  return (
    uiStore.isElectron ? 
    <div className="replay-page-wrapper">
      <div className={`nav-container menu-nav ${isElectron ? 'draggable' : ''}`}>
        <div className="menu-nav-right">
          {/* <Tooltip title={t("icon.upload-log")} placement="bottom">
            <div>
              <CustomIcon className={loading ? "icon-loading" : "icon-upload"} onClick={(evt: any) => {
                handleClick('uploadLog')
              }}></CustomIcon>
            </div>
          </Tooltip> */}
          {/* {uiStore.isElectron && 
          <div className="menu-group">
            <CustomIcon className="icon-minimum" icon onClick={() => {
              uiStore.windowMinimum()
            }} />
            <CustomIcon className="icon-maximum" icon onClick={() => {
              uiStore.windowMaximum()
            }} />
            <CustomIcon className="icon-close" icon onClick={() => {
              uiStore.windowClose()
            }} />
          </div>} */}
        </div>
      </div>
      {props.children}
    </div> :
    props.children
  )
})

export const ReplayPage = () => {
  return (
    <ReplayWrapper>
      <ReplayController />
    </ReplayWrapper>
  )
}

const ReplayPlayerWrapper = observer((props: any) => {

  const uiStore = useReplayUIStore()

  return (
    uiStore.isElectron ? 
    <div className="replay-page-wrapper">
      <div className={`nav-container menu-nav ${isElectron ? 'draggable' : ''}`}>
        <div className="menu-nav-right">
          {/* <Tooltip title={t("icon.upload-log")} placement="bottom">
            <div>
              <CustomIcon className={loading ? "icon-loading" : "icon-upload"} onClick={(evt: any) => {
                handleClick('uploadLog')
              }}></CustomIcon>
            </div>
          </Tooltip> */}
          {/* {
          uiStore.isElectron && 
          <div className="menu-group">
            <CustomIcon className="icon-minimum" icon onClick={() => {
              uiStore.windowMinimum()
            }} />
            <CustomIcon className="icon-maximum" icon onClick={() => {
              uiStore.windowMaximum()
            }} />
            <CustomIcon className="icon-close" icon onClick={() => {
              uiStore.windowClose()
            }} />
          </div>
          } */}
        </div>
      </div>
      {props.children}
    </div> :
    props.children
  )
})

export const PlayerPage = () => {
  return (
    <ReplayPlayerWrapper>
      <ToastContainer />
      <PlayerController />
    </ReplayPlayerWrapper>
  )
}