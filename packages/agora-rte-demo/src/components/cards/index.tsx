import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {observer} from 'mobx-react';
import { Box, createStyles, Switch, Divider, Theme, withStyles, List, ListItem } from '@material-ui/core';
import { t } from '@/i18n';
import { useExtensionStore } from '@/hooks';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { CustomButton } from '../custom-button';
import './index.scss';

const AgoraSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      borderBottom: '1px solid #bdbdbd',
      opacity: 1,
      borderRadius: '13px'
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#44A2FC',
          opacity: 1,
          border: 'none',
        },
      },
      '&$focusVisible $thumb': {
        color: '#52d869',
        border: '6px solid #fff',
      },
    },
    thumb: {
      width: 24,
      height: 24,
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border']),
    },
    checked: {},
    focusVisible: {},
  }),
)(({ classes, ...props }: any) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

type CustomSwitchProps = {
  text: string
  checked: boolean
  handleChange: (evt: any) => any
}

export const CustomSwitch = (props: CustomSwitchProps) => {
  return (
    <Grid component="div" container alignItems="center" justify="space-between">
      <Grid item>{props.text}</Grid>
      <Grid item>
        <AgoraSwitch checked={props.checked} onChange={props.handleChange} />
      </Grid>
    </Grid>
  )
}


const useStyles = makeStyles({
  box: {
    position: 'absolute',
    left: '0px',
    right: '0px',
    top: '0px',
    bottom: '0px',
    margin: 'auto',
    width: 256,
    height: 238,
    zIndex: 33,
  },
  root: {
    width: 256,
    height: 238,
    background: '#FFFFFF',
    boxShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    border: '1px solid #DBE2E5',
    boxSizing: 'border-box',
  },
  cardContent: {
    padding: 10,
    paddingTop: 16,
  },
  cardTitle: {
    marginBottom: 13,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  btnGroup: {
    padding: "0 7px",
    paddingTop: 18
  }
});

export const CustomCard = observer(() => {
  const classes = useStyles();
  const extensionStore = useExtensionStore()

  const [enableCoVideo, setEnableCoVideo] = useState<boolean>(extensionStore.enableCoVideo)

  const [enableAutoHandUpCoVideo, setEnableAutoHandUpCoVideo] = useState<boolean>(extensionStore.enableAutoHandUpCoVideo)


  const handleConfirm = useCallback(async () => {
    await extensionStore.updateHandUpState(enableCoVideo, enableAutoHandUpCoVideo)
    extensionStore.hideCard()
  }, [enableCoVideo, enableAutoHandUpCoVideo])

  const handleClose = () => {
    extensionStore.hideCard()
  }

  return (
    // extensionStore.visibleCard ? 
    <Box className={classes.box}>
      <Card className={classes.root} variant="outlined">
        {/* <CardContent className={classes.cardContent}> */}
          <List component="nav" disablePadding={true} className={classes.cardContent}>
            <ListItem>
              <div className={classes.cardTitle}>
                {t('room.hands_up')}
              </div>
            </ListItem>
            <Divider />
            <ListItem>
              <CustomSwitch
                text={t('switch.enable_hands_up')}
                checked={enableCoVideo}
                handleChange={(evt: any) => {
                  setEnableCoVideo(!enableCoVideo)
                }}
              />
            </ListItem>
            <Divider />
            <ListItem>
              <CustomSwitch
                text={t('switch.enable_auto_hands_up')}
                checked={enableAutoHandUpCoVideo}
                handleChange={(evt: any) => {
                  setEnableAutoHandUpCoVideo(!enableAutoHandUpCoVideo)
                }}
              />
            </ListItem>
            <Divider />
            <ListItem className={classes.btnGroup}>
              <Grid className="cards-btn-group" container item alignItems="center" justify="space-between">
                <Grid item>
                  <CustomButton name={t("toast.confirm")} className="confirm" onClick={handleConfirm} color="primary" />
                </Grid>
                <Grid item >
                  <CustomButton name={t("toast.cancel")} className="cancel" onClick={handleClose} color="primary" />
                </Grid>
              </Grid>
            </ListItem>
          </List>
      </Card>
    </Box> 
    // : null
  );
})