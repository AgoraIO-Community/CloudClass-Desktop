import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { VolumeLevelEnum, Volume, IVolume } from './index'
export default {
  title: '音量',
  argTypes: {
    background: { control: 'color' },
    foregroundColor: { control: 'color' },
    width: { control: 'number' },
    height: { control: 'number' },
    currentVolume: { control: VolumeLevelEnum },
    maxLength: { control: 'number' }
  }
}


export const EducationVolume = (props: IVolume) => {
  return (
    <Volume {...props} />
  )
}
EducationVolume.args = {
  currentVolume: 0,
  width: 10,
  height: 100,
  direction: 'to right',
  maxLength: 4,
}
