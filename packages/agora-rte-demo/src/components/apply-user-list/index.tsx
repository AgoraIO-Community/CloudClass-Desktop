import React, {Fragment, useCallback, useEffect, useMemo, useState} from 'react'
import { useExtensionStore, useMiddleRoomStore, useRoomStore, useUIStore } from "@/hooks"
import { observer } from 'mobx-react'
import {CustomIcon} from '@/components/icon'
import { Card, ClickAwayListener, List, ListItem } from '@material-ui/core';
import {Check, Close} from '@material-ui/icons';
import './index.scss';
import { t } from '@/i18n';

const MAX_LENGTH = 4
interface TickProps {
  tick: number
  className: string
}

interface StudentApplyCardProps {
  userName: string
  userUuid: string
  streamUuid: string
  state: boolean
}

const StudentApplyCard = observer((props: StudentApplyCardProps) => {
  const extensionStore = useExtensionStore()
  const uiStore = useUIStore()
  const [shake, setShake] = useState<boolean>(props.state)

  const handleClick = () => {
    setShake(false)
  }

  return (
    <ListItem
      // onClick={async (evt: any) => {
      //   await extensionStore.acceptApply(props.userUuid, props.streamUuid)
      // }}
    >
      <div className="user-item">{props.userName}</div>
      <div className={`icons-lecture-board-inactive ${shake ? "infinity-shake": ""}`} onClick={handleClick} />
      <div style={{width: "25px", cursor: "pointer", marginRight: "5px"}}>
        <Check onClick={() => {
          uiStore.showDialog({
            type: 'allowConfirm',
            option: {
              userUuid: props.userUuid,
              streamUuid: props.streamUuid,
            },
            message: t('allow_confirm')
          })
        }}/>
      </div>
      <div style={{width: "25px", cursor: "pointer"}}>
        <Close onClick={() => {
          uiStore.showDialog({
            type: 'rejectConfirm',
            option: {
              userUuid: props.userUuid
            },
            message: t('reject_confirm')
          })
        }}/>
      </div>
    </ListItem>
  )
})

export const ApplyUserList = observer(() => {
  const middleRoomStore = useMiddleRoomStore()
  const extensionStore = useExtensionStore()
  const uiStore = useUIStore()

  useEffect(() => {
    if (uiStore.visibleShake) {
      setTimeout(() => {
        uiStore.hideShakeHands()
      }, 500)
    }
  }, [uiStore.visibleShake, uiStore.hideShakeHands])

  const handleStudentClick = async (evt: any) => {
    if (middleRoomStore) {

    }
  }

  const handleClickOutSide = (evt: any) => {
    extensionStore.hideApplyUserList()
  }

  const handleTeacherClick = (evt: any) => {
    extensionStore.toggleApplyUserList()
  }

  const onMouseDown = useCallback(() => {
    if (!extensionStore.inTick) {
      extensionStore.startTick()
    }
  }, [extensionStore.inTick])

  const onMouseOut = useCallback(() => {
     extensionStore.stopTick()
  }, [extensionStore.inTick])

  const onMouseUp = useCallback(() => {
    extensionStore.stopTick()
  }, [extensionStore.inTick])

  const activeClassName = useMemo(() => {
    if (extensionStore.coVideo) {
      // 禁用
      return "disable_hands_up"
    } else {
      if (middleRoomStore.didHandsUp) {
        // 可取消
        return  "inactive_hands_up"
      }
      // 默认
      return "active_hands_up"
    }
  }, [extensionStore.coVideo, middleRoomStore.didHandsUp])

  return (
    <Fragment>
    {extensionStore.showStudentHandsTool  ?
    <div className="tool-kit hand_tools">
      <>
      <div className="student_hand_tools"
        onMouseOut={onMouseOut}
      >
        <div className={`student-apply 
        ${activeClassName}
        ${extensionStore.inTick ? 'bg-white' : ''}`}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {extensionStore.inTick ?
            extensionStore.tick / 1000 : null}
        </div>
      </div>
      </>
    </div> : null}
    {extensionStore.showTeacherHandsTool ?
      <div className="tool-kit teacher_hand_tools">
        <ClickAwayListener onClickAway={handleClickOutSide}>
          <div>
            <CustomIcon className={`active_hands_up ${uiStore.visibleShake ? 'shake' : '' }`} onClick={handleTeacherClick} />
          </div>
        </ClickAwayListener>
        {extensionStore.applyUsers.slice(0, 4).length}/{MAX_LENGTH}
        {extensionStore.visibleUserList ?
        <div className="apply-user-list">
          <Card>
            <List disablePadding={true}>
            {extensionStore.applyUsers.slice(0, 4).map((user, idx) => (
              <StudentApplyCard 
                key={idx}
                userName={user.userName}
                userUuid={user.userUuid}
                streamUuid={user.streamUuid}
                state={user.state}
              />
            ))}
            </List>
          </Card>
        </div> : null }
      </div>
    : null }
          
    </Fragment>
  )
})