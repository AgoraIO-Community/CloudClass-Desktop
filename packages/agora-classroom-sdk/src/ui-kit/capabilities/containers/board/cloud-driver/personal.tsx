import { useUIStore } from '@/infra/hooks';
import { CourseWareItem, mapFileType, PPTKind, useBoardContext, useCloudDriveContext, useRoomContext } from 'agora-edu-core';
import { EduLogger } from 'agora-rte-sdk';
import MD5 from 'js-md5';
import { debounce } from 'lodash';
import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Button, Card, formatFileSize, Loading, Modal, Row, Toast, transI18n } from '~ui-kit';
import { UploadContainer } from './upload';
import { Pagination } from './';
import { Search } from '~components/input'
import SearchSvg from '~components/icon/assets/svg/search.svg'


export const calcUploadFilesMd5 = async (file: File) => {
  return new Promise(resolve => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file); //计算文件md5
    fileReader.onload = async () => {
      const md5Str = MD5(fileReader.result);
      resolve(md5Str);
    };
  });
}

const LoadingWrap = ({ visible }: { visible: boolean }) =>
  visible ? (<Card width={90} height={90} className="card-loading-position">
    <Loading />
  </Card>) : null

export interface uploadFileInfoProps {
  iconType: any,
  fileName: string,
  fileSize: string,
  uploadComplete: boolean,
}

const usePersonalResourcePage = ({ hintText }: { hintText: string }) => {
  const {
    roomInfo
  } = useRoomContext()

  const {
    fetchPersonalResources,
  } = useCloudDriveContext()

  const [pageIdx, setPageIdx] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [resources, setResources] = useState<CourseWareItem[]>([]);

  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback((pageNo: number, hintText: string = '') => {
    setLoading(true)
    fetchPersonalResources(roomInfo.userUuid, { resourceName: hintText, pageNo, pageSize: 10 }).then((page) => {
      setTotalPages(page.pages)
      setResources(page.list)
      setPageIdx(page.pageNo - 1)
    }).finally(() => setLoading(false))
  }, [fetchPersonalResources, roomInfo.userUuid]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage])


  const debounced = useMemo(() => debounce((hint: string) => {
    fetchPage(pageIdx + 1, hint)
  }, 500), [fetchPage, pageIdx]);

  return {
    pageIdx,
    loading,
    totalPages,
    resources,
    fetchResource: fetchPage,
    debouncedFetch: debounced,
    handlePageChange: (pageIdx: number) => {
      setPageIdx(pageIdx);
      fetchPage(pageIdx + 1, hintText)
    }
  };
}


