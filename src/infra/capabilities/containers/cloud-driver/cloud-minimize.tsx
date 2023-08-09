import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { CircleLoading, SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { CloudDriveResourceUploadStatus } from 'agora-edu-core';
import { useI18n } from 'agora-common-libs';

export default observer(function CloudMinimize() {
  const { cloudUIStore } = useStore();
  const { uploadingProgresses, uploadState } = cloudUIStore;
  const transI18n = useI18n();

  return (
    <div className="cloud-upload-minimize">
      {uploadState === 'uploading' ? (
        <span className="upload-minimize-content">
          <CircleLoading width="18" height="18" />
          <span className="upload-minimize-text">
            <span className="fcr-mr-1">{transI18n('cloud.upload_list')}</span>
            {
              uploadingProgresses.filter(
                (item) => item.status === CloudDriveResourceUploadStatus.Success,
              ).length
            }
            /{uploadingProgresses.length}
          </span>
        </span>
      ) : null}
      {uploadState === 'success' ? (
        <span className="upload-minimize-content">
          <SvgImg type={SvgIconEnum.CHECKED} size={16} style={{ color: '#52C41A' }} />
          <span className="upload-minimize-text">{transI18n('whiteboard.upload-success')}</span>
        </span>
      ) : null}
      {uploadState === 'error' ? (
        <span className="upload-minimize-content">
          <SvgImg type={SvgIconEnum.RED_CAUTION} size={16} style={{ color: '#F04C36' }} />
          <span className="upload-minimize-text">{transI18n('whiteboard.upload-error')}</span>
        </span>
      ) : null}
      <span>
        <SvgImg type={SvgIconEnum.TRIANGLE_SOLID_UP} size={16} style={{ marginLeft: 4 }} />
      </span>
    </div>
  );
});
