import { BusinessExceptions } from '@/infra/biz-error'
import { useBoardContext, useRecordingContext, useGlobalContext, useRoomContext, useRoomDiagnosisContext, useScreenShareContext } from 'agora-edu-core'
import { GenericError, GenericErrorWrapper, ScreenShareType } from 'agora-rte-sdk'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useState } from 'react'
import { CloudDriverContainer } from '~capabilities/containers/board/cloud-driver'
import { UserListContainer, StudentUserListContainer } from '~capabilities/containers/board/user-list'
import { ScreenShareContainer } from '~capabilities/containers/screen-share'
import { SettingContainer } from '~capabilities/containers/setting'
import { Button, Modal, t, transI18n } from '~ui-kit'


export type BaseDialogProps = {
  id: string
}

export const KickDialog: React.FC<BaseDialogProps & {userUuid: string, roomUuid: string}> = observer(({ id, userUuid, roomUuid }) => {

  const {removeDialog} = useGlobalContext()
  const {roomInfo, kickOutOnce, kickOutBan} = useRoomContext()

  const [type, setType] = useState<string>('kicked_once')

  const onOK = useCallback(async () => {
    if (type === 'kicked_once') {
      await kickOutOnce(userUuid, roomInfo.roomUuid)
      removeDialog(id)
    }
    if (type === 'kicked_ban') {
      await kickOutBan(userUuid, roomInfo.roomUuid)
      removeDialog(id)
    }
  }, [type, id, userUuid, roomInfo.roomUuid, kickOutOnce, kickOutBan])

  return (
    <Modal
      width={300}
      title={transI18n('kick.kick_out_student')}
      onOk={onOK}
      onCancel={() => {
        removeDialog(id)
      }}
      footer={
        [
          <Button type={'secondary'} action="cancel">{t('toast.cancel')}</Button>,
          <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
        ]
      }
    >
      <div className="radio-container">
        <label className="customize-radio">
          <input type="radio" name="kickType" value="kicked_once" checked={type === 'kicked_once'} onChange={() => setType('kicked_once')} />
          <span className="ml-2">{transI18n('radio.kicked_once')}</span>
        </label>
        <label className="customize-radio">
          <input type="radio" name="kickType" value="kicked_ban" onChange={() => setType('kicked_ban')} />
          <span className="ml-2">{transI18n('radio.ban')}</span>
        </label>
      </div>
    </Modal>
  )
})

export const SettingDialog: React.FC<BaseDialogProps> = observer(({ id }) => {
  return (
    <SettingContainer id={id} />
  )
})

export const CloudDriverDialog: React.FC<BaseDialogProps> = observer(({ id }) => {
  const {removeDialog} = useGlobalContext()
  return (
    <CloudDriverContainer onClose={() => {
      removeDialog(id)
    }} />
  )
})

export const GenericErrorDialog: React.FC<BaseDialogProps & { error: GenericError }> = observer(({ id, error }) => {
  const {removeDialog} = useGlobalContext()

  const {destroyRoom} = useRoomContext()

  const onCancel = async () => {
    removeDialog(id)
    await destroyRoom()
  }

  const onOk = async () => {
    removeDialog(id)
    await destroyRoom()
  }

  return (
    <Modal
      onOk={onOk}
      onCancel={onCancel}
      footer={[
        <Button type={'primary'} action="ok">{transI18n('toast.confirm')}</Button>,
      ]}
      title={BusinessExceptions.getErrorTitle(error)}
    >
      {BusinessExceptions.getErrorText(error)}
    </Modal>
  )
})

export const UserListDialog: React.FC<BaseDialogProps> = observer(({ id }) => {

  const {
    setTool,
    room,
    hasPermission
  } = useBoardContext()

  const {removeDialog} = useGlobalContext()

  const onCancel = useCallback(() => {
    if (room) {
      if (hasPermission) {
        const tool = room.state.memberState.currentApplianceName
        setTool(tool)
      } else {
        setTool('reset')
      }
    }
    removeDialog(id)
  }, [room, removeDialog, setTool, hasPermission])

  return (
    <UserListContainer onClose={onCancel} />
  )
})

