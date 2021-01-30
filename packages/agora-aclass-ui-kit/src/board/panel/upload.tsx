import { Box, createStyles, makeStyles } from '@material-ui/core'
import React from 'react'

export interface IUploadItem {
  itemName: string,
  type: string
}

export interface UploadProps {
  handleUploadFile: (files: File[], type: string) => Promise<any>,
  items: IUploadItem[]
}

const useStyles = makeStyles(() => ({
  uploadBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadHeader: {
    fontWeight: 400,
    color: '#212324'
  },
  uploadTitle: {
    display: 'flex',
  },
  uploadContent: {
    display: 'flex',
  },
  uploadItemBox: {
    display: 'inline-block',
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  }
}))

export const FileUploader = (props: UploadProps) => {

  const classes = useStyles()

  const handleUpload = () => {

  }

  return (
    <div className={classes.uploadBox}>
      <UploadItem type="png" handleUpload={handleUpload}>
      </UploadItem>
      <UploadItem type="ppt" handleUpload={handleUpload}>
      </UploadItem>
      <UploadItem type="dynamic" handleUpload={handleUpload}>
      </UploadItem>
      <UploadItem type="media" handleUpload={handleUpload}>
      </UploadItem>
    </div>
  )
}

const UploadItem = (props: any) => {
  const classes = useStyles()
  return (
    <div className={classes.uploadItemBox}>
      <div className={classes.uploadHeader}>
        <div className={classes.uploadTitle}>{props.header}</div>
        <div style={{
          position: 'absolute',
          background: `url(${props.icon})`
        }}></div>
      </div>
      <div className={classes.uploadContent}>{props.content}</div>
    </div>
  )
}