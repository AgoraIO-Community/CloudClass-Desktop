import { CircleLoading, SvgIconEnum, SvgImg, transI18n, UploadItem, UploadItemStatus } from '~ui-kit';

export type CloudMinimizeProps = {
  state?: 'uploading' | 'success' | 'error' | 'idle';
  uploadingProgresses: UploadItem[];
};

export default function CloudMinimize({
  state = 'uploading',
  uploadingProgresses,
}: CloudMinimizeProps) {
  return (
    <div className="cloud-upload-minimize">
      {state === 'uploading' ? (
        <span className="upload-minimize-content">
          <CircleLoading width="18" height="18" />
          <span className="upload-minimize-text">
            上传列表
            {uploadingProgresses.filter((item) => item.status === UploadItemStatus.Success).length}/
            {uploadingProgresses.length}
          </span>
        </span>
      ) : null}
      {state === 'success' ? (
        <span className="upload-minimize-content">
          <SvgImg type={SvgIconEnum.CHECKED} size={16} style={{ color: '#52C41A' }} />
          <span className="upload-minimize-text">{transI18n('whiteboard.upload-success')}</span>
        </span>
      ) : null}
      {state === 'error' ? (
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
}
