import React, { Dispatch, ReactEventHandler, SetStateAction } from 'react'
import { DiskButton } from './control/disk-button'
import { DiskManagerDialog } from './dialog/manager'
import { CourseReplacer } from './dialog/courseReplacer'
import { Loading } from './control/loading'
import TableEmpty from "./dialog/table-empty";
import { UploadFile } from '../upload/index'
import DownloadDiskTables from './table/download-disk-table'

export default {
  title: '网盘'
}

// interface DownloadDiskProps {
//   // downloadComponet
//   downloadList?: any,

//   showOpenItem?: boolean,
//   setDownloadList?: Dispatch<SetStateAction<any>>,
//   handleDownloadAll?: () => any,
//   handleClearcache?: () => Promise<void>,
//   handleDownload?: (evt: any) => any,
//   handleDeleteSingle?: (evt: any) => any,
//   donwloadAllComponent?: React.ReactNode,
//   deleteAllCacheComponent?: React.ReactNode,
//   singleDownloadComponent?: React.ReactNode,
//   singleDeleteComponent?: React.ReactNode,
//   diskText?: any,
//   diskOpenText?: any,
//   inRoom?: boolean,
// }

// const DownloadDisk = (props: DownloadDiskProps) => {
//   return (
//     <>
//       <DownloadDiskTables
//         tabValue={0}
//         setDownloadList={props.setDownloadList}
//         diskText={props.diskText}
//         handleDownloadAll={props.handleDownloadAll}
//         handleClearcache={props.handleClearcache}
//         handleDownload={props.handleDownload}
//         handleDeleteSingle={props.handleDeleteSingle}
//         singleDownloadComponent={props.singleDownloadComponent}
//         singleDeleteComponent={props.singleDeleteComponent}
//         downloadList={props.downloadList}
//         showText={props.diskOpenText}
//       />
//     </>
//   )
// }

export const CourseReplacerDialog = (props: any) => {
  let items = [
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'},
    {name: '202206PPT课件制作规范.pptx'}
  ]
  return (
    <CourseReplacer items={items}></CourseReplacer>
  )
}

