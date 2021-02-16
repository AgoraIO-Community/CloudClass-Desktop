import { observer } from 'mobx-react'
import React, { useCallback, useRef, useState } from 'react'
import { DiskManagerDialog, UploadFile, DiskButton } from 'agora-aclass-ui-kit'

const NetworkDisk = observer((props: any) => {
  const handleClose = () => {
    console.log('close network disk', props.openDisk)
    props.setOpenDisk(false)
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

  return (
    <DiskManagerDialog
      fullWidth={false}
      visible={props.openDisk}
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
    />
  )
})

export { NetworkDisk }