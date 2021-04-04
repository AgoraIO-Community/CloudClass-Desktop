import { useUIStore } from '@/hooks'
import { DialogType } from '@/stores/app/ui'
import { BusinessExceptions } from '@/utils/biz-error'
import { GenericError, GenericErrorWrapper } from 'agora-rte-sdk'
import { Modal, t, Button, transI18n } from 'agora-scenario-ui-kit'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'
import { useCloseConfirmContext, useDialogContext, useExitContext, useKickEndContext, useOpenDialogContext, useRoomEndContext, useErrorContext, useSettingContext, useRecordingContext } from '../hooks'
import { ScreenShareContainer } from './screen-share'
import { SettingContainer } from './setting'
import { UserListContainer } from './user-list'

export const SettingDialog = observer(({ id }: { id: string }) => {
  return (
    <SettingContainer id={id} />
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
  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useOpenDialogContext(id)
  return (
    <Modal
      width={662}
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.screen_share')}
    >
      <UserListContainer />
    </Modal>
  )
})

export const OpenShareScreen = observer(({ id, resourceName }: { id: string, resourceName: string }) => {

  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useOpenDialogContext(id)
  return (
    <Modal
      width={662}
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title={t('toast.screen_share')}
    >
      <ScreenShareContainer />
    </Modal>
  )
})

export const CloseConfirm = observer(({ id, resourceName }: { id: string, resourceName: string }) => {
  const {
    onOK,
    onCancel,
    ButtonGroup
  } = useCloseConfirmContext(id, resourceName)
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