import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'

export enum VolumeLevelEnum {
  None = 0,
  Level1 = 1,
  Level2 = 2,
  Level3 = 3,
}
export interface IVolume {
  foregroundColor?: string,
  backgroundColor?: string,
  maxLength?: number,
  width?: string,
  height?: string,
  currentVolume: VolumeLevelEnum,
  direction?: 'to top' | 'to right',
}
export const Volume = (props: IVolume) => {
  const { foregroundColor = '#598bdd', width = '10px', height = '2px', backgroundColor = "#aba8a8", maxLength = 4, currentVolume = VolumeLevelEnum.Level1, direction = 'to top' } = props || {}
  const isToRight = direction === 'to right';
  const useStyles = makeStyles((theme: Theme) => ({
    content: {
      display: 'flex',
      flexDirection: isToRight ? 'row':'column-reverse' ,
    },
    default: {
      minWidth:'1px',
      width,
      minHeight:'1px',
      height,
      borderRadius: '3px',
      marginTop: isToRight ? '0px' : '3px',
      marginRight: isToRight ? '3px' : '0px',
    },
    foregroundColor: {
      backgroundColor: foregroundColor
    },
    backgroundColor: {
      backgroundColor
    }
  }))
  const classes = useStyles()
  const volumeArray = new Array(maxLength).fill(0).map((_, index) => {
    if (index + 1 <= currentVolume) {
      return { color: 'foregroundColor' }
    } else {
      return { color: 'backgroundColor' }
    }
  })

  return (
    <div className={classes.content}>
      {
        volumeArray.map((item, index) => {
          return <div key={`${item.color}_${index}`} className={`${classes.default} ${classes[item.color]}`} />
        })
      }
    </div>
  )
}
