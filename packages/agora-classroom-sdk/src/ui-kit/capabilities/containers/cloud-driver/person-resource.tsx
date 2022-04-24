import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { ChangeEvent, useRef, useEffect, useCallback } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import { CloudDriveCourseResource, CloudDriveResource } from 'agora-edu-core';
import {
  Col,
  Inline,
  Placeholder,
  Row,
  Table,
  TableHeader,
  transI18n,
  SvgImg,
  Button,
  Modal,
  Toast,
  Loading,
  CheckBox,
  Pagination,
  CircleLoading,
  Popover,
  UploadItem,
} from '~ui-kit';
import CloudToolbar from './cloud-toolbar';
import CloudMinimize from './cloud-minimize';
import CloudMoreMenu from './cloud-more-menu';
import { FileTypeSvgColor, UploadItem as CloudUploadItem } from '@/infra/stores/common/cloud-ui';
import { CloudDriveResourceUploadStatus } from 'agora-edu-core';
import { debounce } from 'lodash';

const UploadSuccessToast = () => {
  return (
    <Toast
      closeToast={() => {}}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}>
      {transI18n('cloud.upload_success')}
    </Toast>
  );
};

const UploadModal = () => {
  const { cloudUIStore } = useStore();
  const { setShowUploadMinimize, setShowUploadModal, uploadingProgresses, classroomStore } =
    cloudUIStore;
  const { cloudDriveStore } = classroomStore;
  const { retryUpload, cancelUpload } = cloudDriveStore;

  return (
    <Modal
      className="upload-modal"
      modalType="minimize"
      animate={false}
      title={transI18n('cloud.upload')}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 450,
      }}
      closable={true}
      onCancel={() => {
        setShowUploadModal(false);
        setShowUploadMinimize(true);
      }}>
      <Loading
        hasLoadingGif={false}
        noCloseBtn={true}
        showUploadOpeBtn={false}
        uploadItemList={uploadingProgresses as unknown as UploadItem[]}
        onRetry={retryUpload}
        onCancel={cancelUpload}
      />
    </Modal>
  );
};

