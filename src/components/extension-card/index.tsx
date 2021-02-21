import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import { useExtensionStore, useBoardStore , useSceneStore, useUIStore, useMiddleRoomStore} from '@/hooks';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import './extension-card.scss'
import { t } from '@/i18n';

export const ExtensionCard: React.FC<any> = observer(() => {

  const extensionStore = useExtensionStore()
  const boardStore = useBoardStore()
  const sceneStore = useSceneStore()
  const uiStore = useUIStore()
  const middleRoomStore = useMiddleRoomStore()

  const bindMiddleGroup = useCallback(() => {
    // 当前有举手学生在台上 
    if(middleRoomStore.handsUpStreams.length !== 0) {
      uiStore.addToast(t('middle_room.student_down_platform'))
      return
    }
    // 当前有组在台上
    const platformState = middleRoomStore.platformState
    if(platformState.g1Members.length !== 0 || platformState.g2Members.length !== 0 ) {
      uiStore.addToast(t('middle_room.group_down_platform'))
      return
    }
    
    if (middleRoomStore.onStage) {
      uiStore.addToast(t('middle_room.group_down_platform'))
      return
    }
    extensionStore.showGrouping()
    extensionStore.showInsideGroup()
    boardStore.hideExtension()
  }, [extensionStore, boardStore, middleRoomStore.handsUpStreams, middleRoomStore.platformState, middleRoomStore.onStage])

  const bindMiddleHand = function() {
    extensionStore.toggleCard()
    boardStore.hideExtension()
  }

  return (
    <div className="extension-card">
      <Paper className="paperCard">
        <MenuList>
          <MenuItem onClick={bindMiddleGroup}>
          <div className="group-item"></div>
          {t('extension.grouping')}
          </MenuItem>
          <MenuItem onClick={bindMiddleHand}>
          <div className="hand-item"></div>
          {t('extension.hands_up')}
          </MenuItem>
        </MenuList>
      </Paper>
    </div>
  )
})