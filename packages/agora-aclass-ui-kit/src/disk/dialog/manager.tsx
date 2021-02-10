import {Dialog as MDialog, DialogContent as MDialogContent, DialogContentText as MDialogContentText, DialogActions, Box, Typography, DialogTitle as MDialogTitle, Dialog, Theme} from '@material-ui/core'
import { Tabs as MTabs, Tab as MTab } from '@material-ui/core'
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles'
import React, { ReactEventHandler } from 'react'
import { CustomizeTheme, themeConfig } from '../../theme'
import { noop } from '../../declare'
import { DiskFramePaper } from '../dialog/frame'
import DiskTables from '../table/list'

interface DiskTabsProps {
  value: number;
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

const DiskTabs = withStyles({
  indicator: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginTop: '-2.2rem',
    marginRight: '-1.1rem',
    "& > span": {
      maxWidth: 80,
      width: "100%",
      backgroundColor: "#74BFFF"
    }
  }
})((props: DiskTabsProps) => (
  <MTabs {...props} TabIndicatorProps={{ children: <span /> }} />
));

interface DiskTabProps {
  label: string;
}

const DiskTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: "none",
      color: "#fff",
      fontWeight: 400,
      fontSize: "16px",
      marginRight: '-40px',
      "&:focus": {
        opacity: 1,
      },
      "&:hover": {
        opacity: 1,
      },
      "&:active": {
        color: 0.6,
      },
    }
  })
)((props: DiskTabProps) => <MTab disableRipple {...props} />);


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
}

const NetworkDiskDialog: React.FC<NetworkDiskDialogProps> = (props) => {

  const classes = useStyles()
  const onClose = props.onClose ? props.onClose: noop
  const [value, setValue] = React.useState(0)
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  };

  const DiskPaper = (paperProps: any) => {
    return (
      <DiskFramePaper
        {...paperProps}
        closeBtnStyle={props.closeBtnStyle}
        questionBtnStyle={props.questionBtnStyle}
        headerStyle={props.dialogHeaderStyle}
        onClose={onClose}
        showHeader={true}
        title={props.title} />
    )
  }

  const DiskTabsComponent = () => {
    return (
      <div style={{ marginTop: '-2.2rem' }}>
        <DiskTabs
          value={value}
          onChange={handleChange}
          aira-label="disk tabs"
        >
          <DiskTab label="公共资源" />
          <DiskTab label="我的云盘" />
        </DiskTabs>
      </div>
    )
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
        { DiskTabsComponent() }
        <DiskTables></DiskTables>
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