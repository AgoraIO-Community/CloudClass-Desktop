import React, {ReactChild} from 'react'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import {Dialog} from '@material-ui/core'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#DFB635',
    },
    secondary: {
      main: '#A7A7A7',
    },
    // frame: {
    //   borderRadius: '7px',
    //   border: '5px solid #75C0FF',
    // }
  },
  typography: {
    fontFamily: [
      "Helvetica",
      "Tahoma",
      "Arial",
      "STXihei",
      "华文细黑",
      "Microsoft YaHei",
      "微软雅黑",
      "SimSun",
      "宋体",
      "Heiti",
      "黑体",
      "sans-serif"
    ].join(','),
    button: {
      label: {
        color: '#ffffff',
        fontSize: '8px',
        lineHeight: '9px',
        fontWeight: '400'
      }
    }
  }
});

type ThemeProps = Required<{children: ReactChild}>

export const AClassTheme = {
  // backgroundColor: 'repeating-linear-gradient(135deg, #e9be36 0px, #b98d01 2px, #e9be36 2px, rgb(243 203 77) 5px)',
  backgroundColor: 'repeating-linear-gradient(135deg, #e9be36 0px, #cea621 2px, #e9be36 2px, rgb(243 203 77) 5px)',
}

export const themeConfig = {
  dialog: {
    border: {
      border: '5px solid #75C0FF',
      borderColor: '#75C0FF',
      borderRadius: '7px',
    }
  },
  box: {
    border: {
      border: '5px solid #75C0FF',
      borderColor: '#75C0FF',
      borderRadius: '5px',
    }
  }
}

export const CustomizeTheme = (props: ThemeProps) => {
  return (
    <ThemeProvider theme={theme}>
      {props.children}
    </ThemeProvider>
  )
}