import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { ChangeEvent, useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from '@/infra/hooks/ui-store';
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
  Input,
  SvgIconEnum,
} from '~ui-kit';
import CloudToolbar from './cloud-toolbar';
import CloudMinimize from './cloud-minimize';
import CloudMoreMenu from './cloud-more-menu';
import { FileTypeSvgColor, UploadItem as CloudUploadItem } from '@/infra/stores/common/cloud-drive';
import { CloudDriveResourceUploadStatus } from 'agora-edu-core';
import { debounce } from 'lodash';
import { CloudDriveCourseResource } from '@/infra/stores/common/cloud-drive/struct';
import { supportedTypes } from '@/infra/stores/common/cloud-drive/helper';

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
  const [onlineCoursewareModalVisible, setOnlineCoursewareModalVisible] = useState(false);
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
    addOnlineCourseware,
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
      uploadingProgresses.length > 0 &&
      uploadingProgresses.length ===
        uploadingProgresses.filter(
          (item: CloudUploadItem) => item.status === CloudDriveResourceUploadStatus.Success,
        ).length
    ) {
      uploadingRef.current = false;
      setUploadState('success');
      setShowUploadToast(true);
      showUploadModal && setShowUploadModal(false);
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
  const onOnlineCoursewareSubmit = async (formData: IUploadOnlineCoursewareData) => {
    await addOnlineCourseware(formData);
  };
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
                ext,
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
                      type={fileNameToType(ext)}
                      style={{
                        marginRight: '6px',
                        color: FileTypeSvgColor[fileNameToType(resourceName)],
                      }}
                    />
                    <Inline className="filename" title={resourceName}>
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
                        <Inline className="text-level1">
                          <CircleLoading width="18" height="18" />
                        </Inline>
                        <Inline className="text-level1" style={{ marginLeft: '6px' }}>
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
                        <SvgImg type={SvgIconEnum.CLOUD_MORE} style={{ cursor: 'pointer' }} />
                      </span>
                    </Popover>
                  </Col>

                  <Col>
                    <Inline className="text-level1">{formatFileSize(size)}</Inline>
                  </Col>
                  <Col>
                    <Inline className="text-level1">
                      {!!updateTime ? dayjs(updateTime).format('YYYY-MM-DD HH:mm') : '- -'}
                    </Inline>
                  </Col>
                </Row>
              );
            })
          ) : (
            <Placeholder placeholderType="noFile" />
          )}
          {personalResourcesList.length > 0 && (
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
          )}
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
            <div className="cloud-btn-group-right">
              <input
                ref={fileRef}
                id="upload-image"
                accept={supportedTypes.map((item) => '.' + item).join(',')}
                onChange={handleUpload}
                multiple
                type="file"></input>
              <div className="upload-btn-group">
                <Button type="primary" onClick={triggerUpload}>
                  {transI18n('cloud.upload')}
                </Button>
                <Popover
                  content={
                    <div
                      className="upload-btn-popover"
                      onClick={() => setOnlineCoursewareModalVisible(true)}>
                      {transI18n('fcr_online_courseware_button_upload_online_file')}
                    </div>
                  }
                  getPopupContainer={(dom) => (dom.parentNode as HTMLElement) || dom}>
                  <Button type="primary">···</Button>
                </Popover>
              </div>

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
      <UploadOnlineCoursewareModal
        visible={onlineCoursewareModalVisible}
        onOk={onOnlineCoursewareSubmit}
        onCancel={() => {
          setOnlineCoursewareModalVisible(false);
          debouncedFetchPersonalResources();
        }}></UploadOnlineCoursewareModal>
    </>
  );
});
export interface IUploadOnlineCoursewareData {
  url: string;
  resourceName: string;
}
const UploadOnlineCoursewareModal = (props: {
  visible: boolean;
  onCancel: () => void;
  onOk: (formData: IUploadOnlineCoursewareData) => Promise<void>;
}) => {
  const { visible, onCancel, onOk } = props;
  const [formData, setFormData] = useState({
    url: '',
    resourceName: '',
  });
  const {
    shareUIStore: { addToast },
  } = useStore();
  const onSubmit = async () => {
    if (!formData.url || !formData.resourceName) {
      addToast(transI18n('fcr_online_courseware_input_content'), 'warning');
      return;
    }
    if (
      !formData.url.match(
        /(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/,
      )
    ) {
      addToast(transI18n('fcr_online_courseware_valid_url'), 'warning');
      return;
    }
    await onOk(formData);

    addToast(transI18n('cloud.upload_success'), 'success');
    onCancel();
  };
  return visible ? (
    <Modal
      className="cloud-upload-form-modal"
      title={transI18n('fcr_online_courseware_label_uploadpage')}
      closable
      onCancel={onCancel}
      onOk={onSubmit}
      footer={[
        <Button key={1} action="cancel" type="ghost">
          {transI18n('fcr_online_courseware_button_close')}
        </Button>,
        <Button key={2} action="ok" className="disableAGModalClose">
          {transI18n('fcr_online_courseware_button_upload')}
        </Button>,
      ]}>
      <div className="cloud-upload-form-modal-form">
        <div className="cloud-upload-form-item">
          <span>{transI18n('fcr_online_courseware_label_link')}:</span>
          <Input
            maxLength={512}
            placeholder={transI18n('fcr_please_input')}
            value={formData.url}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                url: e.target.value,
              }));
            }}></Input>
        </div>
        <div className="cloud-upload-form-item">
          <span>{transI18n('fcr_online_courseware_label_file_name')}:</span>
          <Input
            maxLength={100}
            placeholder={transI18n('fcr_please_input')}
            value={formData.resourceName}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                resourceName: e.target.value,
              }));
            }}></Input>
        </div>
      </div>
    </Modal>
  ) : null;
};
