import { createStyles, makeStyles } from '@material-ui/core/styles'
import React from 'react'
import {Volume, VolumeDirectionEnum} from '../../volume'

export interface AudioVolumeProps {
  iconPath: string,
  currentVolume: number,
  width?: string,
  height?: string,
  direction: VolumeDirectionEnum,
  imgStyles?: React.CSSProperties
}

const useStyles = makeStyles(() => createStyles(({
  deviceVolume: {
    display: 'flex',
    flexDirection: 'row',
  }
})))

export const AudioVolume: React.FC<AudioVolumeProps> = (props) => {

  const classes = useStyles()

  return (
    <div className={classes.deviceVolume} style={{height: props.height}}>
      <img src={props.iconPath} style={props.imgStyles} />
      <Volume 
        currentVolume={props.currentVolume}
        width={props.width}
        height={props.height}
        direction={props.direction}
        maxLength={35}
      />
    </div>
  )
}

AudioVolume.defaultProps = {
  width: '10px',
  height: '100%',
  imgStyles: {
    display: 'block',
    marginRight: '10px',
  },
  direction: VolumeDirectionEnum.Right
}