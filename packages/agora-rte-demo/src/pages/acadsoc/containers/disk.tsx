import { observer } from 'mobx-react'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { DiskManagerDialog, UploadFile, DiskButton } from 'agora-aclass-ui-kit'
import { useBoardStore, useDiskStore } from '@/hooks'
import MD5 from 'js-md5'
import { HandleUploadType } from '@/services/upload-service'
import { PPTKind } from 'white-web-sdk'
import { EduLogger } from 'agora-rte-sdk'
import { Progress } from '@/components/progress/progress'
import {t} from '@/i18n'
import styles from './disk.module.scss'
import IconRefresh from '../assets/icon-refresh.png'


const UploadingProgress = observer((props: any) => {

  const boardStore = useBoardStore()

  const {fileLoading, uploadingProgress} = boardStore

  console.log("正在上传ing ", fileLoading, uploadingProgress)

  return (
    <>
    {fileLoading ? 
    <Progress title={`${uploadingProgress}`}></Progress>
    : null}
    </>
  )
  
})

const NetworkDisk = observer((props: any) => {

  const boardStore = useBoardStore()
  const diskStore = useDiskStore()

  const handleClose = () => {
    console.log('close network disk', props.openDisk)
    props.setOpenDisk(false)
  }

  const onReload = () => {
    console.log('reload network disk')
  }

  const calcUploadFilesMd5 = async (file: File) => {
    return new Promise(resolve => {
      const time = new Date().getTime(); 
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file); //计算文件md5
      fileReader.onload = async() => {
          const md5Str = MD5(fileReader.result); 
          const et= new Date().getTime();
          resolve(md5Str);
      };
    });
  }

  const uploadRequest = async ({action, data, file, filename, headers, onError, onProgress, onSuccess, withCredentials} : any) => {
    const md5 = await calcUploadFilesMd5(file)
    const resourceUuid = MD5(`${md5}`)
    const name = file.name.split(".")[0]
    const ext = file.name.split(".").pop()
    const isDynamic = ext === 'pptx'


    const payload = {
      file: file,
      fileSize: file.size,
      ext: ext,
      resourceName: name,
      resourceUuid: resourceUuid,
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
  }

  const uploadComponent = () => {
    return (
      <UploadFile
        customRequest={uploadRequest}
        showUploadList={false}
        uploadButton={() => <DiskButton onClick={onUpload} id="disk-button-upload" color={'primary'} text={t('disk.upload')} />}
      />
    )
  }

  const donwloadAllComponent = () => {
    return (
      <DiskButton id="disk-button-donwload-all" style={{ marginRight: 20 }} color={'primary'} text={t('disk.downloadAll')} />
    )
  }

  const deleteAllCache = () => {
    return (
      <DiskButton id="disk-button-clear-storage" color={'secondary'} text={t('disk.clearCache')} />
    )
  }

  const singleDonwload = () => {
    return (
      <DiskButton id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.download')} color={'primary'} />
    )
  }

  const singleDelete = () => {
    return (
      <DiskButton id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.delete')} color={'primary'} />
    )
  }

  const handleDelete = async (selected: any) => {
    if (selected.length) {
      await boardStore.removeMaterialList(selected)
    }
  }

  const handleOpenCourse = async (resourceUuid: any) => {
    await boardStore.putSceneByResourceUuid(resourceUuid)
  }

  const handleRefresh = async () => {
    await boardStore.loadCloudResources()
  }

  const refreshComponent = () => {
    return (
      <img id="disk-button-refresh" style={{ cursor: 'pointer' }} onClick={handleRefresh} src={IconRefresh} className={styles.titleImg} />
    )
  }

  return (
    <>
    <DiskManagerDialog
      // todo add item
      // showOpenItem={boardStore.showOpenCourse}
      // handleOpenCourse={handleOpenCourse}
      removeText={t('disk.delete')}
      handleDelete={handleDelete}
      removeSuccess={t('disk.deleteSuccess')}
      removeFailed={t('disk.deleteFailed')}
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
      donwloadAllComponent={donwloadAllComponent()}
      deleteAllCacheComponent={deleteAllCache()}
      singleDownloadComponent={singleDonwload()}
      singleDeleteComponent={singleDelete()}
      handleOpenCourse={handleOpenCourse}
      showOpenItem={true}
      // deleteComponent={deleteComponent()}
      refreshComponent={refreshComponent()}
      diskText={diskStore.diskTextDoc}
      fileTooltipText={diskStore.fileTooltipTextDoc}
    >
      <UploadingProgress />
    </DiskManagerDialog>
    </>
  )
})

export { NetworkDisk }