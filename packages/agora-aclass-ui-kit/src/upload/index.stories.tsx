import React, { useRef, useState } from 'react'
import CircularProgress, { CircularProgressProps } from '@material-ui/core/CircularProgress';
import {UploadFile} from './index'
// import axios from 'axios'

export default {
  title: '上传',
  argTypes: {
    showUploadList: { control: 'boolean' },
    actionUrl: { control: 'string' },
    uploadButton: { control: 'components' },
  }
}

export const EducationUpload = (props) => {
  return (
    <UploadFile {...props}/>
  )
}

const actionUrl = 'https://api.agora.io/edu/apps/47b7535dcb9a4bb4aa592115266eae98/v2/rooms/test0/users/cd58c1152afa2f56ae1da440ebd3e503/resources';
EducationUpload.args = {
  showUploadList: true,
  uploadButton: () => {
    return <button>开始上传</button>
  },

  actionUrl: 'https://api.agora.io/edu/apps/47b7535dcb9a4bb4aa592115266eae98/v2/rooms/test0/users/cd58c1152afa2f56ae1da440ebd3e503/resources',
  xhrHttpHeader: {
    'Content-Type': 'application/json',
    'x-agora-token': '00647b7535dcb9a4bb4aa592115266eae98IADsG4/VdRo714cxZi4Y/P4QpHsW4ec0HQUGxbRx5ErMAlAMYq0AAAAAIgB2UmECaecYYAQAAQD/////AgD/////AwD/////BAD/////',
    'x-agora-uid': 'cd58c1152afa2f56ae1da440ebd3e503',
  },
 
  progressComponents:()=>{
    return <CircularProgress/>
  },
  onStart:(event)=>{
    console.log('onStart',event)
  },
  beforeUpload:(event)=>{
    console.log('beforeUpload',event);
  },
  onProgress:(event)=>{
    console.log('onProgress',event);
  },
  onSuccess:(event)=>{
    console.log('event',event);
  },
  onError:(error)=>{
    console.log('error',error)
  },
  customRequest: ({
    action,
    data,
    file,
    filename,
    headers,
    onError,
    onProgress,
    onSuccess,
    withCredentials,
  }) => {
    // TO DO
    // axios.post(actionUrl, 'formData', {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'x-agora-token': '00647b7535dcb9a4bb4aa592115266eae98IADsG4/VdRo714cxZi4Y/P4QpHsW4ec0HQUGxbRx5ErMAlAMYq0AAAAAIgB2UmECaecYYAQAAQD/////AgD/////AwD/////BAD/////',
    //     'x-agora-uid': 'cd58c1152afa2f56ae1da440ebd3e503',
    //   },
    //   onUploadProgress: ({ loaded, total }: any) => {
    //     onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
    //   },
    // })
    //   .then(({ data: response }: any) => {
    //     onSuccess(response, file);
    //   })
    //   .catch(onError);
  }
}
