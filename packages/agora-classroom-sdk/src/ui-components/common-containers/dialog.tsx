import { DialogType } from '@/stores/app/ui'
import { Modal, t } from 'agora-scenario-ui-kit'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'
import { useCloseConfirmContext, useDialogContext, useExitContext, useKickEndContext, useOpenDialogContext, useRoomEndContext } from '../hooks'
import { ScreenShareContainer } from './screen-share'

export const OpenShareScreen = observer(({id, resourceName}: {id: string, resourceName: string}) => {

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
      <ScreenShareContainer/>
    </Modal>
  )
})

export const CloseConfirm = observer(({id, resourceName}: {id: string, resourceName: string}) => {
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

  const {onOK, onCancel, ButtonGroup} = useExitContext(id)

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


export const DialogContainer: React.FC<any> = observer(() => {

  const {dialogQueue} = useDialogContext()

  const cls = classnames({
    [`rc-mask`]: !!dialogQueue.length,
  })

  return (
    <div className={cls}>
    {
      dialogQueue.map(({id, component: Component, props}: DialogType) => (
        <div key={id} className="fixed-container">
          <Component {...props} id={id} />
        </div>
      ))
    }
    </div>
  )
})