import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import IconPpt from '../assets/icon-ppt.png'
import IconWord from '../assets/icon-word.png'
import IconExcel from '../assets/icon-excel.png'
import IconPdf from '../assets/icon-pdf.png'
import IconVideo from '../assets/icon-video.png'
import IconAudio from '../assets/icon-audio.png'
import IconTxt from '../assets/icon-txt.png'
import IconPicture from '../assets/icon-pic.png'

export interface TipIconListProps {
  icon: string,
  fileName?: string,
  fileType?: string,
}

const useStylesFileType = makeStyles(() => ({
  container: {
    width: '230px',
    height: '467px',
    borderRadius: '10px',
    paddingTop: '18px',
    paddingLeft: '20px',
    zIndex: 9999,
  },
  title: {
    color: '#586376',
    fontSize: '12px',
  },
  fileItem: {
    display: 'flex',
    alignContent: 'space-between',
    paddingTop: '10px',
  },
  fileIcon: {
    width: '22.4px',
    height: '22.4px',
  },
  fileText: {
    paddingLeft: '8px',
  },
  fileName: {
    fontSize: '14px',
    color: '#273D75',
  },
  fileType: {
    fontSize: '12px',
    color: '#586376',
  }
}))

export const FileSupportTitle = () => {
  const classes = useStylesFileType()

  // file support item
  const fileSupportList: TipIconListProps[] = [
    {icon: IconPpt, fileName: 'Powerpoint演示文档', fileType: '格式类型: ppt pptx pptm'},
    {icon: IconWord, fileName: 'Word文档', fileType: '格式类型: docx doc'},
    {icon: IconExcel, fileName: 'Excel文档', fileType: '格式类型: xlsx xls csv'},
    {icon: IconPdf, fileName: 'Pdf文档', fileType: '格式类型: pdf'},
    {icon: IconVideo, fileName: '视频', fileType: '格式类型: XXX'},
    {icon: IconAudio, fileName: '音频', fileType: '格式类型: XXX'},
    {icon: IconTxt, fileName: '文本文档', fileType: '格式类型: XXX'},
    {icon: IconPicture, fileName: '图片', fileType: '格式类型: XXX'},
  ]

  return (
    <Box id="disk-icon-file" className={classes.container}>
      <div className={classes.title}>教室内支持的文件格式</div>
      {
        fileSupportList.map((item, index) => {
          return <div key={index} className={classes.fileItem}>
            <img src={item.icon} className={classes.fileIcon} />
            <div className={classes.fileText}>
              <div className={classes.fileName}>{item.fileName}</div>
              <div className={classes.fileType}>{item.fileType}</div>
            </div>
          </div>
        })
      }
    </Box>
  )
}

export default FileSupportTitle