export const NetworkDisk = (props: any) => {

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

  const handleDeleteSingle = () => {
    console.log('handleDeleteSingle')
  }

  return (
    <DiskManagerDialog
      handleDelete={() => {

      }}
      removeFailed={"删除失败"}
      removeText={"删除失败"}
      removeSuccess={"删除成功"}
      inRoom={props.inRoom}
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
      showOpenItem={true}
      diskOpenText={"打开"}
      handleDeleteSingle={handleDeleteSingle}
      // downloadDiskComponent={DownloadDisk(props)}
      // uploadComponent={uploadComponent()}
      // donwloadAllComponent={donwloadAllComponent()}
      // deleteAllCacheComponent={deleteAllCache()}
      // singleDownloadComponent={singleDonwload()}
      privateList={[
        {
          calories: '100',
          id: '12',
          name: 'test12312312312312312312313123123123123123123123123123',
          type: 'pic',
          fat: `${Date.now()}`
        },
        {
          calories: '100',
          id: '13',
          name: 'test12312312312312312312313123123123123123123123123123',
          type: 'txt',
          fat: `${Date.now()}`
        },
        {
          calories: '100',
          id: '1',
          name: 'test12312312312312312312313123123123123123123123123123',
          type: 'audio',
          fat: `${Date.now()}`
        },
        {
          calories: '100',
          id: '2',
          name: 'test12312312312312312312313123123123123123123123123123',
          type: 'video',
          fat: `${Date.now()}`
        },
        {
          calories: '100',
          id: '3',
          name: 'test12312312312312312312313123123123123123123123123123',
          type: 'pdf',
          fat: `${Date.now()}`
        },
        {
          calories: '100',
          id: '4',
          name: 'test12312312312312312312313123123123123123123123123123',
          type: 'excel',
          fat: `${Date.now()}`
        },
        {
          calories: '100',
          id: '5',
          name: 'test12312312312312312312313123123123123123123123123123',
          type: 'word',
          fat: `${Date.now()}`
        },
      ]}
      publicList={[
        // {
        //   calories: '100',
        //   id: '12',
        //   name: 'test12312312312312312312313123123123123123123123123123',
        //   type: 'pic',
        //   fat: `${Date.now()}`
        // },
        // {
        //   calories: '100',
        //   id: '13',
        //   name: 'test12312312312312312312313123123123123123123123123123',
        //   type: 'txt',
        //   fat: `${Date.now()}`
        // },
        // {
        //   calories: '100',
        //   id: '1',
        //   name: 'test12312312312312312312313123123123123123123123123123',
        //   type: 'audio',
        //   fat: `${Date.now()}`
        // },
        // {
        //   calories: '100',
        //   id: '2',
        //   name: 'test12312312312312312312313123123123123123123123123123',
        //   type: 'video',
        //   fat: `${Date.now()}`
        // },
        // {
        //   calories: '100',
        //   id: '3',
        //   name: 'test12312312312312312312313123123123123123123123123123',
        //   type: 'pdf',
        //   fat: `${Date.now()}`
        // },
        // {
        //   calories: '100',
        //   id: '4',
        //   name: 'test12312312312312312312313123123123123123123123123123',
        //   type: 'excel',
        //   fat: `${Date.now()}`
        // },
        // {
        //   calories: '100',
        //   id: '5',
        //   name: 'test12312312312312312312313123123123123123123123123123',
        //   type: 'word',
        //   fat: `${Date.now()}`
        // },
      ]}
      downloadList={[
        {
          calories: 100,
          resourceUuid: '12',
          resourceName: 'test12312312312312312312313123123123123123123123123123',
          type: 'pic',
          fat: `${Date.now()}`,
          status: 'notCache',
          progress: -1,
        },
        {
          calories: 100,
          resourceUuid: '13',
          resourceName: 'test12312312312312312312313123123123123123123123123123',
          type: 'txt',
          fat: `${Date.now()}`,
          status: 'notCache',
          progress: -1,
        },
        {
          calories: 100,
          resourceUuid: '1',
          resourceName: 'test12312312312312312312313123123123123123123123123123',
          type: 'audio',
          fat: `${Date.now()}`,
          status: 'downloading',
          progress: -1,
        },
        {
          calories: 100,
          resourceUuid: '2',
          resourceName: 'test12312312312312312312313123123123123123123123123123',
          type: 'video',
          fat: `${Date.now()}`,
          status: 'downloading',
          progress: -1,
        },
        {
          calories: 100,
          resourceUuid: '3',
          resourceName: 'test12312312312312312312313123123123123123123123123123',
          type: 'pdf',
          fat: `${Date.now()}`,
          status: 'cached',
          progress: -1,
        },
        {
          calories: 100,
          resourceUuid: '4',
          resourceName: 'test12312312312312312312313123123123123123123123123123',
          type: 'excel',
          fat: `${Date.now()}`,
          status: 'cached',
          progress: -1,
        },
        {
          calories: 100,
          resourceUuid: '5',
          resourceName: 'test12312312312312312312313123123123123123123123123123',
          type: 'word',
          fat: `${Date.now()}`,
          status: 'downloading',
          progress: -1,
        },
      ]}
      singleDeleteComponent={singleDelete()}
      fileTooltipText={{
        fileType: '格式类型',
        supportText: '教室内支持的文件格式',
        ppt: 'Powerpoint演示文档',
        word: 'Word文档',
        excel: 'Excel文档',
        pdf: 'Pdf文档',
        video: '视频',
        audio: '音频',
        txt: '文本文档',
        pic: '图片',

        pptType: 'ppt pptx pptm',
        wordType: 'docx doc',
        excelType: 'xlsx xls csv',
        pdfType: 'pdf',
        videoType: 'XXX',
        audioType: 'XXX',
        txtType: 'XXX',
        picType: 'XXX',
      }}
      diskText={{
        publicTab: '公共资源 ui-kit',
        privateTab: '我的云盘 ui-kit',
        downloadTab: '下载课件 ui-kit',
        fileName: '文件名 ui-kit',
        size: '大小 ui-kit',
        modificationTime: '修改时间 ui-kit',
        search: '搜索 ui-kit',
        noFile: '暂无文件 ui-kit',
        file: '文件',
        progress: '进度',
        operation: '操作',
        all: '全部',
        downloaded: '已下载',
        notDownload: '未下载',
        downloadAll: '全部下载',
        clearCache: '清空缓存',
        download: '下载',
        delete: '删除',
        downloading: '下载中',

        openCourse: '打开课件',
      }}
    />
  )
}

NetworkDisk.args = {
  inRoom: true,
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