export const PersonalStorageContainer = observer(() => {
  const {
    room,
  } = useBoardContext()

  const {
    checked,
    addToast
  } = useUIStore()

  const {
    tryOpenCloudResource,
    cancelUpload,
    removeMaterialList,
    doUpload
  } = useCloudDriveContext()
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
  const [uploadToastType, setUploadToastType] = useState<0 | 1>(0)
  const [uploadFileInfo, setUploadFileInfo] = useState<uploadFileInfoProps>({
    iconType: '',
    fileName: '',
    fileSize: '',
    uploadComplete: false,
  })
  const [currentProgress, setCurrentProgress] = useState<number>(0)
  const [hintText, setHintText] = useState('');

  const { pageIdx, loading, totalPages, resources, fetchResource, debouncedFetch, handlePageChange } = usePersonalResourcePage({ hintText });

  const showToastFn = (toastType: 0 | 1) => {
    setUploadToastType(toastType)
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
    const extLowerCase = ext ? ext.toLowerCase() : ext
    // hideToast()
    // const supportedFileTypes = ['bmp', 'jpg', 'png', 'gif', 'pdf', 'pptx', 'mp3', 'mp4', 'doc', 'docx']

    const needConvertingFile = ['ppt', 'pptx', 'doc', 'docx', 'pdf']
    const isNeedConverting = needConvertingFile.includes(extLowerCase)
    const needDynamicFileType = ['pptx']
    const isDynamic = needDynamicFileType.includes(extLowerCase)
    const payload = {
      file: file,
      fileSize: file.size,
      ext: ext,
      resourceName: name,
      resourceUuid: resourceUuid,
      converting: isNeedConverting,
      kind: isDynamic ? PPTKind.Dynamic : PPTKind.Static,
      onProgress: async (evt: any) => {
        const { progress, isTransFile = false, isLastProgress = false, failed = false } = evt;
        const parent = Math.floor(progress * 100)
        setCurrentProgress(parent)

        if (isTransFile) {
          setUploadFileInfo({
            ...uploadFileInfo,
            iconType: 'format-' + mapFileType(extLowerCase),
            fileName: name,
            uploadComplete: true,
          })
        }

        if (isLastProgress && parent === 100) {
          showToastFn(0)
        }

        if(failed) {
          showToastFn(1) 
        }
      },
      roomToken: room.roomToken,
      // pptConverter: boardClient.client.pptConverter(boardStore.room.roomToken)
      personalResource: true
    }
    if (extLowerCase === 'pptx') {
      EduLogger.info("upload dynamic pptx")
    }
    // TODO: 渲染UI
    setUploadFileInfo({
      ...uploadFileInfo,
      iconType: 'format-' + mapFileType(extLowerCase),
      fileName: name,
      fileSize: formatFileSize(file.size),
      uploadComplete: false,
    })
    setShowUploadModal(true)
    try {
      await doUpload(payload)
      fileRef.current!.value = ""
    } catch (e) {
      if(fileRef.current) {
        fileRef.current.value = ""
      }
      throw e
    }
    fetchResource(pageIdx + 1, hintText)
  }

  const handleDelete = async () => {
    const checkLen = checkList$.getValue().length

    await cancelUpload();

    await removeMaterialList(checkList$.getValue());
    // back to prev page if there is no more data in this page
    fetchResource(checkLen >= resources.length && pageIdx > 0 ? pageIdx : pageIdx + 1, hintText)  

    setShowUploadModal(false);
  }

  const triggerUpload = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  const handleClick = async (id: string, type: string) => {
    if (type === 'open') {
      const status = await tryOpenCloudResource(id)
      if(status === 'converting') {
        addToast(transI18n('toast.cloud_resource_conversion_not_finished'), 'warning')
      } else if(status === 'unconverted') {
        addToast(transI18n('toast.cloud_resource_conversion_not_converted'), 'error')
      }
    }
  };

  return (
    <>
      <Row style={{ paddingLeft: 19, paddingRight: 19 }} className="btn-group margin-gap">
        <div className="inline-block" style={{ width: 200 }}>
          <Search
            onSearch={(value) => {
              setHintText(value);
              debouncedFetch(value)
            }}
            prefix={<img src={SearchSvg} alt="" />}
            inputPrefixWidth={32}
            placeholder={transI18n('cloud.search')}
          />
        </div>
        <div className="flex-grow" />
        <input ref={fileRef} id="upload-image" accept=".bmp,.jpg,.png,.gif,.pdf,.jpeg,.pptx,.ppt,.doc,.docx,.mp3,.mp4"
          onChange={handleUpload} type="file">
        </input>
        <Button type="primary" onClick={triggerUpload}>
          {transI18n('cloud.upload')}
        </Button>
        <Button disabled={!checked} type="ghost" onClick={handleDelete}>{transI18n('cloud.delete')}</Button>
        {showUploadToast ? ( !uploadToastType ? 
          <Toast closeToast={() => { }} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>{transI18n('cloud.upload_success')}</Toast>:
          <Toast closeToast={() => { }} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} type='error'>{transI18n('cloud.conversion_failed')}</Toast>
        ) : ''}
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
      <UploadContainer handleUpdateCheckedItems={captureCheckedItems} personalResources={resources} />
      <LoadingWrap visible={loading} />
      <Pagination pageIdx={pageIdx} totalPages={totalPages} onChange={handlePageChange} />
    </>
  )
})