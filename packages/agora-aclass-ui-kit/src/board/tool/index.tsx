import React from 'react'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import { ControlButton } from '../control/button'
import { ItemBaseClickEvent } from '../declare'
import { Box, makeStyles, Theme, Typography } from '@material-ui/core'

export interface ToolProps {
  headerTitle: string,
  onClick: ItemBaseClickEvent,
  style?: CSSProperties,
  items: string[]
}

const useStyles = makeStyles((theme: Theme) => ({
  toolBox: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#E9BE36',
    position: 'relative',
    boxSizing: 'border-box',
    width: 46,
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 5,
    border: '2px solid #B98D00',
    borderRadius: 10,
    '&::after': {
      background: 'rgba(185,141,0,.4)'
    }
  }
}))

export const Tool: React.FC<ToolProps> = (props) => {

  const classes = useStyles()

  return (
    <div style={
      {...props.style}
    } className={classes.toolBox}>
      <Typography component="div" style={{
        fontSize: 8,
        color: 'white',
        textShadow: '0 0 3px #775c09, 0 0 3px #e2a910',
        width: 32,
        height: 32,
        lineHeight: '32px',
        userSelect: 'none',
        margin: 6,
      }}>
        {props.headerTitle}
      </Typography>
      {props.items.map((item: string, index: number) => (
        <ControlButton key={index}
          style={{
            width: 38,
            height: 38,
            boxSizing: 'border-box',
            // borderBottom: '1px solid #B98D00',
            borderTop: '1px solid #B98D00',
            borderRadius: 0,
            '&:hover': {
              borderRadius: 0
            },
            '&:active': {
              borderRadius: 0
            }
          }}
          iconStyle={{
            width: item !== 'clear' ? 32 : 25,
            height: item !== 'clear' ? 32 : 25,
            borderRadius: 0,
            '&:hover': {
              borderRadius: 0
            },
            '&:active': {
              borderRadius: 0
            }
          }}
          icon={item}
          onClick={props.onClick.bind({}, item)}/>
      ))}
    </div>
  )
}