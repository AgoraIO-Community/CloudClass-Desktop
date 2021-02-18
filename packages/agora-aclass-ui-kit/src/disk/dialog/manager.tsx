import {
  Dialog as MDialog,
  DialogContent as MDialogContent,
  DialogContentText as MDialogContentText,
  DialogActions,
  Box,
  Typography,
  DialogTitle as MDialogTitle,
  Dialog,
  Theme,
  Paper,
  TableContainer,
} from '@material-ui/core'
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles'
import React, { ReactEventHandler } from 'react'
import { CustomizeTheme, themeConfig } from '../../theme'
import { noop } from '../../declare'

import { DiskTabs, DiskTab } from "./tabs";
import { DiskFramePaper } from '../dialog/frame'

import PrivateDiskTables from '../table/private-disk-table'
import PublicDiskTables from '../table/public-disk-table'
import DownloadDiskTables from "../table/download-disk-table";


const useStyles = makeStyles((theme: Theme) => {
  const styles = createStyles({
    root: {
      overflow: 'hidden',
    },
    backDrop: {
      // '&:first-child': {
      //   background: 'inherit',
      // },
      // background: 'transparent',
    },

    promptPaper: {
      fontFamily: theme.typography.fontFamily,
      width: '167.5px',
      height: '102.5px',
      border: '5px solid #002591',
      borderColor: '#002591',
      borderRadius: '7px',
    },
    dialogContent: {
      backgroundColor: '#002591',
      background: '#ffffff',
      fontFamily: theme.typography.fontFamily,
      position: 'relative',
      padding: '0px',
      '&:first-child': {
        padding: '0px'
      }
    },
    dialogButtonGroup: {
      fontFamily: theme.typography.fontFamily,
      display: 'flex',
      justifyContent: 'center'
    },
    dialogTextTypography: {
      fontFamily: theme.typography.fontFamily,
      color: '#002591',
      textAlign: 'center',
      fontSize: '8px',
      marginTop: '6px',
      marginBottom: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '36px',
    },
  })
  return styles
})

interface NetworkDiskDialogProps {
  title?: string,
  fullWidth: boolean,
  visible: boolean,
  children?: React.ReactElement,
  onClose?: ReactEventHandler<any>,
  id?: number,
  paperStyle?: React.CSSProperties,
  dialogContentStyle?: React.CSSProperties,
  dialogHeaderStyle?: React.CSSProperties,
  closeBtnStyle?: React.CSSProperties,
  questionBtnStyle?: React.CSSProperties,
  fileTooltipText?: any,
  // list data
  publicList?: any,
  privateList?: any,
  downloadList?: any,
  // upload
  uploadComponent?: React.ReactNode,
  handleDelete: (evt: any) => any,
  removeText: string,
  removeSuccess: string,
  removeFailed: string,
  showOpenItem?: boolean,
  handleOpenCourse?: (evt: any) => any,
  // deleteComponent?: React.ReactNode,
  refreshComponent?: React.ReactNode,
  // downloadComponet
  donwloadAllComponent?: React.ReactNode,
  deleteAllCacheComponent?: React.ReactNode,
  singleDownloadComponent?: React.ReactNode,
  singleDeleteComponent?: React.ReactNode,
  diskText?: any,
  diskOpenText?: any,
  inRoom?: boolean,
}

