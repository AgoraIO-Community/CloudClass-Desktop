import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import { ChangeEvent, useState, useRef, useEffect } from 'react';
import { useStore } from '~hooks/use-edu-stores';
import { CloudDriveCourseResource } from 'agora-edu-core';
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
} from '~ui-kit';

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

export const PersonalResourcesContainer = observer(() => {
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
    setPersonalResCurrentPage,
    removePersonalResources,
    uploadPersonalResource,
    fetchPersonalResources,
    personalResources,
  } = cloudUIStore;

  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showUploadToast, setShowUploadToast] = useState<boolean>(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchPersonalResources({ pageNo: currentPersonalResPage, pageSize });
  }, []);

  useEffect(() => {
    if (!uploadingProgresses.length) {
      setShowUploadModal(false);
    }
  }, [uploadingProgresses]);

  const finishUpload = () => {
    setShowUploadModal(false);
    setShowUploadToast(true);
    setTimeout(() => {
      setShowUploadToast(false);
    }, 1000);
    if (currentPersonalResPage !== 1) {
      setPersonalResCurrentPage(1);
    } else {
      fetchPersonalResources({ pageNo: currentPersonalResPage, pageSize });
    }
  };

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
        const taskArr = [];
        for (const file of files) {
          taskArr.push(uploadPersonalResource(file));
        }
        await Promise.all(taskArr);
        finishUpload();
      }
    } catch (e) {
      setShowUploadModal(false);
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
    addConfirmDialog(transI18n('confirm.delete'), transI18n('cloud.deleteTip'), () => {
      removePersonalResources();
    });
  };

  const UploadModal = () => {
    return (
      <Modal
        animate={false}
        title={transI18n('cloud.upload')}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450,
        }}
        closable={false}
        onCancel={() => {
          setShowUploadModal(false);
        }}>
        <Loading hasLoadingGif={false} noCloseBtn={true} uploadItemList={uploadingProgresses} />
      </Modal>
    );
  };

  return (
    <>
      <Row style={{ paddingLeft: 19 }} className="btn-group margin-gap">
        <input
          ref={fileRef}
          id="upload-image"
          accept=".bmp,.jpg,.png,.gif,.pdf,.jpeg,.pptx,.ppt,.doc,.docx,.mp3,.mp4"
          onChange={handleUpload}
          multiple
          type="file"></input>
        <Button type="primary" onClick={triggerUpload}>
          {transI18n('cloud.upload')}
        </Button>
        <Button
          disabled={!hasSelectedPersonalRes || !personalResourcesTotalNum}
          type="ghost"
          onClick={handleDelete}>
          {transI18n('cloud.delete')}
        </Button>
        {showUploadToast ? <UploadSuccessToast></UploadSuccessToast> : null}
        {showUploadModal ? <UploadModal></UploadModal> : null}
      </Row>
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
                    <SvgImg type={fileNameToType(resourceName)} style={{ marginRight: '6px' }} />
                    <Inline className="filename" color="#191919" title={resourceName}>
                      {resourceName}
                    </Inline>
                  </Col>
                  <Col>
                    {item.resource instanceof CloudDriveCourseResource &&
                    item.resource?.taskProgress?.status === 'Converting' ? (
                      <>
                        <Inline color="#586376">
                          <CircleLoading width="18" height="18"></CircleLoading>
                        </Inline>
                        <Inline color="#586376" style={{ marginLeft: '6px' }}>
                          {item.resource?.taskProgress?.convertedPercentage}%
                        </Inline>
                      </>
                    ) : null}
                  </Col>
                  <Col>
                    <Inline color="#586376">{formatFileSize(size)}</Inline>
                  </Col>
                  <Col>
                    <Inline color="#586376">
                      {dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss')}
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
                onChange={(page) => setPersonalResCurrentPage(page)}
                current={currentPersonalResPage}
                total={personalResourcesTotalNum}
                pageSize={pageSize}></Pagination>
            </div>
          </Col>
        </Table>
      </Table>
    </>
  );
});
