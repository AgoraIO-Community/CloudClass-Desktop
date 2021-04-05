import { useUIStore } from '@/hooks'
import { DialogType } from '@/stores/app/ui'
import { BusinessExceptions } from '@/utils/biz-error'
import { GenericError, GenericErrorWrapper } from 'agora-rte-sdk'
import { Button, Modal, t, transI18n } from 'agora-scenario-ui-kit'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import React, { useCallback, useState } from 'react'
import { useCloseConfirmContext, useDialogContext, useErrorContext, useExitContext, useKickDialogContext, useKickEndContext, useOpenDialogContext, useRecordingContext, useRoomEndContext } from '../hooks'
import { CloudDriverContainer } from './cloud-driver'
import { ScreenShareContainer } from './screen-share'
import { SettingContainer } from './setting'
import { UserListContainer } from './user-list'

export const KickDialog = observer(({ id, userUuid, roomUuid }: { id: string, userUuid: string, roomUuid: string }) => {

  const uiStore = useUIStore()

  const [type, setType] = useState<string>('kicked_once')
  const {kickOutOnce, kickOutBan} = useKickDialogContext()

  const onOK = useCallback(async () => {
    if (type === 'kicked_once') {
      await kickOutOnce(userUuid, roomUuid)
      uiStore.removeDialog(id)
    }
    if (type === 'kicked_ban') {
      await kickOutBan(userUuid, roomUuid)
      uiStore.removeDialog(id)
    }
  }, [type, id, userUuid, roomUuid, kickOutOnce, kickOutBan])

  return (
    <Modal
      width={300}
      title={transI18n('kick.kick_out_student')}
      onOk={onOK}
      onCancel={() => {
        uiStore.removeDialog(id)
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

export const SettingDialog = observer(({ id }: { id: string }) => {
  return (
    <SettingContainer id={id} />
  )
})

export const CloudDriverDialog = observer(({ id }: { id: string }) => {
  const uiStore = useUIStore()
  return (
    <CloudDriverContainer onClose={() => {
      uiStore.removeDialog(id)
    }} />
  )
})

export const GenericErrorDialog = observer(({ id, error }: { id: string, error: GenericError }) => {
  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useErrorContext(id)

  const {errCode='', message=''} = GenericErrorWrapper(error)
  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('course.join_failed')}
    >
      {transI18n(BusinessExceptions.getReadableText(errCode), {errCode, message})}
    </Modal>
  )
})

export const UserListDialog = observer(({ id }: { id: string }) => {
  const uiStore = useUIStore()
  return (
    <UserListContainer onClose={() => {
      uiStore.removeDialog(id)
    }} />
  )
})

export const OpenShareScreen = observer(({ id, resourceName }: { id: string, resourceName: string }) => {

  const {
    onOK,
    onCancel,
    ButtonGroup,
    setWindowId,
    windowId,
  } = useOpenDialogContext(id)
  return (
    <Modal
      width={662}
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.screen_share')}
    >
      <ScreenShareContainer
        windowId={windowId}
        setWindowId={setWindowId}
      />
    </Modal>
  )
})

export const CloseConfirm = observer(({ id, resourceUuid }: { id: string, resourceUuid: string }) => {
  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useCloseConfirmContext(id, resourceUuid)
  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.close_ppt')}
    >
      <p>{t('toast.sure_close_ppt')}</p>
    </Modal>
  )
})

export const KickEnd = observer((id: string) => {

  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useKickEndContext(id)

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.kick_by_other_side')}>
      <p>{t('toast.quit_from_room')}</p>
    </Modal>
  )
})

export const KickedEnd = observer((id: string) => {

  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useKickEndContext(id)

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.kick_by_teacher')}>
      <p>{t('toast.quit_from_room')}</p>
    </Modal>
  )
})

export const RoomEnd = observer((id: string) => {

  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useRoomEndContext(id)

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.end_class')}>
      <p>{t('toast.quit_from_room')}</p>
    </Modal>
  )
})

export const Exit = observer((id: string) => {

  const { onOK, onCancel, ButtonGroup } = useExitContext(id)

  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.leave_room')}>
      <p>{t('toast.quit_room')}</p>
    </Modal>
  )
})

export const Record = observer(({id, starting}:{id:string, starting: boolean}) => {
  const uiStore = useUIStore()
  const {
    onStartRecording,
    onStopRecording
  } = useRecordingContext()
  return (
    <Modal
      onOk={async () => {
        uiStore.removeDialog(id)
        try {
          await (starting ? onStartRecording() : onStopRecording())
          uiStore.addToast(transI18n(starting?'toast.start_recording.success':'toast.stop_recording.success'))
        }catch(err) {
          const {errCode='', message=''} = GenericErrorWrapper(err)
          uiStore.addToast(transI18n(BusinessExceptions.getReadableText(err.errCode), {errCode, message}), 'error')
        }
      }}
      onCancel={() => {
        uiStore.removeDialog(id)
      }}
      footer={[
        <Button type={'secondary'} action="cancel">{t('toast.cancel')}</Button>,
        <Button type={'primary'} action="ok">{t('toast.confirm')}</Button>
      ]}
      title={starting ? transI18n('toast.start_recording.title') : transI18n('toast.stop_recording.title')}
    >
      <p>{starting ? transI18n('toast.start_recording.body') : transI18n('toast.stop_recording.body')}</p>
    </Modal>
  )
})


export const DialogContainer: React.FC<any> = observer(() => {

  const { dialogQueue } = useDialogContext()

  const cls = classnames({
    [`rc-mask`]: !!dialogQueue.length,
  })

  return (
    <div className={cls}>
      {
        dialogQueue.map(({ id, component: Component, props }: DialogType) => (
          <div key={id} className="fixed-container">
            <Component {...props} id={id} />
          </div>
        ))
      }
    </div>
  )
})