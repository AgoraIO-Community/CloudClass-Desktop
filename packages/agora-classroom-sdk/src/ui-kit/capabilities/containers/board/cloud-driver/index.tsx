import { useBoardContext, mapFileType, PPTKind, useCloudDriveContext } from 'agora-edu-core';
import { EduLogger } from 'agora-rte-sdk';
import MD5 from 'js-md5';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useRef } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Draggable from 'react-draggable';
import { BehaviorSubject } from 'rxjs';
import { Button, formatFileSize, Icon, Loading, Modal, Row, TabPane, Tabs, Toast, transI18n } from '~ui-kit';
import { DownloadContainer } from './download';
import { StorageContainer } from './storage';
import { UploadContainer } from './upload';
import { useUIStore } from '@/infra/hooks/'

export const calcUploadFilesMd5 = async (file: File) => {
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

export interface uploadFileInfoProps {
  iconType: any,
  fileName: string,
  fileSize: string,
  uploadComplete: boolean,
}

export type CloudDriveContainerProps = {
  onClose: () => void,
  onDelete?: (fileName: string) => void;
}


export const CloudDriverContainer: React.FC<CloudDriveContainerProps> = observer(({id}: any) => {
  const {
    setTool,
    room,
  } = useBoardContext()

  const {
    openCloudResource,
    refreshCloudResources,
    cancelUpload,
    removeMaterialList,
    doUpload,
  } = useCloudDriveContext()

  const {
    checked,
    removeDialog
  } = useUIStore()

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

  const onCancel = useCallback(() => {
    if (room) {
      const tool = room.state.memberState.currentApplianceName
      setTool(tool)
    }
    removeDialog(id)
  }, [room])

  const [activeKey, setActiveKey] = useState<string>('1')

  useEffect(() => {
    if (activeKey === '2') {
      refreshCloudResources()
    }
  }, [activeKey, refreshCloudResources])

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
    const name = file.name
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
            iconType: 'format-' + mapFileType(ext),
            fileName: name,
            uploadComplete: true,
          })
        }

        if (isLastProgress && parent === 100) {
          showToastFn()
        }
      },
      roomToken: room.roomToken
      // pptConverter: boardClient.client.pptConverter(boardStore.room.roomToken)
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
      await doUpload(payload)
      fileRef.current!.value = ""
    } catch (e) {
      fileRef.current!.value = ""
      throw e
    }

  }

  const handleDelete = async () => {
    await cancelUpload();
    await removeMaterialList(checkList$.getValue());
    setShowUploadModal(false);
  }

  const triggerUpload = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  const handleClick = async (id: string, type: string) => {
    if (type === 'open') {
      await openCloudResource(id)
      return;
    }
  };

  return (
    <Draggable>
      <div 
        className="agora-board-resources cloud-wrap"
      >
        <div className="btn-pin">
          <Icon type="close" style={{ cursor: 'pointer' }} onClick={() => {
            onCancel()
          }}></Icon>
        </div>
        <Tabs activeKey={activeKey} onChange={handleChange}>
          <TabPane tab={transI18n('cloud.publicResources')} key="1">
            <StorageContainer />
          </TabPane>
          <TabPane tab={transI18n('cloud.personalResources')} key="2">
            <Row style={{paddingLeft:19}} className="btn-group margin-gap">
              <input ref={fileRef} id="upload-image" accept=".bmp,.jpg,.png,.gif,.pdf,.jpeg,.pptx,.ppt,.doc,.docx,.mp3,.mp4"
                onChange={handleUpload} type="file">
              </input>
              <Button type="primary" onClick={triggerUpload}>
                {transI18n('cloud.upload')}
              </Button>
              <Button disabled={!checked} type="ghost" onClick={handleDelete}>{transI18n('cloud.delete')}</Button>
              {showUploadToast ? (<Toast closeToast={()=>{}} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>{transI18n('cloud.upload_success')}</Toast>) : ''}
              {showUploadModal ? (
                <Modal
                  title={transI18n('cloud.upload')}
                  width={450}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  closable={false}
                  onCancel={() => { setShowUploadModal(false) }}
                >
                  <Loading
                    onClick={handleClick}
                    hasLoadingGif={false}
                    noCloseBtn={true}
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
          <TabPane tab={transI18n('cloud.downloadResources')} key="3">
            <DownloadContainer />
          </TabPane>
        </Tabs>
      </div>
    </Draggable>
  )
})