import { useBoardStore } from '@/hooks'
import { useI18nContext } from '@/utils/utils'
import { EduLogger } from 'agora-rte-sdk'
import { Icon, Tabs, TabPane, Row, Button, CloudDisk } from 'agora-scenario-ui-kit'
import MD5 from 'js-md5'
import { observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import { PPTKind } from 'white-web-sdk'
import { DownloadContainer } from './download'
import { StorageContainer } from './storage'
import { UploadContainer } from './upload'

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

export const CloudDriverContainer = observer((props: any) => {

  const {t} = useI18nContext()

  const boardStore = useBoardStore()

  const onCancel = () => {
    boardStore.setTool('')
    props.actionClose()
  }

  const [activeKey, setActiveKey] = useState<string>('1')

  const handleChange = (key: string) => {
    setActiveKey(key)

  }

  const handleUpload = async (evt: any) => {

    const file = evt.target.files[0]
    const md5 = await calcUploadFilesMd5(file)
    const resourceUuid = MD5(`${md5}`)
    const name = file.name.split(".")[0]
    const ext = file.name.split(".").pop()
    // hideToast()
    const supportedFileTypes = ['bmp','jpg','png','gif','pdf','pptx','mp3','mp4','doc','docx']

    const needConvertingFile = ['ppt', 'pptx', 'doc', 'docx', 'pdf']
    const isNeedConverting = needConvertingFile.includes(ext)
    const needDynamicFileType = ['pptx']
    const isDynamic = needDynamicFileType.includes(ext)
    const payload = {
      file: file,
      fileSize: file.size,
      ext: ext,
      resourceName: name,
      resourceUuid: resourceUuid,
      converting: isNeedConverting,
      kind: isDynamic ? PPTKind.Dynamic : PPTKind.Static,
      onProgress: async(evt: any) => {
        // const { progress, isTransFile  = false , isLastProgress = false } = evt;
        // const parent = Math.floor(progress * 100)
        // // setProcess(parent)
        // // setIsTrans(isTransFile)
        // // if (isLastProgress && parent == 100) {
        // //   prepareToast('success', t('disk.uploadSuccess'))
        // //   setTimeout(() => {
        // //     showToast(() => {setIsUploadFile(false)})
        // //   }, 1000)
        // // }
        // // if (cancelFileList.includes(resourceUuid) && progress === 100) {
        // //   await boardStore.removeMaterialList([file.fileID])
        // // }
      },
      pptConverter: boardStore.boardClient.client.pptConverter(boardStore.room.roomToken)
    }
    if (ext === 'pptx') {
      EduLogger.info("upload dynamic pptx")
    }
    await boardStore.handleUpload(payload)
  }

  const handleDelete = () => {

  }

  console.log(' driver props ', props)

  useEffect(() => {
    if (activeKey === '2') {
      boardStore.refreshState()
    }
  }, [activeKey, boardStore])

  const fileRef = useRef<HTMLInputElement | null>(null)

  const triggerUpload = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }


  return (
    <div className="agora-board-resources">
      <div className="btn-pin">
        <Icon type="close" style={{cursor: 'pointer'}} hover onClick={onCancel}></Icon>
      </div>
      <Tabs activeKey={activeKey} onChange={handleChange}>
        <TabPane tab={t('cloud.publicResources')} key="1">
          <StorageContainer />
        </TabPane>
        <TabPane tab={t('cloud.personalResources')} key="2">
          <Row className="btn-group margin-gap">
            <input ref={fileRef} id="upload-image" accept=".bmp,.jpg,.png,.gif,pdf,.jpeg,.pptx,.ppt,.doc,.docx,.mp3,.mp4"
              onChange={handleUpload} type="file">
            </input>
            <Button type="primary" onClick={triggerUpload}>
              {t('cloud.upload')}
            </Button>
            <Button type="ghost" onClick={handleDelete}>{t('cloud.delete')}</Button>
          </Row>
          <UploadContainer />
        </TabPane>
        <TabPane tab={t('cloud.downloadResources')}  key="3">
          <DownloadContainer />
        </TabPane>
      </Tabs>
    </div>
  )
})

export const CloudDiskContainer = observer(() => {

  const boardStore = useBoardStore()

  const currentActive = boardStore.selector

  return (
    <CloudDisk
      value='cloud'
      label='网盘'
      icon='cloud'
      isActive={currentActive === 'cloud'}
    >
      <CloudDriverContainer />
    </CloudDisk>
  )
})