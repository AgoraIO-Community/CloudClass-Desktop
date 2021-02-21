import React from 'react';
import { Tooltip } from '@material-ui/core';
import { t } from '@/i18n';
import { ControlItem } from '../control-item';
import { useBoardStore, useBreakoutRoomStore, useExtensionStore, useSceneStore, useUIStore } from '@/hooks';
import {observer} from 'mobx-react';
import ScaleController from './scale-controller';
import { useLocation } from 'react-router-dom';
import { ApplyUserList } from '../apply-user-list';
import { EduRoleTypeEnum } from '@/sdk/education/interfaces/index.d.ts';

export const FooterMenu = () => {

  const location = useLocation()

  const isBreakoutClass = location.pathname.match('breakout-class')

  return (
    isBreakoutClass ? <BreakoutClassSceneFooterMenu /> : <BasicSceneFooterMenu />
  )
}

const BasicSceneFooterMenu = observer((props: any) => {
  const boardStore = useBoardStore()
  const extensionStore = useExtensionStore()
  const sceneStore = useSceneStore()
  const uiStore = useUIStore()

  const current = boardStore.activeFooterItem

  const onClick = (key: string) => boardStore.changeFooterMenu(key)

  const handleRecording = async () => {
    await sceneStore.startOrStopRecording()
  } 

  const handleSharing = async () => {
    await sceneStore.startOrStopSharing()
  }
  
  return (
    <>
    {uiStore.showPagination ?
    <div className="pagination">
    {!sceneStore.sharing ?
      <>
      <Tooltip title={t(`control_items.first_page`)} placement="top">
        <span>
          <ControlItem name={`first_page`}
            active={'first_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <Tooltip title={t(`control_items.prev_page`)} placement="top">
        <span>
          <ControlItem name={`prev_page`}
            active={'prev_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <div className="current_page">
        <span>{boardStore.currentPage}/{boardStore.totalPage}</span>
      </div>
      <Tooltip title={t(`control_items.next_page`)} placement="top">
        <span>
          <ControlItem name={`next_page`}
            active={'next_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <Tooltip title={t(`control_items.last_page`)} placement="top">
        <span>
          <ControlItem name={`last_page`}
            active={'last_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <div className="menu-split" style={{ marginLeft: '7px', marginRight: '7px' }}></div>
      </> : null }
      <Tooltip title={t(sceneStore.isRecording ? 'control_items.stop_recording' : 'control_items.recording')} placement="top">
        <span>
          <ControlItem
            loading={sceneStore.recording}
            name={sceneStore.recording ? 'icon-loading ' : (sceneStore.isRecording ? 'stop_recording' : 'recording')}
            onClick={handleRecording}
            active={false}
          />
        </span>
      </Tooltip>
      <Tooltip title={t(sceneStore.sharing ? 'control_items.quit_screen_sharing' : 'control_items.screen_sharing')} placement="top">
        <span>
          <ControlItem
            name={sceneStore.sharing ? 'quit_screen_sharing' : 'screen_sharing'}
            onClick={handleSharing}
            active={false}
            text={sceneStore.sharing ? 'stop sharing' : ''}
          />
        </span>
      </Tooltip>
    </div>
    : null}  
    <div className="bottom-tools">
      {uiStore.showApplyUserList ? <ApplyUserList /> : null}
      {uiStore.showTools ?
      <div className="tool-kit zoom-controls">
        {uiStore.showScaler ? 
        <ScaleController
          lockBoard={boardStore.lock}
          zoomScale={boardStore.scale}
          onClick={() => {
            boardStore.openFolder()
          }}
          onClickBoardLock={() => {
            boardStore.toggleLockBoard()
          }}
          zoomChange={(scale: number) => {
            boardStore.updateScale(scale)
          }}
        /> : null}
      </div> : null}
    </div>
    </>
  )
})

const BreakoutClassSceneFooterMenu = observer(() => {
  const boardStore = useBoardStore()
  const roomStore = useBreakoutRoomStore()

  const current = boardStore.activeFooterItem

  const onClick = (key: string) => boardStore.changeFooterMenu(key)

  const handleRecording = async () => {
    await roomStore.startOrStopRecording()
  } 
  const handleSharing = async () => {
    await roomStore.startOrStopSharing()
  }

  return (
    roomStore.roomInfo.userRole === EduRoleTypeEnum.teacher ?
    <>
    <div className="pagination">
    {!roomStore.sharing ?
      <>
      <Tooltip title={t(`control_items.first_page`)} placement="top">
        <span>
          <ControlItem name={`first_page`}
            active={'first_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <Tooltip title={t(`control_items.prev_page`)} placement="top">
        <span>
          <ControlItem name={`prev_page`}
            active={'prev_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <div className="current_page">
        <span>{boardStore.currentPage}/{boardStore.totalPage}</span>
      </div>
      <Tooltip title={t(`control_items.next_page`)} placement="top">
        <span>
          <ControlItem name={`next_page`}
            active={'next_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <Tooltip title={t(`control_items.last_page`)} placement="top">
        <span>
          <ControlItem name={`last_page`}
            active={'last_page' === current}
            onClick={onClick} />
        </span>
      </Tooltip>
      <div className="menu-split" style={{ marginLeft: '7px', marginRight: '7px' }}></div>
      </> : null 
    }
      <Tooltip title={t(roomStore.recordId ? 'control_items.stop_recording' : 'control_items.recording')} placement="top">
        <span>
          <ControlItem
            loading={roomStore.recording}
            name={roomStore.recording ? 'icon-loading ' : (roomStore.recordId ? 'stop_recording' : 'recording')}
            onClick={handleRecording}
            active={false}
          />
        </span>
      </Tooltip>
      <Tooltip title={t(roomStore.sharing ? 'control_items.quit_screen_sharing' : 'control_items.screen_sharing')} placement="top">
        <span>
          <ControlItem
            name={roomStore.sharing ? 'quit_screen_sharing' : 'screen_sharing'}
            onClick={handleSharing}
            active={false}
            text={roomStore.sharing ? 'stop sharing' : ''}
          />
        </span>
      </Tooltip>
    </div>
    <div className="bottom-tools">
      <div className="tool-kit zoom-controls">
        <ScaleController
          lockBoard={boardStore.lock}
          zoomScale={boardStore.scale}
          onClick={() => {
            boardStore.openFolder()
          }}
          onClickBoardLock={() => {
            boardStore.toggleLockBoard()
          }}
          zoomChange={(scale: number) => {
            boardStore.updateScale(scale)
          }}
        />
      </div>
    </div>
    </>
    : null
  )
})
