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
      'SourceHanSansCN-Regular',
      'Microsoft YaHei',
      'sans-serif',
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