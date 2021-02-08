import React from 'react';
import { UploadFile, Button } from "agora-aclass-ui-kit";
import { UploadFileProvider, IAliOSSConfig } from './uploadFile'
import { useAppStore } from '@/hooks';
import  uuidv4  from 'uuid/v4';

export const demoOssConfig: IAliOSSConfig = {
  "accessKeyId": `${REACT_APP_YOUR_OWN_OSS_BUCKET_KEY}`,
  "accessKeySecret": `${REACT_APP_YOUR_OWN_OSS_BUCKET_SECRET}`,
  "bucket": `${REACT_APP_YOUR_OWN_OSS_BUCKET_NAME}`,
  "endpoint": `${REACT_APP_YOUR_OWN_OSS_CDN_ACCELERATE}`,
}
const uploadButton = () => {
  return <Button text="开始上传" />

}
const progressComponents = () => {
  return <div>1111</div>
}
const onStart = (file: File) => {
}

export const CloudDiskUpload = () => {
  const appStore = useAppStore()
  const ossConfig = appStore?.params?.config?.oss
  let config = demoOssConfig
  if (ossConfig) {
    config = {
      "accessKeyId": `${ossConfig.accessKey}`,
      "accessKeySecret": `${ossConfig.secretKey}`,
      "bucket": `${ossConfig.bucketName}`,
      "endpoint": `${ossConfig.endpoint}`,
    }
  }
  const handlerUpload = new UploadFileProvider(config)
  const customRequest = (res: any) => {
    handlerUpload.setFolder('/test/')
    const fileData = {
      file: res.file,
      path: `${uuidv4()}${res.file.name}`
    }
    handlerUpload.uploadFile(fileData)
  }
  return <>
    <UploadFile
      onStart={(file: File) => onStart(file)}
      progressComponents={progressComponents}
      uploadButton={uploadButton}
      customRequest={customRequest} />
  </>
}
