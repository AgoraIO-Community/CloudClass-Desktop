import React from 'react'
import { Box } from '@material-ui/core'
import { makeStyles, Theme, createGenerateClassName, StylesProvider } from '@material-ui/core/styles'
import { INavigation } from './interface'
export const Navigation = (props: INavigation) => {
  const { minHeight: height = 42, background = '#1D35AD', color = "#fff" } = props
  const useStyles = makeStyles((theme: Theme) => ({
    navigation: {
      width: '100%',
      height,
      fontSize: '14px',
      minHeight: 42,
      background,
      color,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px 10px',
      boxSizing: 'border-box'
    },
    navigationContainer: {
      display: 'flex',
      flexWrap: 'nowrap'
    },
    region: {
      marginRight: 49,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      '&:last-child': {
        marginRight: 0,
      }
    }
  }))
  const classes = useStyles()
  return (
    < Box className={classes.navigation}>
      <div className={classes.navigationContainer} style={props.leftContainerStyle}>
        {
          props.leftContainer?.map((item, index) => {
            return <div key={`leftContainer_${item.componentKey}`} className={classes.region}>
              {item.isComponent ? item.renderItem && item.renderItem() :
                <>
                  {item.icon ?? null}
                  {item.text}
                </>
              }</div>
          })
        }
      </div>
      <div className={classes.navigationContainer} style={props.rightContainerStyle}>
        {
          props.rightContainer?.map((item, index) => {
            return <div key={`rightContainer_${item.componentKey}`} className={classes.region}>
              {item.isComponent ? item.renderItem && item.renderItem() :
                <>
                  {item.icon ?? null}
                  {item.text}
                </>
              }</div>
          })
        }
      </div>

    </Box>
  )
}

export * from './control'