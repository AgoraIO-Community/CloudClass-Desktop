import { observer } from 'mobx-react'
import { makeStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import { IconButton} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
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
const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 10,
      borderRadius: 5,
      margin: '5px 0',
      // width: '80%'
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#1a90ff',
    },
  }),
)(LinearProgress);

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
  const [process,setProcess] = useState<number>(0)
  const [isUploadFile,setIsUploadFile] = useState<boolean>(false)
  const [isTrans,setIsTrans] = useState<boolean>(false)
  const [file,setUploadFile] = useState({
    fileName:'',
    fileSize:'',
    fileID:''
  })
  // const [cancelFileList,setCancelFileList]= useState<string[]>([])
  const [toastMessage, setToastMessage] = useState({ type: '', message: '' })
  const [isOpenToast, setIsOpenToast] = useState(false)

  const handleClose = () => {
    console.log('close network disk', props.openDisk)
    setIsOpenToast(false)
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
    setIsOpenToast(false)
    const supportedFileTypes = ['bmp','jpg','png','gif','pdf','pptx','mp3','mp4','doc','docx']
    console.log('supportedFileTypes.includes(ext)', supportedFileTypes.includes(ext))
    if(!supportedFileTypes.includes(ext)){
      setIsOpenToast(true)
      setToastMessage({
        type: 'error',
        message: t('disk.notSupported')
      })
      return
    }

    const needConvertingFile = ['ppt', 'pptx', 'doc', 'docx', 'pdf']
    const isNeedConverting = needConvertingFile.includes(ext)
    const needDynamicFileType = ['pptx']
    const isDynamic = needDynamicFileType.includes(ext)
    setIsUploadFile(true)
    setProcess(0)
    setIsTrans(false)
    setUploadFile({
      fileName: name,
      fileSize: file.size,
      fileID: resourceUuid
    })
    const payload = {
      file: file,
      fileSize: file.size,
      ext: ext,
      resourceName: name,
      resourceUuid: resourceUuid,
      converting: isNeedConverting,
      kind: isDynamic ? PPTKind.Dynamic : PPTKind.Static,
      onProgress: async(evt) => {
        const { progress, isTransFile  = false , isLastProgress = false } = evt;
        const parent = Math.floor(progress * 100)
        setProcess(parent)
        setIsTrans(isTransFile)
        if (isLastProgress && parent == 100) {
          setTimeout(() => {
            // setProcess(0)
            console.log('isOpenToast disk，onProgress：',isOpenToast)
            setIsOpenToast(true)
            setIsUploadFile(false)
          }, 1000)
          setToastMessage({
            type: 'success',
            message: t('disk.uploadSuccess')
          })
        }
        // if (cancelFileList.includes(resourceUuid) && progress === 100) {
        //   await boardStore.removeMaterialList([file.fileID])
        // }
      },
      pptConverter: boardStore.boardClient.client.pptConverter(boardStore.room.roomToken)
    } as HandleUploadType
    if (ext === 'pptx') {
      EduLogger.info("upload dynamic pptx")
    }
    await boardStore.handleUpload(payload)
  }
  const cancelUpload = async () => {
    setIsUploadFile(false)
    // if (process < 100) {
    // const list =cancelFileList;
    // list.push(file.fileID)
    // setCancelFileList(list)
    await boardStore.cancelUpload()
    const queryResult = await boardStore.getFileInQueryMateria(file.fileName)
    if (queryResult.success) {
      boardStore.removeMaterialList([file.fileID])
    }
    console.log('boardStore.personalResources', boardStore.personalResources)
    // }
  }
  const fileSizeTransSize = (data: number | string) => {
    const toMB = 1024 * 1024
    let transData = data;
    if (typeof (data) === 'string') {
      transData = parseInt(data, 10)
    }
    return ((transData as number) / toMB).toFixed(2) + 'MB'
  }
  const uploadListComponent = () => {
    if (!isUploadFile) return <></>
    return <div className={styles.uploadList}>
      <header>
       {t('disk.upload')}
        <IconButton id="disk-icon-close" disableRipple aria-label="close" className={styles.close} onClick={cancelUpload}>
          <CloseIcon style={{ width: "24px", height: "24px" }} />
        </IconButton>
      </header>
      <div className={styles.listContent}>
        <ul className={styles.listTitle}>
          <li>
            <div>{t('disk.fileName')}</div>
            <div>{t('disk.size')}</div>
            <div>{t('disk.progress')}</div>
            <div>{t('disk.operation')}</div>
          </li>
          <li>
            <div>{file.fileName}</div>
            <div>{fileSizeTransSize(file.fileSize)}</div>
            <div>
            {isTrans?t('whiteboard.converting'):t('disk.upload')}<BorderLinearProgress variant="determinate" value={process} className={styles.process} /></div>
            <div onClick={cancelUpload} className={styles.delete} >
            </div>
          </li>
        </ul>
      </div>
    </div>

  }
  const onUpload = (evt: any) => {
    console.log('upload file', evt)
    return evt
  }

  const handleDownloadAll = () => {
    
  }

  const handleDownloadSingle = async () => {
    await boardStore.startDownload("93b61ab070ec11eb8122cf10b9ec91f7")
    console.log('download signgle 93b61ab070ec11eb8122cf10b9ec91f7')
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

  // const donwloadAllComponent = () => {
  //   return (
  //     <DiskButton onClick={handleDownloadAll} id="disk-button-donwload-all" style={{ marginRight: 20 }} color={'primary'} text={t('disk.downloadAll')} />
  //   )
  // }

  // const deleteAllCache = () => {
  //   return (
  //     <DiskButton id="disk-button-clear-storage" color={'secondary'} text={t('disk.clearCache')} />
  //   )
  // }

  // const singleDonwload = () => {
  //   return (
  //     <DiskButton disabled={boardStore.donwloading} onClick={handleDownloadSingle} id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.download')} color={'primary'} />
  //   )
  // }

  // const singleDelete = () => {
  //   return (
  //     <DiskButton id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.delete')} color={'primary'} />
  //   )
  // }

  const handleDelete = async (selected: any) => {
    try{
      if (selected.length) {
        await boardStore.removeMaterialList(selected)
        setIsOpenToast(true)
        setToastMessage({
          type:'success',
          message:t('disk.deleteSuccess')
        })
    }
    }catch(error){
      setIsOpenToast(true)
      setToastMessage({
        type:'error',
        message:t('disk.deleteFailed')
      })
    }
  
  }

  const handleOpenCourse = async (resourceUuid: any) => {
    await boardStore.putSceneByResourceUuid(resourceUuid)
    boardStore.openDisk = false
    setIsOpenToast(false)
  }

  const handleRefresh = async () => {
    // await boardStore.loadCloudResources()
  }

  const refreshComponent = () => {
    return (
      <img id="disk-button-refresh" style={{ cursor: 'pointer' }} onClick={handleRefresh} src={IconRefresh} className={styles.titleImg} />
    )
  }

  return (
    <>
    <DiskManagerDialog
      inRoom={true}
      // todo add item
      showOpenItem={true}
      diskOpenText={t("disk.open")}
      handleOpenCourse={handleOpenCourse}
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
      // downloadList={boardStore.allResources}
      uploadComponent={uploadComponent()}
      uploadListComponent={uploadListComponent()}
      isOpenToast={isOpenToast}
      toastMessage={toastMessage}
      // donwloadAllComponent={donwloadAllComponent()}
      // deleteAllCacheComponent={deleteAllCache()}
      // singleDownloadComponent={singleDonwload()}
      // singleDeleteComponent={singleDelete()}
      // handleOpenCourse={handleOpenCourse}
      // showOpenItem={true}
      // deleteComponent={deleteComponent()}
      refreshComponent={refreshComponent()}
      diskText={{
        publicTab: t('disk.publicResources'),
        privateTab: t('disk.privateResources'),
        downloadTab: t('disk.downlownResources'),
        fileName: t('disk.fileName'),
        size: t('disk.size'),
        modificationTime: t('disk.modificationTime'),
        search: t('disk.search'),
        noFile: t('disk.noFile'),
        file: t('disk.file'),
        progress: t('disk.progress'),
        operation: t('disk.operation'),
        all: t('disk.all'),
        downloaded: t('disk.downloaded'),
        notDownload: t('disk.notDownload'),
        openFile: t('disk.openCourse'),
      }}
      fileTooltipText={{
        fileType: t('fileTip.fileType'),
        supportText: t('fileTip.supportText'),
        ppt: t('fileTip.ppt'),
        word: t('fileTip.word'),
        // excel: t('fileTip.excel'),
        pdf: t('fileTip.pdf'),
        video: t('fileTip.video'),
        audio: t('fileTip.audio'),
        txt: t('fileTip.txt'),
        pic: t('fileTip.pic'),
    
        pptType: t('fileTip.pptType'),
        wordType: t('fileTip.wordType'),
        // excelType: t('fileTip.excelType'),
        pdfType: t('fileTip.pdfType'),
        videoType: t('fileTip.videoType'),
        audioType: t('fileTip.audioType'),
        txtType: t('fileTip.txtType'),
        picType: t('fileTip.picType'),
      }}
    />
    <UploadingProgress />
    </>
  )
})

export { NetworkDisk }