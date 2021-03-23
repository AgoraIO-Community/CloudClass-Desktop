import { useBoardStore } from '@/hooks'
import { EduLogger } from 'agora-rte-sdk'
import { Icon, Tabs, TabPane, Row, Button, CloudDisk, t, Modal, Loading, Toast, useI18nContext,  formatFileSize } from 'agora-scenario-ui-kit'
import MD5 from 'js-md5'
import { observer } from 'mobx-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PPTKind } from 'white-web-sdk'
import { DownloadContainer } from './download'
import { StorageContainer } from './storage'
import { UploadContainer } from './upload'
import { mapFileType } from '../../../services/upload-service'
import {BehaviorSubject} from 'rxjs'

const calcUploadFilesMd5 = async (file: File) => {
  return new Promise(resolve => {
    const time = new Date().getTime();
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file); //计算文件md5
    fileReader.onload = async () => {
      const md5Str = MD5(fileReader.result);
      const et = new Date().getTime();
      resolve(md5Str);
    };
  });
}

interface uploadFileInfoProps {
  iconType: any,
  fileName: string,
  fileSize: string,
  uploadComplete: boolean,
}

export const CloudDriverContainer = observer((props: any) => {

  const boardStore = useBoardStore()

  const checkList$ = new BehaviorSubject<string[]>([])

  const [checkedList, updateList] = useState<string[]>([])

  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    checkList$.subscribe({
      next: (ids: string[]) => {
        updateList(ids)
      }
    })
    return () => {
      checkList$.unsubscribe()
    }
  }, [])

  const captureCheckedItems = (items: string[]) => {
    checkList$.next(items)
  }

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false)
  const [showUploadToast, setShowUploadToast] = useState<boolean>(false)
  const [uploadFileInfo, setUploadFileInfo] = useState<uploadFileInfoProps>({
    iconType: '',
    fileName: '',
    fileSize: '',
    uploadComplete: false,
  })
  const [currentProgress, setCurrentProgress] = useState<number>(0)

  const onCancel = () => {
    boardStore.setTool('')
    props.actionClose()
  }

  const [activeKey, setActiveKey] = useState<string>('1')

  const handleChange = (key: string) => {
    setActiveKey(key)
  }

  const showToastFn = () => {
    setShowUploadModal(false)
    setShowUploadToast(true)
    setTimeout(() => {
      setShowUploadToast(false)
    }, 1000)
  }

  const handleUpload = async (evt: any) => {

    setUploadFileInfo({
      iconType: '',
      fileName: '',
      fileSize: '',
      uploadComplete: false,
    })
    setCurrentProgress(0)

    const file = evt.target.files[0]
    const md5 = await calcUploadFilesMd5(file)
    const resourceUuid = MD5(`${md5}`)
    const name = file.name.split(".")[0]
    const ext = file.name.split(".").pop()
    // hideToast()
    const supportedFileTypes = ['bmp', 'jpg', 'png', 'gif', 'pdf', 'pptx', 'mp3', 'mp4', 'doc', 'docx']

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
      onProgress: async (evt: any) => {
        const { progress, isTransFile = false, isLastProgress = false } = evt;
        const parent = Math.floor(progress * 100)
        setCurrentProgress(parent)

        if (isTransFile) {
          setUploadFileInfo({
            ...uploadFileInfo,
            fileName: name,
            uploadComplete: true,
          })
        }

        if (isLastProgress && parent === 100) {
          showToastFn()
        }
      },
      pptConverter: boardStore.boardClient.client.pptConverter(boardStore.room.roomToken)
    }
    if (ext === 'pptx') {
      EduLogger.info("upload dynamic pptx")
    }
    // TODO: 渲染UI
    setUploadFileInfo({
      ...uploadFileInfo,
      iconType: 'format-' + mapFileType(ext),
      fileName: name,
      fileSize: formatFileSize(file.size),
      uploadComplete: false,
    })
    setShowUploadModal(true)
    try {
      await boardStore.handleUpload(payload)
      fileRef.current!.value = ""
    } catch (e) {
      fileRef.current!.value = ""
      throw e
    }

  }

  const handleDelete = async () => {
    await boardStore.removeMaterialList(checkList$.getValue())
  }

  // console.log(' driver props ', props)

  useEffect(() => {
    if (activeKey === '2') {
      boardStore.refreshState()
    }
  }, [activeKey, boardStore])

  const triggerUpload = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }


  return (
    <div className="agora-board-resources">
      <div className="btn-pin">
        <Icon type="close" style={{ cursor: 'pointer' }} hover onClick={onCancel}></Icon>
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
            {showUploadToast ? (<Toast style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>上传成功</Toast>) : ''}
            {showUploadModal ? (

              <Modal
                title="上传"
                width={450}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                onCancel={() => { setShowUploadModal(false) }}
              >
                <Loading
                  hasLoadingGif={false}
                  uploadItemList={
                    [
                      { ...uploadFileInfo, currentProgress }
                    ]
                  }
                />
              </Modal>

            ) : ""}

          </Row>
          <UploadContainer handleUpdateCheckedItems={captureCheckedItems} />
        </TabPane>
        <TabPane tab={t('cloud.downloadResources')} key="3">
          <DownloadContainer />
        </TabPane>
      </Tabs>
    </div>
  )
})

export const CloudDiskContainer = observer(() => {

  const boardStore = useBoardStore()

  const {t} = useI18nContext()

  const currentActive = boardStore.selector

  return (
    <CloudDisk
      value='cloud'
      label={t('scaffold.cloud_storage')}
      icon='cloud'
      isActive={currentActive === 'cloud'}
    >
      <CloudDriverContainer />
    </CloudDisk>
  )
})