import { makeStyles } from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React, { ReactEventHandler, useRef } from 'react'
import ConvertPPTPng from '../assets/convert_ppt.png'
import ImagePng from '../assets/image.png'
import MediaPng from '../assets/media.png'
import StaticPPTPng from '../assets/static_ppt.png'

export interface IUploadItem {
  itemName: string,
  type: string
}

export interface UploadProps {
  handleUploadFile: (evt: React.SyntheticEvent<HTMLInputElement, Event>, type: string) => Promise<any>,
  // items: IUploadItem[]
}

const useStyles = makeStyles(() => ({
  uploadBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  uploadHeader: {
    fontWeight: 400,
    color: '#212324',
    display: 'flex',
    flexDirection: 'column',
  },
  uploadTitle: {
    color: '#162D79',
    fontSize: '16px',
  },
  uploadDesc: {
    color: '#A9AEC5',
    fontSize: '14px',
  },
  uploadItemBox: {
    margin: 2,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    boxSizing: 'border-box',
    border: '2px solid #162D79',
    borderRadius: '6px',
    background: '#ffffff',
    position: 'relative',
    '&:hover': {
      border: '2px solid #D7AA1E'
      // backgroundColor: 'rgba(33, 35, 36, 0.3)',
    },
    // '&:active': {
    //   backgroundColor: 'rgba(33, 35, 36, 0.1)',
    // }
  },
  inputUploader: {
    opacity: 0.0,
    width: '100%',
    height: '100%',
    position: 'absolute',
    cursor: 'pointer'
  }
}))

export const FileUploader = (props: UploadProps) => {

  const classes = useStyles()

  const uploadImage = async (evt: React.SyntheticEvent<HTMLInputElement, Event>) => {
    await props.handleUploadFile(evt, 'image')
  }

  const uploadStaticPPT = async (evt: React.SyntheticEvent<HTMLInputElement, Event>) => {
    await props.handleUploadFile(evt, 'static_ppt')
  }

  const uploadDynamicPPT = async (evt: React.SyntheticEvent<HTMLInputElement, Event>) => {
    await props.handleUploadFile(evt, 'dynamic_ppt')
  }

  const uploadMediaFile = async (evt: React.SyntheticEvent<HTMLInputElement, Event>) => {
    await props.handleUploadFile(evt, 'file')
  }


  return (
    <div className={classes.uploadBox}>
      <UploadItem
        title="image"
        description={"jpg,png,gif"}
        icon={ImagePng}
        handleUpload={uploadImage}
        accept="image/*,.bmp,.jpg,.png,.gif"
      />
      <UploadItem
        title="ppt"
        description={"ppt"}
        icon={StaticPPTPng}
        handleUpload={uploadStaticPPT}
        accept=".pptx"
      />
      <UploadItem
        title="dynamic"
        description={"dynamic"}
        icon={ConvertPPTPng}
        handleUpload={uploadDynamicPPT}
        accept=".pptx"
      />
      <UploadItem
        title="media"
        description={"media"}
        icon={MediaPng}
        handleUpload={uploadMediaFile}
        accept=".mp4,.mp3"
      />
    </div>
  )
}

export interface UploaderProps extends React.ClassAttributes<HTMLInputElement>, React.InputHTMLAttributes<HTMLInputElement> {
  style?: CSSProperties,
  accept: string,
}

const Uploader: React.FC<UploaderProps> = (props) => {
  return (
    <input ref={props.ref} type="file" accept={props.accept} className={props.className} onChange={props.onChange} />
  )
}

export interface UploadItemProps {
  title: string,
  description: string,
  icon: string,
  handleUpload: ReactEventHandler<HTMLInputElement>,
  accept: string,
}

const UploadItem: React.FC<UploadItemProps> = (props) => {

  const fileRef = useRef<any>(null)

  const classes = useStyles()

  const onChange = (evt: React.SyntheticEvent<HTMLInputElement, Event>) => {
    props.handleUpload(evt)
    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  return (
    <div className={classes.uploadItemBox}>
      <img style={{width: 24, height: 24, margin: '0 13px'}} src={props.icon} />
      <div className={classes.uploadHeader}>
        <div className={classes.uploadTitle}>{props.title}</div>
        <div className={classes.uploadDesc}>{props.description}</div>
      </div>
      <Uploader ref={fileRef} type="file" accept={props.accept} className={classes.inputUploader} onChange={onChange} />
    </div>
  )
}