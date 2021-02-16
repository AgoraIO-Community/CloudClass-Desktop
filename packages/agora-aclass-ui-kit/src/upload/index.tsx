import React, { useRef, useState } from 'react'
import { makeStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Upload from "rc-upload";
import { RcFile } from "rc-upload/lib/interface";

export default {
  title: '上传',
  argTypes: {
    showUploadList: { control: 'boolean' },
    actionUrl: { control: 'string' },
    uploadButton: { control: 'components' },
  }
}
const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 10,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#1a90ff',
    },
  }),
)(LinearProgress);

interface IProps {
  showUploadList?: boolean;
  uploadButton: () => React.ReactNode;
  progressComponents?: () => React.ReactNode;
  onStart?: (file?: any) => any;
  beforeUpload?: (file?: any) => any;
  onProgress?: (percent: any, file?: any) => any;
  onSuccess?: (file?: any) => any;
  onError?: (error?: any) => any,
  customRequest?: (arg?: any) => any,
}
export const UploadFile = (props: IProps) => {
  const uploader = useRef<any>();
  const [files, setFiles] = useState<any | any[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const {
    showUploadList = true,
    uploadButton,
    progressComponents,
    onStart,
    beforeUpload,
    onProgress,
    onSuccess,
    onError,
    customRequest: sendRequest,
  } = props;
  const uploaderProps = {
    multiple: false,
    onStart(file: { name: any; }) {
      onStart && onStart(file)
      setFiles([file])
    },
    onSuccess(res: any, file: { name: any; }) {
      onSuccess && onSuccess()
      console.log('onSuccess', res, file.name);
    },
    onError(err: any) {
      onError && onError(err)
      console.log('onError', err);
    },
    onProgress({ percent }: any, file: { name: any; }) {
      console.log('onProgress', `${percent}%`, file.name);
      setUploadProgress(percent)
      onProgress && onProgress(percent, file.name)
    },
    beforeUpload(file: RcFile) {
      beforeUpload && beforeUpload(file)
      return true;
    },
    customRequest({
      action,
      data,
      file,
      filename,
      headers,
      onError,
      onProgress,
      onSuccess,
      withCredentials,
    }: any) {
      sendRequest && sendRequest({
        action,
        data,
        file,
        filename,
        headers,
        onError,
        onProgress,
        onSuccess,
        withCredentials,
      });
      return {
        abort() {
          setFiles([]),
            setUploadProgress(0);
          uploader.current?.abort(file);
        },
      };
    },
  };

  const abort = (file: any) => {
    setFiles([]),
      setUploadProgress(0);
    uploader.current?.abort(file);
  }
  return (
    <div >
      <Upload {...uploaderProps} ref={uploader} >
        {uploadButton()}
      </Upload>
      {showUploadList ? <>
        {files.map((item: any) => {
          return <div key={item.uid}>
            {progressComponents ? progressComponents() :
              <>
                <BorderLinearProgress variant="determinate" value={uploadProgress} />
                <button onClick={() => abort(item)}>取消上传</button>
              </>}

          </div>
        })}
      </> : null}
    </div>
  )
}
