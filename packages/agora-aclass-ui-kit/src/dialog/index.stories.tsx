import React from 'react'
import { action } from '@storybook/addon-actions';
import {api, Dialog , PromptDialog} from '.';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

export default {
  title: '对话框',
}

const usePromptDialogs = makeStyles((theme: Theme) => createStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
}))

export const PromptDialogView = () => {
  return (
    <>
      <PromptDialog
        visible={true}
        confirmText="确定"
        text="课程已结束！"
        headerText="提示信息"
      ></PromptDialog>
    </>
  )
}

export const ExitClassroomDialog = () => {
  return (
    <Dialog
      visible={true}
      text="Do you want to exit classroom?"
      confirmText="Yes"
      cancelText="No"
    ></Dialog>
  )
}

export const EndClassDialog = () => {
  return (
    <Dialog
      visible={true}
      text="class is not finished, do you sure want to exit?"
      confirmText="Yes"
      cancelText="No"
    ></Dialog>
  )
}

export const QuitRoomDialogA = () => {
  return (
    <Dialog
      visible={true}
      text="是否退出教室？"
      confirmText="确定"
      cancelText="取消"
    ></Dialog>
  )
}

export const QuitRoomDialogB = () => {
  return (
    <Dialog
      visible={true}
      text="课程还未结束，是否确定退出教室？"
      confirmText="退出教室"
      cancelText="在想一下"
    ></Dialog>
  )
}

// WIP: add action
// export const Demo = () => {
//   try {
//     //@ts-ignore
//     window.api = api
//     api.add({
//       text: '2333',
      
//     })
//   } catch (err) {
//     console.log(err)
//   }

//   return (
//     <div>test</div>
//   )
// }