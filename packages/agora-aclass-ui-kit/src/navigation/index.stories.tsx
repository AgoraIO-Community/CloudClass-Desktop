import React from 'react'
import { Box } from '@material-ui/core'
import { makeStyles, Theme } from '@material-ui/core'
import { INavigation } from './interface'

export default {
  title: '导航栏', argTypes: {
    background: { control: 'color' },
    color: { control: 'color' },
    minHeight: { control: 'number' },
  }
}
export const Navigation = (props: INavigation) => {
  const { minHeight: height = 42, background = '#1D35AD', color = "#fff" } = props
  const useStyles = makeStyles((theme: Theme) => ({
    navigation: {
      width: '100%',
      height,
      background,
      color,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 20px',
      boxSizing: 'border-box'
    },
    container: {
      display: 'flex',
      flexWrap: 'nowrap'
    },
    region: {
      marginRight: 49,
      '&:last-child': {
        marginRight: 0,
      }
    }
  }))
  const classes = useStyles()
  return (
    < Box className={classes.navigation}>
      <div className={classes.container} style={props.leftContainerStyle}>
        {
          props.leftContainer.map((item, index) => {
            return <div key={`leftContainer_${item.componentKey}`} className={classes.region}>
              {item.isComponent ? item.renderItem() :
                <>
                  {item.icon ?? null}
                  {item.text}
                </>
              }</div>
          })
        }
      </div>
      <div className={classes.container} style={props.rightContainerStyle}>
        {
          props.leftContainer.map((item, index) => {
            return <div key={`leftContainer_${item.componentKey}`} className={classes.region}>
              {item.isComponent ? item.renderItem() :
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

Navigation.args = {
  background: '#1D35AD',
  leftContainerStyle: {
  },
  leftContainer: [{
    isComponent: true,
    componentKey: 'test',
    renderItem: () => {
      return <div>8888</div>
    }
  }, {
    isComponent: false,
    componentKey: 'test1',
    name: 'kkkk:',
    text: '课程ID：15555'
  }]
}