const NetworkDiskDialog: React.FC<NetworkDiskDialogProps> = (props) => {

  const classes = useStyles()
  const onClose = props.onClose ? props.onClose: noop
  const [activeValue, setActiveValue] = React.useState(0)
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setActiveValue(newValue)
  };

  const DiskPaper = (paperProps: any) => {
    return (
      <DiskFramePaper
        {...paperProps}
        closeBtnStyle={props.closeBtnStyle}
        questionBtnStyle={props.questionBtnStyle}
        fileTooltipText={props.fileTooltipText}
        headerStyle={props.dialogHeaderStyle}
        onClose={onClose}
        showHeader={true}
        title={props.title} />
    )
  }

  const onUpload = () => {
    console.log('onupload')
  }

  const render = () => {
    return (
      <MDialog
        maxWidth={'md'}
        fullWidth={true}
        BackdropProps={{
          style: {
            background: 'transparent',
          }
        }}
        PaperComponent={(paperProps: any) => {
          return (DiskPaper(paperProps))
        }}
        PaperProps={{
          style: {
            // width: '800px',
            // height: '586px',
            borderRadius: '20px',
            ...props.paperStyle
          },
        }}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        open={props.visible}
        onClose={onClose}
      >
        {/*  active Id  tables */}
        {/*<tabs value={activeId} />*/}
        {/*<activeId === xxx && (渲染不同 table 组件)>*/}
        <div style={{ marginTop: '-2.2rem' }}>
          {props.inRoom === true && 
            <DiskTabs
              value={activeValue}
              onChange={handleChange}
              aira-label="disk tabs"
            >
              <DiskTab id="disk-tab-public" label={props.diskText.publicTab} />
              <DiskTab id="disk-tab-private" label={props.diskText.privateTab} />
            </DiskTabs>
          }
          {props.inRoom === false && 
            <DiskTabs
              value={activeValue}
              onChange={handleChange}
              aira-label="disk tabs"
            >
              <DiskTab id="disk-tab-ware" label={props.diskText.downloadTab} />
            </DiskTabs>
          }
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
          <Paper style={{
            width: '770px',
            borderRadius: '10px',
            marginBottom: '16px',
          }}>
            <TableContainer style={{
              display: 'flex',
              height: '480px',
              width: '730px',
              borderRadius: '20px',
              padding: '20px',
              flexDirection: 'column'
            }}>
              {
                props.inRoom === true && activeValue === 0 && (
                  <PublicDiskTables
                    diskText={props.diskText}
                    tabValue={activeValue}
                    publicList={props.publicList}
                    showOpenItem={props.showOpenItem}
                    handleOpenCourse={props.handleOpenCourse}
                    showText={props.diskOpenText}
                  ></PublicDiskTables>
                )
              }

              {
                props.inRoom === true && activeValue === 1 && (
                  <PrivateDiskTables tabValue={activeValue}
                    diskText={props.diskText}
                    uploadComponent={props.uploadComponent}
                    handleDelete={props.handleDelete}
                    showOpenItem={props.showOpenItem}
                    handleOpenCourse={props.handleOpenCourse}
                    // deleteComponent={props.deleteComponent}
                    refreshComponent={props.refreshComponent}
                    removeText={props.removeText}
                    removeSuccess={props.removeSuccess}
                    removeFailed={props.removeFailed}
                    privateList={props.privateList}
                    showText={props.diskOpenText}
                  ></PrivateDiskTables>
                )
              }
              {
                props.inRoom === false && activeValue === 0 && (
                  <DownloadDiskTables
                    showOpenItem={props.showOpenItem}
                    handleOpenCourse={props.handleOpenCourse}
                    diskText={props.diskText}
                    tabValue={activeValue}
                    donwloadAllComponent={props.donwloadAllComponent}
                    deleteAllCacheComponent={props.deleteAllCacheComponent}
                    singleDownloadComponent={props.singleDownloadComponent}
                    singleDeleteComponent={props.singleDeleteComponent}
                    downloadList={props.downloadList}
                    showText={props.diskOpenText}
                  />
                )
              }
            </TableContainer>
          </Paper>
        </div>
      </MDialog>
    )
  }

  return render()
}

export interface DiskManagerDialogProps extends NetworkDiskDialogProps {}

export const DiskManagerDialog: React.FC<DiskManagerDialogProps> = (props) => {
  return (
    // <CustomizeTheme>
      <NetworkDiskDialog {...props} />
    // </CustomizeTheme>
  )
}