import { useBoardStore } from '@/hooks'
import { useCloudDriverContext } from '@/ui-components/hooks'
import { Button, CloudDisk, Icon, Loading, Modal, Row, t, TabPane, Tabs, Toast } from 'agora-scenario-ui-kit'
import MD5 from 'js-md5'
import { observer } from 'mobx-react'
import React from 'react'
import { DownloadContainer } from './download'
import { StorageContainer } from './storage'
import { UploadContainer } from './upload'

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



export const CloudDriverContainer = observer((props: any) => {

  const {
    activeKey,
    handleChange,
    fileRef,
    uploadFileInfo,
    handleDelete,
    handleUpload,
    showUploadModal,
    showUploadToast,
    triggerUpload,
    setShowUploadModal,
    currentProgress,
    captureCheckedItems,
    onCancel
  } = useCloudDriverContext(props)

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