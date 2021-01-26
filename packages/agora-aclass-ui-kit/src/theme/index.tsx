import React from 'react'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { ReactChild } from 'react'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#DFB635',
    },
    secondary: {
      main: '#A7A7A7',
    }
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

export const CustomizeTheme = (props: ThemeProps) => {
  return (
    <ThemeProvider theme={theme}>
      {props.children}
    </ThemeProvider>
  )
}