export const StudentUserListDialog: React.FC<BaseDialogProps> = observer(({ id }) => {
  const {
    setTool,
    room,
    hasPermission
  } = useBoardContext()

  const {removeDialog} = useGlobalContext()

  const onCancel = useCallback(() => {
    if (room) {
      if (hasPermission) {
        const tool = room.state.memberState.currentApplianceName
        setTool(tool)
      } else {  
        setTool('reset')
      }
    }
    removeDialog(id)
  }, [room, removeDialog, setTool, hasPermission])

  return (
    <StudentUserListContainer onClose={onCancel} />
  )
})

export const OpenShareScreen: React.FC<BaseDialogProps> = observer(({ id }) => {
  const {
    removeScreenShareWindow
  } = useRoomContext()

  const {
    removeDialog
  } = useGlobalContext()

  const {
    startNativeScreenShareBy,
    customScreenSharePickerType
  } = useScreenShareContext()

  const [shareId, setShareId] = useState<any>('')

  const onConfirm = useCallback(async () => {
    await startNativeScreenShareBy(shareId, customScreenSharePickerType)
  }, [shareId])

  const onOK = async () => {
    await onConfirm()
    removeDialog(id)
  }

  const onCancel = () => {
    removeScreenShareWindow()
    removeDialog(id)
  }

  return (
    <Modal
      width={662}
      onOk={onOK}
      onCancel={onCancel}
      footer={[
        <Button type={'secondary'} action="cancel">{t('toast.cancel')}</Button>,
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
      ]}
      title={t('toast.screen_share')}
    >
      <ScreenShareContainer
        windowId={shareId}
        setWindowId={setShareId}
      />
    </Modal>
  )
})

export const CloseConfirm: React.FC<BaseDialogProps & { resourceUuid: string }> = observer(({ id, resourceUuid }) => {

  const {removeDialog} = useGlobalContext()

  const {closeMaterial} = useBoardContext()

  const onOK = async () => {
    await closeMaterial(resourceUuid)
    removeDialog(id)
  }

  const onCancel = () => {
    removeDialog(id)
  }

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={[
        <Button type={'secondary'} action="cancel">{t('toast.cancel')}</Button>,
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
      ]}
      title={t('toast.close_ppt')}
    >
      <p>{t('toast.sure_close_ppt')}</p>
    </Modal>
  )
})

export const KickEnd: React.FC<BaseDialogProps> = observer(({id}) => {

  const {
    removeDialog
  } = useGlobalContext()

  const {
    destroyRoom
  } = useRoomContext()

  const onOK = async () => {
    await destroyRoom()
    removeDialog(id)
  }

  const onCancel = async () => {
    await destroyRoom()
    removeDialog(id)
  }

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={[
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
      ]}
      title={t('toast.kick_by_other_side')}>
      <p>{t('toast.quit_from_room')}</p>
    </Modal>
  )
})

export const KickedEnd: React.FC<BaseDialogProps> = observer(({id}) => {

  const {
    removeDialog
  } = useGlobalContext()

  const {
    destroyRoom
  } = useRoomContext()

  const onOK = async () => {
    await destroyRoom()
    removeDialog(id)
  }

  const onCancel = async () => {
    await destroyRoom()
    removeDialog(id)
  }

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={[
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
      ]}
      title={t('toast.kick_by_teacher')}>
      <p>{t('toast.quit_from_room')}</p>
    </Modal>
  )
})

export const RoomEndNotice: React.FC<BaseDialogProps> = observer(({id}) => {
  const {removeDialog} = useGlobalContext()

  const {destroyRoom} = useRoomContext()

  const handleConfirm = async () => {
    destroyRoom()
  }

  return (
    <Modal
      onOk={async () => {
        await handleConfirm()
        removeDialog(id)
      }}
      footer={[
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>
      ]}
      title={t('toast.end_class')}>
      <p>{t('toast.quit_from_room')}</p>
    </Modal>
  )
})

