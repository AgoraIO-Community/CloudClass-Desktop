import React from 'react'
import { action } from '@storybook/addon-actions';
import {ADialog , APromptDialog} from '.';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

export default {
  title: '对话框',
}

const usePromptDialogs = makeStyles((theme: Theme) => createStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
}))

export const PromptDialog = () => {
  return (
    <>
      <APromptDialog
        confirmText="确定"
        text="课程已结束！"
        headerText="提示信息"
      ></APromptDialog>
      {/* <APromptDialog
        confirmText="Yes"
        text="class is ended"
        headerText="notice"
      ></APromptDialog>
      <APromptDialog
        confirmText="Yes"
        text="class is ended"
        headerText="notice"
      ></APromptDialog>
      <APromptDialog
        confirmText="Yes"
        text="class is ended"
        headerText="notice"
      ></APromptDialog>
      <APromptDialog
        confirmText="Yes"
        text="class is ended"
        headerText="notice"
      ></APromptDialog> */}
    </>
  )
}

export const ExitClassroomDialog = () => {
  return (
    <ADialog
      text="Do you want to exit classroom?"
      confirmText="Yes"
      cancelText="No"
    ></ADialog>
  )
}

export const EndClassDialog = () => {
  return (
    <ADialog
      text="class is not finished, do you sure want to exit?"
      confirmText="Yes"
      cancelText="No"
    ></ADialog>
  )
}

export const QuitRoomDialogA = () => {
  return (
    <ADialog
      text="是否退出教室？"
      confirmText="确定"
      cancelText="取消"
    ></ADialog>
  )
}

export const QuitRoomDialogB = () => {
  return (
    <ADialog
      text="课程还未结束，是否确定退出教室？"
      confirmText="退出教室"
      cancelText="在想一下"
    ></ADialog>
  )
}