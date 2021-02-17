import { observer } from 'mobx-react'
import React, { useCallback, useRef, useState } from 'react'
import { DiskManagerDialog, UploadFile, DiskButton } from 'agora-aclass-ui-kit'
import { useBoardStore } from '@/hooks'
import MD5 from 'js-md5'
import { HandleUploadType } from '@/services/upload-service'
import { PPTKind } from 'white-web-sdk'
import { EduLogger } from 'agora-rte-sdk'
import { Progress } from '@/components/progress/progress'
import { useEffect } from 'react'


const UploadingProgress = observer((props: any) => {

  const boardStore = useBoardStore()

  const {fileLoading, uploadingProgress} = boardStore

  console.log("正在上传ing ", fileLoading, uploadingProgress)

  return (
    fileLoading ? 
    <Progress title={`${uploadingProgress}`}></Progress>
    : null
  )
})

const NetworkDisk = observer((props: any) => {

  const boardStore = useBoardStore()

  const handleClose = () => {
    console.log('close network disk', props.openDisk)
    props.setOpenDisk(false)
  }

  const onReload = () => {
    console.log('reload network disk')
  }

  const uploadRequest = async ({action, data, file, filename, headers, onError, onProgress, onSuccess, withCredentials} : any) => {
    const resourceName = MD5(`${file}`)
    const ext = file.name.split(".").pop()
    const isDynamic = ext === 'pptx'

    // const convertConfig = {
    //   converting: isDynamic ? true : false,
    //   // conversion: {
    //   //   type: isDynamic ? 'dynamic' : 'static',
    //   //   scale: 1.2,
    //   //   preview: false,
    //   //   outputFormat: isDynamic ? '' : ext
    //   // }
    // }
    const payload = {
      file: file,
      fileSize: file.size,
      ext: file.name.split(".").pop(),
      resourceName: resourceName,
      converting: isDynamic ? true : false,
      kind: PPTKind.Dynamic,
      pptConverter: boardStore.boardClient.client.pptConverter(boardStore.room.roomToken)
    } as HandleUploadType
    if (ext === 'pptx') {
      EduLogger.info("upload dynamic pptx")
    }
    await boardStore.handleUpload(payload)
  }

  const onUpload = (evt: any) => {
    console.log('upload file', evt)
    return evt
    // await boardStore.handleUpload({
    //   file: file,
    //   resourceName: MD5(`${file}`),
    //   onProgress: (evt: any) => {
    //     console.log("converting evt: ", evt)
    //   }
    // })
  }

  const uploadComponent = () => {
    return (
      <UploadFile
        customRequest={uploadRequest}
        showUploadList={false}
        uploadButton={() => <DiskButton onClick={onUpload} id="disk-button-upload" color={'primary'} text={'上传'} />}
        progressComponents={() => <UploadingProgress />}
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
      publicList={boardStore.publicResources}
      privateList={boardStore.personalResources}
      downloadList={boardStore.allResources}
      uploadComponent={uploadComponent()}
    />
  )
})

export { NetworkDisk }