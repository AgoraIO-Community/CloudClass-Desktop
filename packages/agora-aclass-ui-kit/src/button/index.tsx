import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import MButton from '@material-ui/core/Button'
import { CustomizeTheme } from 'src/theme'

const useButtonStyles = makeStyles((theme: Theme) =>
  createStyles({
    primary: {
      width: '60px',
      minWidth: '60px',
      padding: '0',
      height: '20px',
      borderRadius: '10px',
      fontWeight: 400,
      '&:hover': {
        backgroundColor: '#ECC54C'
      },
      '&:active': {
        backgroundColor: '#D7AA1E',
      },
      textTransform: 'none',
    },
    secondary: {
      width: '60px',
      minWidth: '60px',
      padding: '0',
      height: '20px',
      borderRadius: '10px',
      fontWeight: 400,
      // '&:hover': {
      //   backgroundColor: '#ECC54C'
      // },
      // '&:active': {
      //   backgroundColor: '#D7AA1E',
      // },
      textTransform: 'none',
    },
    label: {
      color: '#ffffff',
      fontSize: '8px',
      lineHeight: '9px',
    }
  }),
)

export type ButtonProps = {
  text: string,
  color?: "primary" | "secondary",
}

export const AButton: React.VFC = (props: ButtonProps = {text: '', color: 'primary'}) => {
  const classes = useButtonStyles()

  const classKey = props.color === "primary" ? classes.primary : classes.secondary
  return (
    <CustomizeTheme>
      <MButton classes={{root: classKey, label: classes.label}} variant="contained" color={props.color} disableElevation disableRipple>
        {props.text}
      </MButton>
    </CustomizeTheme>
  )
}