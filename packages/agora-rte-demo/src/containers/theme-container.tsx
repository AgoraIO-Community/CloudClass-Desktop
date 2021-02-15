import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

const THEME = createMuiTheme({
  typography: {
   "fontFamily": 'SourceHanSansCN-Regular',
   "fontSize": 14,
   "fontWeightLight": 300,
   "fontWeightRegular": 400,
   "fontWeightMedium": 500,
  },

  overrides: {
    MuiRadio: {
      root: {
        padding: '4px'
      }
    },
    MuiSvgIcon: {
      root: {
        width: '1rem',
        height: '1rem',
      }
    },
    MuiFormControl: {
      root: {
        margin: '0.3rem 0',
      }
    },
    MuiInput: {
      underline: {
        '&:before': {
          borderBottom: '1px solid #EAEAEA',
        },
        '&:hover:not($disabled):not($focused):not($error):before': {
          borderBottom: `2px solid #EAEAEA`,
        },
        '&$focused': {
          '&:after': {
            borderBottom: '2px solid #44a2fc',
          }
        },
      }
    }
  }
});

export default function ({children}: any) {
  return (
    <ThemeProvider theme={THEME}>
      {children}
    </ThemeProvider>
  )
}