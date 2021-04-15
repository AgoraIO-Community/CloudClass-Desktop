import { useUIStore } from '@/hooks'
import { DialogType } from '@/stores/app/ui'
import { BusinessExceptions } from '@/utils/biz-error'
import { GenericError, GenericErrorWrapper } from 'agora-rte-sdk'
import { Button, Modal, t, transI18n } from '~ui-kit'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import React, { useCallback, useState } from 'react'
import { useCloseConfirmContext, useDialogContext, useErrorContext, useExitContext, useKickDialogContext, useKickEndContext, useOpenDialogContext, useRecordingContext, useRoomEndContext, useRoomEndNoticeContext } from '../hooks'
import { CloudDriverContainer } from './cloud-driver'
import { ScreenShareContainer } from './screen-share'
import { SettingContainer } from './setting'
import { UserListContainer } from './user-list'

export type BaseDialogProps = {
  id: string
}

export const KickDialog: React.FC<BaseDialogProps & {userUuid: string, roomUuid: string}> = observer(({ id, userUuid, roomUuid }) => {

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

export const SettingDialog: React.FC<BaseDialogProps> = observer(({ id }) => {
  return (
    <SettingContainer id={id} />
  )
})

export const CloudDriverDialog: React.FC<BaseDialogProps> = observer(({ id }) => {
  const uiStore = useUIStore()
  return (
    <CloudDriverContainer onClose={() => {
      uiStore.removeDialog(id)
    }} />
  )
})

export const GenericErrorDialog: React.FC<BaseDialogProps & { error: GenericError }> = observer(({ id, error }) => {
  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useErrorContext(id)
  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={BusinessExceptions.getErrorTitle(error)}
    >
      {BusinessExceptions.getErrorText(error)}
    </Modal>
  )
})

export const UserListDialog: React.FC<BaseDialogProps> = observer(({ id }) => {
  const uiStore = useUIStore()
  return (
    <UserListContainer onClose={() => {
      uiStore.removeDialog(id)
    }} />
  )
})

export const OpenShareScreen: React.FC<BaseDialogProps> = observer(({ id }) => {

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

export const CloseConfirm: React.FC<BaseDialogProps & { resourceUuid: string }> = observer(({ id, resourceUuid }) => {
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

export const KickEnd: React.FC<BaseDialogProps> = observer(({id}) => {

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

export const KickedEnd: React.FC<BaseDialogProps> = observer(({id}) => {

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

export const RoomEndNotice: React.FC<BaseDialogProps> = observer(({id}) => {
  const uiStore = useUIStore()
  const {
    handleConfirm,
  } = useRoomEndNoticeContext(id)

  return (
    <Modal
      onOk={async () => {
        await handleConfirm()
        uiStore.removeDialog(id)
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

export const Exit: React.FC<BaseDialogProps> = observer(({id}) => {

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

export const Record: React.FC<BaseDialogProps & {starting: boolean}> = observer(({id, starting}) => {
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
          uiStore.addToast(transI18n(starting ? 'toast.start_recording.success' : 'toast.stop_recording.success'))
        }catch(err) {
          const wrapperError = GenericErrorWrapper(err)
          uiStore.addToast(BusinessExceptions.getErrorText(wrapperError), 'error')
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


export const DialogContainer: React.FC<{}> = observer(() => {

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