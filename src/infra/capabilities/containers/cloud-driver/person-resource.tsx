import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { ChangeEvent, useRef, useEffect, useCallback, useState } from 'react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import {
  Col,
  Inline,
  Placeholder,
  Row,
  Table,
  TableHeader,
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
} from '@classroom/ui-kit';
import CloudToolbar from './cloud-toolbar';
import CloudMinimize from './cloud-minimize';
import CloudMoreMenu from './cloud-more-menu';
import { FileTypeSvgColor } from '@classroom/infra/stores/common/cloud-drive';
import { CloudDriveCourseResource } from '@classroom/infra/stores/common/cloud-drive/struct';
import { supportedTypes } from '@classroom/infra/stores/common/cloud-drive/helper';
import { useI18n } from 'agora-common-libs';
import classNames from 'classnames';

const UploadSuccessToast = () => {
  const transI18n = useI18n();
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

const UploadModal = observer(() => {
  const { cloudUIStore } = useStore();
  const { setShowUploadMinimize, setShowUploadModal, uploadingProgresses, classroomStore } =
    cloudUIStore;
  const { cloudDriveStore } = classroomStore;
  const { retryUpload, cancelUpload } = cloudDriveStore;
  const transI18n = useI18n();

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
});

export const PersonalResourcesContainer = observer(() => {
  const [onlineCoursewareModalVisible, setOnlineCoursewareModalVisible] = useState(false);
  const transI18n = useI18n();
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
    personalResourcesTotalNum,
    pageSize,
    currentPersonalResPage,
    removePersonalResources,
    uploadPersonalResource,
    reloadPersonalResources,
    fetchPersonalResources,
    personalResources,
    searchPersonalResourcesKeyword,
    setSearchPersonalResourcesKeyword,
    showUploadMinimize,
    setShowUploadMinimize,
    showUploadModal,
    setShowUploadModal,
    showUploadToast,
    validateFiles,
  } = cloudUIStore;

  const fileRef = useRef<HTMLInputElement>(null);

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
    const files = Array.from(evt.target.files || []);

    if (validateFiles(files)) {
      const filesArr = Array.from(files);
      uploadPersonalResource(filesArr);
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

  const keywordChangeHandle = useCallback(
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
        onKeywordChange={keywordChangeHandle}
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
              let isFailedConverting = false;
              if (
                item.resource instanceof CloudDriveCourseResource &&
                item.resource.status === 'Fail'
              ) {
                isFailedConverting = true;
              }
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
                        color:
                          FileTypeSvgColor[
                            fileNameToType(resourceName) as keyof typeof FileTypeSvgColor
                          ],
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
                    item.resource.status === 'Converting' ? (
                      <>
                        <Inline className="fcr-text-level1">
                          <CircleLoading width="18" height="18" />
                        </Inline>
                        <Inline className="fcr-text-level1" style={{ marginLeft: '6px' }}>
                          {item.resource?.convertedPercentage}%
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
                    <Inline className="fcr-text-level1">{formatFileSize(size)}</Inline>
                  </Col>
                  <Col>
                    <Inline
                      className={classNames('fcr-text-level1', {
                        'cloud-driver-failed-converting': isFailedConverting,
                      })}>
                      {isFailedConverting ? (
                        <span className='cloud-driver-failed_converting-info'>
                          <SvgImg type={SvgIconEnum.FCR_PPT_BROKEN} />{' '}
                          {transI18n('fcr_failed_converting')}
                        </span>
                      ) : !!updateTime ? (
                        dayjs(updateTime).format('YYYY-MM-DD HH:mm')
                      ) : (
                        '- -'
                      )}
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
              {showUploadMinimize ? <CloudMinimize /> : null}
            </div>
            <div className="cloud-btn-group-right">
              <input
                ref={fileRef}
                id="upload-image"
                accept={supportedTypes.map((item) => '.' + item).join(',')}
                onChange={handleUpload}
                multiple
                type="file"
              />
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
        onCancel={() => {
          setOnlineCoursewareModalVisible(false);
          reloadPersonalResources();
        }}></UploadOnlineCoursewareModal>
    </>
  );
});
export interface IUploadOnlineCoursewareData {
  url: string;
  resourceName: string;
}
const UploadOnlineCoursewareModal = (props: { visible: boolean; onCancel: () => void }) => {
  const { visible, onCancel } = props;
  const [formData, setFormData] = useState({
    url: '',
    resourceName: '',
  });
  const {
    shareUIStore: { addToast },
    cloudUIStore: { addOnlineCourseware },
  } = useStore();
  const transI18n = useI18n();
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
    await addOnlineCourseware(formData);

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
