import React from 'react'
import { action } from '@storybook/addon-actions';
import {dialogManager, Dialog , PromptDialog} from '.';
import { Button } from '../button';

export default {
  title: '对话框',
}

const PromptTemplate = (args: any) => <PromptDialog {...args} />

const DialogTemplate = (args: any) => <Dialog {...args} />

let uid = 0

const arrays = []

export const Dialogs = () => {
  // const 
  const onClick = () => {
    action('click button')
    ++uid
    let manager = dialogManager.add({
      title: `test_${uid}`,
      contentText: 'test',
      confirmText: 'ok',
      visible: true,
      cancelText: 'cancel',
      onConfirm: () => {
        action('click confirm')
      },
      onClose: () => {
        action('click close')
        manager.destroy()
      }
    })

    arrays.push(manager)
  }

  const onRemove = () => {
    
  }
  return (
    <Button color="primary" text="click me" style={{position: 'fixed', zIndex: 9999}} onClick={onClick}></Button>
    // <Button color="primary" text="delete " style={{position: 'fixed', zIndex: 9999}} onClick={onClick}></Button>
  )
}

// const usePromptDialogs = makeStyles((theme: Theme) => createStyles({
//   root: {
//     backgroundColor: 'rgba(0, 0, 0, 0.5)'
//   }
// }))

export const PromptDialogView = PromptTemplate.bind({})
PromptDialogView.args = {
  visible: true,
  confirmText: '确定',
  contentText: '课程已结束',
  title: '提示信息'
}


export const ExitClassroomDialog = DialogTemplate.bind({})
ExitClassroomDialog.args = {
  visible: true,
  text: 'Do you want to exit classroom?',
  confirmText: "Yes",
  cancelText: "No"
}

export const EndClassDialog = DialogTemplate.bind({})
EndClassDialog.args = {
  visible: true,
  text: 'class is not finished, do you sure want to exit?',
  confirmText: "Yes",
  cancelText: "No"
}

export const QuitRoomDialogA = DialogTemplate.bind({})
QuitRoomDialogA.args = {
  visible: true,
  text: "是否退出教室？",
  confirmText: "确定",
  cancelText: "取消",
}

export const QuitRoomDialogB = DialogTemplate.bind({})
QuitRoomDialogB.args = {
  visible: true,
  text: "课程还未结束，是否确定退出教室？",
  confirmText: "退出教室",
  cancelText: "在想一下",
}