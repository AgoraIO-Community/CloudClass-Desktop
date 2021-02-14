import React, { ReactEventHandler } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Button as MButton } from '@material-ui/core'
import { CustomizeTheme } from '../../theme'
import { noop } from '../../declare'
import { CSSProperties } from '@material-ui/core/styles/withStyles'

const useButtonStyles = makeStyles((theme: Theme) =>
  createStyles({
    primary: {
      width: '100px',
      minWidth: '60px',
      padding: '0',
      height: '34px',
      borderRadius: '17px',
      fontWeight: 400,
      color: '#ffffff',
      backgroundColor: '#5471FE',
      '&:hover': {
        backgroundColor: '#7C91F8',
      },
      '&:active': {
        backgroundColor: '#3C55CC',
      },
      textTransform: 'none',
    },
    secondary: {
      width: '100px',
      minWidth: '60px',
      padding: '0',
      height: '34px',
      borderRadius: '17px',
      fontWeight: 400,
      color: '#5471FE',
      backgroundColor: '#ffffff',
      border: '1px solid #5471FE',
      // marginLeft: '20px',
      textTransform: 'none',
      '&:hover': {
        color: '#7C91F8',
        backgroundColor: '#ffffff'
      },
      '&:active': {
        color: '#3C55CC',
        backgroundColor: '#ffffff',
      },
    },
    danger: {
      width: '120px',
      minWidth: '60px',
      padding: '0',
      height: '34px',
      borderRadius: '17px',
      fontWeight: 400,
      color: '#ffffff',
      backgroundColor: '#F04C36',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: '#F9705E',
      },
      '&:active': {
        backgroundColor: '#E0442F',
      },
    },
    disabled: {
      width: '120px',
      minWidth: '60px',
      padding: '0',
      height: '34px',
      borderRadius: '17px',
      fontWeight: 400,
      color: '#ffffff',
      backgroundColor: '#DADAE6',
      textTransform: 'none',
      cursor: 'not-allowed',
      '&:hover': {
        color: '#ffffff',
        backgroundColor: '#DADAE6',
      },
      '&:active': {
        color: '#ffffff',
        backgroundColor: '#DADAE6',
      },
    },
    label: {
      fontSize: '14px',
      lineHeight: '9px',
    }
  }),
)

export interface DiskButtonProps {
  id?: string,
  text: string,
  color: "primary" | "secondary",
  onClick?: ReactEventHandler<any>,
  style?: CSSProperties,
  disabled?: boolean,
}

export const DiskButton = (props: DiskButtonProps = { text: '', color: 'primary' }) => {
  const classes = useButtonStyles()
  const classKey = classes[props.color]
  const onClick = props.onClick ? props.onClick : noop

  return (
    <CustomizeTheme>
      <MButton {...props} onClick={onClick} classes={{ root: classKey, label: classes.label }} variant="contained" color={props.color} disableElevation disableRipple>
        {props.text}
      </MButton>
    </CustomizeTheme>
  )
}

