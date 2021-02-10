import React from 'react'
import { DiskButton } from './control/button'
import { DiskManagerDialog } from './dialog/manager'
import { Loading } from './control/loading'

export default {
  title: '网盘'
}

export const NetworkDisk = () => {

  const handleClose = () => {
    console.log('close network disk')
  }

  const onReload = () => {
    console.log('reload network disk')
  }

  const onUpload = () => {
    console.log('upload file')
  }

  return (
    <DiskManagerDialog
      visible={true}
      onClose={handleClose}
      dialogHeaderStyle={{
        minHeight: 40,
      }}
      paperStyle={{
        minWidth: 800,
        minHeight: 587,
        // padding: 20,
        // paddingTop: 0,
        borderRadius: 20,
        overflowY: 'hidden',
      }}
      dialogContentStyle={{
        background: 'transparent',
        borderRadius: 20,
        // display: 'flex',
        // flexDirection: 'column',
        // background: '#DEF4FF',
        // padding: 25
      }}
      questionBtnStyle={{
        top: 16,
        right: 80,
        color: 'white'
      }}
      closeBtnStyle={{
        top: 16,
        right: 18,
        color: 'white'
      }}
    >
    </DiskManagerDialog>
  )
}

NetworkDisk.args = {

}

export const UploadButton = (props: any) => {
  return (
    <DiskButton onClick={props.onClick} color={props.color} text={props.text}></DiskButton>
  )
}

UploadButton.args = {
  color: 'primary',
  text: '上传',
}

export const DeleteButton = (props: any) => {
  return (
    <DiskButton onClick={props.onClick} color={props.color} text={props.text}></DiskButton>
  )
}

DeleteButton.args = {
  color: 'secondary',
  text: '删除',
}

export const ReloadButton = (props: any) => {
  return (
    <DiskButton onClick={props.onClick} color={props.color} text={props.text}></DiskButton>
  )
}

ReloadButton.args = {
  color: 'danger',
  text: '重新加载',
}

export const DisabledButton = (props: any) => {
  return (
    <DiskButton color={props.color} text={props.text}></DiskButton>
  )
}

DisabledButton.args = {
  color: 'disabled',
  text: '禁止',
}

export const DiskLoading = (props: any) => {
  return (
    <Loading />
  )
}