export const PersonalResourcesContainer = observer(() => {
  const uploadingRef = useRef(false);
  const { cloudUIStore, shareUIStore } = useStore();
  const { addConfirmDialog } = shareUIStore;
  const {
    openResource,
    fileNameToType,
    formatFileSize,
    personalResourcesList,
    setPersonalResourceSelected,
    setAllPersonalResourceSelected,
    isPersonalResSelectedAll,
    hasSelectedPersonalRes,
    uploadingProgresses,
    personalResourcesTotalNum,
    pageSize,
    currentPersonalResPage,
    removePersonalResources,
    uploadPersonalResource,
    fetchPersonalResources,
    personalResources,
    searchPersonalResourcesKeyword,
    setSearchPersonalResourcesKeyword,
    showUploadMinimize,
    setShowUploadMinimize,
    uploadState,
    setUploadState,
    showUploadModal,
    setShowUploadModal,
    showUploadToast,
    setShowUploadToast,
  } = cloudUIStore;

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchPersonalResources({
      pageNo: currentPersonalResPage,
      pageSize,
      resourceName: searchPersonalResourcesKeyword,
    });
    return () => {
      setSearchPersonalResourcesKeyword('');
    };
  }, []);
  const debouncedFetchPersonalResources = useCallback(
    debounce(() => {
      fetchPersonalResources({
        pageNo: currentPersonalResPage,
        pageSize,
        resourceName: searchPersonalResourcesKeyword,
      });
    }, 500),
    [currentPersonalResPage, pageSize, searchPersonalResourcesKeyword],
  );
  useEffect(() => {
    if (!uploadingProgresses.length) {
      setShowUploadModal(false);
    }
    if (
      uploadingRef.current &&
      showUploadModal &&
      uploadingProgresses.length > 0 &&
      uploadingProgresses.length ===
        uploadingProgresses.filter(
          (item: CloudUploadItem) => item.status === CloudDriveResourceUploadStatus.Success,
        ).length
    ) {
      uploadingRef.current = false;
      setShowUploadModal(false);
      setUploadState('success');
      setShowUploadToast(true);
      setTimeout(() => {
        setShowUploadToast(false);
      }, 1000);
    }
  }, [uploadingProgresses]);

  const onClickSelectAll = () => {
    setAllPersonalResourceSelected(!hasSelectedPersonalRes);
  };

  const onItemCheckClick = (resourceUuid: string, checked: boolean) => {
    setPersonalResourceSelected(resourceUuid, !checked);
  };

  const triggerUpload = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    try {
      const files = evt.target.files || [];
      if (files?.length) {
        setShowUploadModal(true);
        setUploadState('uploading');
        const taskArr = [];
        uploadingRef.current = true;
        for (const file of files) {
          taskArr.push(
            uploadPersonalResource(file).finally(() => {
              debouncedFetchPersonalResources();
            }),
          );
        }
      }
    } catch (e) {
      setShowUploadModal(false);
      setUploadState('error');
      throw e;
    } finally {
      fileRef.current!.value = '';
    }
  };

  const onClickCol = (resourceUuid: string) => {
    const res = personalResources.get(resourceUuid);
    if (res) {
      openResource(res);
    }
  };

  const handleDelete = () => {
    addConfirmDialog(transI18n('confirm.delete'), transI18n('cloud.deleteTip'), {
      onOK: () => {
        removePersonalResources();
      },
    });
  };

  const handleDeleteOneResource = (uuid: string) => {
    addConfirmDialog(transI18n('confirm.delete'), transI18n('cloud.deleteTip'), {
      onOK: () => {
        removePersonalResources(uuid);
      },
    });
  };

  const keyWordChangeHandle = useCallback(
    (keyword: string) => {
      setSearchPersonalResourcesKeyword(keyword);
    },
    [setSearchPersonalResourcesKeyword],
  );

  return (
    <>
      {showUploadToast ? <UploadSuccessToast /> : null}
      {showUploadModal ? <UploadModal /> : null}
      <CloudToolbar
        fileCounts={personalResourcesTotalNum}
        keyword={searchPersonalResourcesKeyword}
        onKeywordChange={keyWordChangeHandle}
        onRefresh={() => {
          fetchPersonalResources({
            pageNo: 1,
            pageSize,
            resourceName: searchPersonalResourcesKeyword,
          });
        }}
      />
      <Table>
        <TableHeader>
          <Col width={9}>
            <CheckBox
              checked={isPersonalResSelectedAll}
              indeterminate={isPersonalResSelectedAll ? false : hasSelectedPersonalRes}
              onChange={onClickSelectAll}
            />
          </Col>
          <Col>{transI18n('cloud.fileName')}</Col>
          <Col></Col>
          <Col></Col>
          <Col>{transI18n('cloud.size')}</Col>
          <Col>{transI18n('cloud.updated_at')}</Col>
        </TableHeader>
        <Table className="table-container upload-table-container">
          {personalResourcesList.length > 0 ? (
            personalResourcesList.map((item) => {
              const {
                resourceName = '',
                updateTime,
                size = 0,
                resourceUuid = '',
              } = item.resource || {};
              const checked = item.checked;
              return (
                <Row height={10} border={1} key={resourceUuid}>
                  <Col style={{ paddingLeft: 19 }} width={9}>
                    <CheckBox
                      key={resourceUuid}
                      onChange={() => onItemCheckClick(resourceUuid, checked)}
                      checked={checked}
                    />
                  </Col>
                  <Col style={{ cursor: 'pointer' }} onClick={() => onClickCol(resourceUuid)}>
                    <SvgImg
                      type={fileNameToType(resourceName)}
                      style={{
                        marginRight: '6px',
                        color: FileTypeSvgColor[fileNameToType(resourceName)],
                      }}
                    />
                    <Inline className="filename" color="#191919" title={resourceName}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: searchPersonalResourcesKeyword
                            ? resourceName.replaceAll(
                                searchPersonalResourcesKeyword,
                                `<span style="color: #357BF6">${searchPersonalResourcesKeyword}</span>`,
                              )
                            : resourceName,
                        }}></span>
                    </Inline>
                  </Col>
                  <Col>
                    {item.resource instanceof CloudDriveCourseResource &&
                    item.resource?.taskProgress?.status === 'Converting' ? (
                      <>
                        <Inline color="#586376">
                          <CircleLoading width="18" height="18" />
                        </Inline>
                        <Inline color="#586376" style={{ marginLeft: '6px' }}>
                          {item.resource?.taskProgress?.convertedPercentage}%
                        </Inline>
                      </>
                    ) : null}
                  </Col>
                  <Col>
                    <Popover
                      content={
                        <CloudMoreMenu
                          resourceUuid={resourceUuid}
                          deleteResource={handleDeleteOneResource}
                        />
                      }
                      placement={'bottom'}>
                      <span>
                        <SvgImg type="cloud-more" style={{ cursor: 'pointer' }} canHover />
                      </span>
                    </Popover>
                  </Col>

                  <Col>
                    <Inline color="#586376">{formatFileSize(size)}</Inline>
                  </Col>
                  <Col>
                    <Inline color="#586376">
                      {!!updateTime ? dayjs(updateTime).format('YYYY-MM-DD HH:mm') : '- -'}
                    </Inline>
                  </Col>
                </Row>
              );
            })
          ) : (
            <Placeholder placeholderType="noFile" />
          )}
          <Col className="bottom-col">
            <div className="pagination-wrapper">
              <Pagination
                onChange={(page) => {
                  fetchPersonalResources({
                    pageNo: page,
                    pageSize,
                    resourceName: searchPersonalResourcesKeyword,
                  });
                }}
                current={currentPersonalResPage}
                total={personalResourcesTotalNum}
                pageSize={pageSize}></Pagination>
            </div>
          </Col>
          <Row style={{ paddingLeft: 19 }} className="btn-group margin-gap cloud-btn-group">
            <div
              className="cloud-minimize-container"
              onClick={() => {
                if (showUploadMinimize) {
                  setShowUploadMinimize(false);
                  setShowUploadModal(true);
                }
              }}>
              {showUploadMinimize ? (
                <CloudMinimize
                  state={uploadState}
                  uploadingProgresses={uploadingProgresses as unknown as UploadItem[]}
                />
              ) : null}
            </div>
            <div>
              <input
                ref={fileRef}
                id="upload-image"
                accept={CloudDriveResource.supportedTypes.map(item => '.' + item).join(',')}
                onChange={handleUpload}
                multiple
                type="file"></input>
              <Button type="primary" onClick={triggerUpload}>
                {transI18n('cloud.upload')}
              </Button>
              <Button
                disabled={!hasSelectedPersonalRes || !personalResourcesTotalNum}
                style={{ marginLeft: 15 }}
                type="ghost"
                onClick={handleDelete}>
                {transI18n('cloud.delete')}
              </Button>
            </div>
          </Row>
        </Table>
      </Table>
    </>
  );
});