export const RoomEnd: React.FC<BaseDialogProps> = observer(({id}) => {

  const {navigationState} = useRoomDiagnosisContext()

  const {destroyRoom} = useRoomContext()

  const {removeDialog} = useGlobalContext()

  const isStarted = navigationState.isStarted

  const onOK = async () => {
    await destroyRoom()
    removeDialog(id)
  }

  const onCancel = () => {
    removeDialog(id)
  }

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={[
        <Button type={isStarted ? 'primary' : 'secondary'} action="cancel">{t('toast.cancel')}</Button>,
        <Button type={!isStarted ? 'primary' : 'secondary'} action="ok">{t('toast.confirm')}</Button>,
      ]}
      title={t('toast.end_class')}>
      <p>{t('toast.quit_from_room')}</p>
    </Modal>
  )
})

export const Exit: React.FC<BaseDialogProps> = observer(({id}) => {

  const {destroyRoom} = useRoomContext()

  const {removeDialog} = useGlobalContext()

  const onOK = async () => {
    await destroyRoom()
    removeDialog(id)
  }

  const onCancel = () => {
    removeDialog(id)
  }

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={[
        <Button type={'ghost'} action="cancel">{t('toast.cancel')}</Button>,
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>,
      ]}
      title={t('toast.leave_room')}>
      <p style={{
        fontSize: 13, 
        color: 'rgb(88, 99, 118)',
        padding: '15px 0'
      }}>{t('toast.quit_room')}</p>
    </Modal>
  )
})

export const Record: React.FC<BaseDialogProps & {starting: boolean}> = observer(({id, starting}) => {

  console.log('Record isRecording ', starting)
  const { removeDialog, addToast } = useGlobalContext()
  const {
    startRecording,
    stopRecording
  } = useRecordingContext()

  const recordingTitle = starting ? 'toast.stop_recording.title' : 'toast.start_recording.title'

  const recordingContent = starting ? 'toast.stop_recording.body' : 'toast.start_recording.body'

  return (
    <Modal
      onOk={async () => {
        try {
          if (starting) {
            await stopRecording()
          } else {
            await startRecording()
          }
          const recordingToast = starting ? 'toast.stop_recording.success' : 'toast.start_recording.success'
          addToast(transI18n(recordingToast))
          removeDialog(id)
        }catch(err) {
          const wrapperError = GenericErrorWrapper(err)
          addToast(BusinessExceptions.getErrorText(wrapperError), 'error')
          removeDialog(id)
        }
      }}
      onCancel={() => {
        removeDialog(id)
      }}
      footer={[
        <Button type={'ghost'} action="cancel">{t('toast.cancel')}</Button>,
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>
      ]}
      title={transI18n(recordingTitle)}
    >
      <p style={{fontSize: 13, color: '#586376', padding: '15px 0'}}>{transI18n(recordingContent)}</p>
    </Modal>
  )
})

export const DialogContainer: React.FC<any> = observer(() => {

  const { dialogQueue, dialogEventObserver, addDialog } = useGlobalContext()

  const dialogMap = {
    'screen-share': () => addDialog(OpenShareScreen),
    'kicked-end': () => addDialog(KickedEnd),
    'room-end-notice': () => addDialog(RoomEndNotice),
    'kick-end': () => addDialog(KickEnd),
    'generic-error-dialog': (props: any) => addDialog(GenericErrorDialog, {...props}),
  }

  useEffect(() => {
    dialogEventObserver.subscribe((evt: any) => {
      console.log('dialogEventObserver # evt ', evt)
      const dialogOperation = dialogMap[evt.eventName]

      if (dialogOperation) {
        dialogOperation(evt.props)
      }
    })
    return () => {
      dialogEventObserver.complete()
    }
  }, [dialogEventObserver])

  const cls = classnames({
    [`rc-mask`]: !!dialogQueue.length,
  })

  return (
    <div className={cls}>
      {
        dialogQueue.map(({ id, component: Component, props }: any) => (
          <div key={id} className="fixed-container">
            <Component {...props} id={id} />
          </div>
        ))
      }
    </div>
  )
})