import React from 'react'
import { DiskButton } from './control/disk-button'
import { DiskManagerDialog } from './dialog/manager'
import { Loading } from './control/loading'
import TableEmpty from "./dialog/table-empty";
import { UploadFile } from '../upload/index'

export default {
  title: '网盘'
}

export const NetworkDisk = () => {

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    console.log('close network disk', open)
  }

  const onReload = () => {
    console.log('reload network disk')
  }

  const onUpload = () => {
    console.log('upload file')
  }

  const uploadComponent = () => {
    return (
      <UploadFile 
        showUploadList={false}
        uploadButton={() => <DiskButton id="disk-button-upload" onClick={onUpload} color={'primary'} text={'上传'} />}
      />
    )
  }

  const donwloadAllComponent = () => {
    return (
      <DiskButton id="disk-button-donwload-all" style={{ marginRight: 20 }} color={'primary'} text={'全部下载'} />
    )
  }

  const deleteAllCache = () => {
    return (
      <DiskButton id="disk-button-clear-storage" color={'secondary'} text={'清空缓存'} />
    )
  }

  const singleDonwload = () => {
    return (
      <DiskButton id="disk-button-download" style={{ marginRight: 20 }} text={'下载'} color={'primary'} />
    )
  }

  const singleDelete = () => {
    return (
      <DiskButton id="disk-button-download" style={{ marginRight: 20 }} text={'下载'} color={'primary'} />
    )
  }

  return (
    <DiskManagerDialog
      fullWidth={false}
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
      uploadComponent={uploadComponent()}
      donwloadAllComponent={donwloadAllComponent()}
      deleteAllCacheComponent={deleteAllCache()}
      singleDownloadComponent={singleDonwload()}
      singleDeleteComponent={singleDelete()}
    />
  )
}

NetworkDisk.args = {

}

export const PrimaryButton = (props: any) => {
  return (
    <DiskButton onClick={props.onClick} color={props.color} text={props.text}></DiskButton>
  )
}

PrimaryButton.args = {
  color: 'primary',
  text: '上传',
}

export const SecondaryButton = (props: any) => {
  return (
    <DiskButton onClick={props.onClick} color={props.color} text={props.text}></DiskButton>
  )
}

SecondaryButton.args = {
  color: 'secondary',
  text: '删除',
}

export const DangerButton = (props: any) => {
  return (
    <DiskButton onClick={props.onClick} color={props.color} text={props.text}></DiskButton>
  )
}

DangerButton.args = {
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

export const Empty = () => {
  return (
    <TableEmpty />
  )
}