import { useAppStore, useBoardStore, useRoomStore, useUIStore } from '@/hooks'
import { BoardStore } from '@/stores/app'
import { DialogType } from '@/stores/app/ui'
import { Button, Modal } from 'agora-scenario-ui-kit'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import React, { useCallback } from 'react'

export const CloseConfirm = observer(({id, resourceName}: {id: string, resourceName: string}) => {

  const uiStore = useUIStore()
  const boardStore = useBoardStore()

  const onOK = async () => {
    boardStore.closeMaterial(resourceName)
    uiStore.removeDialog(id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={'secondary'} action="cancel">取消</Button>,
      <Button type={'primary'} action="ok">确认</Button>,
    ]
  }, [])

  return (
    <Modal
    onOk={onOK}
    onCancel={onCancel}
    footer={ButtonGroup()}
    title="关闭当前PPT">
    <p>你确定要离开关闭吗？</p>
    </Modal>
  )
})

export const KickEnd = observer((id: string) => {
  const roomStore = useRoomStore()

  const navigationState = roomStore.navigationState

  const uiStore = useUIStore()
  const isStarted = navigationState.isStarted

  const onOK = async () => {
    uiStore.removeDialog(id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={isStarted ? 'primary' : 'secondary'} action="cancel">取消</Button>,
      <Button type={!isStarted ? 'primary' : 'secondary'} action="ok">确认</Button>,
    ]
  }, [isStarted])
  return (
    <Modal
    onOk={onOK}
    onCancel={onCancel}
    footer={ButtonGroup()}
    title="下课确认">
    <p>你确定要离开教室吗？</p>
    </Modal>
  )
})

export const RoomEnd = observer((id: string) => {
  const roomStore = useRoomStore()

  const uiStore = useUIStore()
  const isStarted = roomStore.navigationState.isStarted

  const onOK = async () => {
    uiStore.removeDialog(id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={isStarted ? 'primary' : 'secondary'} action="cancel">取消</Button>,
      <Button type={!isStarted ? 'primary' : 'secondary'} action="ok">确认</Button>,
    ]
  }, [isStarted])
  return (
    <Modal
      onOk={onOK}
      onCancel={onCancel}
      footer={ButtonGroup()}
      title="下课确认">
    <p>你确定要离开教室吗？</p>
    </Modal>
  )
})

export const Exit = observer((id: string) => {
  const roomStore = useRoomStore()
  const appStore = useAppStore()

  const uiStore = useUIStore()
  const isStarted = roomStore.navigationState.isStarted

  const onOK = async () => {
    await appStore.destroyRoom()
    uiStore.removeDialog(id)
  }

  const onCancel = () => {
    uiStore.removeDialog(id)
  }

  const ButtonGroup = useCallback(() => {
    return [
      <Button type={isStarted ? 'primary' : 'secondary'} action="cancel">取消</Button>,
      <Button type={!isStarted ? 'primary' : 'secondary'} action="ok">确认</Button>,
    ]
  }, [isStarted])
  return (
    <Modal
    onOk={onOK}
    onCancel={onCancel}
    footer={ButtonGroup()}
    title="下课确认">
    <p>你确定要离开教室吗？</p>
    </Modal>
  )
})


export const DialogContainer: React.FC<any> = observer(() => {
  const uiStore = useUIStore()

  const {dialogQueue} = uiStore

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


export const ToastContainer = observer(() => {
  return (
    <div></div>
  )
})